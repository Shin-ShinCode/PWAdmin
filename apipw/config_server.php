<?php
function getConfigs() {
    return array(
        "token"      => '123456',       // DEVE SER IGUAL AO TOKEN NO services/pwApi.ts
        "ip"         => "127.0.0.1",    // IP Local (pois este arquivo roda DENTRO do servidor)
        "conexao"    => "127.0.0.1:29000", // Porta Local do GamedBD
        "versao"     => "156",          // Versão do seu PW
        "rede"       => "eth0",         // Interface de rede
        
        // SSH não é necessário quando rodando localmente no servidor
        "ssh_host"   => "",
        "ssh_port"   => 22,
        "ssh_user"   => "",
        "ssh_pass"   => ""
    );
}
?>
