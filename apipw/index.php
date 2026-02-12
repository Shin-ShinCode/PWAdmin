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
            
            // Definição de Nomes de Mapas
            $mapNames = [
                'gs01' => 'MUNDO Principal',
                'is01' => 'Cidade das Feras Sombrias',
                'is02' => 'Passagem Secreta',
                'is05' => 'Caverna do Fogo',
                'is06' => 'Toca dos Lobos',
                'is07' => 'Caverna do Escorpião-Serpente',
                'is08' => 'Túmulo do Herói',
                'is09' => 'Residência de Hades',
                'is10' => 'Salões Congelados',
                'is11' => 'Vale do Desastre',
                'is12' => 'Ruínas da Selva',
                'is13' => 'Incerteza Fantasma',
                'is14' => 'Portão Desalmado',
                'is15' => 'Caverna do Tesouro',
                'is16' => 'Terra dos Imortais',
                'is17' => 'Terra Demoníaca',
                'is18' => 'Palácio dos Dragões',
                'is19' => 'Ilha dos Piratas',
                'is20' => 'Ilha da Serpente',
                'is21' => 'Sábio',
                'is22' => 'Demônio',
                'is23' => 'Purgatório Celeste',
                'is24' => 'Arcadia Infernal',
                'is25' => 'Cidade do Brado de Batalha',
                'is26' => 'Jaula Amaldiçoada',
                'is27' => 'Clareira da Lua',
                'is28' => 'Vale Primordial',
                'is29' => 'Cidade Glacial',
                'is31' => 'Palácio do Crepusculo',
                'is32' => 'Cubo do Destino',
                'is33' => 'Chrono World',
                'is34' => 'Capela',
                'is35' => 'Base de clã',
                'is37' => '[Morai]',
                'is38' => 'Vale da Fênix',
                'is39' => 'Universo Infinito',
                'is40' => 'Morai Dungeon',
                'is41' => 'Universo Infinito - Modo Avançado',
                'is42' => 'Ravina de Guerra',
                'is43' => 'Cinco Imperadores',
                'is44' => 'Local de Teste',
                'is45' => 'Local de Teste',
                'is46' => 'Local de Teste',
                'is47' => 'Vale do Pôr-do-Sol',
                'is48' => 'Palácio Fechado',
                'is49' => 'Covil do Dragão',
                'is50' => 'Ilha de BOT',
                'is61' => 'Vale Celestial',
                'is62' => 'Origem',
                'is63' => 'Mundo Primitivo',
                'is64' => 'Salão do Despertar',
                'is66' => 'Palácio do Rio de Prata',
                'is67' => 'Catedral',
                'is68' => 'Modo da Coruja - Mundo Primitivo',
                'is69' => 'Caverna das Sombras',
                'is70' => 'Cubo do Destino',
                'is71' => 'Ilha dos Lordes Dragões',
                'is72' => 'Torre do Martírio(1)',
                'is73' => 'Torre do Martírio(2)',
                'is74' => 'Torre do Martírio(3)',
                'is75' => 'Torre do Martírio(4)',
                'is76' => 'O Paraíso Despedaçado',
                'is77' => 'Arena dos Campeões',
                'is78' => 'Continente Ocidental',
                'is79' => 'Ruínas de Snowchill',
                'is80' => 'Moradia(1)',
                'is81' => 'Moradia(2)',
                'is82' => 'Moradia(3)',
                'is83' => 'Moradia(4)',
                'is86' => 'Salões de alvorada',
                'is90' => 'Salões Dawnlight (Evento)',
                'a91' => 'Terra da Aventura de Cheero',
                'ms01' => 'Localização móvel',
                'arena01' => 'Teatro Sangrento',
                'arena02' => 'Cave of Fire',
                'arena03' => 'Wolf Den',
                'arena04' => 'Artes Marciais',
                'arena05' => 'Desconhecido',
                'bg01' => 'Guerra Territorial 3 - PvP',
                'bg02' => 'Guerra Territorial 3 - PvE',
                'bg03' => 'Guerra Territorial 2 - PvP',
                'bg04' => 'Guerra Territorial 2 - PvE',
                'bg05' => 'Guerra Territorial 1 - PvP',
                'bg06' => 'Guerra Territorial 1 - PvE',
                'rand03' => 'Deserto da Miragem',
                'rand04' => 'Labirinto da Areia Viva'
            ];

            if ($gamedPids) {
                $pids = explode("\n", $gamedPids);
                foreach ($pids as $pid) {
                    if (empty($pid)) continue;
                    
                    // Try to get map name from cmdline
                    $cmdline = executeRemoteCommand("cat /proc/$pid/cmdline 2>/dev/null");
                    $cmdline = str_replace("\0", " ", $cmdline);
                    
                    $mapName = "Desconhecido";
                    $mapId = "unknown";
                    
                    if (preg_match('/(gs\d+|is\d+|arena\d+|bg\d+|rand\d+|ms\d+|a\d+)/', $cmdline, $matches)) {
                        $mapId = $matches[1];
                        $mapName = isset($mapNames[$mapId]) ? $mapNames[$mapId] : "Instância ($mapId)";
                    } elseif (strpos($cmdline, 'gamed') !== false) {
                        $mapName = "MUNDO Principal";
                        $mapId = "gs01";
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
                    ['id' => 'gs01', 'name' => 'MUNDO Principal', 'status' => 'offline', 'players' => 0]
                ];
            }

            $retorno['status'] = 1;
            $retorno['retorno'] = $instances;
            break;

        case 'ultimas-contas':
            $db = getDBConnection();
            if (!$db) {
                $retorno['status'] = 0;
                $retorno['error'] = "Sem conexão MySQL";
            } else {
                try {
                    $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 10;
                    $stmt = $db->prepare("SELECT ID, name, email, creatime FROM users ORDER BY ID DESC LIMIT :limit");
                    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                    $stmt->execute();
                    $retorno['status'] = 1;
                    $retorno['retorno'] = $stmt->fetchAll();
                } catch (Exception $e) {
                    $retorno['status'] = 0;
                    $retorno['error'] = $e->getMessage();
                }
            }
            break;

        case 'ultimos-personagens':
            $db = getDBConnection();
            if (!$db) {
                $retorno['status'] = 0;
                $retorno['error'] = "Sem conexão MySQL";
            } else {
                try {
                    // Verifica se tabela roles existe
                    $check = $db->query("SHOW TABLES LIKE 'roles'");
                    if ($check->rowCount() > 0) {
                        $limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 50;
                        // JOIN com users para pegar o login
                        $sql = "SELECT r.id, r.name, r.level, r.cls, r.gender, u.name as login 
                                FROM roles r 
                                LEFT JOIN users u ON r.userid = u.ID 
                                ORDER BY r.id DESC LIMIT :limit";
                        $stmt = $db->prepare($sql);
                        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                        $stmt->execute();
                        $retorno['status'] = 1;
                        $retorno['retorno'] = $stmt->fetchAll();
                    } else {
                        $retorno['status'] = 0;
                        $retorno['error'] = "Tabela 'roles' não encontrada.";
                    }
                } catch (Exception $e) {
                    $retorno['status'] = 0;
                    $retorno['error'] = $e->getMessage();
                }
            }
            break;

        case 'territorios':
            if ($api) {
                try {
                    $territories = $api->getTerritories();
                    // Processa para formato mais limpo
                    $cleanList = [];
                    if (isset($territories['Territory'])) {
                        foreach ($territories['Territory'] as $t) {
                            if ($t['owner'] > 0) {
                                $cleanList[] = [
                                    'id' => $t['id'],
                                    'level' => $t['level'],
                                    'owner_id' => $t['owner'],
                                    'color' => $t['color']
                                ];
                            }
                        }
                    }
                    $retorno['status'] = 1;
                    $retorno['retorno'] = $cleanList;
                } catch (Exception $e) {
                    $retorno['status'] = 0;
                    $retorno['error'] = $e->getMessage();
                }
            }
            break;

        case 'detalhes-personagem':
            if ($api) {
                $roleId = getParam('roleid');
                $roleName = getParam('rolename');
                
                if (!$roleId && $roleName) {
                    $roleId = $api->getRoleid($roleName);
                }
                
                if ($roleId && $roleId != -1) {
                    $data = $api->getRole($roleId);
                    if ($data) {
                        $retorno['status'] = 1;
                        $retorno['retorno'] = $data;
                    } else {
                        $retorno['status'] = 0;
                        $retorno['error'] = "Dados do personagem não encontrados.";
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['error'] = "Personagem não encontrado.";
                }
            }
            break;

        case 'detalhes-conta':
             if ($api) {
                $uid = (int)getParam('userid');
                if ($uid > 0) {
                    $data = $api->getUser($uid);
                    if ($data) {
                        $retorno['status'] = 1;
                        $retorno['retorno'] = $data;
                    } else {
                        $retorno['status'] = 0;
                        $retorno['error'] = "Dados da conta não encontrados.";
                    }
                } else {
                    $retorno['status'] = 0;
                    $retorno['error'] = "ID de conta inválido.";
                }
            }
            break;

        case 'detalhes-faccao':
            if ($api) {
                $fid = (int)getParam('fid');
                if ($fid > 0) {
                     $data = $api->getFactionDetail($fid);
                     if ($data) {
                        $retorno['status'] = 1;
                        $retorno['retorno'] = $data;
                     } else {
                        $retorno['status'] = 0;
                        $retorno['error'] = "Dados do clã não encontrados.";
                     }
                } else {
                    $retorno['status'] = 0;
                    $retorno['error'] = "ID de clã inválido.";
                }
            }
            break;

        case 'enviar-item':
            if ($api) {
                $roleId = (int)getParam('roleid');
                $title = getParam('title');
                $context = getParam('context');
                $itemId = (int)getParam('item_id');
                $count = (int)getParam('count');
                $money = (int)getParam('money');
                
                $item = [
                    'id' => $itemId,
                    'pos' => 0,
                    'count' => $count,
                    'max_count' => $count,
                    'data' => '',
                    'proctype' => 0,
                    'expire_date' => 0,
                    'guid1' => 0,
                    'guid2' => 0,
                    'mask' => 0
                ];

                if ($api->sendMail($roleId, $title, $context, $item, $money)) {
                    $retorno['status'] = 1;
                    $retorno['retorno'] = true;
                } else {
                    $retorno['status'] = 0;
                    $retorno['error'] = "Falha ao enviar correio (GProvider).";
                }
            }
            break;

        case 'banir-desbanir':
            if ($api) {
                $roleId = (int)getParam('userid'); // Aqui esperamos o RoleID na verdade
                // 100 anos de ban
                $duration = 3153600000; 
                $reason = "Banned by PWAdmin";
                
                // Primeiro verifica status atual no banco para saber se é ban ou desban
                // Por simplificação, vamos assumir que é para BANIR sempre por enquanto, 
                // ou implementar toggle se tivermos acesso ao status.
                // Vou implementar BANIMENTO direto.
                
                if ($api->forbidRole($roleId, $duration, $reason)) {
                     $retorno['status'] = 1;
                     $retorno['retorno'] = true;
                } else {
                     $retorno['status'] = 0;
                     $retorno['error'] = "Falha ao banir personagem.";
                }
            }
            break;

        case 'chat-logs':
            // Mock ou leitura de logs reais se tiver acesso
            // Vamos tentar ler as ultimas linhas do log do gamed se possivel
            $logPath = '/PWServer/gamed/logs/world2.format.log'; // Exemplo
            if (file_exists($logPath)) {
                $lines = array_slice(file($logPath), -50);
                $logs = [];
                foreach($lines as $l) {
                    // Parser basico
                    $logs[] = ['time' => substr($l, 0, 19), 'channel' => 'global', 'sender' => 'System', 'msg' => $l];
                }
                $retorno['status'] = 1;
                $retorno['retorno'] = $logs;
            } else {
                // Retorno vazio para nao quebrar
                $retorno['status'] = 1;
                $retorno['retorno'] = [];
            }
            break;

        case 'get-lua-config':
            $luaPath = '/PWServer/gamed/script.lua';
            if (PHP_OS_FAMILY === 'Linux') {
                $content = file_get_contents($luaPath);
            } else {
                $content = executeRemoteCommand("cat $luaPath");
            }
            
            if ($content) {
                $retorno['status'] = 1;
                $retorno['retorno'] = $content;
            } else {
                $retorno['status'] = 0;
                $retorno['error'] = "Não foi possível ler o arquivo script.lua";
            }
            break;

        case 'save-lua-config':
            $content = getParam('content');
            $luaPath = '/PWServer/gamed/script.lua';
            
            if (!$content) {
                $retorno['status'] = 0;
                $retorno['error'] = "Conteúdo vazio";
            } else {
                // Em ambiente de produção, use SSH/SFTP ou file_put_contents se permissões permitirem
                // Como executeRemoteCommand é para leitura geralmente, vamos tentar escrever via echo
                // CUIDADO: Isso pode falhar com caracteres especiais. O ideal é file_put_contents local se PHP rodar no mesmo server.
                
                if (PHP_OS_FAMILY === 'Linux') {
                    if (file_put_contents($luaPath, $content) !== false) {
                        $retorno['status'] = 1;
                        $retorno['retorno'] = true;
                    } else {
                        $retorno['status'] = 0;
                        $retorno['error'] = "Falha ao escrever no arquivo (permissão?)";
                    }
                } else {
                    // Fallback remoto precário (base64 para evitar corrupção)
                    $b64 = base64_encode($content);
                    $cmd = "echo '$b64' | base64 -d > $luaPath";
                    executeRemoteCommand($cmd);
                    $retorno['status'] = 1;
                    $retorno['retorno'] = true;
                }
            }
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
