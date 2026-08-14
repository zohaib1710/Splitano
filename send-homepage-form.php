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

function escape_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function readable_file_size(int $bytes): string
{
    if ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    }

    return number_format($bytes / 1024, 1) . ' KB';
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
        error_log('Splitano application form rate-limit directory is unavailable.');
        return true;
    }

    $filePath = $directory . DIRECTORY_SEPARATOR . hash('sha256', $clientIp) . '.json';
    $handle = @fopen($filePath, 'c+');
    if ($handle === false) {
        error_log('Splitano application form rate-limit file could not be opened.');
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
        error_log('Splitano application form rate-limit file could not be locked.');
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
    error_log('Splitano application form SMTP configuration file is missing.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$config = require $configPath;
if (!is_array($config)) {
    error_log('Splitano application form SMTP configuration is invalid.');
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

$requiredConfig = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from_email', 'smtp_to_email'];
foreach ($requiredConfig as $key) {
    if (!isset($config[$key]) || (!is_string($config[$key]) && !is_int($config[$key])) || trim((string) $config[$key]) === '') {
        error_log('Splitano application form SMTP configuration is incomplete.');
        respond(500, false, "Sorry, we couldn't send your message. Please try again.");
    }
}

if ((string) $config['smtp_password'] === 'YOUR_HOSTINGER_EMAIL_PASSWORD_HERE') {
    error_log('Splitano application form SMTP password placeholder has not been replaced.');
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

$sourceLabels = [
    'homepage-popup' => 'Homepage Popup',
    'how-it-works-popup' => 'How It Works Page Popup',
    'pay-in-4-popup' => 'Pay In 4 Page Popup',
    'bill-pay-popup' => 'Bill Pay Page Popup',
    'billers-popup' => 'Eligible Billers Page Popup',
    'contact-popup' => 'Contact Page Popup',
    'contact-page' => 'Contact Page Application Form',
    'about-popup' => 'About Page Popup',
    'privacy-popup' => 'Privacy Policy Page Popup',
    'terms-popup' => 'Terms Of Service Page Popup',
];
$formSource = trim((string) ($_POST['form_source'] ?? ''));
if (!array_key_exists($formSource, $sourceLabels)) {
    respond(422, false, 'This form submission could not be verified. Please refresh the page and try again.');
}
$sourceLabel = $sourceLabels[$formSource];

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
    error_log('Splitano application form requires the PHP fileinfo extension.');
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
$readableSize = readable_file_size($fileSize);
$submittedAt = gmdate('F j, Y \a\t g:i A') . ' UTC';

$bodyLines = [
    'SPLITANO - NEW WEBSITE ENQUIRY',
    '================================',
    '',
    'APPLICANT DETAILS',
    '-----------------',
    'Name: ' . $fullName,
    'Email: ' . ($email !== '' ? $email : 'Not provided'),
    'Phone: ' . $phone,
    '',
    'BILL DETAILS',
    '------------',
    'Bill provider: ' . $provider,
    'Payment option: ' . $paymentLabels[$paymentOption],
    'Additional notes:',
    $notes !== '' ? $notes : 'Not provided',
    '',
    'ATTACHMENT DETAILS',
    '------------------',
    'Filename: ' . $attachmentName,
    'File type: ' . $mimeType,
    'File size: ' . $readableSize,
    '',
    'SUBMISSION DETAILS',
    '------------------',
    'Source: ' . $sourceLabel,
    'Submitted: ' . $submittedAt,
    '',
];
if ($email !== '') {
    $bodyLines[] = 'Reply to this email to respond directly to ' . $fullName . '.';
}
$plainTextBody = implode("\r\n", $bodyLines);

$htmlName = escape_html($fullName);
$htmlEmail = escape_html($email !== '' ? $email : 'Not provided');
$htmlPhone = escape_html($phone);
$htmlProvider = escape_html($provider);
$htmlPaymentOption = escape_html($paymentLabels[$paymentOption]);
$htmlNotes = $notes !== '' ? nl2br(escape_html($notes), false) : 'Not provided';
$htmlAttachmentName = escape_html($attachmentName);
$htmlMimeType = escape_html($mimeType);
$htmlReadableSize = escape_html($readableSize);
$htmlSourceLabel = escape_html($sourceLabel);
$htmlSubmittedAt = escape_html($submittedAt);
$replyReminder = $email !== ''
    ? '<tr><td style="padding:0 32px 32px;"><div style="background:#eef5ff;border-left:4px solid #2474f4;border-radius:8px;padding:14px 16px;color:#0b2a4a;font-size:14px;line-height:1.5;">Reply to this email to respond directly to <strong>' . $htmlName . '</strong>.</div></td></tr>'
    : '';

$htmlBody = <<<HTML
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry</title>
</head>
<body style="margin:0;padding:0;background:#f2f5f8;color:#0b2a4a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f2f5f8;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(11,42,74,0.10);">
          <tr>
            <td style="background:#0b2a4a;padding:30px 32px;color:#ffffff;">
              <div style="width:34px;height:4px;background:#ffc747;border-radius:4px;margin-bottom:18px;"></div>
              <div style="font-size:30px;line-height:1;font-weight:700;letter-spacing:0.5px;">Splitano</div>
              <h1 style="margin:22px 0 12px;font-size:26px;line-height:1.25;color:#ffffff;">New Bill Application</h1>
              <span style="display:inline-block;background:#ffc747;color:#0b2a4a;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;letter-spacing:0.3px;">{$htmlSourceLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 32px 12px;">
              <h2 style="margin:0 0 14px;font-size:18px;line-height:1.3;color:#0b2a4a;">Applicant Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;width:34%;">Name</td><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:14px;">{$htmlName}</td></tr>
                <tr><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;">Email</td><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:14px;word-break:break-word;">{$htmlEmail}</td></tr>
                <tr><td style="padding:10px 12px;background:#f6f9fd;font-size:13px;font-weight:700;">Phone</td><td style="padding:10px 12px;background:#f6f9fd;font-size:14px;">{$htmlPhone}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px 12px;">
              <h2 style="margin:0 0 14px;font-size:18px;line-height:1.3;color:#0b2a4a;">Bill Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;width:34%;">Bill Provider</td><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:14px;">{$htmlProvider}</td></tr>
                <tr><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;">Payment Option</td><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:14px;">{$htmlPaymentOption}</td></tr>
                <tr><td valign="top" style="padding:10px 12px;background:#f6f9fd;font-size:13px;font-weight:700;">Additional Notes</td><td style="padding:10px 12px;background:#f6f9fd;font-size:14px;line-height:1.55;word-break:break-word;">{$htmlNotes}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px 12px;">
              <h2 style="margin:0 0 14px;font-size:18px;line-height:1.3;color:#0b2a4a;">Attachment Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;width:34%;">Filename</td><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:14px;word-break:break-word;">{$htmlAttachmentName}</td></tr>
                <tr><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;">File Type</td><td style="padding:10px 12px;border-bottom:1px solid #e5edf6;font-size:14px;">{$htmlMimeType}</td></tr>
                <tr><td style="padding:10px 12px;background:#f6f9fd;font-size:13px;font-weight:700;">File Size</td><td style="padding:10px 12px;background:#f6f9fd;font-size:14px;">{$htmlReadableSize}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px 26px;">
              <h2 style="margin:0 0 14px;font-size:18px;line-height:1.3;color:#0b2a4a;">Submission Details</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:13px;font-weight:700;width:34%;">Source</td><td style="padding:10px 12px;background:#f6f9fd;border-bottom:1px solid #e5edf6;font-size:14px;">{$htmlSourceLabel}</td></tr>
                <tr><td style="padding:10px 12px;font-size:13px;font-weight:700;">Submitted</td><td style="padding:10px 12px;font-size:14px;">{$htmlSubmittedAt}</td></tr>
              </table>
            </td>
          </tr>
          {$replyReminder}
          <tr><td style="background:#0b2a4a;padding:18px 32px;color:#c9d8e8;font-size:12px;line-height:1.5;text-align:center;">Sent securely from the Splitano website application form.</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

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
    $mailer->isHTML(true);
    $mailer->Body = $htmlBody;
    $mailer->AltBody = $plainTextBody;
    $mailer->addAttachment($temporaryPath, $attachmentName, PHPMailer::ENCODING_BASE64, $mimeType);
    $mailer->send();
} catch (Throwable $exception) {
    $logMessage = preg_replace('/[\r\n]+/', ' ', $exception->getMessage());
    error_log('Splitano application SMTP submission failed: ' . substr((string) $logMessage, 0, 500));
    respond(500, false, "Sorry, we couldn't send your message. Please try again.");
}

respond(200, true, 'Thank you. Your message has been sent successfully.');
