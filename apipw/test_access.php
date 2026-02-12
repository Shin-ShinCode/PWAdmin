<?php 
header('Content-Type: text/plain; charset=utf-8'); 

// --- CONFIGURAÇÃO E INICIALIZAÇÃO ---
require_once('config.php');
require_once('api.php');

// Força IP local para conexões internas mais rápidas e seguras
$configs = getConfigs();
$configs['ip'] = '127.0.0.1'; 
$configs['ssh_host'] = '127.0.0.1';

// Instancia API do Jogo (Socket)
$api = null;
try {
    $api = new API();
} catch (Exception $e) {
    $apiError = $e->getMessage();
}

// --- API ACTIONS (POST/GET) ---
if (isset($_REQUEST['action'])) {
    header('Content-Type: application/json');
    $action = $_REQUEST['action'];
    
    if ($action === 'send_chat') {
        $msg = $_REQUEST['msg'] ?? '';
        $channel = $_REQUEST['channel'] ?? 9; // 9 = Broadcast/System
        $roleId = $_REQUEST['role_id'] ?? 1024; // GM ID ou System ID fictício
        
        if ($api && $msg) {
            // Tenta enviar como mensagem de sistema (Broadcast)
            // Canal 9 costuma ser mensagem amarela/sistema central
            try {
                $result = $api->WorldChat($roleId, $msg, $channel);
                echo json_encode(['success' => true, 'result' => $result]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'API not init or missing msg']);
        }
        exit;
    }
    
    if ($action === 'get_territories') {
        if ($api) {
            try {
                $territories = $api->getTerritories();
                echo json_encode(['success' => true, 'data' => $territories]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'API not initialized']);
        }
        exit;
    }

    if ($action === 'get_factions') {
        // Direct MySQL Query for Factions
        try {
            $dsn = "mysql:host=127.0.0.1;dbname=pw;charset=utf8mb4";
            $pdo = new PDO($dsn, "root", "root");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Fetch basic faction info
            $stmt = $pdo->query("SELECT fid, name, level, master, count, announcement FROM factions ORDER BY level DESC, fid ASC");
            $factions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $factions]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }

    if ($action === 'toggle_nw') {
        $enable = $_REQUEST['enable'] === 'true';
        $gsConf = '/PWServer/gamed/config/gs.conf';
        
        if (file_exists($gsConf)) {
            $content = file_get_contents($gsConf);
            
            // Regex to find battlefield setting
            // Pattern: battlefield=0 or battlefield=1
            if ($enable) {
                $newContent = preg_replace('/battlefield\s*=\s*0/', 'battlefield=1', $content);
                // Also check if it doesn't exist, append it? Usually it exists.
            } else {
                $newContent = preg_replace('/battlefield\s*=\s*1/', 'battlefield=0', $content);
            }
            
            if ($content !== $newContent) {
                if (file_put_contents($gsConf, $newContent)) {
                    echo json_encode(['success' => true, 'message' => 'Configuration updated. Restart gamed to apply.']);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to write to gs.conf (Permission denied?)']);
                }
            } else {
                echo json_encode(['success' => true, 'message' => 'Configuration already set.']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'gs.conf not found']);
        }
        exit;
    }
}

echo "=== RELATÓRIO COMPLETO DE INFRAESTRUTURA E DADOS PW (PWServer) ===\n"; 
echo "Gerado em: " . date('Y-m-d H:i:s') . "\n"; 
echo "Servidor: " . $configs['ip'] . " (Local Mode)\n";
echo "PHP Version: " . phpversion() . "\n";
echo "------------------------------------------------\n\n"; 

// --- HELPERS --- 
function checkProcess($name, $alias = '') { 
    $pids = trim(shell_exec("pgrep -f $name")); 
    $pidArray = array_filter(explode("\n", $pids)); 
    $count = count($pidArray); 
    
    $status = $count > 0 ? "[ONLINE]" : "[OFFLINE]"; 
    $pidInfo = $count > 0 ? "(PIDs: " . str_replace("\n", ", ", $pids) . ")" : ""; 
    
    // Get stats for first PID found 
    $mainPid = $pidArray[0] ?? null; 
    $mem = $mainPid ? trim(shell_exec("ps -p $mainPid -o %mem | tail -1")) . "%" : "0%"; 
    $cpu = $mainPid ? trim(shell_exec("ps -p $mainPid -o %cpu | tail -1")) . "%" : "0%"; 
    
    // Check ports 
    $ports = ""; 
    if ($mainPid) { 
        $portsCmd = shell_exec("netstat -nlp 2>/dev/null | grep $mainPid | awk '{print $4}' | awk -F: '{print $NF}' | sort | uniq | tr '\n' ' '"); 
        $ports = $portsCmd ? "Portas: $portsCmd" : ""; 
    } 

    echo sprintf("%-20s %-10s %-20s CPU: %-6s RAM: %-6s %s\n", 
        $alias ?: $name, $status, $pidInfo, $cpu, $mem, $ports); 
    
    return $count > 0; 
} 

function checkDir($path, $label) { 
    if (is_dir($path)) { 
        $perms = substr(sprintf('%o', fileperms($path)), -4); 
        $owner = posix_getpwuid(fileowner($path))['name']; 
        echo "[OK] $label: $path (Perms: $perms, Owner: $owner)\n"; 
        return true; 
    } else { 
        echo "[ERRO] $label: $path não encontrado!\n"; 
        return false; 
    } 
} 

function formatBytes($bytes, $precision = 2) { 
    $units = array('B', 'KB', 'MB', 'GB', 'TB'); 
    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 
    $bytes /= pow(1024, $pow); 
    return round($bytes, $precision) . ' ' . $units[$pow]; 
} 

// 1. ANÁLISE DE PROCESSOS CRÍTICOS 
echo "[1] STATUS DOS SERVIÇOS (DAEMONS)...\n"; 
$services = [ 
    'logservice'   => 'LOGSERVICE', 
    'uniquanamed'  => 'UNIQUENAMED', 
    'authd'        => 'AUTHD', 
    'gamedbd'      => 'GAMEDBD', 
    'gacd'         => 'GACD (AntiCheat)', 
    'gfactiond'    => 'GFACTIOND', 
    'gdeliveryd'   => 'GDELIVERYD', 
    'glinkd'       => 'GLINKD', 
    'gamed'        => 'GAMED (GS)', 
]; 

$onlineCount = 0; 
foreach ($services as $proc => $alias) { 
    if (checkProcess($proc, $alias)) $onlineCount++; 
} 
echo "------------------------------------------------\n"; 
echo "Resumo: $onlineCount / " . count($services) . " serviços online.\n\n"; 


// 2. MAPAS E INSTÂNCIAS (DETALHADO) 
echo "[2] MONITORAMENTO DE MAPAS E INSTÂNCIAS...\n"; 
$gamedPids = trim(shell_exec("pgrep -f gamed")); 

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
    echo "Processos 'gamed' detectados: " . count($pids) . "\n"; 
    
    foreach ($pids as $pid) { 
        if (empty($pid)) continue; 
        
        $cmdline = shell_exec("cat /proc/$pid/cmdline 2>/dev/null"); 
        $cmdline = str_replace("\0", " ", $cmdline); 
        
        $mapId = "unknown"; 
        $mapName = "Desconhecido"; 
        
        if (preg_match('/(gs\d+|is\d+|arena\d+|bg\d+|rand\d+|ms\d+|a\d+)/', $cmdline, $matches)) { 
            $mapId = $matches[1]; 
            $mapName = isset($mapNames[$mapId]) ? $mapNames[$mapId] : "Instância ($mapId)"; 
        } elseif (strpos($cmdline, 'gamed') !== false) { 
            $mapId = "gs01"; 
            $mapName = "MUNDO Principal"; 
        } 

        // Stats 
        $cpu = trim(shell_exec("ps -p $pid -o %cpu | tail -1")); 
        $mem = trim(shell_exec("ps -p $pid -o %mem | tail -1")); 
        
        echo "   - [PID: $pid] $mapName ($mapId) | CPU: $cpu% | RAM: $mem%\n"; 
    } 
} else { 
    echo "[CRÍTICO] Nenhum processo 'gamed' encontrado! O servidor está desligado.\n"; 
} 
echo "\n"; 

// 3. ESTRUTURA DE ARQUIVOS (PWServer) 
echo "[3] VERIFICAÇÃO DE ESTRUTURA (/PWServer)...\n"; 
$pwRoot = '/PWServer'; 

if (is_dir($pwRoot)) { 
    echo "Raiz detectada em: $pwRoot\n"; 
    checkDir("$pwRoot/gamed", "Game Server"); 
    checkDir("$pwRoot/gamedbd", "Database Server"); 
    checkDir("$pwRoot/uniquenamed", "Unique Name"); 
    checkDir("$pwRoot/logs", "Logs de Jogo"); 
    checkDir("$pwRoot/gamed/config", "Configurações"); 
} else { 
    echo "[CRÍTICO] Pasta raiz $pwRoot não encontrada! Verifique o caminho da instalação.\n"; 
} 
echo "\n"; 

// 4. BANCO DE DADOS (MYSQL)
echo "[4] ANÁLISE DE DADOS (MYSQL)...\n"; 
$db_host = "127.0.0.1"; 
$db_user = "root"; 
$db_pass = "root"; 
$db_name = "pw"; 

try { 
    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4"; 
    $pdo = new PDO($dsn, $db_user, $db_pass); 
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    echo "[OK] Conexão MySQL: SUCESSO!\n\n"; 
    
    // 4.1. Contagem Geral
    $users = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(); 
    $factions = $pdo->query("SELECT COUNT(*) FROM factions")->fetchColumn(); 
    
    // Verifica se existe tabela roles
    $hasRoles = false;
    try {
        $rolesCount = $pdo->query("SELECT COUNT(*) FROM roles")->fetchColumn();
        $hasRoles = true;
    } catch (Exception $e) { $rolesCount = "N/A (Tabela 'roles' não existe)"; }

    echo "--- Estatísticas Gerais ---\n";
    echo "   - Contas Totais: $users\n"; 
    echo "   - Clãs Criados: $factions\n"; 
    echo "   - Personagens: $rolesCount\n\n"; 
    
    // 4.2. Últimas Contas Criadas
    echo "--- Últimas 5 Contas Criadas ---\n";
    $stmt = $pdo->query("SELECT ID, name, email, creatime FROM users ORDER BY ID DESC LIMIT 5");
    $lastUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($lastUsers as $u) {
        echo sprintf("   [ID: %-4s] Login: %-15s | Email: %-25s | Data: %s\n", 
            $u['ID'], $u['name'], substr($u['email'], 0, 25), $u['creatime']);
    }
    echo "\n";

    // 4.3. Últimos Personagens (Se tabela roles existir)
    if ($hasRoles) {
        echo "--- Últimos 5 Personagens Criados ---\n";
        // Tenta pegar colunas comuns. Ajuste conforme sua tabela roles.
        // Geralmente: id, name, level, cls (class), gender
        $stmt = $pdo->query("SELECT id, name, level, cls FROM roles ORDER BY id DESC LIMIT 5");
        $lastRoles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $classes = [
            0 => 'Guerreiro', 1 => 'Mago', 2 => 'Espiritualista', 3 => 'Feiticeira', 
            4 => 'Bárbaro', 5 => 'Mercenário', 6 => 'Arqueiro', 7 => 'Sacerdote',
            8 => 'Arcano', 9 => 'Místico', 10 => 'Retalhador', 11 => 'Tormentador'
        ];

        foreach ($lastRoles as $r) {
            $clsName = isset($classes[$r['cls']]) ? $classes[$r['cls']] : "Classe " . $r['cls'];
            echo sprintf("   [ID: %-4s] Nome: %-15s | Nível: %-3s | Classe: %s\n", 
                $r['id'], $r['name'], $r['level'], $clsName);
        }
        echo "\n";
    }

} catch (PDOException $e) { 
    echo "[ERRO] MySQL: " . $e->getMessage() . "\n"; 
} 
echo "\n"; 


// 5. DADOS DO JOGO (VIA SOCKET API)
echo "[5] DADOS EM TEMPO REAL (GAME API)...\n"; 
if ($api) {
    if ($api->serverOnline()) {
        echo "[OK] Servidor de Jogo (GLink/Delivery) respondendo.\n";
        
        // 5.1. Jogadores Online
        $onlineList = $api->getOnlineList();
        $onlineCount = count($onlineList);
        echo "--- Jogadores Online: $onlineCount ---\n";
        
        if ($onlineCount > 0) {
            foreach ($onlineList as $player) {
                // Tenta pegar detalhes extras se possível
                $roleId = $player['roleid'];
                $roleName = $player['name'];
                $userId = $player['userid'];
                
                // Detalhes profundos via API
                $details = "";
                try {
                    $roleData = $api->getRole($roleId);
                    if ($roleData && isset($roleData['status'])) {
                        $lvl = $roleData['status']['level'];
                        $hp = $roleData['status']['hp'];
                        $mp = $roleData['status']['mp'];
                        $details = "| Lvl: $lvl | HP: $hp | MP: $mp";
                    }
                } catch (Exception $e) {}

                echo "   - [UID: $userId] Char: $roleName (ID: $roleId) $details\n";
            }
        } else {
            echo "   (Nenhum jogador online no momento)\n";
        }
        echo "\n";

        // 5.2. Territórios
        echo "--- Territórios ---\n";
        try {
            $territories = $api->getTerritories();
            if ($territories && isset($territories['Territory'])) {
                $count = 0;
                foreach ($territories['Territory'] as $t) {
                    if ($t['owner'] > 0) {
                        // Tentar pegar nome da facção seria ideal, mas custoso fazer N chamadas aqui
                        echo "   - Território ID " . $t['id'] . " (Nível " . $t['level'] . "): Ocupado por Guild ID " . $t['owner'] . "\n";
                        $count++;
                    }
                }
                if ($count == 0) echo "   (Nenhum território ocupado)\n";
            } else {
                echo "   (Erro ao ler territórios ou mapa vazio)\n";
            }
        } catch (Exception $e) {
            echo "   (Falha ao consultar territórios: " . $e->getMessage() . ")\n";
        }

    } else {
        echo "[AVISO] API conectada, mas o servidor parece não estar respondendo na porta de jogo.\n";
    }
} else {
    echo "[ERRO] Falha ao inicializar API: " . ($apiError ?? 'Erro desconhecido') . "\n";
}
echo "\n";


// 6. RECURSOS DO SISTEMA 
echo "[6] RECURSOS DO SERVIDOR...\n"; 
$load = sys_getloadavg(); 
echo "Load Average: " . implode(", ", $load) . "\n"; 

$free = shell_exec("free -m | grep Mem | awk '{print \"Total: \" $2 \"MB | Usado: \" $3 \"MB | Livre: \" $4 \"MB\"}'"); 
echo "Memória: $free\n"; 

$disk = shell_exec("df -h /PWServer | tail -1 | awk '{print \"Total: \" $2 \" | Usado: \" $3 \" (\" $5 \") | Livre: \" $4}'"); 
echo "Disco (/PWServer): " . ($disk ? $disk : "N/A") . "\n"; 

// 7. CHAT LOGS (VIA TAIL)
echo "[7] CHAT LOGS (LAST 10)...\n";
$chatLogs = $api->getChat(10);
if ($chatLogs) {
    foreach ($chatLogs as $log) {
        echo "   " . $log['raw'] . "\n";
    }
} else {
    echo "   (Nenhum log de chat recente ou arquivo inacessível)\n";
}
// 8. NATION WAR (CONFIG CHECK)
echo "[8] NATION WAR CONFIG...\n";
$gsConf = '/PWServer/gamed/config/gs.conf';
$is32 = '/PWServer/gamed/config/is32';

if (file_exists($gsConf)) {
    echo "gs.conf encontrado.\n";
    // Basic check for NW enabled
    $content = file_get_contents($gsConf);
    if (strpos($content, 'battlefield=1') !== false) {
        echo "Nation War (Battlefield) habilitado no gs.conf.\n";
    } else {
        echo "Nation War não parece estar habilitado no gs.conf.\n";
    }
} else {
    echo "gs.conf não encontrado.\n";
}

if (file_exists($is32)) {
    echo "Pasta is32 encontrada (Instância de NW).\n";
} else {
    echo "Pasta is32 não encontrada.\n";
}
echo "\n================================================\n";
echo "FIM DO RELATÓRIO"; 
?>