
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

require_once('api.php');
require_once('config.php');

$configs = getConfigs();

$retorno = array('status' => 0, 'retorno' => '', 'error' => '');

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
            // Varredura de PIDs automática via Shell do Linux
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
                $pid = shell_exec("pgrep -f " . $s['id']);
                $pid = $pid ? (int)trim($pid) : null;
                $res[] = [
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'status' => $pid ? 'online' : 'offline',
                    'pid' => $pid,
                    'cpu' => $pid ? round(floatval(shell_exec("ps -p $pid -o %cpu | tail -1")), 1) : 0,
                    'mem' => $pid ? round(floatval(shell_exec("ps -p $pid -o %mem | tail -1")), 1) : 0
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
            // Exemplo fictício de retorno estruturado
            $retorno['status'] = 1;
            $retorno['retorno'] = []; // Implementar query SQL aqui
            break;

        case 'broadcast':
            if($api->WorldChat(1024, getParam('text'), 1)) {
                $retorno['status'] = 1;
            }
            break;

        default:
            $retorno['error'] = "Função [$func] não integrada ou em desenvolvimento.";
    }
} catch (Exception $e) {
    $retorno['error'] = $e->getMessage();
}

echo json_encode($retorno);
?>
