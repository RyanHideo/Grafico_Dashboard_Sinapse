const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 700;

// Configuração do banco de dados
const db = mysql.createConnection({
  host: '192.168.15.28',
  port: 3306,
  user: 'root',
  password: 'sinapse0109',
  database: 'logs_fabrica',
  multipleStatements: true,
});

// Ativar o CORS para todas as origens
app.use(cors());

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Função para ler dados do banco de dados periodicamente
const readDatabase = () => {
  const query = `
    SELECT 
        meses.mes,
        IFNULL(SUM(logs.total_kwh_mes), 0) AS total_kwh_mes
    FROM 
        (SELECT '2025-01' AS mes UNION ALL
         SELECT '2025-02' UNION ALL
         SELECT '2025-03' UNION ALL
         SELECT '2025-04' UNION ALL
         SELECT '2025-05' UNION ALL
         SELECT '2025-06' UNION ALL
         SELECT '2025-07' UNION ALL
         SELECT '2025-08' UNION ALL
         SELECT '2025-09' UNION ALL
         SELECT '2025-10' UNION ALL
         SELECT '2025-11' UNION ALL
         SELECT '2025-12') AS meses
    LEFT JOIN (
        SELECT 
            DATE_FORMAT(log_time, '%Y-%m') AS mes,
            MAX(kwh_mes) - MIN(kwh_mes) AS total_kwh_mes
        FROM logs
        GROUP BY mes
    ) AS logs
    ON meses.mes = logs.mes
    GROUP BY meses.mes
    ORDER BY meses.mes;

    SELECT 
        kw_atual, 
        fator_potencia, 
        sensor_status, 
        tensao_LL, 
        corrente_LL, 
        tensao_LN, 
        corrente_LN, 
        frequencia
    FROM logs 
    ORDER BY log_time DESC 
    LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a query:', err);
      return;
    }

    if (results && results.length > 0) {
      const historicoMensal = results[0];
      const ultimoRegistro = results[1] && results[1][0] ? results[1][0] : {};

      const data = {
        historico: historicoMensal.map((row) => ({
          mes: row.mes,
          total_kwh_mes: parseFloat(row.total_kwh_mes),
        })),
        atual: {
          kw_atual: parseFloat(ultimoRegistro.kw_atual || 0),
          fator_potencia: ultimoRegistro.fator_potencia ? `${(ultimoRegistro.fator_potencia * 100).toFixed(2)}%` : '0.00%',
          sensor_status: ultimoRegistro.sensor_status ? 'Ativo' : 'Inativo',
          tensao_LL: ultimoRegistro.tensao_LL || '0 V',
          corrente_LL: ultimoRegistro.corrente_LL || '0 A',
          tensao_LN: ultimoRegistro.tensao_LN || '0 V',
          corrente_LN: ultimoRegistro.corrente_LN || '0 A',
          frequencia: ultimoRegistro.frequencia || '0 Hz',
        },
      };

      console.log('Dados lidos do banco:', JSON.stringify(data, null, 2));
    } else {
      console.log('Nenhum dado encontrado no banco.');
    }
  });
};

// Configurar intervalo para leitura a cada 1 hora
setInterval(readDatabase, 60 * 60 * 1000); // 1 hora em milissegundos

// Rota para obter os dados consolidados
app.get('/api/data', (req, res) => {
  const query = `
    SELECT 
        meses.mes,
        IFNULL(SUM(logs.total_kwh_mes), 0) AS total_kwh_mes
    FROM 
        (SELECT '2025-01' AS mes UNION ALL
         SELECT '2025-02' UNION ALL
         SELECT '2025-03' UNION ALL
         SELECT '2025-04' UNION ALL
         SELECT '2025-05' UNION ALL
         SELECT '2025-06' UNION ALL
         SELECT '2025-07' UNION ALL
         SELECT '2025-08' UNION ALL
         SELECT '2025-09' UNION ALL
         SELECT '2025-10' UNION ALL
         SELECT '2025-11' UNION ALL
         SELECT '2025-12') AS meses
    LEFT JOIN (
        SELECT 
            DATE_FORMAT(log_time, '%Y-%m') AS mes,
            MAX(kwh_mes) - MIN(kwh_mes) AS total_kwh_mes
        FROM logs
        GROUP BY mes
    ) AS logs
    ON meses.mes = logs.mes
    GROUP BY meses.mes
    ORDER BY meses.mes;

    SELECT 
        kw_atual, 
        fator_potencia, 
        sensor_status, 
        tensao_LL, 
        corrente_LL, 
        tensao_LN, 
        corrente_LN, 
        frequencia
    FROM logs 
    ORDER BY log_time DESC 
    LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao executar a query:', err);
      return res.status(500).send('Erro ao buscar os dados.');
    }

    if (results && results.length > 0) {
      const historicoMensal = results[0];
      const ultimoRegistro = results[1] && results[1][0] ? results[1][0] : {};

      const data = {
        historico: historicoMensal.map((row) => ({
          mes: row.mes,
          total_kwh_mes: parseFloat(row.total_kwh_mes),
        })),
        atual: {
          kw_atual: parseFloat(ultimoRegistro.kw_atual || 0),
          fator_potencia: ultimoRegistro.fator_potencia ? `${(ultimoRegistro.fator_potencia * 100).toFixed(2)}%` : '0.00%',
          sensor_status: ultimoRegistro.sensor_status ? 'Ativo' : 'Inativo',
          tensao_LL: ultimoRegistro.tensao_LL || '0 V',
          corrente_LL: ultimoRegistro.corrente_LL || '0 A',
          tensao_LN: ultimoRegistro.tensao_LN || '0 V',
          corrente_LN: ultimoRegistro.corrente_LN || '0 A',
          frequencia: ultimoRegistro.frequencia || '0 Hz',
        },
      };

      res.json(data);
    } else {
      res.json({
        historico: [
          { mes: '2025-01', total_kwh_mes: 0 },
          { mes: '2025-02', total_kwh_mes: 0 },
          { mes: '2025-03', total_kwh_mes: 0 },
          { mes: '2025-04', total_kwh_mes: 0 },
          { mes: '2025-05', total_kwh_mes: 0 },
          { mes: '2025-06', total_kwh_mes: 0 },
          { mes: '2025-07', total_kwh_mes: 0 },
          { mes: '2025-08', total_kwh_mes: 0 },
          { mes: '2025-09', total_kwh_mes: 0 },
          { mes: '2025-10', total_kwh_mes: 0 },
          { mes: '2025-11', total_kwh_mes: 0 },
          { mes: '2025-12', total_kwh_mes: 0 },
        ],
        atual: {
          kw_atual: 0,
          fator_potencia: '0.00%',
          sensor_status: 'Inativo',
          tensao_LL: '0 V',
          corrente_LL: '0 A',
          tensao_LN: '0 V',
          corrente_LN: '0 A',
          frequencia: '0 Hz',
        },
      });
    }
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://192.168.15.28:${PORT}`);
});
