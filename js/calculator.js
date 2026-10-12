/**
 * Evo OPS - DPCV Engineering & Cost Estimation Calculator
 * Precision Bill of Materials (BOM) & Dynamic Pricing Engine
 */

class EvoCalculator {
  constructor(store) {
    this.store = store;
  }

  // Master calculation method for an active valve configuration
  calculateValve(config = null) {
    const activeConfig = config || this.store.state.activeConfig;
    const master = this.store.state.masterData;

    const size = activeConfig.size || '6"';
    const pClass = activeConfig.pressureClass || '150#';
    const endConn = activeConfig.endConnection || 'wafer';
    const qty = parseInt(activeConfig.quantity) || 1;
    const margin = parseFloat(activeConfig.marginPercent) || 22;
    const discount = parseFloat(activeConfig.discountPercent) || 0;

    // Lookups
    const baseW = master.baseWeight150Wafer[size] || master.baseWeight150Wafer['6"'];
    const pData = master.pressureClasses.find(p => p.class === pClass) || master.pressureClasses[0];
    const eData = master.endConnections.find(e => e.id === endConn) || master.endConnections[0];

    const pMult = pData.weightMultiplier;
    const eMult = eData.weightMultiplier;

    // Materials
    const matBody = master.materials.castings.find(m => m.code === activeConfig.materials.body) || master.materials.castings[0];
    const matFlap = master.materials.castings.find(m => m.code === activeConfig.materials.flap) || master.materials.castings[2];
    const matHPin = master.materials.pins.find(p => p.code === activeConfig.materials.hingePin) || master.materials.pins[2];
    const matSPin = master.materials.pins.find(p => p.code === activeConfig.materials.stopPin) || master.materials.pins[2];
    const matSpring = master.materials.springs.find(s => s.code === activeConfig.materials.spring) || master.materials.springs[0];
    const matSeat = master.materials.seats.find(s => s.code === activeConfig.materials.seat) || master.materials.seats[0];

    // Component 1: Valve Body
    const bodyWeight = Math.round((baseW.body * pMult * eMult * matBody.densityFactor) * 100) / 100;
    const bodyRawCost = Math.round(bodyWeight * matBody.ratePerKg);
    const bodyMachCost = Math.round((baseW.baseMachining * 0.55) * pMult * matBody.machiningFactor);
    const bodyTotalCost = bodyRawCost + bodyMachCost;

    // Component 2: Flaps / Dual Discs (Pair)
    const flapWeight = Math.round((baseW.flap * pMult * matFlap.densityFactor) * 100) / 100;
    const flapRawCost = Math.round(flapWeight * matFlap.ratePerKg);
    const flapMachCost = Math.round((baseW.baseMachining * 0.32) * pMult * matFlap.machiningFactor);
    const flapTotalCost = flapRawCost + flapMachCost;

    // Component 3: Hinge Pin
    const hPinWeight = Math.round((baseW.hingePin * pMult) * 100) / 100;
    const hPinRawCost = Math.round(hPinWeight * matHPin.ratePerKg);
    const hPinMachCost = Math.round((baseW.baseMachining * 0.05) * matHPin.machinability);
    const hPinTotalCost = hPinRawCost + hPinMachCost;

    // Component 4: Stop Pin
    const sPinWeight = Math.round((baseW.stopPin * pMult) * 100) / 100;
    const sPinRawCost = Math.round(sPinWeight * matSPin.ratePerKg);
    const sPinMachCost = Math.round((baseW.baseMachining * 0.05) * matSPin.machinability);
    const sPinTotalCost = sPinRawCost + sPinMachCost;

    // Component 5: Torsion Spring(s)
    const springWeight = Math.round((baseW.spring * pMult) * 100) / 100;
    const springCount = pMult >= 2.0 || parseInt(size) >= 12 ? 2 : 1;
    const springCost = Math.round((matSpring.baseCostPerSpring * springCount) + (springWeight * (matSpring.ratePerKg * 0.15)));

    // Component 6: Seat / Resilient Seal
    const sizeFactor = Math.max(1, (baseW.body / 6.0));
    const seatCost = Math.round(matSeat.baseCost * sizeFactor * (pMult >= 1.8 ? 1.35 : 1.0));

    // Component 7: Bearings, Retainers & Hardware
    const hardwareWeight = Math.round((baseW.others * pMult) * 100) / 100;
    const hardwareCost = Math.round(220 * sizeFactor);

    // Assembly Totals
    const totalWeightUnit = Math.round((bodyWeight + flapWeight + hPinWeight + sPinWeight + springWeight + hardwareWeight) * 100) / 100;
    const directMaterialCost = bodyRawCost + flapRawCost + hPinRawCost + sPinRawCost + springCost + seatCost + hardwareCost;
    const directMachiningCost = bodyMachCost + flapMachCost + hPinMachCost + sPinMachCost;
    const directCost = directMaterialCost + directMachiningCost;

    // Operations / Overheads
    const testingCost = Math.round(master.operationalDefaults.hydroTestingChargePerValve * Math.sqrt(pMult));
    const paintingCost = Math.round(master.operationalDefaults.paintingAndCoatingPerKg * totalWeightUnit);
    const packingCost = Math.round(master.operationalDefaults.exportPackingPerKg * totalWeightUnit);
    const factoryCost = directCost + testingCost + paintingCost + packingCost;

    // Commercials
    const markupDivisor = Math.max(0.05, 1 - (margin / 100));
    const unitSellingPrice = Math.round(factoryCost / markupDivisor);
    const discountAmount = Math.round(unitSellingPrice * (discount / 100));
    const netUnitPrice = unitSellingPrice - discountAmount;
    const totalSellingPrice = netUnitPrice * qty;
    const totalBatchWeight = Math.round(totalWeightUnit * qty * 100) / 100;

    // BOM Breakdown Structure for Tables & Visuals
    const bom = [
      {
        itemNo: 1,
        component: "Valve Body",
        material: matBody.name,
        materialCode: matBody.code,
        weightKg: bodyWeight,
        unitRate: matBody.ratePerKg,
        rawCost: bodyRawCost,
        machiningCost: bodyMachCost,
        totalCost: bodyTotalCost,
        weightPct: Math.round((bodyWeight / totalWeightUnit) * 100),
        costPct: Math.round((bodyTotalCost / directCost) * 100)
      },
      {
        itemNo: 2,
        component: "Dual Plates (Flaps - 2 Nos)",
        material: matFlap.name,
        materialCode: matFlap.code,
        weightKg: flapWeight,
        unitRate: matFlap.ratePerKg,
        rawCost: flapRawCost,
        machiningCost: flapMachCost,
        totalCost: flapTotalCost,
        weightPct: Math.round((flapWeight / totalWeightUnit) * 100),
        costPct: Math.round((flapTotalCost / directCost) * 100)
      },
      {
        itemNo: 3,
        component: "Hinge Pin",
        material: matHPin.name,
        materialCode: matHPin.code,
        weightKg: hPinWeight,
        unitRate: matHPin.ratePerKg,
        rawCost: hPinRawCost,
        machiningCost: hPinMachCost,
        totalCost: hPinTotalCost,
        weightPct: Math.round((hPinWeight / totalWeightUnit) * 100),
        costPct: Math.max(1, Math.round((hPinTotalCost / directCost) * 100))
      },
      {
        itemNo: 4,
        component: "Stop Pin",
        material: matSPin.name,
        materialCode: matSPin.code,
        weightKg: sPinWeight,
        unitRate: matSPin.ratePerKg,
        rawCost: sPinRawCost,
        machiningCost: sPinMachCost,
        totalCost: sPinTotalCost,
        weightPct: Math.round((sPinWeight / totalWeightUnit) * 100),
        costPct: Math.max(1, Math.round((sPinTotalCost / directCost) * 100))
      },
      {
        itemNo: 5,
        component: `Torsion Spring (${springCount} No${springCount > 1 ? 's' : ''})`,
        material: matSpring.name,
        materialCode: matSpring.code,
        weightKg: springWeight,
        unitRate: matSpring.baseCostPerSpring + '/pc',
        rawCost: springCost,
        machiningCost: 0,
        totalCost: springCost,
        weightPct: Math.round((springWeight / totalWeightUnit) * 100),
        costPct: Math.max(1, Math.round((springCost / directCost) * 100))
      },
      {
        itemNo: 6,
        component: "Resilient / Metal Seat",
        material: matSeat.name,
        materialCode: matSeat.code,
        weightKg: 0.1,
        unitRate: matSeat.baseCost + '/set',
        rawCost: seatCost,
        machiningCost: 0,
        totalCost: seatCost,
        weightPct: 0.5,
        costPct: Math.max(1, Math.round((seatCost / directCost) * 100))
      },
      {
        itemNo: 7,
        component: "Bearings & Retainers Hardware",
        material: "SS316 / PTFE / Alloy",
        materialCode: "HDW",
        weightKg: hardwareWeight,
        unitRate: "Standard",
        rawCost: hardwareCost,
        machiningCost: 0,
        totalCost: hardwareCost,
        weightPct: Math.round((hardwareWeight / totalWeightUnit) * 100),
        costPct: Math.max(1, Math.round((hardwareCost / directCost) * 100))
      }
    ];

    // Technical Datasheet & Test Pressures (API 598)
    const testingData = {
      standard: "API 598 / ISO 5208",
      designStandard: "API 594",
      faceToFace: "API 594 Short Pattern",
      pressureRating: pData.label,
      hydroShellBar: pData.hydroShellBar,
      hydroShellPsi: Math.round(pData.hydroShellBar * 14.5038),
      hydroSeatBar: pData.hydroSeatBar,
      hydroSeatPsi: Math.round(pData.hydroSeatBar * 14.5038),
      airSeatBar: pData.airSeatBar,
      airSeatPsi: Math.round(pData.airSeatBar * 14.5038)
    };

    return {
      config: JSON.parse(JSON.stringify(activeConfig)),
      size,
      pressureClass: pClass,
      endConnection: eData.name,
      quantity: qty,
      description: `${size} Class ${pClass} Dual Plate Check Valve (${eData.name}) - Body: ${matBody.code}, Flap: ${matFlap.code}, Pin: ${matHPin.code}, Spring: ${matSpring.code}`,
      bom,
      weights: {
        body: bodyWeight,
        flap: flapWeight,
        hingePin: hPinWeight,
        stopPin: sPinWeight,
        spring: springWeight,
        hardware: hardwareWeight,
        unitTotal: totalWeightUnit,
        batchTotal: totalBatchWeight
      },
      costs: {
        directMaterialCost,
        directMachiningCost,
        directCost,
        testingCost,
        paintingCost,
        packingCost,
        factoryCost
      },
      pricing: {
        marginPercent: margin,
        marginAmount: unitSellingPrice - factoryCost,
        unitSellingPrice,
        discountPercent: discount,
        discountAmount,
        netUnitPrice,
        totalSellingPrice,
        currency: master.company.currencySymbol
      },
      testingData
    };
  }
}

// Global Calculator Instance
window.evoCalculator = new EvoCalculator(window.evoStore);
