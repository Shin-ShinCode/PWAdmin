<?php
function getConfigs() {
    return array(
        "token"      => '123456',       // DEVE SER IGUAL AO TOKEN NO services/pwApi.ts
        "ip"         => "127.0.0.1",    // IP do Servidor PW
        "conexao"    => "127.0.0.1:29000", // Porta do GamedBD ou Delivery
        "versao"     => "156",          // Versão do seu PW
        "rede"       => "eth0",         // Interface de rede para o gráfico de tráfego
    );
}
?>