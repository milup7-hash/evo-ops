/**
 * Evo OPS - Estimator UI Module
 * Real-time Dual Plate Check Valve Interactive Configurator & Cost Inspector
 */

class EstimatorModule {
  constructor(store, calculator) {
    this.store = store;
    this.calculator = calculator;
  }

  // Initialize and bind DOM elements
  init() {
    this.renderPresets();
    this.populateDropdowns();
    this.bindEvents();
    this.recalculate();

    // Subscribe to state changes
    this.store.subscribe('configChanged', () => this.recalculate());
    this.store.subscribe('masterDataChanged', () => {
      this.populateDropdowns();
      this.recalculate();
    });
  }

  // Render quick preset buttons
  renderPresets() {
    const container = document.getElementById('presetsContainer');
    if (!container) return;

    const presets = this.store.state.masterData.presets;
    container.innerHTML = presets.map((p, idx) => `
      <button type="button" class="preset-pill" data-preset-idx="${idx}">
        <span class="preset-indicator"></span>
        <span class="preset-name">${p.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.preset-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-preset-idx'));
        this.store.applyPreset(idx);
        container.querySelectorAll('.preset-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.showToast) {
          window.showToast(`Applied Preset: ${presets[idx].name}`, 'info');
        }
      });
    });
  }

  // Populate Select Dropdowns from Master Data
  populateDropdowns() {
    const master = this.store.state.masterData;
    const config = this.store.state.activeConfig;

    // Sizes
    const sizeSelect = document.getElementById('cfgSize');
    if (sizeSelect) {
      sizeSelect.innerHTML = master.sizes.map(s => `
        <option value="${s.nps}" ${s.nps === config.size ? 'selected' : ''}>${s.label}</option>
      `).join('');
    }

    // Classes
    const classSelect = document.getElementById('cfgClass');
    if (classSelect) {
      classSelect.innerHTML = master.pressureClasses.map(p => `
        <option value="${p.class}" ${p.class === config.pressureClass ? 'selected' : ''}>${p.label}</option>
      `).join('');
    }

    // End Connection
    const endSelect = document.getElementById('cfgEndConnection');
    if (endSelect) {
      endSelect.innerHTML = master.endConnections.map(e => `
        <option value="${e.id}" ${e.id === config.endConnection ? 'selected' : ''}>${e.name}</option>
      `).join('');
    }

    // Materials - Body
    const bodySelect = document.getElementById('matBody');
    if (bodySelect) {
      bodySelect.innerHTML = master.materials.castings.map(m => `
        <option value="${m.code}" ${m.code === config.materials.body ? 'selected' : ''}>${m.code} - ${m.name} (₹${m.ratePerKg}/kg)</option>
      `).join('');
    }

    // Materials - Flap
    const flapSelect = document.getElementById('matFlap');
    if (flapSelect) {
      flapSelect.innerHTML = master.materials.castings.map(m => `
        <option value="${m.code}" ${m.code === config.materials.flap ? 'selected' : ''}>${m.code} - ${m.name} (₹${m.ratePerKg}/kg)</option>
      `).join('');
    }

    // Materials - Hinge Pin
    const hPinSelect = document.getElementById('matHingePin');
    if (hPinSelect) {
      hPinSelect.innerHTML = master.materials.pins.map(p => `
        <option value="${p.code}" ${p.code === config.materials.hingePin ? 'selected' : ''}>${p.name} (₹${p.ratePerKg}/kg)</option>
      `).join('');
    }

    // Materials - Stop Pin
    const sPinSelect = document.getElementById('matStopPin');
    if (sPinSelect) {
      sPinSelect.innerHTML = master.materials.pins.map(p => `
        <option value="${p.code}" ${p.code === config.materials.stopPin ? 'selected' : ''}>${p.name} (₹${p.ratePerKg}/kg)</option>
      `).join('');
    }

    // Materials - Spring
    const springSelect = document.getElementById('matSpring');
    if (springSelect) {
      springSelect.innerHTML = master.materials.springs.map(s => `
        <option value="${s.code}" ${s.code === config.materials.spring ? 'selected' : ''}>${s.name} (₹${s.baseCostPerSpring}/pc)</option>
      `).join('');
    }

    // Materials - Seat
    const seatSelect = document.getElementById('matSeat');
    if (seatSelect) {
      seatSelect.innerHTML = master.materials.seats.map(st => `
        <option value="${st.code}" ${st.code === config.materials.seat ? 'selected' : ''}>${st.name}</option>
      `).join('');
    }

    // Commercial inputs
    const qtyInput = document.getElementById('cfgQuantity');
    if (qtyInput) qtyInput.value = config.quantity || 1;

    const marginInput = document.getElementById('cfgMargin');
    if (marginInput) marginInput.value = config.marginPercent || 22;

    const discountInput = document.getElementById('cfgDiscount');
    if (discountInput) discountInput.value = config.discountPercent || 0;
  }

  // Bind change and click events
  bindEvents() {
    const bindChange = (id, callback) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', callback);
    };
    const bindInput = (id, callback) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', callback);
    };

    bindChange('cfgSize', (e) => this.store.updateConfig({ size: e.target.value }));
    bindChange('cfgClass', (e) => this.store.updateConfig({ pressureClass: e.target.value }));
    bindChange('cfgEndConnection', (e) => this.store.updateConfig({ endConnection: e.target.value }));
    bindInput('cfgQuantity', (e) => this.store.updateConfig({ quantity: parseInt(e.target.value) || 1 }));
    bindInput('cfgMargin', (e) => this.store.updateConfig({ marginPercent: parseFloat(e.target.value) || 0 }));
    bindInput('cfgDiscount', (e) => this.store.updateConfig({ discountPercent: parseFloat(e.target.value) || 0 }));

    // Materials
    bindChange('matBody', (e) => this.store.updateConfigMaterial('body', e.target.value));
    bindChange('matFlap', (e) => this.store.updateConfigMaterial('flap', e.target.value));
    bindChange('matHingePin', (e) => this.store.updateConfigMaterial('hingePin', e.target.value));
    bindChange('matStopPin', (e) => this.store.updateConfigMaterial('stopPin', e.target.value));
    bindChange('matSpring', (e) => this.store.updateConfigMaterial('spring', e.target.value));
    bindChange('matSeat', (e) => this.store.updateConfigMaterial('seat', e.target.value));

    // Action buttons
    const addBtn = document.getElementById('btnAddToQuote');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const item = this.calculator.calculateValve();
        this.store.addItemToQuotation(item);
        if (window.showToast) {
          window.showToast(`Added ${item.size} ${item.pressureClass} DPCV (${item.quantity} Nos) to Quotation!`, 'success');
        }
      });
    }

    const quickQuoteBtn = document.getElementById('btnViewInQuote');
    if (quickQuoteBtn) {
      quickQuoteBtn.addEventListener('click', () => {
        const item = this.calculator.calculateValve();
        this.store.addItemToQuotation(item);
        this.store.setView('quotations');
      });
    }
  }

  // Recalculate and update UI metrics & BOM Table
  recalculate() {
    const res = this.calculator.calculateValve();

    // Summary Metric Cards
    this.setText('metricValveDesc', `${res.size} ${res.pressureClass} ${res.endConnection}`);
    this.setText('metricTotalWeight', `${res.weights.unitTotal.toFixed(2)} kg`);
    this.setText('metricBatchWeight', `${res.weights.batchTotal.toFixed(2)} kg`);
    this.setText('metricFactoryCost', `₹${res.costs.factoryCost.toLocaleString('en-IN')}`);
    this.setText('metricUnitPrice', `₹${res.pricing.netUnitPrice.toLocaleString('en-IN')}`);
    this.setText('metricTotalSelling', `₹${res.pricing.totalSellingPrice.toLocaleString('en-IN')}`);
    this.setText('metricProfitMargin', `₹${(res.pricing.marginAmount * res.quantity).toLocaleString('en-IN')} (${res.pricing.marginPercent}%)`);

    // Testing details tag
    this.setText('testShellPressure', `${res.testingData.hydroShellBar} bar (${res.testingData.hydroShellPsi} psi)`);
    this.setText('testSeatPressure', `${res.testingData.hydroSeatBar} bar (${res.testingData.hydroSeatPsi} psi)`);

    // BOM Table
    const tbody = document.getElementById('bomTableBody');
    if (tbody) {
      tbody.innerHTML = res.bom.map(b => `
        <tr>
          <td class="text-center font-mono">${b.itemNo}</td>
          <td>
            <div class="fw-bold">${b.component}</div>
            <div class="text-muted small">${b.material}</div>
          </td>
          <td><span class="badge badge-metallurgy">${b.materialCode}</span></td>
          <td class="text-end font-mono">${b.weightKg.toFixed(2)} kg</td>
          <td class="text-end font-mono">${typeof b.unitRate === 'number' ? '₹' + b.unitRate.toLocaleString('en-IN') : b.unitRate}</td>
          <td class="text-end font-mono">₹${b.rawCost.toLocaleString('en-IN')}</td>
          <td class="text-end font-mono">₹${b.machiningCost.toLocaleString('en-IN')}</td>
          <td class="text-end font-mono fw-bold">₹${b.totalCost.toLocaleString('en-IN')}</td>
          <td class="text-end font-mono text-cyan">${b.costPct}%</td>
        </tr>
      `).join('');
    }

    // Weight & Cost Visual Breakdown Bar
    const weightBar = document.getElementById('weightBreakdownBar');
    if (weightBar) {
      weightBar.innerHTML = `
        <div class="prog-segment bg-primary" style="width: ${res.bom[0].weightPct}%;" title="Body: ${res.bom[0].weightPct}% (${res.weights.body} kg)"></div>
        <div class="prog-segment bg-info" style="width: ${res.bom[1].weightPct}%;" title="Flaps: ${res.bom[1].weightPct}% (${res.weights.flap} kg)"></div>
        <div class="prog-segment bg-warning" style="width: ${res.bom[2].weightPct + res.bom[3].weightPct}%;" title="Pins: ${res.weights.hingePin + res.weights.stopPin} kg"></div>
        <div class="prog-segment bg-success" style="width: ${Math.max(3, res.bom[4].weightPct + res.bom[6].weightPct)}%;" title="Spring & Hardware: ${res.weights.spring + res.weights.hardware} kg"></div>
      `;
    }

    // Visual Cost Split
    this.setText('splitMaterial', `₹${res.costs.directMaterialCost.toLocaleString('en-IN')} (${Math.round((res.costs.directMaterialCost/res.costs.factoryCost)*100)}%)`);
    this.setText('splitMachining', `₹${res.costs.directMachiningCost.toLocaleString('en-IN')} (${Math.round((res.costs.directMachiningCost/res.costs.factoryCost)*100)}%)`);
    this.setText('splitOverheads', `₹${(res.costs.testingCost + res.costs.paintingCost + res.costs.packingCost).toLocaleString('en-IN')}`);
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

window.EstimatorModule = EstimatorModule;
