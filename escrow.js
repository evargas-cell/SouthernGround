(function () {
  'use strict';

  // ============================================================
  //  FEE SCHEDULE — single source of truth. Change here to reprice.
  // ============================================================

  // EMD: flat fee by funding amount. These are the 30-day base fees.
  var EMD_TIERS = [
    { max:   5000, fee:  1500 },
    { max:  15000, fee:  2500 },
    { max:  25000, fee:  5000 },
    { max:  50000, fee: 12000 },
    { max:  75000, fee: 19000 },
    { max: 100000, fee: 30000 },
  ];
  var EMD_AUTO_QUOTE_MAX = 100000; // above this, needs additional approval

  // Double close: percentage of the wire, tiered by size.
  var DC_TIERS = [
    { max:  500000, pct: 0.0125 },
    { max: 1000000, pct: 0.0150 },
    { max: 1500000, pct: 0.0175 },
  ];
  var DC_AUTO_QUOTE_MAX = 1500000; // above this, closes with our attorney
  var DC_MIN_FEE        = 1000;    // floor on any transactional fee
  var DC_EXTRA_DAY_PCT  = 0.005;   // each day past the first 24 hours

  // Upfront deposit (EMD only): 5% of the loan, $250 floor, credited to the fee.
  var DEPOSIT_PCT = 0.05;
  var DEPOSIT_MIN = 250;

  var TOTAL_STEPS = 4;
  var currentStep = 1;

  var form         = document.getElementById('escrow-form');
  if (!form) return;

  var successEl    = document.getElementById('escrow-success');
  var progressEl   = document.getElementById('escrow-progress');
  var navBtns      = document.getElementById('escrow-nav-btns');
  var progressFill = document.getElementById('escrow-progress-fill');
  var backBtn      = document.getElementById('escrow-back-btn');
  var nextBtn      = document.getElementById('escrow-next-btn');
  var submitBtn    = document.getElementById('escrow-submit-btn');

  var amountInput  = document.getElementById('e-amount');
  var daysInput    = document.getElementById('e-dc-days');

  var roleSelect        = document.getElementById('e-role');
  var connectorFeeGroup = document.getElementById('e-connector-fee-group');
  var connectorFeeInput = document.getElementById('e-connector-fee');

  // ============================================================
  //  HELPERS
  // ============================================================

  function money(n) {
    if (n == null || isNaN(n)) return '—';
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function parseMoney(v) {
    if (!v) return null;
    var n = Number(String(v).replace(/[^0-9.]/g, ''));
    return !n || isNaN(n) ? null : n;
  }

  // An element counts as inactive if it (or any ancestor) is hidden. Used to
  // skip validation and submission for branch fields that don't apply.
  function isHidden(el) {
    return !!el.closest('[hidden]');
  }

  // Whether a field belongs to the branch the user actually selected.
  // Deliberately keyed off the deal type rather than DOM visibility: every
  // field on a step you aren't looking at is also "hidden", and treating those
  // as inactive would wipe answers as soon as you moved to the next step.
  function branchApplies(el) {
    if (el.closest('.branch-emd')) return isEmd();
    if (el.closest('.branch-dc'))  return isDoubleClose();
    return true;
  }

  function selectedDealType() {
    var checked = form.querySelector('input[name="deal_type"]:checked');
    return checked ? checked.value : '';
  }

  function isEmd(t)         { return (t || selectedDealType()).indexOf('EMD') === 0; }
  function isDoubleClose(t) { return (t || selectedDealType()) === 'Double Close'; }

  // ============================================================
  //  FEE ENGINE
  // ============================================================
  // Returns { rows, total, totalLabel, deposit, note, needsReview }.
  // total is null whenever the deal falls outside the auto-quote range.
  function computeFee(dealType, amount, days) {
    if (!dealType || !amount) return null;

    if (isEmd(dealType)) {
      var isSixty = dealType.indexOf('60') !== -1;

      if (amount > EMD_AUTO_QUOTE_MAX) {
        return {
          rows: [['Funding amount', money(amount)]],
          total: null,
          totalLabel: 'Quoted on review',
          deposit: null,
          needsReview: true,
          note: 'EMDs above ' + money(EMD_AUTO_QUOTE_MAX) + ' require additional approval. ' +
                'Submit the same way and we\'ll price it on review.',
        };
      }

      var tier = null;
      for (var i = 0; i < EMD_TIERS.length; i++) {
        if (amount <= EMD_TIERS[i].max) { tier = EMD_TIERS[i]; break; }
      }
      if (!tier) return null;

      var deposit = Math.max(amount * DEPOSIT_PCT, DEPOSIT_MIN);

      return {
        rows: [
          ['Funding amount', money(amount)],
          [isSixty ? 'Base fee (30-day schedule)' : 'EMD fee (30-day schedule)', money(tier.fee)],
        ],
        total: tier.fee,
        totalLabel: isSixty ? 'Starting at' : 'Total Fee',
        deposit: deposit,
        needsReview: false,
        note: isSixty
          ? '60-day EMDs price above the 30-day base schedule. This is your starting point — ' +
            'your final fee is confirmed on the term sheet. Remember to add your own fee on top ' +
            'before you present numbers to your borrower.'
          : 'Wholesale pricing — add your own fee on top before you present numbers to your borrower.',
      };
    }

    if (isDoubleClose(dealType)) {
      if (amount > DC_AUTO_QUOTE_MAX) {
        return {
          rows: [['Funding amount', money(amount)]],
          total: null,
          totalLabel: 'Quoted on review',
          deposit: null,
          needsReview: true,
          note: 'Transactional funding above ' + money(DC_AUTO_QUOTE_MAX) + ' is reviewed case by ' +
                'case and must close with our attorney.',
        };
      }

      var pct = null;
      for (var j = 0; j < DC_TIERS.length; j++) {
        if (amount <= DC_TIERS[j].max) { pct = DC_TIERS[j].pct; break; }
      }
      if (pct == null) return null;

      var nDays     = Math.max(1, parseInt(days, 10) || 1);
      var extraDays = nDays - 1;
      var baseFee   = amount * pct;
      var extraFee  = amount * DC_EXTRA_DAY_PCT * extraDays;
      var raw       = baseFee + extraFee;
      var total     = Math.max(raw, DC_MIN_FEE);

      var rows = [
        ['Funding amount', money(amount)],
        ['Transactional fee (' + (pct * 100).toFixed(2).replace(/\.?0+$/, '') + '%, 24 hours)', money(baseFee)],
      ];
      if (extraDays > 0) {
        rows.push([
          extraDays + ' additional day' + (extraDays === 1 ? '' : 's') +
            ' (' + (DC_EXTRA_DAY_PCT * 100).toFixed(1).replace(/\.0$/, '') + '% / day)',
          money(extraFee),
        ]);
      }
      if (raw < DC_MIN_FEE) {
        rows.push(['Minimum fee applied', money(DC_MIN_FEE)]);
      }

      return {
        rows: rows,
        total: total,
        totalLabel: 'Total Fee',
        deposit: null,
        needsReview: false,
        note: 'Wholesale pricing — add your own fee on top before you present numbers to your borrower.',
      };
    }

    return null;
  }

  // ============================================================
  //  FEE BOX RENDERING
  // ============================================================

  var feeBox        = document.getElementById('e-fee-box');
  var feeTitle      = document.getElementById('e-fee-title');
  var feeRows       = document.getElementById('e-fee-rows');
  var feeTotalWrap  = document.getElementById('e-fee-total-wrap');
  var feeTotal      = document.getElementById('e-fee-total');
  var feeDeposit    = document.getElementById('e-fee-deposit');
  var feeDepositAmt = document.getElementById('e-fee-deposit-amt');
  var feeNote       = document.getElementById('e-fee-note');

  function currentQuote() {
    return computeFee(
      selectedDealType(),
      parseMoney(amountInput.value),
      daysInput ? daysInput.value : 1
    );
  }

  function renderFeeBox() {
    var q = currentQuote();

    if (!q) {
      feeBox.hidden = true;
      updateTotals();
      updateDepositCallout(null);
      return;
    }

    feeBox.hidden = false;
    feeTitle.textContent = isEmd() ? 'Your EMD Fee' : 'Your Transactional Fee';

    feeRows.innerHTML = '';
    q.rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fee-box-row';
      var label = document.createElement('span');
      label.textContent = r[0];
      var val = document.createElement('span');
      val.textContent = r[1];
      row.appendChild(label);
      row.appendChild(val);
      feeRows.appendChild(row);
    });

    feeTotalWrap.querySelector('span').textContent = q.totalLabel;
    feeTotal.textContent = q.total != null ? money(q.total) : 'On review';
    feeTotalWrap.classList.toggle('fee-box-total--review', q.total == null);

    if (q.deposit != null) {
      feeDeposit.hidden = false;
      feeDepositAmt.textContent = money(q.deposit);
    } else {
      feeDeposit.hidden = true;
    }

    feeNote.textContent = q.note || '';
    feeNote.hidden = !q.note;

    updateTotals();
    updateDepositCallout(q);
  }

  // ============================================================
  //  SUBMITTER ROLE — borrower vs connector
  // ============================================================
  // A borrower is quoting themselves, so our fee is the whole story. A
  // connector marks the deal up, so they get a fee field and we show the
  // stacked total their borrower will actually see.

  var totalBox  = document.getElementById('e-total-box');
  var totalRows = document.getElementById('e-total-rows');
  var totalAmt  = document.getElementById('e-total-amt');

  function isConnector() {
    return !!roleSelect && roleSelect.value === 'Connector';
  }

  function toggleConnectorFee() {
    if (!connectorFeeGroup || !connectorFeeInput) return;
    var on = isConnector();
    connectorFeeGroup.hidden = !on;
    connectorFeeInput.required = on;
    if (!on) {
      connectorFeeInput.value = '';
      connectorFeeInput.classList.remove('error');
      var err = connectorFeeGroup.querySelector('.form-error');
      if (err) err.textContent = '';
    }
    updateTotals();
  }

  function connectorFee() {
    return isConnector() ? parseMoney(connectorFeeInput ? connectorFeeInput.value : null) : null;
  }

  // Our fee + the connector's fee, or null when we can't total it yet.
  function totalToBorrower(q) {
    if (!q || q.total == null) return null;
    return q.total + (connectorFee() || 0);
  }

  function updateTotals() {
    if (!totalBox) return;
    var q = currentQuote();
    var fee = connectorFee();

    // Only meaningful for a connector who has entered a fee — for a borrower
    // this would just restate the fee box from step 1.
    if (!isConnector() || !q || q.total == null || !fee) {
      totalBox.hidden = true;
      return;
    }

    var rows = [
      ['Our fee', money(q.total)],
      ['Your fee', money(fee)],
    ];

    totalRows.innerHTML = '';
    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fee-box-row';
      var label = document.createElement('span');
      label.textContent = r[0];
      var val = document.createElement('span');
      val.textContent = r[1];
      row.appendChild(label);
      row.appendChild(val);
      totalRows.appendChild(row);
    });

    totalAmt.textContent = money(q.total + fee);
    totalBox.hidden = false;
  }

  // When the borrower is submitting for themselves, seed the borrower fields
  // from their own details rather than making them type it twice. Left
  // editable — the borrower of record is often an LLC or includes a co-borrower.
  function syncBorrowerIdentity() {
    var selfNote = document.getElementById('e-borrower-self-note');
    var isSelf = roleSelect && roleSelect.value === 'Borrower';
    if (selfNote) selfNote.hidden = !isSelf;

    var nameLabel = document.getElementById('e-borrower-name-label');
    var mailLabel = document.getElementById('e-borrower-address-label');
    var expLabel  = document.getElementById('e-borrower-experience-label');
    if (nameLabel) nameLabel.innerHTML = (isSelf ? 'Borrower Name (you)' : 'Borrower Name') + ' <span class="req">*</span>';
    if (mailLabel) mailLabel.innerHTML = (isSelf ? 'Your Mailing Address' : 'Borrower Mailing Address') + ' <span class="req">*</span>';
    if (expLabel)  expLabel.textContent = isSelf ? 'Your Experience Level' : "Borrower's Experience Level";

    if (!isSelf) return;
    var nameEl  = document.getElementById('e-borrower-name');
    var emailEl = document.getElementById('e-borrower-email');
    var srcName  = document.getElementById('e-your-name');
    var srcEmail = document.getElementById('e-your-email');
    if (nameEl && !nameEl.value.trim() && srcName)   nameEl.value  = srcName.value;
    if (emailEl && !emailEl.value.trim() && srcEmail) emailEl.value = srcEmail.value;
  }

  var depositCalloutAmt   = document.getElementById('e-deposit-callout-amt');
  var depositCalloutValue = document.getElementById('e-deposit-callout-value');

  function updateDepositCallout(q) {
    if (!depositCalloutAmt) return;
    if (q && q.deposit != null) {
      depositCalloutAmt.hidden = false;
      depositCalloutValue.textContent = money(q.deposit);
    } else {
      depositCalloutAmt.hidden = true;
    }
  }

  // ============================================================
  //  BRANCHING — show only the fields for the selected deal type
  // ============================================================

  var mutualReleaseSelect  = document.getElementById('e-mutual-release');
  var mutualReleaseFileGrp = document.getElementById('e-mutual-release-file-group');
  var mutualReleaseFile    = document.getElementById('e-mutual-release-file');
  var emdSoftSelect        = document.getElementById('e-emd-soft');
  var emdSoftWarning       = document.getElementById('e-emd-soft-warning');
  var amountNote           = document.getElementById('e-amount-note');

  function applyBranching() {
    var type = selectedDealType();
    var emd  = isEmd(type);
    var dc   = isDoubleClose(type);

    document.querySelectorAll('.branch-emd').forEach(function (el) { el.hidden = !emd; });
    document.querySelectorAll('.branch-dc').forEach(function (el)  { el.hidden = !dc;  });

    // A branch field is only required while its branch applies to the selected
    // deal type. Clear it when it doesn't, so an answer from the other branch
    // never reaches the server — but keep answers intact across step changes.
    form.querySelectorAll('[data-branch-required]').forEach(function (el) {
      var active = branchApplies(el);
      el.required = active;
      if (!active) {
        if (el.type === 'checkbox') el.checked = false;
        else if (el.type === 'file') el.value = '';
        else if (el.id === 'e-dc-days') el.value = '1'; // keep the sane default
        else el.value = '';
        el.classList.remove('error');
        var grp = el.closest('.form-group');
        var err = grp ? grp.querySelector('.form-error') : null;
        if (err) err.textContent = '';
      }
    });

    if (amountNote) {
      amountNote.textContent = dc
        ? 'The total wire amount needed to fund the A–B closing.'
        : 'The total dollar amount you need us to wire into escrow.';
    }

    toggleMutualReleaseFile();
    renderFeeBox();
  }

  // The signed seller addendum is only required on EMD deals in a mutual
  // release state — it depends on two answers, so it gets its own toggle.
  function toggleMutualReleaseFile() {
    if (!mutualReleaseFileGrp || !mutualReleaseFile) return;
    var needed = isEmd() && mutualReleaseSelect && mutualReleaseSelect.value === 'Yes';
    mutualReleaseFileGrp.hidden = !needed;
    mutualReleaseFile.required = needed;
    if (!needed) {
      mutualReleaseFile.value = '';
      mutualReleaseFile.classList.remove('error');
      var err = mutualReleaseFileGrp.querySelector('.form-error');
      if (err) err.textContent = '';
    }
  }

  form.querySelectorAll('input[name="deal_type"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      document.querySelectorAll('.deal-type-card').forEach(function (card) {
        card.classList.toggle('selected', card.contains(radio) && radio.checked);
      });
      var err = document.getElementById('deal-type-error');
      if (err) err.textContent = '';
      applyBranching();
    });
  });

  if (mutualReleaseSelect) {
    mutualReleaseSelect.addEventListener('change', toggleMutualReleaseFile);
  }

  if (emdSoftSelect && emdSoftWarning) {
    emdSoftSelect.addEventListener('change', function () {
      emdSoftWarning.hidden = this.value !== 'No' && this.value !== 'Not Sure';
    });
  }

  if (amountInput) amountInput.addEventListener('input', renderFeeBox);
  if (daysInput)   daysInput.addEventListener('input', renderFeeBox);
  if (connectorFeeInput) connectorFeeInput.addEventListener('input', updateTotals);

  if (roleSelect) {
    roleSelect.addEventListener('change', function () {
      toggleConnectorFee();
      syncBorrowerIdentity();
    });
  }

  // ============================================================
  //  VALIDATION
  // ============================================================

  function validateField(input) {
    if (isHidden(input)) return true;

    var group   = input.closest('.form-group');
    var errorEl = group ? group.querySelector('.form-error') : null;
    var valid   = true;

    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';

    function fail(msg) {
      if (errorEl) errorEl.textContent = msg;
      input.classList.add('error');
      valid = false;
    }

    if (input.type === 'checkbox') {
      if (input.required && !input.checked) {
        if (errorEl) errorEl.textContent = 'You must check this box to continue.';
        valid = false;
      }
      return valid;
    }

    if (input.type === 'file') {
      if (input.required && !input.files.length) fail('Please attach this document.');
      return valid;
    }

    if (input.required && !input.value.trim()) {
      fail(input.tagName === 'SELECT' ? 'Please select an option.' : 'This field is required.');
    } else if (input.type === 'email' && input.value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) fail('Please enter a valid email address.');
    } else if (input.type === 'tel' && input.value.trim()) {
      if (!/[\d\s\(\)\-\+]{7,}/.test(input.value.trim())) fail('Please enter a valid phone number.');
    } else if (input.type === 'url' && input.value.trim()) {
      if (!/^https?:\/\/.+\..+/.test(input.value.trim())) fail('Please enter a full URL starting with http:// or https://');
    } else if (input === amountInput && input.value.trim()) {
      if (!parseMoney(input.value)) fail('Please enter a dollar amount.');
    }

    return valid;
  }

  function validateStep(step) {
    var panel = document.querySelector('.apply-step-panel[data-step="' + step + '"]');
    if (!panel) return true;

    var valid = true;
    var firstError = null;

    // Step 1 gates on the radio group, which has no .form-group wrapper.
    if (step === 1 && !selectedDealType()) {
      var dtErr = document.getElementById('deal-type-error');
      if (dtErr) dtErr.textContent = 'Please choose a transaction type.';
      valid = false;
      firstError = panel.querySelector('input[name="deal_type"]');
    }

    panel.querySelectorAll('input, select, textarea').forEach(function (input) {
      if (input.name === 'deal_type') return;
      if (!validateField(input)) {
        valid = false;
        if (!firstError) firstError = input;
      }
    });

    if (firstError) firstError.focus();
    return valid;
  }

  // ============================================================
  //  STEP NAVIGATION
  // ============================================================

  function showStep(step) {
    document.querySelectorAll('.apply-step-panel').forEach(function (panel) {
      panel.hidden = parseInt(panel.dataset.step, 10) !== step;
    });

    document.querySelectorAll('.step-dot').forEach(function (dot) {
      var s = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('active', s === step);
      dot.classList.toggle('done', s < step);
    });

    progressFill.style.width = ((step / TOTAL_STEPS) * 100) + '%';

    backBtn.hidden   = step === 1;
    nextBtn.hidden   = step === TOTAL_STEPS;
    submitBtn.hidden = step !== TOTAL_STEPS;

    currentStep = step;

    // Re-run branching whenever a panel becomes visible, so required flags on
    // that panel's branch fields match the selected deal type.
    applyBranching();
    if (step === 3) syncBorrowerIdentity();
    if (step === TOTAL_STEPS) renderRecap();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', function () {
    if (validateStep(currentStep)) showStep(currentStep + 1);
  });

  backBtn.addEventListener('click', function () {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  // ============================================================
  //  FINAL RECAP
  // ============================================================

  var recapBox  = document.getElementById('e-recap');
  var recapRows = document.getElementById('e-recap-rows');

  function renderRecap() {
    if (!recapBox) return;
    var q = currentQuote();
    var type = selectedDealType();
    if (!type || !q) { recapBox.hidden = true; return; }

    var rows = [
      ['Transaction type', type],
      ['Funding amount', money(parseMoney(amountInput.value))],
    ];
    if (isDoubleClose(type) && daysInput) {
      rows.push(['Days needed', daysInput.value + (daysInput.value === '1' ? ' day' : ' days')]);
    }
    rows.push(['Submitting as', roleSelect && roleSelect.value ? roleSelect.value : '—']);
    rows.push(['Our fee', q.total != null ? money(q.total) : 'Quoted on review']);

    var fee = connectorFee();
    if (fee) {
      rows.push(['Your fee', money(fee)]);
      var total = totalToBorrower(q);
      if (total != null) rows.push(['Total to borrower', money(total)]);
    }
    if (q.deposit != null) rows.push(['Deposit due upfront', money(q.deposit)]);

    recapRows.innerHTML = '';
    rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'fee-box-row';
      var label = document.createElement('span');
      label.textContent = r[0];
      var val = document.createElement('span');
      val.textContent = r[1];
      row.appendChild(label);
      row.appendChild(val);
      recapRows.appendChild(row);
    });
    recapBox.hidden = false;
  }

  // ============================================================
  //  FILE HANDLING
  // ============================================================
  // Files ride along as base64 on the JSON payload and get attached to the
  // notification email. Netlify caps function payloads at ~6MB, so hold the
  // total well under that and tell people to email anything bigger.
  var MAX_TOTAL_BYTES = 4 * 1024 * 1024;

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        // reader.result is "data:<mime>;base64,<payload>" — keep the payload.
        var result = String(reader.result);
        resolve({
          filename: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          content: result.slice(result.indexOf(',') + 1),
        });
      };
      reader.onerror = function () { reject(new Error('Could not read ' + file.name)); };
      reader.readAsDataURL(file);
    });
  }

  function collectFiles() {
    var inputs = Array.prototype.slice.call(form.querySelectorAll('input[type="file"]'))
      .filter(function (el) { return !isHidden(el) && el.files.length; });

    var totalBytes = inputs.reduce(function (sum, el) { return sum + el.files[0].size; }, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      return Promise.reject(new Error(
        'Your attachments total ' + (totalBytes / 1048576).toFixed(1) + ' MB, over the 4 MB limit. ' +
        'Please attach smaller files, or remove them and email the documents to funding@sgcapital.io ' +
        'after you submit.'
      ));
    }

    return Promise.all(inputs.map(function (el) {
      return readFileAsBase64(el.files[0]).then(function (f) {
        f.field = el.name;
        f.label = el.name === 'psa_ab' ? 'Purchase Contract (A-B)'
                : el.name === 'psa_bc' ? 'Purchase Contract (B-C)'
                : 'Signed Mutual Release Seller Addendum';
        return f;
      });
    }));
  }

  // ============================================================
  //  SUBMIT
  // ============================================================

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Enter inside a text field fires submit from any step. Treat that as
    // "next" until the user is actually on the final step — otherwise the
    // final step's fields are off-screen and would all validate vacuously.
    if (currentStep !== TOTAL_STEPS) {
      if (validateStep(currentStep)) showStep(currentStep + 1);
      return;
    }

    if (!validateStep(TOTAL_STEPS)) return;

    var q = currentQuote();
    var data = {};
    new FormData(form).forEach(function (val, key) {
      if (val instanceof File) return; // files are handled separately
      data[key] = val;
    });

    // Send the quote we showed on screen so the desk sees exactly what the
    // submitter was quoted, not a number recomputed later.
    data.quoted_fee        = q && q.total != null ? q.total : null;
    data.quoted_deposit    = q && q.deposit != null ? Math.round(q.deposit) : null;
    data.needs_review      = !!(q && q.needsReview);
    data.total_to_borrower = totalToBorrower(q);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    collectFiles()
      .then(function (files) {
        data.attachments = files;
        return fetch('/.netlify/functions/escrow-funding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error ' + res.status);
        return res.json();
      })
      .then(function () {
        form.hidden = true;
        if (progressEl) progressEl.hidden = true;
        if (navBtns) navBtns.hidden = true;

        var depositLine = document.getElementById('escrow-success-deposit');
        if (depositLine && q && q.deposit != null) {
          document.getElementById('escrow-success-deposit-amt').textContent = money(q.deposit);
          depositLine.hidden = false;
        }

        successEl.hidden = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function (err) {
        console.error('Escrow funding submit error:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Funding Request →';
        alert(err && /4 MB limit/.test(err.message)
          ? err.message
          : 'Something went wrong. Please call (678) 842-8084 or email funding@sgcapital.io.');
      });
  });

  // ============================================================
  //  FIELD BEHAVIOR
  // ============================================================

  form.querySelectorAll('input, select, textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
    input.addEventListener('input', function () {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  function formatCurrency(input) {
    var raw = input.value.replace(/[^0-9]/g, '');
    input.value = raw ? '$' + parseInt(raw, 10).toLocaleString('en-US') : '';
  }

  form.querySelectorAll('input[data-currency]').forEach(function (input) {
    input.addEventListener('input', function () { formatCurrency(input); });
    input.addEventListener('blur',  function () { formatCurrency(input); });
  });

  // Carry affiliate attribution through, same as the loan application.
  var refField = document.getElementById('e-referred-by');
  if (refField) {
    var storedRef = localStorage.getItem('sgc_ref');
    if (storedRef) refField.value = storedRef;
  }

  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Init
  applyBranching();
  toggleConnectorFee();
  showStep(1);

})();
