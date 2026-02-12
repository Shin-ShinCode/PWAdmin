<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

require_once('api.php');
require_once('config.php');

$configs = getConfigs();
$retorno = array('status' => 0, 'retorno' => '', 'error' => '');

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
    
    // Local fallback
    if ($configs['ip'] == '127.0.0.1' || $configs['ip'] == 'localhost') {
        return shell_exec($cmd);
    }
    
    $conn = getSSHConnection();
    if (!$conn) {
        // Return a mock/empty response if SSH fails, to prevent crash, but log error
        return ""; 
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
        case 'server-services':
            // Varredura de PIDs automática via SSH
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
            // Optimization: Run one big command to get all PIDs
            // "pgrep -f uniquanamed; pgrep -f authd; ..."
            
            foreach($services as $s) {
                $pidCmd = "pgrep -f " . $s['id'];
                $pidOutput = executeRemoteCommand($pidCmd);
                $pid = (is_numeric(trim($pidOutput))) ? (int)trim($pidOutput) : null;
                
                $cpu = 0;
                $mem = 0;
                
                if ($pid) {
                    $cpuCmd = "ps -p $pid -o %cpu | tail -1";
                    $memCmd = "ps -p $pid -o %mem | tail -1";
                    $cpu = round(floatval(executeRemoteCommand($cpuCmd)), 1);
                    $mem = round(floatval(executeRemoteCommand($memCmd)), 1);
                }

                $res[] = [
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'status' => $pid ? 'online' : 'offline',
                    'pid' => $pid,
                    'cpu' => $cpu,
                    'mem' => $mem
                ];
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

        case 'lista-clãs':
            // Aqui você deve implementar a busca na tabela faction do banco MySQL pw
            $retorno['status'] = 1;
            $retorno['retorno'] = []; 
            break;

        case 'broadcast':
            if($api->WorldChat(1024, getParam('text'), 1)) {
                $retorno['status'] = 1;
            }
            break;
            
        case 'stats-servidor':
            // Exemplo de stats do servidor via SSH
            $uptime = executeRemoteCommand("uptime -p");
            $cpuLoad = executeRemoteCommand("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"); // User + Sys
            $memTotal = executeRemoteCommand("free -m | grep Mem | awk '{print $2}'");
            $memUsed = executeRemoteCommand("free -m | grep Mem | awk '{print $3}'");
            
            $retorno['status'] = 1;
            $retorno['retorno'] = [
                ['name' => 'Uptime', 'value' => trim($uptime)],
                ['name' => 'CPU Load', 'value' => trim($cpuLoad) . '%'],
                ['name' => 'Memory Usage', 'value' => trim($memUsed) . 'MB / ' . trim($memTotal) . 'MB']
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
