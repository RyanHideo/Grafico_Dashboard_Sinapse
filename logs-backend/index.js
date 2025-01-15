const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'vps56146.publiccloud.com.br', // Endereço correto do MySQL
  port: 9904,                         // Porta do MySQL
  user: 'admin',                      // Usuário do banco de dados
  password: '9904Diego',              // Senha do banco de dados
  database: 'logs_fabrica',
 multipleStatements: true,           // Nome do banco de dados
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Rota para obter os dados consolidados
// Rota para obter os dados mensais
app.get('/api/data', (req, res) => {
  // Query para obter o histórico de consumo mensal e os valores atuais
  const query = `
    SELECT 
      DATE_FORMAT(log_time, '%Y-%m') AS mes,                  -- Agrupa por mês
      MAX(kwh_mes) - MIN(kwh_mes) AS total_kwh_mes           -- Calcula o consumo do mês
    FROM logs
    GROUP BY mes
    ORDER BY mes DESC;

    SELECT 
      kw_atual, 
      fator_potencia, 
      sensor_status 
    FROM logs 
    ORDER BY log_time DESC 
    LIMIT 1; -- Pega o último registro
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a query:', err);
      return res.status(500).send('Erro ao buscar os dados.');
    }

    if (results.length > 0) {
      // Separar os resultados da primeira e segunda query
      const historicoMensal = results[0];
      const ultimoRegistro = results[1][0];

      // Formatar os dados
      const data = {
        historico: historicoMensal.map((row) => ({
          mes: row.mes,
          total_kwh_mes: row.total_kwh_mes,
        })),
        atual: {
          kw_atual: ultimoRegistro.kw_atual,
          fator_potencia: `${(ultimoRegistro.fator_potencia * 100).toFixed(2)}%`,
          sensor_status: ultimoRegistro.sensor_status ? 'Ativo' : 'Inativo',
        },
      };

      res.json(data);
    } else {
      res.json({ message: 'Nenhum dado encontrado.' });
    }
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
