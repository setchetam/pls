(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const number = (id) => {
    const element = $(id);
    const value = Number(element?.value ?? 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };
  const money = (value) => `${value < 0 ? '−' : ''}₸${Math.round(Math.abs(value)).toLocaleString('en-US')}`;

  // The budget exercise is local arithmetic. It does not store or transmit inputs.
  function updateBudget() {
    if (!$('income')) return;
    const income = number('income');
    const housing = number('housing');
    const mortgage = number('mortgage');
    const living = number('living');
    const consumer = number('consumer');
    const installments = number('installments');
    const car = number('car');
    const running = number('carRunning');
    const proposed = number('newPay');

    const debtPayments = mortgage + consumer + installments + car + proposed;
    const expenses = housing + living + running + debtPayments;
    const balance = income - expenses;
    const debtRatio = income > 0 ? (debtPayments / income) * 100 : 0;
    const shock = Math.min(50, number('shock'));
    const shockBalance = income * (1 - shock / 100) - expenses;
    const upfrontBalance = number('cashReady') - number('upfrontCost') - number('reserve');
    const outgoingPercent = income > 0 ? Math.max(0, Math.min(100, (expenses / income) * 100)) : 0;

    const setText = (id, value) => {
      const node = $(id);
      if (node) node.textContent = value;
    };
    setText('balance', money(balance));
    setText('balanceMessage', balance >= 0
      ? 'Cash left in a normal month, before irregular expenses.'
      : 'Your listed monthly costs are higher than your take-home income.');
    setText('debtRatio', `${debtRatio.toFixed(1)}%`);
    setText('shockBalance', money(shockBalance));
    setText('upfrontBalance', money(upfrontBalance));
    setText('upfrontMessage', upfrontBalance >= 0
      ? 'Your stated reserve remains after upfront costs.'
      : 'The upfront cost would use part of your emergency reserve.');
    setText('expenseTotal', money(expenses));
    setText('savingsTotal', money(balance));
    setText('outgoingPercent', `${outgoingPercent.toFixed(1)}%`);

    const wheel = $('debtWheel');
    if (wheel) wheel.style.setProperty('--spent', `${outgoingPercent}%`);
    const balanceNode = $('balance');
    if (balanceNode) balanceNode.classList.toggle('negative', balance < 0);
  }

  [
    'income', 'housing', 'mortgage', 'living', 'consumer', 'installments',
    'car', 'carRunning', 'newPay', 'cashReady', 'upfrontCost', 'reserve', 'shock'
  ].forEach((id) => $(id)?.addEventListener('input', updateBudget));

  $('resetBudget')?.addEventListener('click', () => {
    const defaults = {
      income: 350000, housing: 100000, mortgage: 0, living: 100000,
      consumer: 30000, installments: 25000, car: 0, carRunning: 0,
      newPay: 80000, cashReady: 500000, upfrontCost: 2000000,
      reserve: 300000, shock: 20
    };
    Object.entries(defaults).forEach(([id, value]) => {
      if ($(id)) $(id).value = value;
    });
    updateBudget();
  });

  // Three-question reflection tool. It does not assess creditworthiness.
  const pauseAnswers = [...document.querySelectorAll('.pause-answer')];
  const pauseResult = $('pauseResult');
  function updatePause() {
    if (!pauseResult) return;
    const checked = pauseAnswers.filter((item) => item.checked).length;
    if (checked === 0) {
      pauseResult.textContent = 'Tick any statement that feels familiar. No judgement — just a reason to pause.';
    } else if (checked === 1) {
      pauseResult.textContent = 'One signal spotted. Take a moment and check the full price, not only the monthly payment.';
    } else if (checked === 2) {
      pauseResult.textContent = 'Two signals spotted. Step back, compare the total cost and give yourself time before deciding.';
    } else {
      pauseResult.textContent = 'Three signals spotted. The ad is doing a lot of persuading. Pause and check the contract when you are not rushed.';
    }
  }
  pauseAnswers.forEach((item) => item.addEventListener('change', updatePause));
  $('resetPause')?.addEventListener('click', () => {
    pauseAnswers.forEach((item) => { item.checked = false; });
    updatePause();
  });

  // Responsive navigation.
  const menuButton = $('menuToggle');
  const header = document.querySelector('.site-header');
  function closeMenu() {
    header?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    if (menuButton) menuButton.textContent = '☰';
  }
  menuButton?.addEventListener('click', () => {
    const open = header?.classList.toggle('menu-open') ?? false;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuButton.textContent = open ? '×' : '☰';
  });
  document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  // If a publisher blocks hotlinking, leave a visible source-link fallback.
  document.querySelectorAll('.hero-ad img, .car-image img, .bi-poster-image img').forEach((img) => {
    const failed = () => {
      const card = img.closest('.hero-ad, .car-image, .bi-poster-image');
      if (!card || card.querySelector('.image-fallback-text')) return;
      card.classList.add('image-failed');
      const fallback = document.createElement('span');
      fallback.className = 'image-fallback-text';
      fallback.textContent = card.classList.contains('bi-poster-image') ? 'BI Group poster not loaded. Tap here to open the original official campaign post.' : 'Ad image not loaded. Open the original advertisement using this card.';
      card.appendChild(fallback);
    };
    img.addEventListener('error', failed, { once: true });
    if (img.complete && img.naturalWidth === 0) failed();
  });

  // Reading progress indicator.
  const progress = $('readingProgress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  updateBudget();
  updatePause();
  updateProgress();
})();
