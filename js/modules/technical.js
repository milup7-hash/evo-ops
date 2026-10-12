/**
 * Evo OPS - Technical & 3D Cutaway Module
 * Interactive Engineering Exploded View & API 594 Standards Compliance
 */

class TechnicalModule {
  constructor(store) {
    this.store = store;
  }

  init() {
    this.renderTechnicalSpecs();
    this.bindHotspots();
  }

  bindHotspots() {
    const detailsBox = document.getElementById('componentDetailBox');
    if (!detailsBox) return;

    const componentsInfo = {
      body: {
        title: "1. Valve Cast Body (વાલ્વ બોડી)",
        standard: "API 594 / ASME B16.34",
        desc: "Heavy-duty cylindrical casting with integral central rib and hinge/stop pin carrier bosses. Available in Wafer, Lugged, or Flanged ends in ASTM A216 WCB, CF8, CF8M, 4A Duplex, and 5A Super Duplex.",
        function: "Pressure containment vessel designed to withstand line surges, water hammer, and external pipe bending moments."
      },
      flap: {
        title: "2. Dual Semi-Circular Flaps / Discs (પ્લેટ / ફ્લેપ)",
        standard: "API 594 Design Standard",
        desc: "Twin D-shaped plates hinged along the central vertical axis. Manufactured in precision cast CF8M, 4A, or 5A with polished sealing faces.",
        function: "Twin plates open rapidly under forward differential pressure and close synchronously against reverse flow to prevent water hammer."
      },
      hingePin: {
        title: "3. Central Hinge Pin (હિંજ પિન)",
        standard: "ASTM A276 / ASTM A564 / UNS S31803",
        desc: "Precision center shaft supporting the dual flaps. Machined in AISI 316, 17-4PH, or Duplex F51 to eliminate galling and friction.",
        function: "Main pivot axis for the dual plates with low-friction PTFE or alloy sleeve bearings."
      },
      stopPin: {
        title: "4. Stop Pin (સ્ટોપ પિન)",
        standard: "API 594 Retainerless / Plugged",
        desc: "Parallel shaft positioned directly behind the hinge pin to limit maximum flap opening angle to 80°-85°.",
        function: "Prevents disc flutter, prevents disc-to-disc collision, and ensures immediate spring response on flow reversal."
      },
      spring: {
        title: "5. Torsion Spring (ઇન્કોનેલ સ્પ્રિંગ)",
        standard: "Inconel X-750 (NACE MR0175) / SS 316",
        desc: "Dual leg torsion spring coiled around the hinge pin with legs exerting positive closing torque against each flap.",
        function: "Forces the plates to close instantaneously before flow deceleration, completely eliminating hydraulic slam and pressure shocks."
      },
      seat: {
        title: "6. Resilient & Metal Seating (વાલ્વ સીટ)",
        standard: "API 598 Zero Leakage (Rate A)",
        desc: "Precision dovetail groove in body holding EPDM, Viton, NBR, or welded Stellite Gr. 6 overlay for high-temperature services.",
        function: "Ensures bubble-tight bi-directional sealing even at low back pressures down to 0.5 bar."
      }
    };

    document.querySelectorAll('.hotspot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-comp-key');
        const info = componentsInfo[key];
        if (info) {
          document.querySelectorAll('.hotspot-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          detailsBox.innerHTML = `
            <div class="p-3 bg-card-highlight rounded border border-cyan">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="text-cyan mb-0">${info.title}</h5>
                <span class="badge badge-primary font-mono">${info.standard}</span>
              </div>
              <p class="small text-white mb-2"><strong>Specification:</strong> ${info.desc}</p>
              <p class="small text-muted mb-0"><strong>Engineering Function:</strong> ${info.function}</p>
            </div>
          `;
        }
      });
    });
  }

  renderTechnicalSpecs() {
    // Technical table rendering
    const specTable = document.getElementById('standardsComplianceTable');
    if (!specTable) return;

    specTable.innerHTML = `
      <tr><td>Design & Manufacture</td><td><strong>API 594 / ASME B16.34</strong></td><td>Full compliance for Wafer & Lugged patterns</td></tr>
      <tr><td>Pressure Testing & Inspection</td><td><strong>API 598 / ISO 5208</strong></td><td>100% Shell, Seat, and Air Test</td></tr>
      <tr><td>Face-to-Face Dimensions</td><td><strong>API 594 / ASME B16.10</strong></td><td>Compact short pattern wafer installation</td></tr>
      <tr><td>Flange Compatibility</td><td><strong>ASME B16.5 / B16.47 Series A</strong></td><td>Suits RF, RTJ, Flat Face flanges</td></tr>
      <tr><td>Sour Gas Compatibility</td><td><strong>NACE MR0175 / ISO 15156</strong></td><td>Available for Inconel X750 springs & Duplex trims</td></tr>
      <tr><td>Material Test Certification</td><td><strong>EN 10204 Type 3.1</strong></td><td>Full heat traceability & chemical/mechanical reports</td></tr>
    `;
  }
}

window.TechnicalModule = TechnicalModule;
