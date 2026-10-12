/**
 * Evo OPS - Main Application Orchestrator (UI/UX Pro Max Standard)
 * Bootstraps modules, manages navigation, theme toggling, and accessible toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle (Dark Slate vs High-Contrast Engineering Light)
  const themeToggleBtn = document.getElementById('btnThemeToggle');
  if (themeToggleBtn) {
    const savedTheme = localStorage.getItem('evo_ops_theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('evo_ops_theme', nextTheme);
      if (window.showToast) {
        window.showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Slate' : 'High-Contrast Light'} Theme`, 'info');
      }
    });
  }

  // Accessible Toast Helper with SVG Vector Icons (No emoji per UI/UX Pro Max)
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-fade-in`;
    toast.setAttribute('role', 'status');
    
    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else if (type === 'danger') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    }

    toast.innerHTML = `
      <div class="toast-content d-flex align-items-center gap-2" style="display: flex; align-items: center; gap: 0.6rem;">
        <span class="toast-icon" style="display: flex; align-items: center;">${iconSvg}</span>
        <span class="toast-message">${message}</span>
      </div>
      <button class="toast-close" aria-label="Close notification" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  };

  // Clock in IST
  const updateClock = () => {
    const el = document.getElementById('liveClock');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    }
  };
  setInterval(updateClock, 1000);
  updateClock();

  // Instantiate Modules
  const store = window.evoStore;
  const calculator = window.evoCalculator;

  const estimatorMod = new EstimatorModule(store, calculator);
  const quotationMod = new QuotationModule(store);
  const masterDataMod = new MasterDataModule(store);
  const shopfloorMod = new ShopfloorModule(store);
  const technicalMod = new TechnicalModule(store);

  estimatorMod.init();
  quotationMod.init();
  masterDataMod.init();
  shopfloorMod.init();
  technicalMod.init();

  // Navigation / View Switching
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  const switchView = (targetView) => {
    navTabs.forEach(btn => {
      const isTarget = btn.getAttribute('data-view') === targetView;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    viewPanels.forEach(panel => {
      const isTarget = panel.getAttribute('id') === `view-${targetView}`;
      panel.classList.toggle('d-none', !isTarget);
    });

    store.setView(targetView);
  };

  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-view');
      switchView(target);
    });
  });

  // Listen to store view changes
  store.subscribe('viewChanged', (newView) => {
    switchView(newView);
  });

  // Archive Quotes List Rendering
  const renderArchive = () => {
    const tbody = document.getElementById('archiveQuotesTableBody');
    if (!tbody) return;

    const list = store.state.savedQuotes;
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No archived quotations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(q => `
      <tr>
        <td class="font-mono fw-bold text-white">${q.quoteNo}</td>
        <td><span class="badge badge-outline">${q.revision}</span></td>
        <td>
          <div class="fw-bold text-white">${q.customerName}</div>
          <div class="small text-muted">${q.projectName || '-'}</div>
        </td>
        <td class="font-mono">${q.date}</td>
        <td class="text-center font-mono">${q.totalQty} Nos</td>
        <td class="text-end font-mono fw-bold text-success">₹${q.totalAmount.toLocaleString('en-IN')}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-cyan" onclick="window.evoStore.loadSavedQuote('${q.id}')">Load & Edit</button>
        </td>
      </tr>
    `).join('');
  };

  renderArchive();
  store.subscribe('archiveChanged', renderArchive);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      const current = store.state.currentView;
      if (current === 'quotations') {
        // Let print happen
      } else {
        e.preventDefault();
        switchView('quotations');
        setTimeout(() => window.print(), 300);
      }
    }
  });

  console.log('%c Evo OPS Enterprise Platform Initialized (UI/UX Pro Max Standard) ', 'background: #00d2ff; color: #0a0e17; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
});
