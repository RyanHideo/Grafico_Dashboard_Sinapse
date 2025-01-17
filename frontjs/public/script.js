// Inicializar os gráficos usando Chart.js
let consumoMensalChart, consumoChart, potenciaChart;

const initializeCharts = () => {
  const ctxConsumoMensal = document.getElementById('consumoMensalChart').getContext('2d');
  const ctxConsumo = document.getElementById('consumoChart').getContext('2d');
  const ctxPotencia = document.getElementById('potenciaChart').getContext('2d');

  consumoMensalChart = new Chart(ctxConsumoMensal, {
    type: 'bar',
    data: {
      labels: [], // Será atualizado com os meses
      datasets: [{
        label: 'Consumo Mensal (kWh)',
        data: [], // Será atualizado com os valores
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  consumoChart = new Chart(ctxConsumo, {
    type: 'pie',
    data: {
      labels: ['Utilizado', 'Disponível'],
      datasets: [{
        data: [], // Será atualizado
        backgroundColor: ['#FF6384', '#36A2EB'],
      }],
    },
    options: {
      responsive: true,
    },
  });

  potenciaChart = new Chart(ctxPotencia, {
    type: 'pie',
    data: {
      labels: ['Utilizado', 'Disponível'],
      datasets: [{
        data: [], // Será atualizado
        backgroundColor: ['#FFCE56', '#4BC0C0'],
      }],
    },
    options: {
      responsive: true,
    },
  });
};

// Função para buscar dados do backend
const fetchData = async () => {
  try {
    const response = await fetch('http://192.168.15.28:700/api/data'); // URL da API
    if (!response.ok) throw new Error('Erro ao buscar dados da API');
    const data = await response.json();

    console.log('Dados recebidos do backend:', data); // Log para verificar os dados recebidos

    // Atualizar gráficos e dados
    updateCharts(data);
    updateTable(data.atual);
  } catch (error) {
    console.error('Erro:', error);
  }
};

// Função para atualizar gráficos
const updateCharts = (data) => {
  console.log('Atualizando gráficos com os dados:', data);

  // Atualizar gráfico de consumo mensal
  if (consumoMensalChart) {
    consumoMensalChart.data.labels = data.historico.map(row => row.mes);
    consumoMensalChart.data.datasets[0].data = data.historico.map(row => row.total_kwh_mes);
    consumoMensalChart.update();
  }

  // Atualizar gráficos de pizza (consumo atual e potência ativa)
  if (consumoChart) {
    consumoChart.data.datasets[0].data = [
      data.atual.kw_atual,
      Math.max(0, 100 - data.atual.kw_atual), // Calculo de porcentagem fictício, ajuste conforme necessidade
    ];
    consumoChart.update();
  }

  if (potenciaChart) {
    potenciaChart.data.datasets[0].data = [
      data.atual.kw_atual,
      Math.max(0, 100 - data.atual.kw_atual), // Calculo de porcentagem fictício, ajuste conforme necessidade
    ];
    potenciaChart.update();
  }
};

// Função para atualizar tabela de dados
const updateTable = (atual) => {
  console.log('Atualizando tabela com os dados:', atual);

  // Atualizar os valores na tabela
  document.getElementById('tensaoLL').textContent = atual.tensao_LL || '0.00';
  document.getElementById('correnteLL').textContent = atual.corrente_LL || '0.00';
  document.getElementById('tensaoLN').textContent = atual.tensao_LN || '0.00';
  document.getElementById('correnteLN').textContent = atual.corrente_LN || '0.00';
  document.getElementById('fp').textContent = atual.fator_potencia || '0.00%';
  document.getElementById('frequencia').textContent = atual.frequencia || '0.00';
};

// Chamar fetchData para buscar e exibir os dados
initializeCharts();
fetchData();
