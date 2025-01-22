// Adicionando suporte para texto no centro dos gráficos e ponteiro
Chart.register({
  id: 'centerText',
  beforeDraw(chart) {
    const { width, height } = chart;
    const ctx = chart.ctx;
    const text = chart.options.elements?.center?.text;

    if (text) {
      ctx.save();
      ctx.font = `${chart.options.elements.center.minFontSize || 20}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = chart.options.elements.center.color || '#000';
      ctx.fillText(text, width / 2, height / 1.5);
      ctx.restore();
    }

    // Adiciona o ponteiro
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((sum, value) => sum + value, 0);
    const currentValue = dataset.data[0];
    const percentage = currentValue / total;
    const angle = Math.PI * (1 - percentage); // Calcula o ângulo do ponteiro
    const x = Math.cos(angle) * (width / 4) + width / 2;
    const y = Math.sin(angle) * (height / 4) + height / 1.5;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(width / 2, height / 1.5); // Centro do gráfico
    ctx.lineTo(x, y); // Ponta do ponteiro
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FF0000'; // Cor do ponteiro
    ctx.stroke();
    ctx.restore();
  },
});

// Inicializar os gráficos usando Chart.js
let consumoMensalChart, consumoChart, potenciaChart;

const initializeCharts = () => {
  const ctxConsumoMensal = document.getElementById('consumoMensalChart').getContext('2d');
  const ctxConsumo = document.getElementById('consumoChart').getContext('2d');
  const ctxPotencia = document.getElementById('potenciaChart').getContext('2d');

  consumoMensalChart = new Chart(ctxConsumoMensal, {
    type: 'bar',
    data: {
      labels: [], // Atualizado com os meses do backend
      datasets: [{
        label: 'Consumo Mensal (kWh)',
        data: [], // Atualizado com os valores do backend
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Permite altura independente do aspecto
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: { beginAtZero: true }, // Escala horizontal
      },
      indexAxis: 'y', // Configuração para barras horizontais
    },
  });

  // Gráfico de pizza de consumo
  consumoChart = new Chart(ctxConsumo, {
    type: 'doughnut',
    data: {
      labels: ['Usado', 'Disponível'],
      datasets: [{
        data: [120, 180], // Exemplo: 120 kVA usado de um total de 300 kVA
        backgroundColor: ['#FF6384', '#CCCCCC'],
      }],
    },
    options: {
      responsive: true,
      rotation: -90, // Começa em cima
      circumference: 180, // Faz a meia lua
      plugins: {
        legend: { display: false },
      },
      elements: {
        center: {
          text: '40%', // Valor central (ajustado dinamicamente pelo backend)
          color: '#FF6384', // Cor do texto
          minFontSize: 20, // Tamanho mínimo da fonte
        },
      },
    },
  });

  // Gráfico de pizza de potência
  potenciaChart = new Chart(ctxPotencia, {
    type: 'doughnut',
    data: {
      labels: ['Usado', 'Disponível'],
      datasets: [{
        data: [75, 225], // Exemplo: 75 kVA usado de um total de 300 kVA
        backgroundColor: ['#36A2EB', '#CCCCCC'],
      }],
    },
    options: {
      responsive: true,
      rotation: -90, // Começa em cima
      circumference: 180, // Faz a meia lua
      plugins: {
        legend: { display: false },
      },
      elements: {
        center: {
          text: '25%', // Valor central (ajustado dinamicamente pelo backend)
          color: '#36A2EB', // Cor do texto
          minFontSize: 20, // Tamanho mínimo da fonte
        },
      },
    },
  });
};

// Função para buscar dados do backend
const fetchData = async () => {
  try {
    const response = await fetch('http://192.168.15.29:700/api/data'); // URL da API
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

  if (consumoMensalChart) {
    consumoMensalChart.data.labels = data.historico.map(row => row.mes);
    consumoMensalChart.data.datasets[0].data = data.historico.map(row => row.total_kwh_mes);
    consumoMensalChart.update();
  }

  if (consumoChart) {
    consumoChart.data.datasets[0].data = [data.atual.kw_atual, 300 - data.atual.kw_atual];
    consumoChart.options.elements.center.text = `${((data.atual.kw_atual / 300) * 100).toFixed(1)}%`;
    consumoChart.update();
  }

  if (potenciaChart) {
    potenciaChart.data.datasets[0].data = [data.atual.kw_atual, 300 - data.atual.kw_atual];
    potenciaChart.options.elements.center.text = `${((data.atual.kw_atual / 300) * 100).toFixed(1)}%`;
    potenciaChart.update();
  }
};

// Função para atualizar tabela de dados
const updateTable = (atual) => {
  console.log('Atualizando tabela com os dados:', atual);

  document.getElementById('tensaoLL').textContent = atual.tensao_LL || '0.00';
  document.getElementById('correnteLL').textContent = atual.corrente_LL || '0.00';
  document.getElementById('tensaoLN').textContent = atual.tensao_LN || '0.00';
  document.getElementById('correnteLN').textContent = atual.corrente_LN || '0.00';
  document.getElementById('fp').textContent = atual.fator_potencia || '0.00%';
  document.getElementById('frequencia').textContent = atual.frequencia || '0.00';
};

// Inicializar os gráficos e buscar dados do backend
initializeCharts();
fetchData();
