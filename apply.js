(function () {
  'use strict';

  var EXCLUDED_STATES = ['AZ', 'NV', 'ND', 'OR', 'SD', 'UT', 'VT'];
  var TOTAL_STEPS = 5;
  var currentStep = 1;

  var form        = document.getElementById('apply-form');
  var successEl   = document.getElementById('apply-success');
  var progressEl  = document.getElementById('apply-progress');
  var navBtns     = document.getElementById('apply-nav-btns');
  var progressFill = document.getElementById('apply-progress-fill');
  var backBtn     = document.getElementById('apply-back-btn');
  var nextBtn     = document.getElementById('apply-next-btn');
  var submitBtn   = document.getElementById('apply-submit-btn');

  if (!form) return;

  // === STEP NAVIGATION ===
  function showStep(step) {
    document.querySelectorAll('.apply-step-panel').forEach(function (panel) {
      panel.hidden = parseInt(panel.dataset.step) !== step;
    });

    document.querySelectorAll('.step-dot').forEach(function (dot) {
      var s = parseInt(dot.dataset.step);
      dot.classList.toggle('active', s === step);
      dot.classList.toggle('done', s < step);
    });

    progressFill.style.width = ((step / TOTAL_STEPS) * 100) + '%';

    backBtn.hidden = step === 1;
    nextBtn.hidden = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;

    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // === FIELD VALIDATION ===
  function validateField(input) {
    var group = input.closest('.form-group');
    var errorEl = group ? group.querySelector('.form-error') : null;
    var valid = true;

    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';

    if (input.type === 'checkbox') {
      if (input.required && !input.checked) {
        if (errorEl) errorEl.textContent = 'You must agree to continue.';
        valid = false;
      }
      return valid;
    }

    if (input.required && !input.value.trim()) {
      if (errorEl) errorEl.textContent = 'This field is required.';
      input.classList.add('error');
      valid = false;
    } else if (input.type === 'email' && input.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
        if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
        input.classList.add('error');
        valid = false;
      }
    } else if (input.type === 'tel' && input.value.trim()) {
      if (!/[\d\s\(\)\-\+]{7,}/.test(input.value.trim())) {
        if (errorEl) errorEl.textContent = 'Please enter a valid phone number.';
        input.classList.add('error');
        valid = false;
      }
    } else if (input.tagName === 'SELECT' && input.required && !input.value) {
      if (errorEl) errorEl.textContent = 'Please select an option.';
      input.classList.add('error');
      valid = false;
    } else if (input.id === 'a-credit-score' && input.value.trim()) {
      var fico = parseInt(input.value, 10);
      if (isNaN(fico) || fico < 300 || fico > 850) {
        if (errorEl) errorEl.textContent = 'Enter a valid FICO score between 300 and 850.';
        input.classList.add('error');
        valid = false;
      }
    }

    return valid;
  }

  // === STEP VALIDATION ===
  function validateStep(step) {
    var panel = document.querySelector('.apply-step-panel[data-step="' + step + '"]');
    if (!panel) return true;

    var inputs = panel.querySelectorAll('input, select, textarea');
    var valid = true;
    var firstError = null;

    inputs.forEach(function (input) {
      var group = input.closest('.form-group');
      if (group && group.hidden) return;
      if (!validateField(input)) {
        valid = false;
        if (!firstError) firstError = input;
      }
    });

    if (firstError) firstError.focus();
    return valid;
  }

  // === CONDITIONAL: REHAB BUDGET ===
  var renovationSelect  = document.getElementById('a-renovation');
  var rehabBudgetGroup  = document.getElementById('rehab-budget-group');
  var rehabBudgetInput  = document.getElementById('a-rehab-budget');

  if (renovationSelect && rehabBudgetGroup && rehabBudgetInput) {
    renovationSelect.addEventListener('change', function () {
      var isRenovation = this.value === 'Yes';
      rehabBudgetGroup.hidden = !isRenovation;
      rehabBudgetInput.required = isRenovation;
      if (!isRenovation) rehabBudgetInput.value = '';
    });
  }

  // === CONDITIONAL: REFINANCE-ONLY FIELDS ===
  // Show Loan Purpose + Purchase Date only for refinances; relabel purchase price.
  var transactionSelect = document.getElementById('a-transaction-type');
  var loanPurposeGroup  = document.getElementById('loan-purpose-group');
  var loanPurposeInput  = document.getElementById('a-loan-purpose');
  var purchaseDateGroup = document.getElementById('purchase-date-group');
  var purchaseDateInput = document.getElementById('a-purchase-date');
  var purchasePriceLabel = document.getElementById('a-purchase-price-label');

  function toggleRefinanceFields() {
    if (!transactionSelect) return;
    var isRefi = transactionSelect.value.indexOf('Refinance') === 0;
    if (loanPurposeGroup) {
      loanPurposeGroup.hidden = !isRefi;
      if (loanPurposeInput) loanPurposeInput.required = isRefi;
      if (!isRefi && loanPurposeInput) loanPurposeInput.value = '';
    }
    if (purchaseDateGroup) {
      purchaseDateGroup.hidden = !isRefi;
      if (purchaseDateInput) purchaseDateInput.required = isRefi;
      if (!isRefi && purchaseDateInput) purchaseDateInput.value = '';
    }
    if (purchasePriceLabel) {
      purchasePriceLabel.innerHTML = isRefi
        ? 'Original Purchase Price <span class="req">*</span>'
        : 'Purchase Price / Current Value <span class="req">*</span>';
    }
  }
  if (transactionSelect) {
    transactionSelect.addEventListener('change', toggleRefinanceFields);
    toggleRefinanceFields();
  }

  // === CONDITIONAL: RENO SPENT (only if work completed) ===
  var workCompletedSelect = document.getElementById('a-work-completed');
  var renoSpentGroup      = document.getElementById('reno-spent-group');
  var renoSpentInput      = document.getElementById('a-reno-spent');

  if (workCompletedSelect && renoSpentGroup && renoSpentInput) {
    workCompletedSelect.addEventListener('change', function () {
      var done = this.value === 'Yes';
      renoSpentGroup.hidden = !done;
      renoSpentInput.required = done;
      if (!done) renoSpentInput.value = '';
    });
  }

  // === CONDITIONAL: RENTAL STRATEGY (only for rental holds) ===
  var exitStrategySelect  = document.getElementById('a-exit-strategy');
  var rentalStrategyGroup = document.getElementById('rental-strategy-group');
  var rentalStrategyInput = document.getElementById('a-rental-strategy');

  if (exitStrategySelect && rentalStrategyGroup && rentalStrategyInput) {
    exitStrategySelect.addEventListener('change', function () {
      var isRental = this.value === 'Hold as Rental' || this.value === 'Refinance into DSCR';
      rentalStrategyGroup.hidden = !isRental;
      rentalStrategyInput.required = isRental;
      if (!isRental) rentalStrategyInput.value = '';
    });
  }

  // === STATE WARNING ===
  var applyStateSelect  = document.getElementById('a-state');
  var applyStateWarning = document.getElementById('apply-state-warning');

  if (applyStateSelect && applyStateWarning) {
    applyStateSelect.addEventListener('change', function () {
      applyStateWarning.hidden = !EXCLUDED_STATES.includes(this.value);
    });
  }

  // === NEXT / BACK ===
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (validateStep(currentStep)) showStep(currentStep + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      if (currentStep > 1) showStep(currentStep - 1);
    });
  }

  // === BLUR / INPUT VALIDATION ===
  form.querySelectorAll('input, select, textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // === FORM SUBMISSION ===
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(TOTAL_STEPS)) return;

    var data = {};
    new FormData(form).forEach(function (val, key) { data[key] = val; });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting\u2026';

    fetch('/.netlify/functions/loan-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error ' + res.status);
        return res.json();
      })
      .then(function () {
        form.hidden = true;
        if (progressEl) progressEl.hidden = true;
        if (navBtns) navBtns.hidden = true;
        successEl.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function (err) {
        console.error('Application submit error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application \u2192';
        alert('Something went wrong. Please call (678) 842-8084 or email loans@sgcapital.io.');
      });
  });

  // === CURRENCY FORMATTING ===
  function formatCurrency(input) {
    var raw = input.value.replace(/[^0-9]/g, '');
    if (!raw) { input.value = ''; return; }
    input.value = '$' + parseInt(raw, 10).toLocaleString('en-US');
  }

  form.querySelectorAll('input[data-currency]').forEach(function (input) {
    input.addEventListener('input', function () { formatCurrency(input); });
    input.addEventListener('blur', function () { formatCurrency(input); });
  });

  // === REF TRACKING ===
  var refField = document.getElementById('a-referred-by');
  if (refField) {
    var storedRef = localStorage.getItem('sgc_ref');
    if (storedRef) refField.value = storedRef;
  }

  // === FOOTER YEAR ===
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Init
  showStep(1);

})();
