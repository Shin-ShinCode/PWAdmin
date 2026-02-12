<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

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
        // Log error but don't crash yet, let specific functions handle it
        return null;
    }
}

// --- SSH HELPER FUNCTIONS ---
$ssh_connection = null;

function getSSHConnection() {
    global $ssh_connection, $configs;
    if ($ssh_connection) return $ssh_connection;
    
    // Check if ssh2 extension is loaded
    if (!function_exists("ssh2_connect")) {
        return null;
    }
    
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
        return shell_exec($cmd);
    }

    if ($configs['ip'] == '127.0.0.1' || $configs['ip'] == 'localhost') {
        return shell_exec($cmd);
    }
    
    $conn = getSSHConnection();
    if (!$conn) {
        return shell_exec($cmd); 
    }
    
    $stream = ssh2_exec($conn, $cmd);
    stream_set_blocking($stream, true);
    $output = stream_get_contents($stream);
    fclose($stream);
    return $output;
}
// ----------------------------

function getParam($name, $default = '') { return isset($_POST[$name]) ? $_POST[$name] : $default; }

if(getParam('token') !== $configs['token']) {
    echo json_encode(['status' => 0, 'error' => 'Token de API Inválido']);
    exit;
}

try {
    $api = new API();
    $func = getParam('function');

    switch ($func) {
        // --- FUNÇÕES DE BANCO DE DADOS (MySQL) ---
        
        case 'criar-conta':
            $login = getParam('login');
            $pass  = getParam('pass'); // Deve vir como base64 MD5 do frontend ou plain text para hashear aqui
            $email = getParam('email');
            
            // PW usa MD5 Binary para senhas geralmente, ou MD5 salt.
            // Padrão comum: call procedure adduser
            $db = getDBConnection();
            if (!$db) throw new Exception("Erro de conexão com Banco de Dados MySQL");
            
            // Exemplo de chamada de procedure padrão do PW
            // CALL adduser('login', 'md5_pass', '0', '0', '0', '0', 'email', '0', '0', '0', '0', '0', '0', '0', '', '', '0');
            // Adaptar conforme a estrutura da sua tabela `users`
            
            // Hash da senha (md5 saltada ou binary, verifique seu authd)
            // Assumindo MD5 simples base64 para este exemplo:
            $passHash = base64_encode(md5($login . $pass, true)); 

            $stmt = $db->prepare("CALL adduser(:login, :pass, '0', '0', '0', '0', :email, '0', '0', '0', '0', '0', '0', '0', '', '', '0')");
            $stmt->execute(['login' => $login, 'pass' => $passHash, 'email' => $email]);
            
            $retorno['status'] = 1;
            $retorno['retorno'] = true;
            break;

        case 'lista-clãs':
            $db = getDBConnection();
            if (!$db) throw new Exception("Erro de conexão com Banco de Dados MySQL");
            
            $stmt = $db->query("SELECT * FROM factions ORDER BY fid DESC LIMIT 50"); // Ajuste nome da tabela
            $retorno['status'] = 1;
            $retorno['retorno'] = $stmt->fetchAll();
            break;

        // --- FUNÇÕES DE SISTEMA (Socket / SSH) ---

        case 'server-services':
            $services = [
                ['id' => 'uniquanamed', 'name' => 'UNIQUENAMED'],
                ['id' => 'authd', 'name' => 'AUTHD'],
                ['id' => 'gamestbd', 'name' => 'GAMESTBD'],
                ['id' => 'gamedbd', 'name' => 'GAMEDBD'],
                ['id' => 'gdeliveryd', 'name' => 'GDELIVERYD'],
                ['id' => 'gacd', 'name' => 'GACD (AntiCheat)'],
                ['id' => 'gfactiond', 'name' => 'GFACTIOND'],
                ['id' => 'glinkd', 'name' => 'GLINKD (Proxy)']
            ];
            
            $res = [];
            foreach($services as $s) {
                $pidCmd = "pgrep -f " . $s['id'];
                $pidOutput = executeRemoteCommand($pidCmd);
                $pid = (is_numeric(trim($pidOutput))) ? (int)trim($pidOutput) : null;
                
                $cpu = 0; $mem = 0;
                if ($pid) {
                    $cpu = is_numeric(trim(executeRemoteCommand("ps -p $pid -o %cpu | tail -1"))) ? round(floatval(trim(executeRemoteCommand("ps -p $pid -o %cpu | tail -1"))), 1) : 0;
                    $mem = is_numeric(trim(executeRemoteCommand("ps -p $pid -o %mem | tail -1"))) ? round(floatval(trim(executeRemoteCommand("ps -p $pid -o %mem | tail -1"))), 1) : 0;
                }

                $res[] = ['id' => $s['id'], 'name' => $s['name'], 'status' => $pid ? 'online' : 'offline', 'pid' => $pid, 'cpu' => $cpu, 'mem' => $mem];
            }
            $retorno['status'] = 1;
            $retorno['retorno'] = $res;
            break;

        case 'online':
            $retorno['status'] = 1;
            $retorno['retorno'] = $api->getOnlineList();
            break;

        case 'salvar-personagem':
            $uid = (int)getParam('userid');
            $data = json_decode(getParam('data'), true);
            if($api->putRole($uid, $data)) {
                $retorno['status'] = 1;
            } else {
                $retorno['error'] = 'GamedBD: Erro ao persistir dados no banco pw.';
            }
            break;

        case 'broadcast':
            if($api->WorldChat(1024, getParam('text'), 1)) {
                $retorno['status'] = 1;
            }
            break;
            
        case 'stats-servidor':
            $uptime = executeRemoteCommand("uptime -p");
            $cpuLoad = executeRemoteCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'");
            $memTotal = executeRemoteCommand("free -m | grep Mem | awk '{print $2}'");
            $memUsed = executeRemoteCommand("free -m | grep Mem | awk '{print $3}'");
            
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                ['name' => 'Uptime', 'value' => trim($uptime)],
                ['name' => 'CPU Load', 'value' => trim($cpuLoad) . '%'],
                ['name' => 'Memory Usage', 'value' => trim($memUsed) . 'MB / ' . trim($memTotal) . 'MB']
            ];
            break;
            
        case 'map-instances':
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                ['id' => 1, 'name' => 'World', 'status' => 'online', 'players' => 0],
                ['id' => 101, 'name' => 'City of Feather', 'status' => 'online', 'players' => 0]
            ];
            break;

        default:
            $retorno['error'] = "Função [$func] não integrada ou em desenvolvimento.";
    }
} catch (Exception $e) {
    $retorno['error'] = $e->getMessage();
}

echo json_encode($retorno);
?>
