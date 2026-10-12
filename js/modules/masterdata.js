/**
 * Evo OPS - Master Data & Rates Management Module
 * Live Pricing Matrix, Weight Database, and Operational Multipliers
 */

class MasterDataModule {
  constructor(store) {
    this.store = store;
  }

  init() {
    this.renderTables();
    this.bindEvents();
    this.store.subscribe('masterDataChanged', () => this.renderTables());
  }

  bindEvents() {
    // Reset to Defaults Button
    const resetBtn = document.getElementById('btnResetMasterData');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to restore all material rates and weights to factory defaults?')) {
          this.store.resetMasterDataToDefaults();
          if (window.showToast) {
            window.showToast('Master rates and engineering weights restored to defaults.', 'info');
          }
        }
      });
    }

    // Export JSON Button
    const exportBtn = document.getElementById('btnExportMasterJson');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.store.state.masterData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `evo_valves_master_data_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        if (window.showToast) {
          window.showToast('Master data exported as JSON.', 'success');
        }
      });
    }

    // Import JSON File Input
    const importInput = document.getElementById('inputImportMasterJson');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.materials && parsed.baseWeight150Wafer) {
              this.store.state.masterData = parsed;
              this.store.saveState();
              this.store.notify('masterDataChanged', null);
              this.store.notify('configChanged', this.store.state.activeConfig);
              if (window.showToast) {
                window.showToast('Master data imported and updated successfully!', 'success');
              }
            } else {
              alert('Invalid master data JSON file structure.');
            }
          } catch (err) {
            alert('Error parsing JSON file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // Render editable tables for Casting Rates, Pins, Springs, Seats, and Base Weights
  renderTables() {
    const master = this.store.state.masterData;

    // 1. Casting Materials Table (Body & Flap)
    const castingTbody = document.getElementById('castingRatesTableBody');
    if (castingTbody) {
      castingTbody.innerHTML = master.materials.castings.map(m => `
        <tr>
          <td><span class="badge badge-metallurgy">${m.code}</span></td>
          <td>
            <strong>${m.name}</strong>
            <div class="text-muted small">${m.description}</div>
          </td>
          <td><span class="badge badge-outline">${m.category}</span></td>
          <td class="text-center font-mono">${m.densityFactor}</td>
          <td class="text-center font-mono">${m.machiningFactor}x</td>
          <td class="text-end" style="width: 140px;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark text-muted">₹</span>
              <input type="number" class="form-control text-end font-mono rate-input" 
                value="${m.ratePerKg}" 
                data-cat="castings" 
                data-code="${m.code}" 
                min="10" step="5" />
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 2. Pin Materials Table (Hinge & Stop Pins)
    const pinTbody = document.getElementById('pinRatesTableBody');
    if (pinTbody) {
      pinTbody.innerHTML = master.materials.pins.map(p => `
        <tr>
          <td><span class="badge badge-secondary">${p.code}</span></td>
          <td><strong>${p.name}</strong></td>
          <td class="text-center font-mono">${p.machinability}x</td>
          <td class="text-end" style="width: 140px;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark text-muted">₹</span>
              <input type="number" class="form-control text-end font-mono rate-input" 
                value="${p.ratePerKg}" 
                data-cat="pins" 
                data-code="${p.code}" 
                min="10" step="5" />
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 3. Springs Table
    const springTbody = document.getElementById('springRatesTableBody');
    if (springTbody) {
      springTbody.innerHTML = master.materials.springs.map(s => `
        <tr>
          <td><span class="badge badge-info">${s.code}</span></td>
          <td><strong>${s.name}</strong></td>
          <td class="text-end" style="width: 140px;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark text-muted">₹/pc</span>
              <input type="number" class="form-control text-end font-mono rate-input" 
                value="${s.baseCostPerSpring}" 
                data-cat="springs" 
                data-code="${s.code}" 
                min="50" step="10" />
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 4. Seats Table
    const seatTbody = document.getElementById('seatRatesTableBody');
    if (seatTbody) {
      seatTbody.innerHTML = master.materials.seats.map(st => `
        <tr>
          <td><span class="badge badge-success">${st.code}</span></td>
          <td><strong>${st.name}</strong></td>
          <td><span class="badge badge-outline">${st.type}</span></td>
          <td class="text-end" style="width: 140px;">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-dark text-muted">₹</span>
              <input type="number" class="form-control text-end font-mono rate-input" 
                value="${st.baseCost}" 
                data-cat="seats" 
                data-code="${st.code}" 
                min="50" step="10" />
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 5. Base Weights Matrix Table (Size 2" to 24")
    const weightTbody = document.getElementById('baseWeightTableBody');
    if (weightTbody) {
      const sizes = Object.keys(master.baseWeight150Wafer);
      weightTbody.innerHTML = sizes.map(size => {
        const row = master.baseWeight150Wafer[size];
        return `
          <tr>
            <td class="font-mono fw-bold text-cyan">${size}</td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="body" value="${row.body}" step="0.1" />
            </td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="flap" value="${row.flap}" step="0.05" />
            </td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="hingePin" value="${row.hingePin}" step="0.01" />
            </td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="stopPin" value="${row.stopPin}" step="0.01" />
            </td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="spring" value="${row.spring}" step="0.01" />
            </td>
            <td class="text-end">
              <input type="number" class="form-control form-control-sm text-end font-mono weight-input" 
                data-size="${size}" data-comp="baseMachining" value="${row.baseMachining}" step="50" />
            </td>
          </tr>
        `;
      }).join('');
    }

    // Attach dynamic input listeners to all rate and weight inputs
    document.querySelectorAll('.rate-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const cat = e.target.getAttribute('data-cat');
        const code = e.target.getAttribute('data-code');
        const val = parseFloat(e.target.value) || 0;
        this.store.updateMaterialRate(cat, code, val);
        if (window.showToast) {
          window.showToast(`Updated ${code} rate to ₹${val}`, 'success');
        }
      });
    });

    document.querySelectorAll('.weight-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const size = e.target.getAttribute('data-size');
        const comp = e.target.getAttribute('data-comp');
        const val = parseFloat(e.target.value) || 0;
        this.store.updateBaseWeight(size, comp, val);
        if (window.showToast) {
          window.showToast(`Updated ${size} ${comp} to ${val}`, 'info');
        }
      });
    });
  }
}

window.MasterDataModule = MasterDataModule;
