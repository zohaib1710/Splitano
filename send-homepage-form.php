<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    exit;
}

function text_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function allowed_request_source(string $url, array $allowedHosts): bool
{
    $host = parse_url($url, PHP_URL_HOST);
    if (!is_string($host) || $host === '') {
        return false;
    }

    return in_array(strtolower(rtrim($host, '.')), $allowedHosts, true);
}

function consume_rate_limit(string $directory, string $clientIp, int $limit, int $windowSeconds): bool
{
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        error_log('Splitano homepage form rate-limit directory is unavailable.');
        return true;
    }

    $filePath = $directory . DIRECTORY_SEPARATOR . hash('sha256', $clientIp) . '.json';
    $handle = @fopen($filePath, 'c+');
    if ($handle === false) {
        error_log('Splitano homepage form rate-limit file could not be opened.');
        return true;
    }

    $allowed = true;
    if (flock($handle, LOCK_EX)) {
        $contents = stream_get_contents($handle);
        $decoded = is_string($contents) && $contents !== '' ? json_decode($contents, true) : [];
        $timestamps = is_array($decoded) ? $decoded : [];
        $now = time();
        $timestamps = array_values(array_filter($timestamps, static function ($timestamp) use ($now, $windowSeconds): bool {
            return is_int($timestamp) && $timestamp > ($now - $windowSeconds);
        }));

        if (count($timestamps) >= $limit) {
            $allowed = false;
        } else {
            $timestamps[] = $now;
        }

        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($timestamps));
        fflush($handle);
        flock($handle, LOCK_UN);
    } else {
        error_log('Splitano homepage form rate-limit file could not be locked.');
    }

    fclose($handle);
    return $allowed;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'This endpoint accepts form submissions only.');
}

$contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
if ($contentLength > (12 * 1024 * 1024)) {
    respond(413, false, 'The uploaded file is too large. Please upload a file up to 10MB.');
}

$honeypot = $_POST['website'] ?? '';
if (!is_string($honeypot) || trim($honeypot) !== '') {
    respond(200, true, 'Thank you. Your message has been sent successfully.');
}

$configOverride = getenv('SPLITANO_SMTP_CONFIG');
$configPath = is_string($configOverride) && trim($configOverride) !== ''
    ? trim($configOverride)
    : dirname(__DIR__) . DIRECTORY_SEPARATOR . 'splitano-private' . DIRECTORY_SEPARATOR . 'smtp-config.php';
if (!is_file($configPath)) {
    error_log('Splitano homepage form SMTP configuration file is missing.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$config = require $configPath;
if (!is_array($config)) {
    error_log('Splitano homepage form SMTP configuration is invalid.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$requiredConfig = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from_email', 'smtp_to_email'];
foreach ($requiredConfig as $key) {
    if (!isset($config[$key]) || (!is_string($config[$key]) && !is_int($config[$key])) || trim((string) $config[$key]) === '') {
        error_log('Splitano homepage form SMTP configuration is incomplete.');
        respond(500, false, "Sorry, we couldn't send your message. Please try again.");
    }
}

if ((string) $config['smtp_password'] === 'YOUR_HOSTINGER_EMAIL_PASSWORD_HERE') {
    error_log('Splitano homepage form SMTP password placeholder has not been replaced.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$allowedHosts = $config['allowed_hosts'] ?? ['splitano.com', 'www.splitano.com', 'localhost', '127.0.0.1'];
if (!is_array($allowedHosts)) {
    $allowedHosts = [];
}
$allowedHosts = array_values(array_filter(array_map(static function ($host): string {
    return is_string($host) ? strtolower(rtrim(trim($host), '.')) : '';
}, $allowedHosts)));

$origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
$referer = trim((string) ($_SERVER['HTTP_REFERER'] ?? ''));
if (($origin !== '' && !allowed_request_source($origin, $allowedHosts)) ||
    ($origin === '' && $referer !== '' && !allowed_request_source($referer, $allowedHosts))) {
    respond(403, false, 'This form submission could not be verified. Please refresh the page and try again.');
}

$scalarFields = ['full_name', 'phone', 'email', 'provider', 'payment_option', 'notes', 'form_source', 'form_started_at'];
foreach ($scalarFields as $field) {
    if (isset($_POST[$field]) && !is_string($_POST[$field])) {
        respond(422, false, 'Please check the form fields and try again.');
    }
}

if (($_POST['form_source'] ?? '') !== 'homepage') {
    respond(422, false, 'This form submission could not be verified. Please refresh the page and try again.');
}

$startedAt = filter_var($_POST['form_started_at'] ?? null, FILTER_VALIDATE_INT);
if ($startedAt === false) {
    respond(422, false, 'This form submission could not be verified. Please refresh the page and try again.');
}
$elapsed = time() - (int) $startedAt;
if ($elapsed >= 0 && $elapsed < 3) {
    respond(422, false, 'Please take a moment to review the form, then submit it again.');
}

$clientIp = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateLimitDirectory = dirname($configPath) . DIRECTORY_SEPARATOR . 'rate-limits';
if (!consume_rate_limit($rateLimitDirectory, $clientIp, 5, 15 * 60)) {
    respond(429, false, 'Too many submissions were received. Please wait a few minutes and try again.');
}

$fullName = trim((string) ($_POST['full_name'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$provider = trim((string) ($_POST['provider'] ?? ''));
$paymentOption = trim((string) ($_POST['payment_option'] ?? ''));
$notes = trim((string) ($_POST['notes'] ?? ''));

if ($fullName === '' || text_length($fullName) < 2 || text_length($fullName) > 100 ||
    preg_match("/^[\\p{L}][\\p{L} .'-]{1,99}$/u", $fullName) !== 1) {
    respond(422, false, 'Please enter a valid full name.');
}

$phoneDigits = preg_replace('/\D+/', '', $phone);
if ($phone === '' || text_length($phone) > 24 || preg_match('/^\+?[0-9() .-]{7,24}$/', $phone) !== 1 ||
    !is_string($phoneDigits) || strlen($phoneDigits) < 7 || strlen($phoneDigits) > 15) {
    respond(422, false, 'Please enter a valid phone number.');
}

if ($email !== '' && (text_length($email) > 254 || preg_match('/[\r\n]/', $email) === 1 ||
    filter_var($email, FILTER_VALIDATE_EMAIL) === false)) {
    respond(422, false, 'Please enter a valid email address.');
}

if ($provider === '' || text_length($provider) < 2 || text_length($provider) > 120 ||
    preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $provider) === 1) {
    respond(422, false, 'Please enter a valid bill provider.');
}

$paymentLabels = ['pay-in-4' => 'Pay in 4', 'pay-in-full' => 'Pay in Full'];
if (!array_key_exists($paymentOption, $paymentLabels)) {
    respond(422, false, 'Please choose a valid payment option.');
}

if (text_length($notes) > 500 || preg_match('/[\x00\x0B\x0C]/', $notes) === 1) {
    respond(422, false, 'Additional notes must be 500 characters or fewer.');
}

if (!isset($_FILES['bill_file']) || !is_array($_FILES['bill_file'])) {
    respond(422, false, 'Please upload your bill as a PDF, JPG, or PNG file.');
}

$uploadedFile = $_FILES['bill_file'];
foreach (['name', 'type', 'tmp_name', 'error', 'size'] as $fileKey) {
    if (!array_key_exists($fileKey, $uploadedFile) || is_array($uploadedFile[$fileKey])) {
        respond(422, false, 'The uploaded bill could not be processed. Please try again.');
    }
}

if ((int) $uploadedFile['error'] !== UPLOAD_ERR_OK) {
    $status = (int) $uploadedFile['error'] === UPLOAD_ERR_INI_SIZE || (int) $uploadedFile['error'] === UPLOAD_ERR_FORM_SIZE ? 413 : 422;
    respond($status, false, 'The uploaded bill could not be processed. Please use a PDF, JPG, or PNG up to 10MB.');
}

$fileSize = (int) $uploadedFile['size'];
$temporaryPath = (string) $uploadedFile['tmp_name'];
if ($fileSize < 1 || $fileSize > (10 * 1024 * 1024) || !is_uploaded_file($temporaryPath)) {
    respond($fileSize > (10 * 1024 * 1024) ? 413 : 422, false, 'The uploaded bill could not be processed. Please use a PDF, JPG, or PNG up to 10MB.');
}

if (!class_exists('finfo')) {
    error_log('Splitano homepage form requires the PHP fileinfo extension.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$fileInfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $fileInfo->file($temporaryPath);
$allowedMimeTypes = [
    'application/pdf' => 'pdf',
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
];
if (!is_string($mimeType) || !isset($allowedMimeTypes[$mimeType])) {
    respond(422, false, 'Please upload your bill as a PDF, JPG, or PNG file.');
}

$originalName = basename(str_replace('\\', '/', (string) $uploadedFile['name']));
$safeStem = preg_replace('/[^A-Za-z0-9_-]+/', '_', pathinfo($originalName, PATHINFO_FILENAME));
$safeStem = is_string($safeStem) ? trim(substr($safeStem, 0, 70), '_') : '';
if ($safeStem === '') {
    $safeStem = 'bill-upload';
}
$attachmentName = $safeStem . '.' . $allowedMimeTypes[$mimeType];
$sizeInMb = number_format($fileSize / 1048576, 2) . ' MB';
$submittedAt = gmdate('Y-m-d H:i:s') . ' UTC';

$bodyLines = [
    'New website enquiry',
    '',
    'Name:',
    $fullName,
    '',
    'Email:',
    $email !== '' ? $email : 'Not provided',
    '',
    'Phone:',
    $phone,
    '',
    'Bill provider:',
    $provider,
    '',
    'Payment option:',
    $paymentLabels[$paymentOption],
    '',
    'Additional notes:',
    $notes !== '' ? $notes : 'Not provided',
    '',
    'Uploaded bill:',
    $attachmentName . ' (' . $mimeType . ', ' . $sizeInMb . ')',
    '',
    'Submitted from:',
    'Homepage',
    '',
    'Submitted at:',
    $submittedAt,
];

$libraryRoot = __DIR__ . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'PHPMailer' . DIRECTORY_SEPARATOR . 'src';
require_once $libraryRoot . DIRECTORY_SEPARATOR . 'Exception.php';
require_once $libraryRoot . DIRECTORY_SEPARATOR . 'PHPMailer.php';
require_once $libraryRoot . DIRECTORY_SEPARATOR . 'SMTP.php';

$mailer = new PHPMailer(true);
try {
    $mailer->isSMTP();
    $mailer->Host = (string) $config['smtp_host'];
    $mailer->SMTPAuth = true;
    $mailer->Username = (string) $config['smtp_username'];
    $mailer->Password = (string) $config['smtp_password'];
    $mailer->Port = (int) $config['smtp_port'];
    $encryption = strtolower((string) ($config['smtp_encryption'] ?? 'smtps'));
    $mailer->SMTPSecure = $encryption === 'starttls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
    $mailer->SMTPAutoTLS = true;
    $mailer->Timeout = 20;
    $mailer->CharSet = PHPMailer::CHARSET_UTF8;

    $mailer->setFrom((string) $config['smtp_from_email'], 'Splitano Website');
    $mailer->addAddress((string) $config['smtp_to_email']);
    if ($email !== '') {
        $mailer->addReplyTo($email, $fullName);
    }
    $mailer->Subject = 'New Website Enquiry - ' . $fullName;
    $mailer->Body = implode("\n", $bodyLines);
    $mailer->AltBody = $mailer->Body;
    $mailer->addAttachment($temporaryPath, $attachmentName, PHPMailer::ENCODING_BASE64, $mimeType);
    $mailer->send();
} catch (Throwable $exception) {
    $logMessage = preg_replace('/[\r\n]+/', ' ', $exception->getMessage());
    error_log('Splitano homepage SMTP submission failed: ' . substr((string) $logMessage, 0, 500));
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

respond(200, true, 'Thank you. Your message has been sent successfully.');
