<?php
/* ============================================================
   API истории подарочных сертификатов (gift-studio.html).
   Единственный серверный файл на статическом сайте — работает
   на любом PHP-хостинге. Хранит историю в gift-data/history.json
   (папка закрыта .htaccess, создаётся автоматически; при деплое
   папку gift-data НЕ перетирать — см. README).

   Запросы: POST JSON {pin, action, ...}
     action=list          → вся история
     action=save, item:{} → добавить/обновить запись (по номеру k)
     action=delete, k     → удалить запись
   Ответ: {ok:true, list:[...]} | {ok:false, error:'...'}

   Авторизация — пин студии (сравнивается sha256-хэш).
   Меняешь пин в gift-studio.html — пересчитай PIN_HASH:
   echo -n 'НОВЫЙ_ПИН' | sha256sum
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
const MAX_ITEMS = 300;

$dir  = __DIR__ . '/gift-data';
$file = $dir . '/history.json';

function out($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(['ok' => false, 'error' => 'method']);
}

$req = json_decode(file_get_contents('php://input'), true);
if (!is_array($req)) {
    out(['ok' => false, 'error' => 'bad_request']);
}
if (!hash_equals(PIN_HASH, hash('sha256', (string)($req['pin'] ?? '')))) {
    out(['ok' => false, 'error' => 'auth']);
}

/* хранилище: папка закрывается от прямого доступа из браузера */
if (!is_dir($dir)) {
    if (!mkdir($dir, 0755, true)) {
        out(['ok' => false, 'error' => 'storage']);
    }
}
if (!is_file($dir . '/.htaccess')) {
    file_put_contents($dir . '/.htaccess',
        "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n" .
        "<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
}

/* запись только нужных полей — ничего лишнего в хранилище не попадает */
function cleanItem($x) {
    if (!is_array($x)) return null;
    $k = trim((string)($x['k'] ?? ''));
    if ($k === '' || mb_strlen($k) > 40) return null;
    return [
        'k'   => $k,
        'n'   => mb_substr(trim((string)($x['n'] ?? '')), 0, 120),
        'a'   => max(0, (int)($x['a'] ?? 0)),
        't'   => preg_replace('/[^a-z0-9]/', '', (string)($x['t'] ?? '')) ?: 'universal',
        'e'   => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['e'] ?? '')) ? $x['e'] : '',
        'url' => mb_substr((string)($x['url'] ?? ''), 0, 2000),
        'ts'  => (int)($x['ts'] ?? round(microtime(true) * 1000)),
    ];
}

$fp = fopen($file, 'c+');
if (!$fp || !flock($fp, LOCK_EX)) {
    out(['ok' => false, 'error' => 'storage']);
}
$list = json_decode(stream_get_contents($fp) ?: '', true);
if (!is_array($list)) $list = [];

$action = (string)($req['action'] ?? 'list');

if ($action === 'save') {
    $item = cleanItem($req['item'] ?? null);
    if (!$item) out(['ok' => false, 'error' => 'bad_item']);
    $list = array_values(array_filter($list, fn($x) => ($x['k'] ?? '') !== $item['k']));
    array_unshift($list, $item);
    if (count($list) > MAX_ITEMS) $list = array_slice($list, 0, MAX_ITEMS);
} elseif ($action === 'delete') {
    $k = (string)($req['k'] ?? '');
    $list = array_values(array_filter($list, fn($x) => ($x['k'] ?? '') !== $k));
} elseif ($action !== 'list') {
    out(['ok' => false, 'error' => 'bad_action']);
}

if ($action !== 'list') {
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($list, JSON_UNESCAPED_UNICODE));
    fflush($fp);
}
flock($fp, LOCK_UN);
fclose($fp);

out(['ok' => true, 'list' => $list]);
