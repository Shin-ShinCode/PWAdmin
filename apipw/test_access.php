<?php
header('Content-Type: text/plain; charset=utf-8');
require_once('config.php');

echo "=== DIAGNÓSTICO DE ACESSO AO SERVIDOR ===\n";
echo "Data: " . date('Y-m-d H:i:s') . "\n";
echo "Sistema Operacional: " . PHP_OS . " (" . php_uname() . ")\n";
echo "Usuário do PHP: " . exec('whoami') . "\n";
echo "----------------------------------------\n\n";

// 1. TESTE DE EXECUÇÃO DE COMANDOS (SHELL)
echo "[1] TESTE DE COMANDOS SHELL (PIDs)...\n";
if (!function_exists('shell_exec')) {
    echo "[ERRO] A função 'shell_exec' está desabilitada no PHP. O painel não conseguirá ver os processos.\n";
} else {
    echo "[OK] 'shell_exec' está habilitado.\n";
    
    $services = ['gamedbd', 'gdeliveryd', 'glinkd', 'uniquanamed'];
    foreach ($services as $svc) {
        $pid = trim(shell_exec("pgrep -f $svc"));
        if ($pid) {
            echo "   - $svc: ENCONTRADO (PID: $pid)\n";
        } else {
            echo "   - $svc: NÃO ENCONTRADO (O servidor está ligado? O usuário do PHP tem permissão para ver?)\n";
            // Tenta listar processos de outra forma para debug
            $check = shell_exec("ps aux | grep $svc | grep -v grep");
            if ($check) echo "     (Mas aparece no 'ps aux': $check)\n";
        }
    }
}
echo "\n";

// 2. TESTE DE CONEXÃO COM BANCO DE DADOS
echo "[2] TESTE DE BANCO DE DADOS (MySQL)...\n";
$configs = getConfigs();
try {
    $dsn = "mysql:host=" . $configs['db_host'] . ";dbname=" . $configs['db_name'] . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $configs['db_user'], $configs['db_pass']);
    echo "[OK] Conexão MySQL realizada com sucesso!\n";
    
    // Tenta listar tabelas
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "   - Tabelas encontradas: " . count($tables) . "\n";
    if (in_array('users', $tables)) echo "   - Tabela 'users': OK\n";
    if (in_array('point', $tables)) echo "   - Tabela 'point': OK\n";
    
} catch (Exception $e) {
    echo "[ERRO] Falha ao conectar no MySQL: " . $e->getMessage() . "\n";
    echo "   - Host configurado: " . $configs['db_host'] . "\n";
    echo "   - Usuário configurado: " . $configs['db_user'] . "\n";
}
echo "\n";

// 3. TESTE DE PERMISSÕES DE ARQUIVO
echo "[3] TESTE DE LEITURA DE LOGS...\n";
$logDirs = ['/home/gamed/logs', '/var/log/pw', '/root/gamed/logs']; // Ajuste conforme seu server
$found = false;
foreach ($logDirs as $dir) {
    if (is_dir($dir)) {
        echo "[OK] Diretório de logs encontrado: $dir\n";
        if (is_readable($dir)) {
            echo "   - Permissão de leitura: OK\n";
        } else {
            echo "   - [ERRO] Sem permissão de leitura!\n";
        }
        $found = true;
        break;
    }
}
if (!$found) echo "[AVISO] Nenhum diretório de logs padrão encontrado. (Isso afeta a leitura de logs, mas não o status).\n";

echo "\n----------------------------------------\n";
echo "FIM DO DIAGNÓSTICO";
?>
