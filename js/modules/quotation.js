/**
 * Evo OPS - Quotation Studio Module
 * Multi-item Quotation Builder, Commercials, and Print-Ready A4 Document
 */

class QuotationModule {
  constructor(store) {
    this.store = store;
  }

  init() {
    this.bindEvents();
    this.renderQuotation();
    this.store.subscribe('quotationChanged', () => this.renderQuotation());
  }

  bindEvents() {
    const bindInput = (id, field) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.store.updateQuoteHeader({ [field]: e.target.value });
        });
      }
    };

    bindInput('qCustomerName', 'customerName');
    bindInput('qInquiryRef', 'inquiryRef');
    bindInput('qProjectName', 'projectName');
    bindInput('qQuoteNo', 'quoteNo');
    bindInput('qRevision', 'revision');
    bindInput('qDate', 'date');
    bindInput('qValidityDays', 'validityDays');
    bindInput('qDeliveryWeeks', 'deliveryWeeks');
    bindInput('qPaymentTerms', 'paymentTerms');
    bindInput('qPriceBasis', 'priceBasis');
    bindInput('qWarranty', 'warrantyMonths');

    // Print Button
    const printBtn = document.getElementById('btnPrintQuote');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Archive / Save Button
    const saveBtn = document.getElementById('btnSaveQuote');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const saved = this.store.archiveCurrentQuote();
        if (saved) {
          if (window.showToast) {
            window.showToast(`Quotation ${saved.quoteNo} saved to Archive!`, 'success');
          }
        } else {
          if (window.showToast) {
            window.showToast('Please add at least one valve item before saving.', 'warning');
          }
        }
      });
    }

    // New Quote Button
    const newBtn = document.getElementById('btnNewQuote');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        if (confirm('Create a new blank quotation? Current unsaved changes will reset.')) {
          this.store.createNewQuote();
          if (window.showToast) {
            window.showToast('New Quotation initialized.', 'info');
          }
        }
      });
    }
  }

  // Render Quotation in UI and printable sheet
  renderQuotation() {
    const quote = this.store.state.currentQuote;
    const company = this.store.state.masterData.company;

    // Populate header inputs
    this.setVal('qCustomerName', quote.customerName);
    this.setVal('qInquiryRef', quote.inquiryRef);
    this.setVal('qProjectName', quote.projectName);
    this.setVal('qQuoteNo', quote.quoteNo);
    this.setVal('qRevision', quote.revision);
    this.setVal('qDate', quote.date);
    this.setVal('qValidityDays', quote.validityDays);
    this.setVal('qDeliveryWeeks', quote.deliveryWeeks);
    this.setVal('qPaymentTerms', quote.paymentTerms);
    this.setVal('qPriceBasis', quote.priceBasis);
    this.setVal('qWarranty', quote.warrantyMonths);

    // Calculate totals
    const totalQty = quote.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalWeight = Math.round(quote.items.reduce((sum, it) => sum + (it.weights.batchTotal || (it.weights.unitTotal * it.quantity)), 0) * 100) / 100;
    const subtotal = quote.items.reduce((sum, it) => sum + it.pricing.totalSellingPrice, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gstAmount;

    // Badges & Counters
    this.setText('quoteItemsCount', quote.items.length);
    this.setText('quoteTotalValSummary', `₹${grandTotal.toLocaleString('en-IN')}`);

    // Render Editable Table in the Studio
    const tbody = document.getElementById('quoteItemsTableBody');
    if (tbody) {
      if (quote.items.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center py-5 text-muted">
              <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-2 text-muted"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <div class="fw-bold">No valve items added to this quotation yet</div>
                <div class="small">Go to the <strong>⚡ Dynamic Estimator</strong> tab to configure DPCV models and click "Add to Quotation".</div>
              </div>
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = quote.items.map((it) => `
          <tr>
            <td class="text-center font-mono">${it.itemNo}</td>
            <td>
              <div class="fw-bold text-white">${it.size} Class ${it.pressureClass} Dual Plate Check Valve</div>
              <div class="text-muted small">${it.endConnection} | Body: <span class="text-cyan">${it.config.materials.body}</span> | Disc: <span class="text-cyan">${it.config.materials.flap}</span> | Pin: ${it.config.materials.hingePin} | Spring: ${it.config.materials.spring}</div>
            </td>
            <td><span class="badge badge-outline">${it.config.materials.body} / ${it.config.materials.flap}</span></td>
            <td class="text-center font-mono">${it.quantity} Nos</td>
            <td class="text-end font-mono">${it.weights.unitTotal.toFixed(2)} kg</td>
            <td class="text-end font-mono">${it.weights.batchTotal.toFixed(2)} kg</td>
            <td class="text-end font-mono">₹${it.pricing.netUnitPrice.toLocaleString('en-IN')}</td>
            <td class="text-end font-mono fw-bold text-success">₹${it.pricing.totalSellingPrice.toLocaleString('en-IN')}</td>
            <td class="text-center">
              <button type="button" class="btn-icon text-danger" title="Remove Item" onclick="window.evoStore.removeItemFromQuotation('${it.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Totals in UI
    this.setText('qSubtotalDisplay', `₹${subtotal.toLocaleString('en-IN')}`);
    this.setText('qGstDisplay', `₹${gstAmount.toLocaleString('en-IN')}`);
    this.setText('qGrandTotalDisplay', `₹${grandTotal.toLocaleString('en-IN')}`);
    this.setText('qTotalWeightDisplay', `${totalWeight.toFixed(2)} kg`);

    // Render Print Template (for A4 Print Layout)
    this.renderPrintDocument(quote, company, subtotal, gstAmount, grandTotal, totalWeight, totalQty);
  }

  // Generate Official A4 Corporate Quotation Document
  renderPrintDocument(quote, company, subtotal, gstAmount, grandTotal, totalWeight, totalQty) {
    const printDoc = document.getElementById('printableQuotationDoc');
    if (!printDoc) return;

    printDoc.innerHTML = `
      <div class="print-page">
        <!-- Letterhead Header -->
        <div class="print-header">
          <div class="d-flex justify-content-between align-items-center">
            <div class="print-brand d-flex align-items-center gap-3">
              <img src="assets/images/evo_valves_logo.jpg" alt="Evo Valves" class="print-logo" />
              <div>
                <h1 class="print-title">${company.brand}</h1>
                <div class="print-subtitle">${company.tagline}</div>
                <div class="print-meta small">${company.address}</div>
                <div class="print-meta small">Phone: ${company.phone} | Email: ${company.email}</div>
                <div class="print-meta small"><strong>GSTIN:</strong> ${company.gstin}</div>
              </div>
            </div>
            <div class="print-quote-badge text-end">
              <div class="print-doc-type">COMMERCIAL QUOTATION</div>
              <div class="print-quote-no font-mono">${quote.quoteNo}</div>
              <div class="print-quote-rev">${quote.revision} | Date: ${quote.date}</div>
            </div>
          </div>
        </div>

        <hr class="print-divider" />

        <!-- Customer & Project Details -->
        <div class="print-client-grid">
          <div class="print-col">
            <div class="print-label">CUSTOMER NAME & ADDRESS:</div>
            <div class="print-val fw-bold">${quote.customerName || 'M/s. [Valued Customer]'}</div>
            <div class="print-sub-info">Attn: Procurement & Technical Operations Team</div>
          </div>
          <div class="print-col">
            <div class="print-label">INQUIRY REFERENCE:</div>
            <div class="print-val font-mono">${quote.inquiryRef || 'As per Email Discussion'}</div>
            <div class="print-label mt-1">PROJECT NAME:</div>
            <div class="print-val">${quote.projectName || 'Industrial Piping & Valve Supply'}</div>
          </div>
          <div class="print-col text-end">
            <div class="print-label">PRICE BASIS:</div>
            <div class="print-val">${quote.priceBasis}</div>
            <div class="print-label mt-1">OFFER VALIDITY:</div>
            <div class="print-val">${quote.validityDays} Days from date of offer</div>
          </div>
        </div>

        <!-- Scope of Supply Table -->
        <div class="print-table-container">
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 5%;">Item</th>
                <th style="width: 42%;">Description & Metallurgy Specification</th>
                <th style="width: 13%;">Inspection Standards</th>
                <th style="width: 8%;" class="text-center">Qty</th>
                <th style="width: 10%;" class="text-end">Unit Wt (kg)</th>
                <th style="width: 11%;" class="text-end">Unit Rate (₹)</th>
                <th style="width: 11%;" class="text-end">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-4">No valve items added</td>
                </tr>
              ` : quote.items.map(it => `
                <tr>
                  <td class="text-center font-mono">${it.itemNo}</td>
                  <td>
                    <strong>${it.size} Class ${it.pressureClass} Dual Plate Check Valve</strong><br/>
                    <small>
                      <strong>Design:</strong> API 594 (${it.endConnection})<br/>
                      <strong>Body:</strong> ${it.config.materials.body} | <strong>Plate (Flap):</strong> ${it.config.materials.flap}<br/>
                      <strong>Hinge/Stop Pin:</strong> ${it.config.materials.hingePin} | <strong>Spring:</strong> ${it.config.materials.spring}<br/>
                      <strong>Seat:</strong> ${it.config.materials.seat}
                    </small>
                  </td>
                  <td class="small">
                    Design: API 594<br/>
                    Testing: API 598<br/>
                    Face: API 594<br/>
                    Shell: ${it.testingData.hydroShellBar} bar
                  </td>
                  <td class="text-center font-mono fw-bold">${it.quantity} Nos</td>
                  <td class="text-end font-mono">${it.weights.unitTotal.toFixed(2)}</td>
                  <td class="text-end font-mono">₹${it.pricing.netUnitPrice.toLocaleString('en-IN')}</td>
                  <td class="text-end font-mono fw-bold">₹${it.pricing.totalSellingPrice.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="3" class="text-end">Total Lot Quantities & Estimated Weight:</th>
                <th class="text-center font-mono">${totalQty} Nos</th>
                <th class="text-end font-mono">${totalWeight.toFixed(2)} kg</th>
                <th class="text-end">SUBTOTAL:</th>
                <th class="text-end font-mono">₹${subtotal.toLocaleString('en-IN')}</th>
              </tr>
              <tr>
                <th colspan="6" class="text-end">GST @ 18% (SGST 9% + CGST 9% or IGST 18%):</th>
                <th class="text-end font-mono">₹${gstAmount.toLocaleString('en-IN')}</th>
              </tr>
              <tr class="print-grand-total">
                <th colspan="6" class="text-end">TOTAL EX-WORKS COMMERCIAL OFFER (INR):</th>
                <th class="text-end font-mono fw-bold print-price">₹${grandTotal.toLocaleString('en-IN')}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Technical Testing Parameters per API 598 -->
        <div class="print-technical-notes mt-2">
          <div class="print-section-title">QUALITY TESTING & CERTIFICATION PROTOCOL (API 598 / ISO 10497)</div>
          <p class="small text-muted mb-1">
            Every Dual Plate Check Valve is 100% factory tested in accordance with <strong>API 598 / BS EN 12266-1</strong>. Standard testing covers Hydrostatic Shell Test, Hydrostatic Seat Test, and Low Pressure Air Seat Test. Valves are supplied with EN 10204 Type 3.1 Material Test Certificates (MTC) with full chemical, mechanical, and PMI heat traceability.
          </p>
        </div>

        <!-- Commercial Terms & Conditions -->
        <div class="print-terms-grid mt-2">
          <div class="print-term-item"><strong>1. Delivery Period:</strong> ${quote.deliveryWeeks} from receipt of technically & commercially clear Purchase Order.</div>
          <div class="print-term-item"><strong>2. Payment Terms:</strong> ${quote.paymentTerms}</div>
          <div class="print-term-item"><strong>3. Warranty:</strong> ${quote.warrantyMonths}</div>
          <div class="print-term-item"><strong>4. Documentation:</strong> MTC 3.1, Hydro Test Certificate, General Arrangement (GA) Drawing, and O&M Manual.</div>
          <div class="print-term-item"><strong>5. Third Party Inspection:</strong> TPI by Bureau Veritas / DNV / TUV / Lloyds can be arranged at nominal client cost.</div>
        </div>

        <!-- Authorized Signature Footer -->
        <div class="print-sign-grid mt-4">
          <div class="print-sign-col">
            <div class="print-sign-line">Prepared By</div>
            <div class="print-sign-name">Sales & Estimation Engineer</div>
            <div class="small text-muted">Evo Valves Pvt. Ltd.</div>
          </div>
          <div class="print-sign-col text-end">
            <div class="print-sign-line">Authorized Signatory</div>
            <div class="print-sign-name">Head of Commercial & Technical Operations</div>
            <div class="small text-muted">Evo Valves Pvt. Ltd.</div>
          </div>
        </div>
      </div>
    `;
  }

  setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val !== undefined ? val : '';
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

window.QuotationModule = QuotationModule;
