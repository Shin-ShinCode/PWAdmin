<?php
header('Content-Type: application/json');
require_once('config.php');

$db = null;
try {
    $dsn = "mysql:host=" . $configs['db_host'] . ";dbname=" . $configs['db_name'] . ";charset=utf8mb4";
    $db = new PDO($dsn, $configs['db_user'], $configs['db_pass']);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Connection failed: ' . $e->getMessage()]);
    exit;
}

$tables = [];
try {
    $stmt = $db->query("SHOW TABLES");
    $tableList = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tableList as $table) {
        $stmt = $db->query("DESCRIBE `$table`");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $tables[$table] = $columns;
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

echo json_encode($tables, JSON_PRETTY_PRINT);
?>