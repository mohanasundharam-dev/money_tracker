/* ===================================================
   MoneyFlow Manager — modals.js
   Modal open/close, form submissions, bid simulator
   =================================================== */

/* ---------- Open / Close ---------- */
function openModal(name) {
  const el = document.getElementById('modal-' + name);
  if (!el) return;
  el.classList.add('open');
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (name === 'simulate') {
    populateSimChits();
    calcSim();
  }
  if (name === 'add-recharge') {
    const today = MF.today();
    document.getElementById('r-date').value = today;
    updateRechargeExpiry();
  }
  if (name === 'add-expense') {
    document.getElementById('e-date').value = MF.today();
  }
}

function closeModal(name) {
  const el = document.getElementById('modal-' + name);
  if (!el) return;
  el.classList.remove('open');
  el.style.display = 'none';
  document.body.style.overflow = '';
}

/* Close on overlay click */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      const name = overlay.id.replace('modal-', '');
      closeModal(name);
    }
  });
});

/* Close on Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(el => {
      const name = el.id.replace('modal-', '');
      closeModal(name);
    });
  }
});

/* ---------- Recharge Expiry Auto-Calc ---------- */
function updateRechargeExpiry() {
  const dateEl = document.getElementById('r-date');
  const valEl  = document.getElementById('r-validity');
  const expEl  = document.getElementById('r-expiry');
  if (!dateEl || !valEl || !expEl) return;
  if (dateEl.value && valEl.value) {
    expEl.value = MF.addDays(dateEl.value, parseInt(valEl.value));
  }
}

document.getElementById('r-date')?.addEventListener('input', updateRechargeExpiry);
document.getElementById('r-validity')?.addEventListener('input', updateRechargeExpiry);

/* ---------- Recharge Form Submit ---------- */
document.getElementById('form-recharge')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    type:        document.getElementById('r-type').value,
    name:        document.getElementById('r-name').value.trim(),
    provider:    document.getElementById('r-provider').value,
    amount:      parseFloat(document.getElementById('r-amount').value) || 0,
    validity:    parseInt(document.getElementById('r-validity').value) || 30,
    rechargeDate:document.getElementById('r-date').value || MF.today(),
    mobile:      document.getElementById('r-mobile').value.trim(),
    notes:       document.getElementById('r-notes').value.trim(),
    autoRenew:   document.getElementById('r-autorenew').checked,
  };
  if (!data.name || !data.amount) {
    showToast('Please fill name and amount');
    return;
  }
  MF.addRecharge(data);
  closeModal('add-recharge');
  e.target.reset();
  renderRecharge();
  showToast('Recharge added ✓');
});

/* ---------- Chit Form Submit ---------- */
document.getElementById('form-chit')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    name:      document.getElementById('c-name').value.trim(),
    value:     parseFloat(document.getElementById('c-value').value) || 0,
    members:   parseInt(document.getElementById('c-members').value) || 1,
    monthly:   parseFloat(document.getElementById('c-monthly').value) || 0,
    duration:  parseInt(document.getElementById('c-duration').value) || 12,
    commType:  document.getElementById('c-comm-type').value,
    commVal:   parseFloat(document.getElementById('c-comm-val').value) || 0,
    startDate: document.getElementById('c-start').value || MF.today(),
    notes:     document.getElementById('c-notes').value.trim(),
  };
  if (!data.name || !data.value) {
    showToast('Please fill chit name and value');
    return;
  }
  MF.addChit(data);
  closeModal('add-chit');
  e.target.reset();
  renderChits();
  renderDashboard();
  showToast('Chit fund added ✓');
});

/* ---------- Expense Form Submit ---------- */
let activeTxnType = 'expense';

document.querySelectorAll('#txn-type-toggle .toggle-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('#txn-type-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeTxnType = this.dataset.type;
  });
});

document.getElementById('form-expense')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    type:     activeTxnType,
    amount:   parseFloat(document.getElementById('e-amount').value) || 0,
    date:     document.getElementById('e-date').value || MF.today(),
    category: document.getElementById('e-category').value,
    desc:     document.getElementById('e-desc').value.trim(),
    mode:     document.getElementById('e-mode').value,
  };
  if (!data.amount || !data.desc) {
    showToast('Please fill amount and description');
    return;
  }
  MF.addTransaction(data);
  closeModal('add-expense');
  e.target.reset();
  renderExpenses();
  renderDashboard();
  showToast('Transaction saved ✓');
});

/* ---------- Auction Calc ---------- */
function calcAuction() {
  const bidEl  = document.getElementById('a-bid');
  const commEl = document.getElementById('a-comm');
  const poolEl = document.getElementById('a-pool');
  const perEl  = document.getElementById('a-per');
  const payEl  = document.getElementById('a-payable');
  if (!bidEl) return;

  const chitValue = 200000;
  const members   = 20;
  const monthly   = 10000;

  const bid  = parseFloat(bidEl.value)  || 0;
  const comm = parseFloat(commEl.value) || 0;

  const pool      = bid - comm;
  const perMember = members > 0 ? pool / members : 0;
  const payable   = monthly - perMember;

  poolEl.textContent  = MF.formatINR(pool);
  perEl.textContent   = MF.formatINR(perMember);
  payEl.textContent   = MF.formatINR(payable);
}

/* ---------- Auction Form Submit ---------- */
document.getElementById('form-auction')?.addEventListener('submit', e => {
  e.preventDefault();
  closeModal('add-auction');
  e.target.reset();
  showToast('Auction entry saved ✓');
});

/* ---------- Bid Simulator ---------- */
function populateSimChits() {
  const sel = document.getElementById('sim-chit');
  if (!sel) return;
  sel.innerHTML = MF.state.chits.map(c =>
    `<option value="${c.id}">${c.name} — ${MF.formatINR(c.value)} · ${c.duration} months</option>`
  ).join('');
  // Update max month
  calcSim();
}

function updateSimMonth(el) {
  const val = document.getElementById('sim-month-val');
  if (val) val.textContent = 'Month ' + el.value;
}

function calcSim() {
  const chitSel = document.getElementById('sim-chit');
  const monthEl = document.getElementById('sim-month');
  const bidEl   = document.getElementById('sim-bid');
  if (!chitSel || !monthEl || !bidEl) return;

  const chitId = chitSel.value;
  const chit   = MF.state.chits.find(c => c.id === chitId) || MF.state.chits[0];
  if (!chit) return;

  // Update month range
  monthEl.max = chit.duration;
  const month  = Math.min(parseInt(monthEl.value) || chit.currentMonth, chit.duration);
  const bid    = parseFloat(bidEl.value) || 0;

  const chitValue    = chit.value;
  const monthlyAmt   = chit.monthly;
  const totalMonths  = chit.duration;
  const divsPerMonth = chit.dividends > 0 ? (chit.dividends / chit.currentMonth) : (monthlyAmt * 0.04);

  const received    = chitValue - bid;
  const paidNow     = month * monthlyAmt;
  const remaining   = (totalMonths - month) * monthlyAmt;
  const divs        = Math.round(month * divsPerMonth);
  const net         = received + divs - paidNow - remaining;

  document.getElementById('s-val').textContent    = MF.formatINR(chitValue);
  document.getElementById('s-recv').textContent   = MF.formatINR(received);
  document.getElementById('s-paid').textContent   = MF.formatINR(paidNow);
  document.getElementById('s-future').textContent = MF.formatINR(remaining);
  document.getElementById('s-divs').textContent   = MF.formatINR(divs);

  const netEl = document.getElementById('s-net');
  netEl.textContent = (net >= 0 ? '+' : '') + MF.formatINR(net);
  netEl.className   = net >= 0 ? 'pos' : 'neg';
  netEl.style.color = net >= 0 ? 'var(--green)' : 'var(--red)';

  // Guide
  const breakEvenBid  = received - paidNow - remaining + divs + bid;
  const safeBid       = breakEvenBid * 0.75;
  const guideEl       = document.getElementById('sim-guide');
  if (guideEl) {
    guideEl.innerHTML = `
      <strong>Recommended bid:</strong> up to ${MF.formatINR(safeBid)}<br>
      <strong>Break-even bid:</strong> ${MF.formatINR(breakEvenBid)}<br>
      Above ${MF.formatINR(breakEvenBid)}: you enter a loss zone.`;
  }
}

document.getElementById('sim-chit')?.addEventListener('change', calcSim);
document.getElementById('sim-month')?.addEventListener('input', function() {
  updateSimMonth(this);
  calcSim();
});
document.getElementById('sim-bid')?.addEventListener('input', calcSim);
