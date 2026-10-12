/**
 * Evo OPS - Central Reactive State Store
 * Manages Master Data, Quotation Items, Settings, and Operations Log
 */

class EvoStore {
  constructor() {
    this.storageKey = 'evo_ops_data_v1';
    this.subscribers = new Map();
    this.state = this.loadState();
  }

  // Load state from localStorage or initialize with EVO_DATA defaults
  loadState() {
    try {
      const globalData = (typeof window !== 'undefined' && window.EVO_DATA) ? window.EVO_DATA : (typeof EVO_DATA !== 'undefined' ? EVO_DATA : {});
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with system defaults if keys are missing
        return {
          ...this.getDefaultState(),
          ...parsed,
          masterData: {
            ...globalData,
            ...(parsed.masterData || {})
          }
        };
      }
    } catch (e) {
      console.warn('Failed to load saved state, falling back to defaults', e);
    }
    return this.getDefaultState();
  }

  // Default state initialization
  getDefaultState() {
    return {
      currentView: 'estimator', // 'estimator' | 'quotations' | 'masterdata' | 'shopfloor' | 'technical' | 'archive'
      activeConfig: {
        size: '6"',
        pressureClass: '150#',
        endConnection: 'wafer',
        quantity: 10,
        materials: {
          body: 'WCB',
          flap: 'CF8M',
          hingePin: 'SS316',
          stopPin: 'SS316',
          spring: 'INCONEL_X750',
          seat: 'EPDM'
        },
        testingStandard: 'API 598',
        faceToFaceStandard: 'API 594',
        marginPercent: 22,
        discountPercent: 0
      },
      currentQuote: {
        quoteNo: 'EVO-Q-2026-0108',
        revision: 'Rev 0',
        date: new Date().toISOString().split('T')[0],
        validityDays: 30,
        customerName: 'Reliance Industries Limited (Jamnagar)',
        inquiryRef: 'RIL/PROC/VLV/2026/089',
        projectName: 'Offshore Seawater Cooling Expansion',
        currency: 'INR',
        currencySymbol: '₹',
        deliveryWeeks: '4-6 Weeks',
        paymentTerms: '30% Advance, 70% against PI before dispatch',
        priceBasis: 'Ex-Works, Ahmedabad Factory',
        warrantyMonths: '18 months from supply / 12 months from commissioning',
        items: []
      },
      savedQuotes: [
        {
          id: 'quote-sample-1',
          quoteNo: 'EVO-Q-2026-0094',
          revision: 'Rev 1',
          customerName: 'Larsen & Toubro Ltd. (Hydrocarbon)',
          projectName: 'ONGC Mehsana Asset Upgrade',
          date: '2026-09-24',
          totalAmount: 1845200,
          totalQty: 48,
          status: 'Issued',
          itemsCount: 4
        },
        {
          id: 'quote-sample-2',
          quoteNo: 'EVO-Q-2026-0102',
          revision: 'Rev 0',
          customerName: 'Adani Ports and SEZ Ltd.',
          projectName: 'Mundra Seawater Desalination Plant',
          date: '2026-09-29',
          totalAmount: 3420000,
          totalQty: 24,
          status: 'Negotiation',
          itemsCount: 3
        }
      ],
      shopfloorOrders: [
        {
          woNumber: 'WO-2026-501',
          valveDesc: '6" 150# DPCV Wafer (WCB / CF8M)',
          qty: 12,
          client: 'Reliance Industries',
          heatNo: 'HT-26-WCB-849',
          currentStage: 'Hydro Testing (API 598)',
          progress: 80,
          dueDate: '2026-10-10',
          status: 'In Progress'
        },
        {
          woNumber: 'WO-2026-502',
          valveDesc: '8" 300# DPCV Lugged (Full 4A Duplex)',
          qty: 6,
          client: 'Adani Ports Mundra',
          heatNo: 'HT-26-4A-122',
          currentStage: 'CNC Machining',
          progress: 45,
          dueDate: '2026-10-18',
          status: 'In Progress'
        },
        {
          woNumber: 'WO-2026-503',
          valveDesc: '12" 150# DPCV Flanged (5A Super Duplex)',
          qty: 4,
          client: 'L&T Hydrocarbon',
          heatNo: 'HT-26-5A-031',
          currentStage: 'Raw Casting Inspection',
          progress: 20,
          dueDate: '2026-10-25',
          status: 'Pending Raw Material'
        },
        {
          woNumber: 'WO-2026-499',
          valveDesc: '4" 150# DPCV Wafer (Full CF8M)',
          qty: 20,
          client: 'Gujarat Fluorochemicals',
          heatNo: 'HT-26-CF8M-902',
          currentStage: 'Dispatched',
          progress: 100,
          dueDate: '2026-09-30',
          status: 'Completed'
        }
      ],
      masterData: JSON.parse(JSON.stringify((typeof window !== 'undefined' && window.EVO_DATA) ? window.EVO_DATA : (typeof EVO_DATA !== 'undefined' ? EVO_DATA : {})))
    };
  }

  // Save current state to localStorage
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  // Subscribe to changes on specific slices of state
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
    return () => {
      const list = this.subscribers.get(event) || [];
      this.subscribers.set(event, list.filter(cb => cb !== callback));
    };
  }

  // Notify subscribers
  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(cb => cb(data, this.state));
    }
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => cb({ event, data }, this.state));
    }
  }

  // Update Master Rate for a material
  updateMaterialRate(category, code, newRate) {
    const list = this.state.masterData.materials[category];
    if (list) {
      const item = list.find(m => m.code === code);
      if (item) {
        if ('ratePerKg' in item) {
          item.ratePerKg = parseFloat(newRate) || 0;
        } else if ('baseCost' in item) {
          item.baseCost = parseFloat(newRate) || 0;
        } else if ('baseCostPerSpring' in item) {
          item.baseCostPerSpring = parseFloat(newRate) || 0;
        }
        this.saveState();
        this.notify('masterDataChanged', { category, code, newRate });
        this.notify('configChanged', this.state.activeConfig);
      }
    }
  }

  // Update Base Weight for a size
  updateBaseWeight(size, component, newWeight) {
    if (this.state.masterData.baseWeight150Wafer[size]) {
      this.state.masterData.baseWeight150Wafer[size][component] = parseFloat(newWeight) || 0;
      this.saveState();
      this.notify('masterDataChanged', { size, component, newWeight });
      this.notify('configChanged', this.state.activeConfig);
    }
  }

  // Reset Master Data to Factory Defaults
  resetMasterDataToDefaults() {
    this.state.masterData = JSON.parse(JSON.stringify(EVO_DATA));
    this.saveState();
    this.notify('masterDataChanged', null);
    this.notify('configChanged', this.state.activeConfig);
  }

  // Set Active View
  setView(viewName) {
    this.state.currentView = viewName;
    this.saveState();
    this.notify('viewChanged', viewName);
  }

  // Update Active Valve Configuration
  updateConfig(updates) {
    this.state.activeConfig = {
      ...this.state.activeConfig,
      ...updates
    };
    this.saveState();
    this.notify('configChanged', this.state.activeConfig);
  }

  // Update Material inside Config
  updateConfigMaterial(componentKey, materialCode) {
    this.state.activeConfig.materials[componentKey] = materialCode;
    this.saveState();
    this.notify('configChanged', this.state.activeConfig);
  }

  // Apply a Preset Trim
  applyPreset(presetIndex) {
    const preset = this.state.masterData.presets[presetIndex];
    if (preset) {
      this.state.activeConfig.materials = {
        body: preset.bodyMat,
        flap: preset.flapMat,
        hingePin: preset.hingePinMat,
        stopPin: preset.stopPinMat,
        spring: preset.springMat,
        seat: preset.seatMat
      };
      this.saveState();
      this.notify('configChanged', this.state.activeConfig);
      this.notify('presetApplied', preset);
    }
  }

  // Add Current Valve Configuration as Line Item to Quotation
  addItemToQuotation(calculatedItem) {
    const item = {
      id: 'item_' + Date.now(),
      itemNo: this.state.currentQuote.items.length + 1,
      ...calculatedItem
    };
    this.state.currentQuote.items.push(item);
    this.saveState();
    this.notify('quotationChanged', this.state.currentQuote);
    return item;
  }

  // Remove Item from Quotation
  removeItemFromQuotation(itemId) {
    this.state.currentQuote.items = this.state.currentQuote.items.filter(it => it.id !== itemId);
    // Re-index
    this.state.currentQuote.items.forEach((it, idx) => it.itemNo = idx + 1);
    this.saveState();
    this.notify('quotationChanged', this.state.currentQuote);
  }

  // Update Quotation Header Details
  updateQuoteHeader(updates) {
    this.state.currentQuote = {
      ...this.state.currentQuote,
      ...updates
    };
    this.saveState();
    this.notify('quotationChanged', this.state.currentQuote);
  }

  // Save Current Quote to Saved Quotes Archive
  archiveCurrentQuote() {
    const current = this.state.currentQuote;
    if (current.items.length === 0) return null;

    const totalAmount = current.items.reduce((sum, it) => sum + it.pricing.totalSellingPrice, 0);
    const totalQty = current.items.reduce((sum, it) => sum + it.quantity, 0);

    const record = {
      id: 'quote_' + Date.now(),
      quoteNo: current.quoteNo,
      revision: current.revision,
      customerName: current.customerName,
      projectName: current.projectName,
      date: current.date,
      totalAmount,
      totalQty,
      status: 'Active',
      itemsCount: current.items.length,
      snapshot: JSON.parse(JSON.stringify(current))
    };

    this.state.savedQuotes.unshift(record);
    this.saveState();
    this.notify('archiveChanged', this.state.savedQuotes);
    return record;
  }

  // Load a Saved Quote
  loadSavedQuote(quoteId) {
    const found = this.state.savedQuotes.find(q => q.id === quoteId);
    if (found && found.snapshot) {
      this.state.currentQuote = JSON.parse(JSON.stringify(found.snapshot));
      this.saveState();
      this.notify('quotationChanged', this.state.currentQuote);
      this.setView('quotations');
    }
  }

  // Create New Clean Quote
  createNewQuote() {
    const nextSeq = this.state.savedQuotes.length + 109;
    this.state.currentQuote = {
      quoteNo: `EVO-Q-2026-0${nextSeq}`,
      revision: 'Rev 0',
      date: new Date().toISOString().split('T')[0],
      validityDays: 30,
      customerName: '',
      inquiryRef: '',
      projectName: '',
      currency: 'INR',
      currencySymbol: '₹',
      deliveryWeeks: '4-6 Weeks',
      paymentTerms: '30% Advance, 70% against PI before dispatch',
      priceBasis: 'Ex-Works, Ahmedabad Factory',
      warrantyMonths: '18 months from supply / 12 months from commissioning',
      items: []
    };
    this.saveState();
    this.notify('quotationChanged', this.state.currentQuote);
  }

  // Add Shopfloor Work Order
  addWorkOrder(order) {
    const newOrder = {
      woNumber: `WO-2026-${500 + this.state.shopfloorOrders.length + 1}`,
      progress: 10,
      status: 'In Progress',
      ...order
    };
    this.state.shopfloorOrders.unshift(newOrder);
    this.saveState();
    this.notify('shopfloorChanged', this.state.shopfloorOrders);
    return newOrder;
  }

  // Update Work Order Stage
  updateWorkOrderStatus(woNumber, newStage, newProgress, status) {
    const order = this.state.shopfloorOrders.find(o => o.woNumber === woNumber);
    if (order) {
      order.currentStage = newStage;
      order.progress = newProgress;
      if (status) order.status = status;
      this.saveState();
      this.notify('shopfloorChanged', this.state.shopfloorOrders);
    }
  }
}

// Global Store Instance
window.evoStore = new EvoStore();
