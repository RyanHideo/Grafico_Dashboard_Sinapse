// URL do backend
const backendUrl = '/api/data';

// Referências aos elementos Canvas
const kwGaugeCtx = document.getElementById('kwGauge').getContext('2d');
const fatorGaugeCtx = document.getElementById('fatorGauge').getContext('2d');
const sensorGaugeCtx = document.getElementById('sensorGauge').getContext('2d');
const monthlyChartCtx = document.getElementById('annualChart').getContext('2d');

// Variáveis para os gráficos
let kwGaugeChart, fatorGaugeChart, sensorGaugeChart, monthlyChart;

// Função para buscar os dados do backend
async function fetchData() {
  try {
    const response = await fetch(backendUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao obter dados do backend:', error);
    return null;
  }
}

// Função para criar ou atualizar gráficos do tipo Gauge
function updateGaugeChart(chart, ctx, value, label, color) {
  if (!chart) {
    // Criar o gráfico se não existir
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [value, 100 - value],
            backgroundColor: [color, '#E0E0E0'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '80%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false },
          title: { display: true, text: label },
        },
      },
    });
  } else {
    // Atualizar os dados do gráfico existente
    chart.data.datasets[0].data = [value, 100 - value];
    chart.update();
    return chart;
  }
}

// Função para criar ou atualizar o gráfico de consumo mensal
function updateMonthlyChart(chart, ctx, monthlyData) {
  // Extrair os labels e valores em ordem decrescente
  const labels = monthlyData.map((entry) => entry.mes).reverse();
  const values = monthlyData.map((entry) => entry.total_kwh_mes).reverse();

  if (!chart) {
    // Criar o gráfico se não existir
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Consumo Mensal (kWh)',
            data: values,
            backgroundColor: '#FF6384',
            borderColor: '#FF6384',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Consumo Mensal - Últimos Meses' },
        },
        scales: {
          x: { title: { display: true, text: 'Mês' } },
          y: { title: { display: true, text: 'Consumo (kWh)' } },
        },
      },
    });
  } else {
    // Atualizar os dados do gráfico existente
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
    return chart;
  }
}

// Função para atualizar os gráficos dinamicamente
async function updateCharts() {
  const data = await fetchData();
  if (!data) return;

  const kwAtual = data.atual.kw_atual;
  const fatorPotencia = parseFloat(data.atual.fator_potencia.replace('%', ''));
  const sensorStatus = data.atual.sensor_status === 'Ativo' ? 100 : 0;

  kwGaugeChart = updateGaugeChart(kwGaugeChart, kwGaugeCtx, kwAtual, 'KW Atual', '#4CAF50');
  fatorGaugeChart = updateGaugeChart(fatorGaugeChart, fatorGaugeCtx, fatorPotencia, 'Fator de Potência', '#2196F3');
  sensorGaugeChart = updateGaugeChart(sensorGaugeChart, sensorGaugeCtx, sensorStatus, 'Status do Sensor', '#FF5722');

  monthlyChart = updateMonthlyChart(monthlyChart, monthlyChartCtx, data.historico);
}

// Atualizar os gráficos a cada 5 segundos
setInterval(updateCharts, 5000);

// Inicializar os gráficos na carga inicial
updateCharts();
