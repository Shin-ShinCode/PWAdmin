
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Carregar .env do diretório atual
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Testando conexão com o banco de dados...');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`Port: ${process.env.PORT || 3306}`);

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectTimeout: 5000
    });
    console.log('✅ Conexão bem sucedida!');
    await connection.end();
  } catch (error: any) {
    console.error('❌ Falha na conexão:');
    console.error(`Código: ${error.code}`);
    console.error(`Mensagem: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
        console.error('Dica: Verifique se o IP está correto e se o servidor MySQL permite conexões remotas.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Dica: Verifique se o usuário e senha estão corretos.');
    }
  }
}

testConnection();
