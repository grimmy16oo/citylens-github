// Analytics & Reports Charts
document.addEventListener('DOMContentLoaded', function() {
  // Population Growth Chart
  const populationCtx = document.getElementById('populationChart').getContext('2d');
  new Chart(populationCtx, {
    type: 'line',
    data: {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
      datasets: [{
        label: 'Urban Population (Millions)',
        data: [18.5, 19.2, 19.8, 20.3, 20.9, 21.5],
        borderColor: '#0EA5E9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#E5E7EB' } } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#E5E7EB' } },
        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#E5E7EB' } }
      }
    }
  });

  // Greenery Distribution Chart
  const greeneryCtx = document.getElementById('greeneryChart').getContext('2d');
  new Chart(greeneryCtx, {
    type: 'doughnut',
    data: {
      labels: ['Forest', 'Parks', 'Urban Gardens', 'Agricultural', 'Barren'],
      datasets: [{
        data: [25, 15, 10, 40, 10],
        backgroundColor: ['#10B981','#34D399','#6EE7B7','#A7F3D0','#374151'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#E5E7EB', font: { size: 12 } } }
      }
    }
  });

  // Regional Comparison Chart
  const regionalCtx = document.getElementById('regionalChart').getContext('2d');
  new Chart(regionalCtx, {
    type: 'bar',
    data: {
      labels: ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet'],
      datasets: [
        { label: 'Population Density', data: [4200, 2800, 1200, 1500, 900], backgroundColor: '#0EA5E9' },
        { label: 'Green Coverage %', data: [22, 35, 45, 40, 60], backgroundColor: '#10B981' },
        { label: 'AQI Score', data: [152, 130, 95, 110, 85], backgroundColor: '#F43F5E' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#E5E7EB' } } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#E5E7EB' } },
        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#E5E7EB' } }
      }
    }
  });
});
