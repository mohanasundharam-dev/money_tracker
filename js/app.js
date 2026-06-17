/* ===================================================
   MoneyFlow Manager — app.js
   Screen rendering, navigation, UI logic
   =================================================== */

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  MF.state.theme = theme;
  MF.save('theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  applyTheme(MF.state.theme === 'dark' ? 'light' : 'dark');
});

applyTheme(MF.state.theme);

/* ---------- Screen Navigation ---------- */
const SCREEN_TITLES = {
  dashboard: 'MoneyFlow Manager',
  recharge:  'Recharge & Subscriptions',
  chits:     'Chit Funds',
  expenses:  'Expenses & Income',
  reports:   'Reports & Insights',
};

function switchScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const screen = document.getElementById('screen-' + name);
  const navBtn = document.querySelector(`.nav-item[data-screen="${name}"]`);
  if (screen) screen.classList.add('active');
  if (navBtn) navBtn.classList.add('active');
  document.getElementById('topbar-title').textContent = SCREEN_TITLES[name] || 'MoneyFlow';

  // Show/hide greeting
  const greeting = document.getElementById('topbar-greeting');
  greeting.style.display = name === 'dashboard' ? '' : 'none';

  // Render dynamic screens
  if (name === 'dashboard')  renderDashboard();
  if (name === 'recharge')   renderRecharge();
  if (name === 'chits')      renderChits();
  if (name === 'expenses')   renderExpenses();
  if (name === 'reports')    renderReports();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchScreen(btn.dataset.screen));
});

/* ---------- Greeting ---------- */
function setGreeting() {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon 👋' : 'Good evening 👋';
  document.getElementById('topbar-greeting').textContent = g;
}

setGreeting();

/* ===================================================
   DASHBOARD
   =================================================== */
function renderDashboard() {
  // Balance hero
  const bal = MF.totalBalance();
  const inc = MF.totalIncome();
  const exp = MF.totalExpenses();
  document.querySelector('.balance-amount').textContent = MF.formatINR(inc - exp + 82300);
  document.querySelector('.balance-tag').innerHTML =
    `<i class="ti ti-trending-up"></i> +${MF.formatINR(inc - exp)} this month`;

  // Upcoming
  const up = MF.upcomingPayments();
  const ul = document.getElementById('upcoming-list');
  ul.innerHTML = up.map(item => {
    const b = MF.urgencyBadge(item.days);
    return `
      <div class="upcoming-item">
        <div class="row-left">
          <div class="row-title">${item.label}</div>
          <div class="row-sub">${item.sub}</div>
        </div>
        <span class="badge ${b.cls}">${MF.formatINR(item.amount)}</span>
      </div>`;
  }).join('');

  // Chit snapshot
  const cs = document.getElementById('chit-snapshot');
  cs.innerHTML = MF.state.chits.slice(0, 3).map(c => {
    const profit = MF.chitEstProfit(c);
    const cls = profit >= 0 ? 'pos' : 'neg';
    const sign = profit >= 0 ? '+' : '-';
    return `
      <div class="snapshot-row">
        <div class="row-left">
          <div class="row-title">${c.name}</div>
          <div class="row-sub">Month ${c.currentMonth}/${c.duration} · Paid ${MF.formatINR(MF.chitPaidSoFar(c))}</div>
        </div>
        <div class="row-right">
          <div class="row-amount ${cls}">${sign}${MF.formatINR(Math.abs(profit))}</div>
          <div style="font-size:10px;color:var(--text-hint);margin-top:2px">est. profit</div>
        </div>
      </div>`;
  }).join('');
}

/* ===================================================
   RECHARGE & SUBSCRIPTIONS
   =================================================== */
function renderRecharge() {
  renderMobile();
  renderBroadband();
  renderOTT();
}

function renderMobile() {
  const el = document.getElementById('mobile-list');
  const items = MF.state.recharges.filter(r => r.type === 'mobile');
  if (!items.length) { el.innerHTML = emptyState('No mobile recharges added'); return; }
  el.innerHTML = items.map(r => rechargeCard(r)).join('');
  attachDeleteHandlers(el, 'recharge');
}

function renderBroadband() {
  const el = document.getElementById('broadband-list');
  const items = MF.state.recharges.filter(r => r.type === 'broadband');
  if (!items.length) { el.innerHTML = emptyState('No broadband plans added'); return; }
  el.innerHTML = items.map(r => rechargeCard(r)).join('');
  attachDeleteHandlers(el, 'recharge');
}

function renderOTT() {
  const el = document.getElementById('ott-list');
  const items = MF.state.recharges.filter(r => r.type === 'ott' || r.type === 'other');
  if (!items.length) { el.innerHTML = emptyState('No subscriptions added'); return; }
  el.innerHTML = items.map(r => rechargeCard(r)).join('');
  attachDeleteHandlers(el, 'recharge');
}

function rechargeCard(r) {
  const expiry = MF.getRechargeExpiry(r);
  const days = MF.daysLeft(expiry);
  const b = MF.urgencyBadge(days);
  const pct = r.validity ? Math.min(100, Math.round((r.validity - days) / r.validity * 100)) : 50;
  const pc = MF.progressClass(days);
  const icon = providerIcon(r.provider);
  return `
    <div class="recharge-card" data-id="${r.id}">
      <div class="recharge-header">
        <div>
          <div class="row-title" style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">${icon}</span> ${r.name}
            ${r.mobile ? `<span style="font-size:12px;color:var(--text-secondary)">${r.mobile}</span>` : ''}
          </div>
          <div class="row-sub" style="margin-top:3px">${r.provider} · ${MF.formatINR(r.amount)} · ${r.validity}d plan</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="badge ${b.cls}">${b.label}</span>
          <button class="btn btn-sm btn-outline del-btn" data-id="${r.id}" data-target="recharge" style="padding:4px 8px;font-size:11px">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill ${pc}" style="width:${pct}%"></div></div>
      <div class="recharge-meta">
        <span>Recharged ${MF.formatDate(r.rechargeDate)}</span>
        <span>Expires ${MF.formatDate(expiry)}</span>
      </div>
      ${r.autoRenew ? '<div style="margin-top:6px"><span class="badge badge-blue"><i class="ti ti-refresh"></i> Auto-renew on</span></div>' : ''}
    </div>`;
}

function providerIcon(p) {
  const map = { 'Jio':'📶', 'Airtel':'📡', 'BSNL':'📞', 'Vi':'📳',
    'Netflix':'🎬', 'Prime':'📦', 'Hotstar':'⭐', 'Spotify':'🎵',
    'ChatGPT':'🤖', 'Other':'🔌' };
  return map[p] || '📱';
}

/* ===================================================
   CHIT FUNDS
   =================================================== */
function renderChits() {
  const el = document.getElementById('chit-list');
  if (!MF.state.chits.length) { el.innerHTML = emptyState('No chit funds added yet'); return; }
  el.innerHTML = MF.state.chits.map(c => chitCard(c)).join('');
  attachDeleteHandlers(el, 'chit');
}

function chitCard(c) {
  const paid = MF.chitPaidSoFar(c);
  const profit = MF.chitEstProfit(c);
  const pct = Math.round(c.currentMonth / c.duration * 100);
  const profitCls = profit >= 0 ? 'pos' : 'neg';
  const status = c.taken ? 'badge-purple' : 'badge-green';
  const statusLabel = c.taken ? 'Taken' : 'Active';

  return `
    <div class="chit-card" data-id="${c.id}">
      <div class="chit-header">
        <div>
          <div class="chit-name">${c.name}</div>
          <div class="chit-meta">${MF.formatINR(c.value)} · ${c.members} members · ${c.duration} months</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <span class="badge ${status}">${statusLabel}</span>
          <button class="btn btn-sm btn-outline del-btn" data-id="${c.id}" data-target="chit" style="padding:4px 8px;font-size:11px">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill blue" style="width:${pct}%"></div></div>
      <div class="recharge-meta">
        <span>Month ${c.currentMonth} of ${c.duration}</span>
        <span>${pct}% complete</span>
      </div>
      <div class="chit-stats">
        <div class="chit-stat">
          <div class="chit-stat-val">${MF.formatINR(paid)}</div>
          <div class="chit-stat-label">Paid so far</div>
        </div>
        <div class="chit-stat">
          <div class="chit-stat-val">${MF.formatINR(c.dividends)}</div>
          <div class="chit-stat-label">Dividends</div>
        </div>
        <div class="chit-stat">
          <div class="chit-stat-val ${profitCls}">${profit >= 0 ? '+' : ''}${MF.formatINR(profit)}</div>
          <div class="chit-stat-label">Est. profit</div>
        </div>
      </div>
      <div class="chit-actions">
        <button class="btn btn-outline btn-sm" style="flex:1" onclick="openSimulate('${c.id}')">
          <i class="ti ti-calculator"></i> Simulate bid
        </button>
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="openModal('add-auction')">
          <i class="ti ti-plus"></i> Add auction
        </button>
      </div>
    </div>`;
}

function openSimulate(chitId) {
  const sel = document.getElementById('sim-chit');
  if (sel) {
    // populate options from real chits
    sel.innerHTML = MF.state.chits.map(c =>
      `<option value="${c.id}" ${c.id === chitId ? 'selected' : ''}>${c.name} — ${MF.formatINR(c.value)} · ${c.duration} months</option>`
    ).join('');
  }
  openModal('simulate');
}

/* ===================================================
   EXPENSES & INCOME
   =================================================== */
function renderExpenses() {
  // Category breakdown
  const cats = MF.categoryBreakdown();
  const cbEl = document.getElementById('category-breakdown');
  cbEl.innerHTML = cats.slice(0, 6).map(cat => `
    <div class="cat-row">
      <div class="cat-dot" style="background:${cat.color}"></div>
      <div class="cat-info">
        <div class="cat-name">${cat.category}</div>
        <div class="cat-count">${cat.count} transaction${cat.count !== 1 ? 's' : ''}</div>
      </div>
      <div class="cat-bar-wrap">
        <div class="cat-bar" style="width:${cat.pct}%;background:${cat.color}"></div>
      </div>
      <div class="cat-amount">${MF.formatINR(cat.amount)}</div>
    </div>`).join('');

  // Transactions
  const txnEl = document.getElementById('txn-list');
  const sorted = [...MF.state.transactions].sort((a,b) => b.date.localeCompare(a.date));
  txnEl.innerHTML = sorted.slice(0, 15).map(t => {
    const icon = txnIcon(t.category);
    const cls = t.type === 'income' ? 'pos' : 'neg';
    const sign = t.type === 'income' ? '+' : '−';
    return `
      <div class="txn-item" data-id="${t.id}">
        <div class="txn-icon" style="background:${icon.bg}">${icon.emoji}</div>
        <div class="txn-info">
          <div class="txn-title">${t.desc}</div>
          <div class="txn-sub">${MF.formatDate(t.date)} · ${t.mode}</div>
        </div>
        <div>
          <div class="txn-amount ${cls}">${sign}${MF.formatINR(t.amount)}</div>
        </div>
      </div>`;
  }).join('');
}

function txnIcon(cat) {
  const m = {
    'Food':          { emoji:'🍽', bg:'#fef9c3' },
    'Travel':        { emoji:'🚗', bg:'#dcfce7' },
    'Shopping':      { emoji:'🛍', bg:'#f3e8ff' },
    'Bills':         { emoji:'⚡', bg:'#fef3c7' },
    'Fuel':          { emoji:'⛽', bg:'#fee2e2' },
    'Medical':       { emoji:'💊', bg:'#e0f2fe' },
    'Entertainment': { emoji:'🎬', bg:'#ede9fe' },
    'Salary':        { emoji:'💼', bg:'#dcfce7' },
    'Freelancing':   { emoji:'💻', bg:'#e0f2fe' },
    'Business':      { emoji:'📊', bg:'#fef9c3' },
    'Interest':      { emoji:'🏦', bg:'#dcfce7' },
  };
  return m[cat] || { emoji:'💰', bg:'#f3f4f6' };
}

/* ===================================================
   REPORTS
   =================================================== */
function renderReports() {
  // Chit summary
  const rcEl = document.getElementById('report-chit');
  let totalProfit = 0;
  rcEl.innerHTML = MF.state.chits.map(c => {
    const profit = MF.chitEstProfit(c);
    totalProfit += profit;
    const cls = profit >= 0 ? 'pos' : 'neg';
    return `
      <div class="list-row">
        <div class="row-left">
          <div class="row-title">${c.name}</div>
          <div class="row-sub">Paid ${MF.formatINR(MF.chitPaidSoFar(c))} · Div ${MF.formatINR(c.dividends)}</div>
        </div>
        <div class="row-amount ${cls}">${profit >= 0 ? '+' : ''}${MF.formatINR(profit)}</div>
      </div>`;
  }).join('') + `
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;font-weight:600;font-size:14px;padding:6px 0">
      <span>Total expected profit</span>
      <span class="${totalProfit >= 0 ? 'pos' : 'neg'}" style="color:${totalProfit >= 0 ? 'var(--green)' : 'var(--red)'}">${totalProfit >= 0 ? '+' : ''}${MF.formatINR(totalProfit)}</span>
    </div>`;

  // Subscriptions
  const subGroups = [
    { label:'Netflix + Prime + Hotstar', amount:1848 },
    { label:'ChatGPT + Spotify', amount:1769 },
    { label:'Mobile + Broadband', amount:1647 },
  ];
  const rsEl = document.getElementById('report-subs');
  let subTotal = 0;
  rsEl.innerHTML = subGroups.map(sg => {
    subTotal += sg.amount;
    return `
      <div class="list-row">
        <div class="row-title">${sg.label}</div>
        <div class="row-amount neg">−${MF.formatINR(sg.amount)}</div>
      </div>`;
  }).join('') + `
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;font-weight:600;font-size:14px;padding:6px 0">
      <span>Total recurring/mo</span>
      <span style="color:var(--red)">−${MF.formatINR(subTotal)}</span>
    </div>`;
}

/* ===================================================
   CHIP BARS
   =================================================== */
document.querySelectorAll('.chip-bar').forEach(bar => {
  bar.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', function () {
      bar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

/* ===================================================
   FAB BINDINGS
   =================================================== */
document.getElementById('fab-recharge')?.addEventListener('click', () => openModal('add-recharge'));
document.getElementById('fab-chit')?.addEventListener('click',     () => openModal('add-chit'));
document.getElementById('fab-expense')?.addEventListener('click',  () => openModal('add-expense'));

/* ===================================================
   DELETE HANDLERS
   =================================================== */
function attachDeleteHandlers(container, type) {
  container.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm('Delete this entry?')) {
        if (type === 'recharge') MF.deleteRecharge(id);
        if (type === 'chit')     MF.deleteChit(id);
        showToast('Deleted ✓');
        renderRecharge();
        renderChits();
        renderDashboard();
      }
    });
  });
}

/* ===================================================
   EXPORT
   =================================================== */
function exportReport(format) {
  if (format === 'json') {
    MF.exportJSON();
    showToast('JSON backup downloaded');
    return;
  }
  showToast(`${format.toUpperCase()} export — coming soon`);
}

/* ===================================================
   TOAST
   =================================================== */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ===================================================
   EMPTY STATE
   =================================================== */
function emptyState(msg) {
  return `<div style="text-align:center;padding:28px 16px;color:var(--text-secondary);font-size:13px">
    <i class="ti ti-inbox" style="font-size:32px;display:block;margin-bottom:8px;opacity:0.4"></i>${msg}</div>`;
}

/* ---------- Initial Render ---------- */
renderDashboard();
