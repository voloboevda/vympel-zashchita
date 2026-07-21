<?php
/**
 * Обработчик формы заявки.
 * Совместим с PHP 5.6+ (на Beget сейчас 5.6).
 * URL: /api/leads.php  и  /api/leads/
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('ok' => false, 'error' => 'Метод не поддерживается'), JSON_UNESCAPED_UNICODE);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if (!$body || !is_array($body)) {
    $body = $_POST;
}
if (!is_array($body)) {
    $body = array();
}

function lead_val($arr, $key, $default = '') {
    return isset($arr[$key]) ? $arr[$key] : $default;
}

// Honeypot
if (!empty($body['website'])) {
    echo json_encode(array(
        'ok' => true,
        'id' => 'spam-trap',
        'message' => 'Заявка принята. Наш специалист свяжется с вами в течение рабочего дня.'
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim((string) lead_val($body, 'name'));
$phone = trim((string) lead_val($body, 'phone'));
$email = trim((string) lead_val($body, 'email'));
$company = trim((string) lead_val($body, 'company'));
$objectType = trim((string) lead_val($body, 'objectType'));
$message = trim((string) lead_val($body, 'message'));
$source = trim((string) lead_val($body, 'source', 'contacts-form'));

$errors = array();

if (function_exists('mb_strlen')) {
    $nameLen = mb_strlen($name, 'UTF-8');
} else {
    $nameLen = strlen($name);
}

if ($nameLen < 2) {
    $errors[] = 'Укажите корректное имя (минимум 2 символа)';
}

$phoneClean = preg_replace('/[\s\-()]/', '', $phone);
if (!preg_match('/^\+?\d{10,15}$/', $phoneClean)) {
    $errors[] = 'Укажите корректный номер телефона';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Укажите корректный email или оставьте поле пустым';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => implode('; ', $errors)), JSON_UNESCAPED_UNICODE);
    exit;
}

function lead_substr($str, $len) {
    if (function_exists('mb_substr')) {
        return mb_substr($str, 0, $len, 'UTF-8');
    }
    return substr($str, 0, $len);
}

$remoteIp = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'mswork7v.beget.tech';

$lead = array(
    'id' => uniqid('', true),
    'name' => lead_substr($name, 200),
    'company' => $company !== '' ? lead_substr($company, 200) : null,
    'phone' => lead_substr($phone, 50),
    'email' => $email !== '' ? lead_substr($email, 200) : null,
    'objectType' => $objectType !== '' ? $objectType : null,
    'message' => $message !== '' ? lead_substr($message, 2000) : null,
    'source' => lead_substr($source, 50),
    'status' => 'new',
    'createdAt' => date('c'),
    'ip' => $remoteIp,
);

$leadsFile = __DIR__ . '/leads.json';
$leads = array();
if (file_exists($leadsFile)) {
    $json = file_get_contents($leadsFile);
    $decoded = json_decode($json, true);
    if (is_array($decoded)) {
        $leads = $decoded;
    }
}
$leads[] = $lead;
@file_put_contents(
    $leadsFile,
    json_encode($leads, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
    LOCK_EX
);

$recipient = 'ooo.vss74@yandex.com';
$fromEmail = 'noreply@' . preg_replace('/:\d+$/', '', $host);

$subjectText = 'Новая заявка с сайта — ' . $name;
$subject = '=?UTF-8?B?' . base64_encode($subjectText) . '?=';

$emailBody = "Новая заявка с сайта " . $host . "\n\n";
$emailBody .= "Имя: $name\n";
$emailBody .= "Телефон: $phone\n";
if ($company !== '') {
    $emailBody .= "Компания: $company\n";
}
if ($email !== '') {
    $emailBody .= "Email: $email\n";
}
if ($objectType !== '') {
    $emailBody .= "Тип объекта: $objectType\n";
}
if ($message !== '') {
    $emailBody .= "Комментарий: $message\n";
}
$emailBody .= "\nДата: " . date('d.m.Y H:i') . "\n";
$emailBody .= "IP: $remoteIp\n";
$emailBody .= "Источник: $source\n";

$headers = array();
$headers[] = 'From: Сайт <' . $fromEmail . '>';
$headers[] = 'Reply-To: ' . ($email !== '' ? $email : $recipient);
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$mailOk = @mail($recipient, $subject, $emailBody, implode("\r\n", $headers));

echo json_encode(array(
    'ok' => true,
    'id' => $lead['id'],
    'mail_sent' => (bool) $mailOk,
    'message' => 'Заявка принята. Наш специалист свяжется с вами в течение рабочего дня для уточнения деталей и согласования выезда на объект.'
), JSON_UNESCAPED_UNICODE);
