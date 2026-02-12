<?php
function getConfigs() {
    return array(
        "token"      => '123456',       // DEVE SER IGUAL AO TOKEN NO services/pwApi.ts
        "ip"         => "95.111.235.239",    // IP do Servidor PW
        "conexao"    => "95.111.235.239:29000", // Porta do GamedBD ou Delivery
        "versao"     => "156",          // Versão do seu PW
        "rede"       => "eth0",         // Interface de rede para o gráfico de tráfego
        
        // Credenciais SSH para Comandos Remotos
        "ssh_host"   => "95.111.235.239",
        "ssh_port"   => 22,
        "ssh_user"   => "root",
        "ssh_pass"   => "vjaDwK6V34k0FbFbiZRR",
        
        // Configurações do Banco de Dados MySQL (PW)
        "db_host"    => "localhost", // Se o script rodar no servidor, use localhost
        "db_user"    => "root",      // Usuário do MySQL
        "db_pass"    => "root",      // Senha do MySQL (ajuste conforme necessário)
        "db_name"    => "pw"         // Nome do banco de dados principal
    );
}
?>
