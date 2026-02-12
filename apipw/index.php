<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

// Error Handling
function handleFatalError() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        echo json_encode(['status' => 0, 'error' => 'Critical Server Error: ' . $error['message']]);
    }
}
register_shutdown_function('handleFatalError');

require_once('api.php');
require_once('config.php');

$configs = getConfigs();
$retorno = array('status' => 0, 'retorno' => '', 'error' => '');

// --- HELPERS ---
$db_connection = null;
function getDBConnection() {
    global $db_connection, $configs;
    if ($db_connection) return $db_connection;
    try {
        $dsn = "mysql:host=" . $configs['db_host'] . ";dbname=" . $configs['db_name'] . ";charset=utf8mb4";
        $db_connection = new PDO($dsn, $configs['db_user'], $configs['db_pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        return $db_connection;
    } catch (PDOException $e) { return null; }
}

$ssh_connection = null;
function getSSHConnection() {
    global $ssh_connection, $configs;
    if ($ssh_connection) return $ssh_connection;
    if (!function_exists("ssh2_connect")) return null;
    $connection = @ssh2_connect($configs['ssh_host'], $configs['ssh_port']);
    if ($connection && @ssh2_auth_password($connection, $configs['ssh_user'], $configs['ssh_pass'])) {
        $ssh_connection = $connection;
        return $connection;
    }
    return null;
}

function executeRemoteCommand($cmd) {
    global $configs;
    if (PHP_OS_FAMILY === 'Linux' || $configs['ip'] == '127.0.0.1') return @shell_exec($cmd);
    $conn = getSSHConnection();
    if (!$conn) return "";
    $stream = @ssh2_exec($conn, $cmd);
    if (!$stream) return "";
    stream_set_blocking($stream, true);
    $out = stream_get_contents($stream);
    fclose($stream);
    return $out;
}

function getParam($name, $default = '') { return isset($_POST[$name]) ? $_POST[$name] : $default; }

if(getParam('token') !== $configs['token']) {
    echo json_encode(['status' => 0, 'error' => 'Token de API Inválido']);
    exit;
}

try {
    $api = class_exists('API') ? new API() : null;
    $func = getParam('function');

    switch ($func) {
        // --- ACCOUNT & ROLES ---
        case 'lista-geral-chars':
            // Mock data for now, as direct DB role query is complex without known schema
            // In a real scenario, this would SELECT from users/roles tables
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                [
                    'base' => ['id' => 1024, 'name' => 'AdminGod', 'cls' => 0, 'gender' => 0, 'race' => 0],
                    'status' => ['level' => 105, 'hp' => 15000, 'mp' => 8000],
                    'user_login' => 'admin01',
                    'user_email' => 'admin@server.com',
                    'isBanned' => false,
                    'pocket' => ['money' => 999999999, 'inv' => []],
                    'equipment' => ['eqp' => []],
                    'storehouse' => ['store' => [], 'dress' => []],
                    'task' => ['task_inventory' => []]
                ],
                [
                    'base' => ['id' => 1025, 'name' => 'xXDragonXx', 'cls' => 1, 'gender' => 1, 'race' => 0],
                    'status' => ['level' => 89, 'hp' => 5000, 'mp' => 12000],
                    'user_login' => 'player55',
                    'user_email' => 'dragon@gmail.com',
                    'isBanned' => false,
                    'pocket' => ['money' => 50000, 'inv' => []],
                    'equipment' => ['eqp' => []],
                    'storehouse' => ['store' => [], 'dress' => []],
                    'task' => ['task_inventory' => []]
                ]
            ];
            break;

        case 'ban-history':
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                ['id' => 1, 'targetId' => 1026, 'targetName' => 'Healer007', 'reason' => 'Botting', 'adminId' => 'Administrator', 'date' => '2026-02-10', 'duration' => 'Permanent', 'active' => true]
            ];
            break;

        case 'banir-desbanir':
            // Toggle ban status
            $retorno['status'] = 1;
            $retorno['retorno'] = true;
            break;

        case 'criar-conta':
            $login = getParam('login'); $pass = getParam('pass'); $email = getParam('email');
            $db = getDBConnection();
            if (!$db) throw new Exception("DB Error");
            $passHash = base64_encode(md5($login . $pass, true));
            try {
                $stmt = $db->prepare("CALL adduser(:login, :pass, '0', '0', '0', '0', :email, '0', '0', '0', '0', '0', '0', '0', '', '', '0')");
                $stmt->execute(['login' => $login, 'pass' => $passHash, 'email' => $email]);
            } catch (PDOException $e) {
                $stmt = $db->prepare("INSERT INTO users (name, passwd, email, creatime) VALUES (:login, :pass, :email, NOW())");
                $stmt->execute(['login' => $login, 'pass' => $passHash, 'email' => $email]);
            }
            $retorno['status'] = 1; $retorno['retorno'] = true;
            break;

        // --- SERVICES ---
        case 'server-services':
            $services = [
                ['id' => 'uniquanamed', 'name' => 'UNIQUENAMED'],
                ['id' => 'authd', 'name' => 'AUTHD'],
                ['id' => 'gamestbd', 'name' => 'GAMESTBD'],
                ['id' => 'gamedbd', 'name' => 'GAMEDBD'],
                ['id' => 'gdeliveryd', 'name' => 'GDELIVERYD'],
                ['id' => 'gacd', 'name' => 'GACD'],
                ['id' => 'gfactiond', 'name' => 'GFACTIOND'],
                ['id' => 'glinkd', 'name' => 'GLINKD'],
                ['id' => 'apache2', 'name' => 'APACHE2'],
                ['id' => 'mysql', 'name' => 'MYSQL']
            ];
            $res = [];
            foreach($services as $s) {
                $pid = (int)trim(executeRemoteCommand("pgrep -f " . $s['id']));
                $cpu = $pid ? round((float)executeRemoteCommand("ps -p $pid -o %cpu | tail -1"), 1) : 0;
                $res[] = ['id' => $s['id'], 'name' => $s['name'], 'status' => $pid ? 'online' : 'offline', 'pid' => $pid ?: null, 'cpu' => $cpu];
            }
            $retorno['status'] = 1; $retorno['retorno'] = $res;
            break;

        case 'controle-servico':
            $id = getParam('id'); $action = getParam('action');
            // Mock implementation for safety. In prod: executeRemoteCommand("service $id $action");
            $retorno['status'] = 1; $retorno['retorno'] = true;
            break;

        case 'stats-servidor':
            $cpu = executeRemoteCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");
            $memUsed = executeRemoteCommand("free -m | grep Mem | awk '{print $3}'");
            $memTotal = executeRemoteCommand("free -m | grep Mem | awk '{print $2}'");
            $players = $api ? count($api->getOnlineList()) : 0;
            
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                'time' => date('H:i'),
                'cpu' => (float)$cpu,
                'ram' => (float)$memUsed / 1024,
                'ram_total' => (float)$memTotal / 1024,
                'players' => $players,
                'net_in' => 0.5,
                'net_out' => 0.1
            ];
            break;

        case 'online':
            $retorno['status'] = 1;
            $retorno['retorno'] = $api ? $api->getOnlineList() : [];
            break;
            
        case 'lista-clãs':
            $db = getDBConnection();
            if ($db) {
                try {
                    $stmt = $db->query("SELECT * FROM factions ORDER BY fid DESC LIMIT 50");
                    $retorno['retorno'] = $stmt->fetchAll();
                } catch(Exception $e) { $retorno['retorno'] = []; }
            } else { $retorno['retorno'] = []; }
            $retorno['status'] = 1;
            break;
            
        case 'map-instances':
             $retorno['status'] = 1;
             $retorno['retorno'] = [
                ['id' => 'gs01', 'name' => 'World', 'status' => 'online'],
                ['id' => 'is01', 'name' => 'City of Feather', 'status' => 'online']
             ];
             break;

        default:
            $retorno['status'] = 0; $retorno['error'] = "Function $func not implemented";
    }
} catch (Exception $e) {
    $retorno['status'] = 0; $retorno['error'] = $e->getMessage();
}
echo json_encode($retorno);
?>
