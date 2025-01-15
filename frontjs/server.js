const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 8001;

// Configura a pasta pública para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter os dados do backend
app.get('/api/data', async (req, res) => {
  try {
    const backendResponse = await axios.get('http://vps56146.publiccloud.com.br:3000/api/data');
    res.json(backendResponse.data);
  } catch (error) {
    console.error('Erro ao obter dados do backend:', error.message);
    res.status(500).send('Erro ao obter dados do backend.');
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
