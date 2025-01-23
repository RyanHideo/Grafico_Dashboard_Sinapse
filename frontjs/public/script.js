// Adicionando suporte para texto no centro dos gráficos
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
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 2;
      ctx.fillText(text, width / 2, height - 20);
      ctx.restore();
    }
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
      labels: [],
      datasets: [{
        label: 'Consumo Mensal (kWh)',
        data: [], 
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
        legend: { 
          display: true,
          labels: {
            fontColor: "blue",
            fontSize: 18
        }
        },
        color: '#b79fd8'
      },
      scales: {
        y: {
          ticks: {
            color: "white",
            beginAtZero: true
          }
        },
        x: { 
          ticks: {
            color: "white",
            beginAtZero: true
          }
        }
      },
      indexAxis: 'y', 
    },
  });

  // Gráfico de consumo em (kWh)
  consumoChart = new Chart(ctxConsumo, {
    type: 'doughnut',
    data: {
      labels: ['Usado', 'Disponível'],
      datasets: [{
        data: [120, 180], 
        backgroundColor: ['#FF6384', '#CCCCCC'],
      }],
    },
    options: {
      responsive: true,
      rotation: -90, 
      circumference: 180, 
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Consumo em (kWh)', 
          font: {
            size: 16,
          },
          color: '#054df4' // altera aqui https://www.chartjs.org/docs/latest/configuration/title.html
        },
      },
      elements: {
        center: {
          text: '40%', 
          color: '#FF6384', 
          minFontSize: 20, 
        },
      },
    },
  });

  // Gráfico de potência ativa da planta (kVA)
  potenciaChart = new Chart(ctxPotencia, {
    type: 'doughnut',
    data: {
      labels: ['Usado', 'Disponível'],
      datasets: [{
        data: [75, 225],
        backgroundColor: ['#36A2EB', '#CCCCCC'],
      }],
    },
    options: {
      responsive: true,
      rotation: -90, 
      circumference: 180, 
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Potência ativa da planta (kVA)',
          font: {
            size: 16,
          },
          color: '#054df4' // altera aqui https://www.chartjs.org/docs/latest/configuration/title.html
        },
      },
      elements: {
        center: {
          text: '25%',
          color: '#36A2EB', 
          minFontSize: 20, 
        },
      },
    },
  });
};

// Função para buscar dados do backend
const fetchData = async () => {
  try {
    const response = await fetch('http://192.168.15.32:700/api/data');
    if (!response.ok) throw new Error('Erro ao buscar dados da API');
    const data = await response.json();

    console.log('Dados recebidos do backend:', data);

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
    consumoChart.options.elements.center.text = `${data.atual.kw_atual} kWh`; // Exibe o valor real usado
    consumoChart.update();
  }

  if (potenciaChart) {
    potenciaChart.data.datasets[0].data = [data.atual.kw_atual, 300 - data.atual.kw_atual];
    potenciaChart.options.elements.center.text = `${data.atual.kw_atual} kVA`; // Exibe o valor real usado
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


initializeCharts();
fetchData();
