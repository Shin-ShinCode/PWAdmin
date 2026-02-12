<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

// Error Handling for "Service Unavailable"
function handleFatalError() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        echo json_encode([
            'status' => 0, 
            'error' => 'Critical Server Error: ' . $error['message'] . ' in ' . $error['file'] . ':' . $error['line']
        ]);
    }
}
register_shutdown_function('handleFatalError');

require_once('api.php');
require_once('config.php');

$configs = getConfigs();
$retorno = array('status' => 0, 'retorno' => '', 'error' => '');

// --- DATABASE HELPER FUNCTIONS ---
$db_connection = null;

function getDBConnection() {
    global $db_connection, $configs;
    if ($db_connection) return $db_connection;

    try {
        $dsn = "mysql:host=" . $configs['db_host'] . ";dbname=" . $configs['db_name'] . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $db_connection = new PDO($dsn, $configs['db_user'], $configs['db_pass'], $options);
        return $db_connection;
    } catch (PDOException $e) {
        return null;
    }
}

// --- SSH HELPER FUNCTIONS ---
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
    
    if (PHP_OS_FAMILY === 'Linux') {
        return @shell_exec($cmd);
    }

    if ($configs['ip'] == '127.0.0.1' || $configs['ip'] == 'localhost') {
        return @shell_exec($cmd);
    }
    
    $conn = getSSHConnection();
    if (!$conn) {
        return ""; 
    }
    
    $stream = @ssh2_exec($conn, $cmd);
    if (!$stream) return "";

    stream_set_blocking($stream, true);
    $output = stream_get_contents($stream);
    fclose($stream);
    return $output;
}

function getParam($name, $default = '') { return isset($_POST[$name]) ? $_POST[$name] : $default; }

if(getParam('token') !== $configs['token']) {
    echo json_encode(['status' => 0, 'error' => 'Token de API Inválido']);
    exit;
}

try {
    $api = null;
    if (class_exists('API')) {
        $api = new API();
    }

    $func = getParam('function');

    switch ($func) {
        case 'criar-conta':
            $login = getParam('login');
            $pass  = getParam('pass');
            $email = getParam('email');
            
            $db = getDBConnection();
            if (!$db) throw new Exception("Erro de conexão com Banco de Dados MySQL");
            
            $passHash = base64_encode(md5($login . $pass, true)); 

            try {
                $stmt = $db->prepare("CALL adduser(:login, :pass, '0', '0', '0', '0', :email, '0', '0', '0', '0', '0', '0', '0', '', '', '0')");
                $stmt->execute(['login' => $login, 'pass' => $passHash, 'email' => $email]);
            } catch (PDOException $e) {
                $stmt = $db->prepare("INSERT INTO users (name, passwd, email, creatime) VALUES (:login, :pass, :email, NOW())");
                $stmt->execute(['login' => $login, 'pass' => $passHash, 'email' => $email]);
            }
            
            $retorno['status'] = 1;
            $retorno['retorno'] = true;
            break;

        case 'lista-clãs':
            $db = getDBConnection();
            if (!$db) {
                $retorno['retorno'] = [];
                $retorno['status'] = 1;
            } else {
                try {
                    $stmt = $db->query("SELECT * FROM factions ORDER BY fid DESC LIMIT 50");
                    $retorno['status'] = 1;
                    $retorno['retorno'] = $stmt->fetchAll();
                } catch (Exception $e) {
                    $retorno['retorno'] = [];
                    $retorno['status'] = 1;
                }
            }
            break;

        case 'server-services':
            $services = [
                ['id' => 'logservice', 'name' => 'LOGSERVICE'],
                ['id' => 'uniquanamed', 'name' => 'UNIQUENAMED'],
                ['id' => 'authd', 'name' => 'AUTHD'],
                ['id' => 'gamedbd', 'name' => 'GAMEDBD'],
                ['id' => 'gdeliveryd', 'name' => 'GDELIVERYD'],
                ['id' => 'gacd', 'name' => 'GACD (AntiCheat)'],
                ['id' => 'gfactiond', 'name' => 'GFACTIOND'],
                ['id' => 'glinkd', 'name' => 'GLINKD (Proxy)'],
                ['id' => 'gamed', 'name' => 'GAMED (GS)']
            ];
            
            $res = [];
            foreach($services as $s) {
                $pidCmd = "pgrep -f " . $s['id'];
                $pidOutput = executeRemoteCommand($pidCmd);
                // Handle multiple PIDs (e.g., glinkd)
                $pids = array_filter(explode("\n", trim($pidOutput)));
                $pid = !empty($pids) ? $pids[0] : null; // Use first PID found
                
                $cpu = 0; $mem = 0;
                if ($pid) {
                    $cpuRaw = executeRemoteCommand("ps -p $pid -o %cpu | tail -1");
                    $memRaw = executeRemoteCommand("ps -p $pid -o %mem | tail -1");
                    $cpu = is_numeric(trim($cpuRaw)) ? round(floatval(trim($cpuRaw)), 1) : 0;
                    $mem = is_numeric(trim($memRaw)) ? round(floatval(trim($memRaw)), 1) : 0;
                }

                $res[] = ['id' => $s['id'], 'name' => $s['name'], 'status' => $pid ? 'online' : 'offline', 'pid' => (int)$pid, 'cpu' => $cpu, 'mem' => $mem];
            }
            $retorno['status'] = 1;
            $retorno['retorno'] = $res;
            break;

        case 'online':
            if ($api) {
                $retorno['status'] = 1;
                $retorno['retorno'] = $api->getOnlineList();
            } else {
                $retorno['status'] = 1;
                $retorno['retorno'] = [];
            }
            break;

        case 'salvar-personagem':
            if ($api) {
                $uid = (int)getParam('userid');
                $data = json_decode(getParam('data'), true);
                if($api->putRole($uid, $data)) {
                    $retorno['status'] = 1;
                } else {
                    $retorno['error'] = 'GamedBD: Erro ao persistir dados no banco pw.';
                }
            }
            break;

        case 'broadcast':
            if ($api && $api->WorldChat(1024, getParam('text'), 1)) {
                $retorno['status'] = 1;
            }
            break;
            
        case 'stats-servidor':
            // Coleta dados reais do servidor
            $cpuLoad = executeRemoteCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");
            $memTotal = executeRemoteCommand("free -m | grep Mem | awk '{print $2}'");
            $memUsed = executeRemoteCommand("free -m | grep Mem | awk '{print $3}'");
            $swapTotal = executeRemoteCommand("free -m | grep Swap | awk '{print $2}'");
            $swapUsed = executeRemoteCommand("free -m | grep Swap | awk '{print $3}'");
            
            // Simulação de tráfego de rede (necessitaria de vnstat ou leitura de /proc/net/dev)
            $netIn = 0.5; // Mock
            $netOut = 0.1; // Mock
            
            // Jogadores Online (via API do PW)
            $players = 0;
            if ($api) {
                $onlineList = $api->getOnlineList();
                $players = is_array($onlineList) ? count($onlineList) : 0;
            }

            // Retorna formato compatível com DashboardStats (types.ts)
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                'time' => date('H:i'),
                'cpu' => is_numeric(trim($cpuLoad)) ? (float)trim($cpuLoad) : 0,
                'ram' => is_numeric(trim($memUsed)) ? (float)trim($memUsed) / 1024 : 0, // Convertendo para GB
                'ram_total' => is_numeric(trim($memTotal)) ? (float)trim($memTotal) / 1024 : 16,
                'swap' => is_numeric(trim($swapUsed)) ? (float)trim($swapUsed) / 1024 : 0,
                'swap_total' => is_numeric(trim($swapTotal)) ? (float)trim($swapTotal) / 1024 : 0,
                'players' => $players,
                'net_in' => $netIn,
                'net_out' => $netOut
            ];
            break;
            
        case 'map-instances':
            $gamedPids = trim(executeRemoteCommand("pgrep -f gamed"));
            $instances = [];
            
            if ($gamedPids) {
                $pids = explode("\n", $gamedPids);
                foreach ($pids as $pid) {
                    if (empty($pid)) continue;
                    
                    // Try to get map name from cmdline
                    $cmdline = executeRemoteCommand("cat /proc/$pid/cmdline 2>/dev/null");
                    $cmdline = str_replace("\0", " ", $cmdline);
                    
                    $mapName = "Unknown Instance";
                    $mapId = "gs_" . $pid;
                    
                    if (preg_match('/(gs\d+|is\d+|arena\d+|bg\d+)/', $cmdline, $matches)) {
                        $mapName = $matches[1];
                        $mapId = $matches[1];
                    } elseif (strpos($cmdline, 'gamed') !== false) {
                        $mapName = "World (GS)";
                        $mapId = "world";
                    }
                    
                    $instances[] = [
                        'id' => $mapId,
                        'name' => $mapName,
                        'status' => 'online',
                        'players' => 0 // Would need deep packet inspection or logs to know per-map players
                    ];
                }
            } else {
                // Fallback / Mock if offline or permission denied
                 $instances = [
                    ['id' => 'gs01', 'name' => 'World', 'status' => 'offline', 'players' => 0]
                ];
            }

            $retorno['status'] = 1;
            $retorno['retorno'] = $instances;
            break;

        default:
            $retorno['status'] = 0; 
            $retorno['error'] = "Função [$func] não integrada.";
    }
} catch (Exception $e) {
    $retorno['status'] = 0;
    $retorno['error'] = $e->getMessage();
}

echo json_encode($retorno);
?>
