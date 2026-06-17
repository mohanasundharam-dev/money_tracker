/* ===================================================
   MoneyFlow Manager — data.js
   In-memory data store + localStorage persistence
   =================================================== */

const MF = (() => {

  /* ---------- Default / Seed Data ---------- */
  const SEED = {
    recharges: [
      { id:'r1', type:'mobile', name:'Karthik', mobile:'+91 98765 43210', provider:'Jio',
        amount:299, validity:84, rechargeDate:'2026-03-28', notes:'Main number', autoRenew:true },
      { id:'r2', type:'mobile', name:'Meena', mobile:'+91 87654 32109', provider:'Airtel',
        amount:349, validity:56, rechargeDate:'2026-05-18', notes:'', autoRenew:false },
      { id:'r3', type:'mobile', name:'Appa', mobile:'+91 76543 21098', provider:'BSNL',
        amount:197, validity:28, rechargeDate:'2026-05-30', notes:'Father', autoRenew:false },
      { id:'r4', type:'broadband', name:'Home Broadband', mobile:'', provider:'BSNL',
        amount:999, validity:30, rechargeDate:'2026-05-28', notes:'Fiber plan', autoRenew:true },
      { id:'r5', type:'ott', name:'Netflix', mobile:'', provider:'Netflix',
        amount:649, validity:30, rechargeDate:'2026-06-01', notes:'Family plan', autoRenew:true },
      { id:'r6', type:'ott', name:'Prime Video', mobile:'', provider:'Prime',
        amount:1499, validity:365, rechargeDate:'2026-08-15', notes:'Yearly', autoRenew:true },
      { id:'r7', type:'ott', name:'Spotify Premium', mobile:'', provider:'Spotify',
        amount:119, validity:30, rechargeDate:'2026-05-22', notes:'', autoRenew:true },
      { id:'r8', type:'ott', name:'ChatGPT Plus', mobile:'', provider:'ChatGPT',
        amount:1650, validity:30, rechargeDate:'2026-06-10', notes:'GPT-4', autoRenew:true },
      { id:'r9', type:'ott', name:'Hotstar Mobile', mobile:'', provider:'Hotstar',
        amount:499, validity:365, rechargeDate:'2026-04-01', notes:'Cricket season', autoRenew:false },
    ],

    chits: [
      { id:'c1', name:'Family Chit', value:200000, members:20, monthly:10000,
        duration:20, currentMonth:4, commType:'percent', commVal:5,
        startDate:'2026-03-01', dividends:3200, taken:false, takenMonth:null,
        amountReceived:0, notes:'Monthly auction on 1st' },
      { id:'c2', name:'Office Chit', value:300000, members:25, monthly:12000,
        duration:25, currentMonth:6, commType:'percent', commVal:5,
        startDate:'2026-01-01', dividends:5850, taken:false, takenMonth:null,
        amountReceived:0, notes:'Colleague fund' },
      { id:'c3', name:'Friends Chit', value:100000, members:10, monthly:10000,
        duration:10, currentMonth:2, commType:'fixed', commVal:1000,
        startDate:'2026-05-01', dividends:1400, taken:false, takenMonth:null,
        amountReceived:0, notes:'10 close friends' },
      { id:'c4', name:'Village Chit', value:500000, members:50, monthly:10000,
        duration:50, currentMonth:1, commType:'percent', commVal:5,
        startDate:'2026-06-01', dividends:0, taken:false, takenMonth:null,
        amountReceived:0, notes:'Annual gathering' },
    ],

    transactions: [
      { id:'t1',  type:'income',  amount:55000, category:'Salary',      desc:'TCS June Salary',   date:'2026-06-01', mode:'Bank Transfer' },
      { id:'t2',  type:'income',  amount:13000, category:'Freelancing', desc:'UI Design Project', date:'2026-06-05', mode:'UPI' },
      { id:'t3',  type:'expense', amount:2340,  category:'Food',        desc:'DMart Grocery',     date:'2026-06-08', mode:'UPI' },
      { id:'t4',  type:'expense', amount:1800,  category:'Fuel',        desc:'HP Petrol',         date:'2026-06-10', mode:'Cash' },
      { id:'t5',  type:'expense', amount:1450,  category:'Bills',       desc:'EB Bill June',      date:'2026-06-12', mode:'Auto-debit' },
      { id:'t6',  type:'expense', amount:649,   category:'Entertainment', desc:'Netflix June',    date:'2026-06-01', mode:'Auto-debit' },
      { id:'t7',  type:'expense', amount:1650,  category:'Entertainment', desc:'ChatGPT Plus',    date:'2026-06-10', mode:'Auto-debit' },
      { id:'t8',  type:'expense', amount:3500,  category:'Medical',     desc:'Apollo Clinic',     date:'2026-06-11', mode:'Card' },
      { id:'t9',  type:'expense', amount:4200,  category:'Shopping',    desc:'Amazon order',      date:'2026-06-09', mode:'Card' },
      { id:'t10', type:'expense', amount:1260,  category:'Food',        desc:'Zomato x 3',        date:'2026-06-13', mode:'UPI' },
      { id:'t11', type:'expense', amount:3300,  category:'Travel',      desc:'Bus passes',        date:'2026-06-03', mode:'UPI' },
      { id:'t12', type:'expense', amount:2800,  category:'Bills',       desc:'Internet bill',     date:'2026-06-07', mode:'Auto-debit' },
      { id:'t13', type:'expense', amount:4600,  category:'Fuel',        desc:'Car service',       date:'2026-06-06', mode:'Card' },
      { id:'t14', type:'expense', amount:1800,  category:'Shopping',    desc:'Clothing',          date:'2026-06-14', mode:'UPI' },
      { id:'t15', type:'income',  amount:0,     category:'Interest',    desc:'FD Interest Q1',    date:'2026-06-15', mode:'Bank Transfer' },
    ],

    cashflow: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      income:   [62000, 65000, 60000, 68000, 70000, 68000],
      expenses: [28000, 31000, 29000, 33000, 30000, 32450],
    }
  };

  /* ---------- Storage ---------- */
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem('mf_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function save(key, data) {
    try { localStorage.setItem('mf_' + key, JSON.stringify(data)); } catch {}
  }

  /* ---------- State ---------- */
  const state = {
    recharges:    load('recharges',    SEED.recharges),
    chits:        load('chits',        SEED.chits),
    transactions: load('transactions', SEED.transactions),
    cashflow:     SEED.cashflow,
    theme:        load('theme', 'light'),
    nextId:       load('nextId', 1000),
  };

  /* ---------- Helpers ---------- */
  function uid() {
    state.nextId++;
    save('nextId', state.nextId);
    return 'id_' + state.nextId;
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  }

  function formatINR(n) {
    if (n == null || isNaN(n)) return '₹0';
    return '₹' + Math.abs(Math.round(n)).toLocaleString('en-IN');
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function daysLeft(expiryStr) {
    const exp = new Date(expiryStr);
    const now = new Date();
    exp.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    return Math.round((exp - now) / 86400000);
  }

  function urgencyBadge(days) {
    if (days < 0)  return { cls: 'badge-red',   label: 'Expired' };
    if (days <= 5)  return { cls: 'badge-red',   label: days + 'd left' };
    if (days <= 15) return { cls: 'badge-amber', label: days + 'd left' };
    return                  { cls: 'badge-green', label: days + 'd left' };
  }

  function progressClass(days) {
    if (days < 0)  return 'red';
    if (days <= 5)  return 'red';
    if (days <= 15) return 'amber';
    return 'green';
  }

  /* ---------- Derived Metrics ---------- */
  function getRechargeExpiry(r) {
    return addDays(r.rechargeDate, r.validity || 30);
  }

  function chitPaidSoFar(c) {
    return c.currentMonth * c.monthly;
  }

  function chitEstProfit(c) {
    const totalPaid = c.duration * c.monthly;
    const commAmt = c.commType === 'percent'
      ? (c.value * c.commVal / 100 * c.duration)
      : (c.commVal * c.duration);
    const totalDivs = c.dividends;
    // Rough: assumed to take mid-duration if not taken
    const expectedBid = c.value * 0.08;
    const received = c.taken ? c.amountReceived : (c.value - expectedBid);
    return received + totalDivs - totalPaid;
  }

  function totalIncome() {
    return state.transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  }

  function totalExpenses() {
    return state.transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
  }

  function totalBalance() {
    return totalIncome() - totalExpenses();
  }

  function categoryBreakdown() {
    const cats = {};
    const colors = {
      'Food':'#1a56db', 'Bills':'#d97706', 'Fuel':'#c81e1e',
      'Shopping':'#7c3aed', 'Medical':'#0891b2', 'Travel':'#059669',
      'Entertainment':'#9333ea', 'Other':'#6b7280'
    };
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!cats[t.category]) cats[t.category] = { amount:0, count:0, color: colors[t.category] || '#6b7280' };
      cats[t.category].amount += t.amount;
      cats[t.category].count++;
    });
    const total = Object.values(cats).reduce((s,c) => s + c.amount, 0);
    return Object.entries(cats)
      .sort((a,b) => b[1].amount - a[1].amount)
      .map(([name, d]) => ({ name, ...d, pct: total ? Math.round(d.amount / total * 100) : 0 }));
  }

  function upcomingPayments() {
    const items = [];
    state.recharges.forEach(r => {
      const expiry = getRechargeExpiry(r);
      const days = daysLeft(expiry);
      if (days <= 10) {
        items.push({ label: r.name + ' — ' + r.provider, sub: 'Expires ' + formatDate(expiry), amount: r.amount, days, type:'recharge' });
      }
    });
    state.chits.forEach(c => {
      items.push({ label: c.name + ' — Month ' + (c.currentMonth + 1), sub: 'Next installment due', amount: c.monthly, days: 5, type:'chit' });
    });
    return items.sort((a,b) => a.days - b.days).slice(0, 5);
  }

  /* ---------- CRUD ---------- */
  function addRecharge(data) {
    const r = { id: uid(), ...data };
    state.recharges.push(r);
    save('recharges', state.recharges);
    return r;
  }

  function deleteRecharge(id) {
    state.recharges = state.recharges.filter(r => r.id !== id);
    save('recharges', state.recharges);
  }

  function addChit(data) {
    const c = { id: uid(), currentMonth:1, dividends:0, taken:false, takenMonth:null, amountReceived:0, ...data };
    state.chits.push(c);
    save('chits', state.chits);
    return c;
  }

  function deleteChit(id) {
    state.chits = state.chits.filter(c => c.id !== id);
    save('chits', state.chits);
  }

  function addTransaction(data) {
    const t = { id: uid(), ...data };
    state.transactions.unshift(t);
    save('transactions', state.transactions);
    return t;
  }

  function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    save('transactions', state.transactions);
  }

  /* ---------- Export ---------- */
  function exportJSON() {
    const blob = new Blob([JSON.stringify({ recharges: state.recharges, chits: state.chits, transactions: state.transactions }, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moneyflow-backup-' + today() + '.json';
    a.click();
  }

  return {
    state, today, formatDate, formatINR, addDays, daysLeft, uid,
    urgencyBadge, progressClass, getRechargeExpiry,
    chitPaidSoFar, chitEstProfit,
    totalIncome, totalExpenses, totalBalance,
    categoryBreakdown, upcomingPayments,
    addRecharge, deleteRecharge,
    addChit, deleteChit,
    addTransaction, deleteTransaction,
    save, exportJSON
  };
})();
