/* ===================================================
   MoneyFlow Manager — charts.js
   All Chart.js initializations
   =================================================== */

let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function isDark() {
  return document.body.getAttribute('data-theme') === 'dark';
}

function textColor() {
  return isDark() ? '#9ca3af' : '#6b7280';
}

function gridColor() {
  return isDark() ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
}

/* ---------- Cash Flow Line Chart ---------- */
function initCashflowChart() {
  const ctx = document.getElementById('cashflowChart');
  if (!ctx) return;
  destroyChart('cashflow');

  chartInstances['cashflow'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MF.state.cashflow.labels,
      datasets: [
        {
          label: 'Income',
          data: MF.state.cashflow.income,
          borderColor: '#1a56db',
          backgroundColor: 'rgba(26,86,219,0.07)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#1a56db',
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: MF.state.cashflow.expenses,
          borderColor: '#c81e1e',
          backgroundColor: 'rgba(200,30,30,0.05)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#c81e1e',
          borderWidth: 2,
          borderDash: [4, 3]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ₹' + ctx.parsed.y.toLocaleString('en-IN')
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: v => '₹' + (v / 1000).toFixed(0) + 'k',
            font: { size: 10 },
            color: textColor(),
            maxTicksLimit: 5
          },
          grid: { color: gridColor() },
          border: { display: false }
        },
        x: {
          ticks: { font: { size: 10 }, color: textColor() },
          grid: { display: false },
          border: { display: false }
        }
      }
    }
  });
}

/* ---------- Expense Donut Chart ---------- */
function initDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx) return;
  destroyChart('donut');

  const cats = MF.categoryBreakdown().slice(0, 6);
  const labels = cats.map(c => c.category);
  const data   = cats.map(c => c.amount);
  const colors = cats.map(c => c.color);

  // Build legend
  const legend = document.getElementById('donut-legend');
  if (legend) {
    legend.innerHTML = cats.map(c => `
      <div class="donut-legend-item">
        <div class="donut-legend-dot" style="background:${c.color}"></div>
        <span>${c.category} <strong>${c.pct}%</strong></span>
      </div>`).join('');
  }

  chartInstances['donut'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: isDark() ? '#1f2937' : '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ₹' + ctx.parsed.toLocaleString('en-IN') + ' (' + cats[ctx.dataIndex]?.pct + '%)'
          }
        }
      }
    }
  });
}

/* ---------- Chit Performance Bar Chart ---------- */
function initChitChart() {
  const ctx = document.getElementById('chitChart');
  if (!ctx) return;
  destroyChart('chit');

  const chits = MF.state.chits;
  const labels = chits.map(c => c.name);
  const profits = chits.map(c => MF.chitEstProfit(c));
  const colors  = profits.map(p => p >= 0 ? 'rgba(5,122,85,0.75)' : 'rgba(200,30,30,0.75)');
  const borders = profits.map(p => p >= 0 ? '#057a55' : '#c81e1e');

  chartInstances['chit'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Est. Profit/Loss',
        data: profits,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => (ctx.parsed.y >= 0 ? ' +' : ' ') + '₹' + ctx.parsed.y.toLocaleString('en-IN')
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: v => (v >= 0 ? '' : '-') + '₹' + Math.abs(v / 1000).toFixed(0) + 'k',
            font: { size: 10 },
            color: textColor()
          },
          grid: { color: gridColor() },
          border: { display: false }
        },
        x: {
          ticks: { font: { size: 11 }, color: textColor() },
          grid: { display: false },
          border: { display: false }
        }
      }
    }
  });
}

/* ---------- Profit Forecast Line Chart ---------- */
function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx) return;
  destroyChart('forecast');

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const actual  = [2000, 4500, 7200, 11000, 15800, 20500, null, null, null, null, null, null];
  const forecast= [null, null, null, null, null, 20500, 24000, 28700, 32000, 35500, 38000, 42000];

  chartInstances['forecast'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          borderColor: '#1a56db',
          backgroundColor: 'rgba(26,86,219,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
          spanGaps: false
        },
        {
          label: 'Forecast',
          data: forecast,
          borderColor: '#059669',
          backgroundColor: 'rgba(5,150,105,0.06)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          borderWidth: 2,
          borderDash: [5, 4],
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.parsed.y != null ? ' ₹' + ctx.parsed.y.toLocaleString('en-IN') : ''
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: v => '₹' + (v / 1000).toFixed(0) + 'k',
            font: { size: 10 },
            color: textColor()
          },
          grid: { color: gridColor() },
          border: { display: false }
        },
        x: {
          ticks: { font: { size: 10 }, color: textColor() },
          grid: { display: false },
          border: { display: false }
        }
      }
    }
  });
}

/* ---------- Initialize all charts on DOM ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure canvas elements are in the DOM
  setTimeout(() => {
    initCashflowChart();
    initDonutChart();
  }, 50);
});

/* ---------- Re-init charts when switching screens ---------- */
const _origSwitch = window.switchScreen;
window.switchScreen = function(name) {
  _origSwitch(name);
  setTimeout(() => {
    if (name === 'dashboard') {
      initCashflowChart();
      initDonutChart();
    }
    if (name === 'chits')   initChitChart();
    if (name === 'reports') initForecastChart();
  }, 50);
};

/* ---------- Reinit on theme change ---------- */
document.getElementById('theme-toggle').addEventListener('click', () => {
  setTimeout(() => {
    destroyChart('cashflow');  initCashflowChart();
    destroyChart('donut');     initDonutChart();
    destroyChart('chit');      initChitChart();
    destroyChart('forecast');  initForecastChart();
  }, 50);
});
