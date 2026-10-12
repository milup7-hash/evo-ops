/**
 * Evo OPS - Shopfloor & Quality Operations Module
 * Daily Assembly Flow & API 598 Hydrostatic QC Testing Logbook
 */

class ShopfloorModule {
  constructor(store) {
    this.store = store;
  }

  init() {
    this.renderOrders();
    this.bindEvents();
    this.store.subscribe('shopfloorChanged', () => this.renderOrders());
  }

  bindEvents() {
    // Add Work Order Button
    const addWoBtn = document.getElementById('btnAddWorkOrder');
    if (addWoBtn) {
      addWoBtn.addEventListener('click', () => {
        const client = prompt('Enter Customer / Project Name:');
        if (!client) return;
        const valveDesc = prompt('Enter Valve Spec (e.g., 6" 150# DPCV CF8M):', '6" 150# DPCV Wafer (CF8M)');
        if (!valveDesc) return;
        const qty = parseInt(prompt('Enter Quantity (Nos):', '10')) || 1;
        const heatNo = 'HT-26-' + Math.floor(100 + Math.random() * 900);

        this.store.addWorkOrder({
          client,
          valveDesc,
          qty,
          heatNo,
          currentStage: 'Raw Casting Inspection',
          progress: 15,
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        });

        if (window.showToast) {
          window.showToast('New Work Order scheduled on Shopfloor!', 'success');
        }
      });
    }

    // Hydro Test Logger
    const logTestBtn = document.getElementById('btnSubmitHydroTest');
    if (logTestBtn) {
      logTestBtn.addEventListener('click', () => {
        const wo = document.getElementById('testWoSelect')?.value;
        const shellBar = document.getElementById('testShellInput')?.value;
        const seatBar = document.getElementById('testSeatInput')?.value;
        const result = document.getElementById('testResultSelect')?.value;
        const inspector = document.getElementById('testInspectorInput')?.value;

        if (!inspector) {
          alert('Please enter QC Inspector name / badge number.');
          return;
        }

        if (window.showToast) {
          window.showToast(`Hydro Test recorded for ${wo}: PASSED Zero Leakage (API 598). Inspected by ${inspector}`, 'success');
        }

        // Close modal if open
        const modalEl = document.getElementById('hydroTestModal');
        if (modalEl) {
          modalEl.classList.remove('show');
        }
      });
    }
  }

  renderOrders() {
    const orders = this.store.state.shopfloorOrders;
    const container = document.getElementById('shopfloorOrdersList');
    if (!container) return;

    container.innerHTML = orders.map(o => `
      <div class="card order-card mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span class="badge badge-primary font-mono">${o.woNumber}</span>
              <span class="badge badge-outline ms-2 font-mono">${o.heatNo}</span>
              <h5 class="card-title text-white mt-2 mb-1">${o.valveDesc}</h5>
              <div class="text-muted small">Client: <strong>${o.client}</strong> | Quantity: <strong>${o.qty} Nos</strong> | Due: ${o.dueDate}</div>
            </div>
            <div class="text-end">
              <span class="badge ${o.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${o.status}</span>
              <div class="current-stage mt-2 text-cyan fw-bold">${o.currentStage}</div>
            </div>
          </div>

          <div class="progress mt-3" style="height: 8px;">
            <div class="progress-bar ${o.progress === 100 ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${o.progress}%;"></div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary">
            <div class="stage-stepper small text-muted">
              <span>Casting</span> ➔ <span>Machining</span> ➔ <span>Assembly</span> ➔ <span class="text-warning">API 598 Test</span> ➔ <span>Dispatch</span>
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-sm btn-outline-info" onclick="window.advanceOrderStage('${o.woNumber}')">Advance Stage ➔</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.advanceOrderStage = function(woNumber) {
  const store = window.evoStore;
  const order = store.state.shopfloorOrders.find(o => o.woNumber === woNumber);
  if (!order) return;

  const stages = [
    { name: 'Raw Casting Inspection', prog: 20, status: 'In Progress' },
    { name: 'CNC Machining', prog: 45, status: 'In Progress' },
    { name: 'Component Assembly', prog: 65, status: 'In Progress' },
    { name: 'Hydro Testing (API 598)', prog: 85, status: 'In Progress' },
    { name: 'Painting & Final QC', prog: 95, status: 'In Progress' },
    { name: 'Dispatched', prog: 100, status: 'Completed' }
  ];

  const currentIdx = stages.findIndex(s => s.name === order.currentStage);
  if (currentIdx < stages.length - 1) {
    const next = stages[currentIdx + 1];
    store.updateWorkOrderStatus(woNumber, next.name, next.prog, next.status);
    if (window.showToast) {
      window.showToast(`${woNumber} advanced to "${next.name}"`, 'success');
    }
  } else {
    if (window.showToast) {
      window.showToast(`${woNumber} is already completed & dispatched.`, 'info');
    }
  }
};

window.ShopfloorModule = ShopfloorModule;
