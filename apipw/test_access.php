<?php
header('Content-Type: text/plain; charset=utf-8');
require_once('config.php');

echo "=== DIAGNÓSTICO AVANÇADO DE INFRAESTRUTURA PW ===\n";
echo "Data: " . date('Y-m-d H:i:s') . "\n";
echo "Sistema: " . PHP_OS . " (" . php_uname() . ")\n";
echo "Usuário PHP: " . exec('whoami') . " | UID: " . getmyuid() . "\n";
echo "Servidor Alvo: " . $configs['ip'] . "\n";
echo "------------------------------------------------\n\n";

// --- HELPERS ---
function checkProcess($name, $alias = '') {
    $pid = trim(shell_exec("pgrep -f $name"));
    $status = $pid ? "[ONLINE]" : "[OFFLINE]";
    $color = $pid ? "PASS" : "FAIL";
    $pidInfo = $pid ? "(PID: $pid)" : "";
    $mem = $pid ? trim(shell_exec("ps -p $pid -o %mem | tail -1")) . "%" : "0%";
    $cpu = $pid ? trim(shell_exec("ps -p $pid -o %cpu | tail -1")) . "%" : "0%";
    
    // Check if process is listening on ports (if netstat/ss available)
    $ports = "";
    if ($pid) {
        $ports = shell_exec("netstat -nlp | grep $pid | awk '{print $4}' | tr '\n' ' '");
        $ports = $ports ? "Ports: $ports" : "";
    }

    echo sprintf("%-20s %-10s %-15s CPU: %-6s RAM: %-6s %s\n", 
        $alias ?: $name, $status, $pidInfo, $cpu, $mem, $ports);
    
    return $pid ? true : false;
}

function checkDir($path, $label) {
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        $owner = posix_getpwuid(fileowner($path))['name'];
        echo "[OK] $label: $path (Perms: $perms, Owner: $owner)\n";
        
        // Count files
        $count = count(scandir($path)) - 2;
        echo "     - Arquivos encontrados: $count\n";
        return true;
    } else {
        echo "[ERRO] $label: $path não encontrado!\n";
        return false;
    }
}

// 1. ANÁLISE DE PROCESSOS CRÍTICOS (PW CORE)
echo "[1] STATUS DOS PROCESSOS (CORE SERVICES)...\n";
$services = [
    'logservice'   => 'LOGSERVICE',
    'uniquanamed'  => 'UNIQUENAMED',
    'authd'        => 'AUTHD',
    'gamedbd'      => 'GAMEDBD',
    'gacd'         => 'GACD (AntiCheat)',
    'gfactiond'    => 'GFACTIOND',
    'gdeliveryd'   => 'GDELIVERYD',
    'glinkd'       => 'GLINKD (Global)',
    'gamed'        => 'GAMED (GS)',
];

$onlineCount = 0;
foreach ($services as $proc => $alias) {
    if (checkProcess($proc, $alias)) $onlineCount++;
}
echo "------------------------------------------------\n";
echo "Resumo: $onlineCount / " . count($services) . " serviços online.\n\n";


// 2. MAPAS E INSTÂNCIAS (GS)
echo "[2] MONITORAMENTO DE MAPAS (GAMED)...\n";
$gsPid = trim(shell_exec("pgrep -f gamed"));
if ($gsPid) {
    echo "Gamed (GS) está rodando (PID: $gsPid).\n";
    echo "Tentando identificar instâncias de mapas ativos...\n";
    
    // Check open files by GS to find maps (advanced)
    // gs usually opens map configuration files
    $maps = shell_exec("lsof -p $gsPid | grep '/gamed/config/' | awk '{print $9}' | sort | uniq");
    if ($maps) {
        $mapCount = substr_count($maps, "\n");
        echo "   - Instâncias detectadas: $mapCount\n";
    } else {
        echo "   - Não foi possível listar detalhes dos mapas (permissão lsof restrita?)\n";
    }
} else {
    echo "[CRÍTICO] GAMED (GS) ESTÁ OFF! O MUNDO ESTÁ DESLIGADO.\n";
}
echo "\n";


// 3. ESTRUTURA DE ARQUIVOS
echo "[3] VERIFICAÇÃO DE ESTRUTURA DE DIRETÓRIOS...\n";
$pwRoot = '/home'; // Adjust based on common setups: /home, /root, /usr
$candidates = ['$pwRoot/gamed', '$pwRoot/gamedbd', '/var/log/pw'];

// Try to auto-detect PW root
$detectedRoot = null;
if (is_dir('/home/gamed')) $detectedRoot = '/home';
elseif (is_dir('/root/gamed')) $detectedRoot = '/root';
elseif (is_dir('/usr/gamed')) $detectedRoot = '/usr';

if ($detectedRoot) {
    echo "Raiz PW detectada em: $detectedRoot\n";
    checkDir("$detectedRoot/gamed", "Game Server");
    checkDir("$detectedRoot/gamedbd", "Database Server");
    checkDir("$detectedRoot/uniquenamed", "Unique Name");
    checkDir("$detectedRoot/gamed/logs", "Logs de Jogo");
    checkDir("$detectedRoot/gamed/config", "Configurações");
} else {
    echo "[AVISO] Não foi possível detectar automaticamente a pasta raiz do servidor (padrão /home/gamed não encontrado).\n";
}
echo "\n";


// 4. BANCO DE DADOS
echo "[4] CONEXÃO MYSQL E INTEGRIDADE...\n";
try {
    $dsn = "mysql:host=" . $configs['db_host'] . ";dbname=" . $configs['db_name'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $configs['db_user'], $configs['db_pass']);
    echo "[OK] Conexão MySQL: SUCESSO\n";
    
    $res = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "   - Contas cadastradas: $res\n";
    
    $res = $pdo->query("SELECT COUNT(*) FROM point")->fetchColumn();
    echo "   - Registros de Cubi (point): $res\n";
    
    $res = $pdo->query("SELECT COUNT(*) FROM factions")->fetchColumn();
    echo "   - Clãs criados: $res\n";
    
    // Check Procedures
    $procs = $pdo->query("SHOW PROCEDURE STATUS WHERE Db = '" . $configs['db_name'] . "'")->fetchAll();
    echo "   - Stored Procedures encontradas: " . count($procs) . "\n";
    $hasAddUser = false;
    foreach($procs as $p) { if($p['Name'] == 'adduser') $hasAddUser = true; }
    echo "   - Procedure 'adduser': " . ($hasAddUser ? "OK" : "AUSENTE (Criação de conta pode falhar)") . "\n";

} catch (Exception $e) {
    echo "[ERRO] MySQL: " . $e->getMessage() . "\n";
}
echo "\n";


// 5. RECURSOS DO SISTEMA
echo "[5] RECURSOS DO SERVIDOR...\n";
$load = sys_getloadavg();
echo "Load Average: " . implode(", ", $load) . "\n";

$free = shell_exec("free -m");
echo "Memória:\n$free\n";

$disk = shell_exec("df -h /");
echo "Disco:\n$disk\n";

echo "\n================================================\n";
echo "FIM DO RELATÓRIO AVANÇADO";
?>
