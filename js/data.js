/**
 * Evo Valves - DPCV Engineering Master Data
 * Dual Plate Check Valve Estimation & Configuration Engine
 */

const EVO_DATA = {
  company: {
    name: "Evo Valves Pvt. Ltd.",
    brand: "EVO VALVES",
    tagline: "Precision Dual Plate Check Valve Manufacturer",
    product: "Dual Plate Check Valve (DPCV)",
    standards: ["API 594", "API 598", "ASME B16.34", "ASME B16.5", "BS EN 12266"],
    address: "Plot No. 42-45, GIDC Industrial Estate, Phase II, Vatva, Ahmedabad, Gujarat, India - 382445",
    phone: "+91 98250 XXXXX / +91 79 XXXXXXXX",
    email: "sales@evovalves.com / quotes@evovalves.com",
    web: "www.evovalves.com",
    gstin: "24AAACE0000A1Z5",
    currency: "INR (₹)",
    currencySymbol: "₹"
  },

  // Valve Sizes (NPS & DN)
  sizes: [
    { nps: '2"', dn: 50, label: '2" (DN 50)' },
    { nps: '2.5"', dn: 65, label: '2.5" (DN 65)' },
    { nps: '3"', dn: 80, label: '3" (DN 80)' },
    { nps: '4"', dn: 100, label: '4" (DN 100)' },
    { nps: '5"', dn: 125, label: '5" (DN 125)' },
    { nps: '6"', dn: 150, label: '6" (DN 150)' },
    { nps: '8"', dn: 200, label: '8" (DN 200)' },
    { nps: '10"', dn: 250, label: '10" (DN 250)' },
    { nps: '12"', dn: 300, label: '12" (DN 300)' },
    { nps: '14"', dn: 350, label: '14" (DN 350)' },
    { nps: '16"', dn: 400, label: '16" (DN 400)' },
    { nps: '18"', dn: 450, label: '18" (DN 450)' },
    { nps: '20"', dn: 500, label: '20" (DN 500)' },
    { nps: '24"', dn: 600, label: '24" (DN 600)' }
  ],

  // ASME Pressure Classes & Shell/Seat Test Pressures (API 598)
  pressureClasses: [
    {
      class: "150#",
      pn: "PN 20",
      label: "Class 150# (PN 20)",
      weightMultiplier: 1.0,
      hydroShellBar: 30,
      hydroSeatBar: 22,
      airSeatBar: 6
    },
    {
      class: "300#",
      pn: "PN 50",
      label: "Class 300# (PN 50)",
      weightMultiplier: 1.38,
      hydroShellBar: 77,
      hydroSeatBar: 57,
      airSeatBar: 6
    },
    {
      class: "600#",
      pn: "PN 100",
      label: "Class 600# (PN 100)",
      weightMultiplier: 1.88,
      hydroShellBar: 154,
      hydroSeatBar: 113,
      airSeatBar: 6
    },
    {
      class: "900#",
      pn: "PN 150",
      label: "Class 900# (PN 150)",
      weightMultiplier: 2.65,
      hydroShellBar: 231,
      hydroSeatBar: 170,
      airSeatBar: 6
    },
    {
      class: "1500#",
      pn: "PN 250",
      label: "Class 1500# (PN 250)",
      weightMultiplier: 3.75,
      hydroShellBar: 385,
      hydroSeatBar: 283,
      airSeatBar: 6
    }
  ],

  // End Connections
  endConnections: [
    { id: "wafer", name: "Wafer Type (API 594 Short)", weightMultiplier: 1.0 },
    { id: "lug", name: "Lugged Type", weightMultiplier: 1.25 },
    { id: "flanged", name: "Double Flanged Type", weightMultiplier: 1.55 },
    { id: "retainerless", name: "Retainerless Wafer (API 594)", weightMultiplier: 1.08 }
  ],

  // Material Library with Standard Rates (₹/kg or base unit) & Density Ratios
  materials: {
    // Body & Flap Casting Materials
    castings: [
      {
        code: "WCB",
        name: "ASTM A216 Gr. WCB (Carbon Steel)",
        category: "Carbon Steel",
        densityFactor: 1.00,
        ratePerKg: 175,
        machiningFactor: 1.00,
        description: "Standard industrial carbon steel for non-corrosive oil, gas, water, steam"
      },
      {
        code: "CF8",
        name: "ASTM A351 Gr. CF8 (SS 304)",
        category: "Stainless Steel",
        densityFactor: 1.01,
        ratePerKg: 360,
        machiningFactor: 1.25,
        description: "Austenitic stainless steel for general corrosive chemical & sanitary services"
      },
      {
        code: "CF8M",
        name: "ASTM A351 Gr. CF8M (SS 316)",
        category: "Stainless Steel",
        densityFactor: 1.01,
        ratePerKg: 490,
        machiningFactor: 1.30,
        description: "Moly-bearing stainless steel, exceptional pitting and acid resistance"
      },
      {
        code: "4A",
        name: "ASTM A890 Gr. 4A / CD3MN (2205 Duplex)",
        category: "Duplex Steel",
        densityFactor: 0.995,
        ratePerKg: 890,
        machiningFactor: 1.55,
        description: "22% Cr Duplex Stainless Steel, high mechanical strength & chloride resistance"
      },
      {
        code: "5A",
        name: "ASTM A890 Gr. 5A / CE3MN (2507 Super Duplex)",
        category: "Super Duplex Steel",
        densityFactor: 0.995,
        ratePerKg: 1380,
        machiningFactor: 1.80,
        description: "25% Cr Super Duplex SS, extreme seawater, offshore & aggressive acid resistance"
      },
      {
        code: "CF3M",
        name: "ASTM A351 Gr. CF3M (SS 316L)",
        category: "Stainless Steel",
        densityFactor: 1.01,
        ratePerKg: 520,
        machiningFactor: 1.32,
        description: "Low carbon SS 316L, prevents intergranular corrosion"
      },
      {
        code: "NAB",
        name: "ASTM B148 C95800 (Nickel Al-Bronze)",
        category: "Bronze Alloy",
        densityFactor: 0.96,
        ratePerKg: 780,
        machiningFactor: 0.95,
        description: "Nickel Aluminum Bronze, prime choice for marine & desalination"
      },
      {
        code: "HAST_C276",
        name: "ASTM A494 CW-12MW (Hastelloy C276)",
        category: "Nickel Alloy",
        densityFactor: 1.13,
        ratePerKg: 3200,
        machiningFactor: 2.20,
        description: "Nickel-Molybdenum-Chromium alloy for severe chemical environments"
      }
    ],

    // Pin Materials (Bar stock for Hinge & Stop Pins)
    pins: [
      { code: "SS410", name: "AISI 410 (ASTM A276)", ratePerKg: 240, machinability: 1.0 },
      { code: "SS304", name: "AISI 304 (ASTM A276)", ratePerKg: 380, machinability: 1.2 },
      { code: "SS316", name: "AISI 316 (ASTM A276)", ratePerKg: 510, machinability: 1.25 },
      { code: "17_4PH", name: "17-4 PH (ASTM A564 Gr. 630)", ratePerKg: 750, machinability: 1.45 },
      { code: "DUPLEX_F51", name: "Duplex 2205 (ASTM A182 F51)", ratePerKg: 950, machinability: 1.6 },
      { code: "SDUPLEX_F53", name: "Super Duplex 2507 (ASTM A182 F53)", ratePerKg: 1450, machinability: 1.85 },
      { code: "INCONEL_718", name: "Inconel 718 (UNS N07718)", ratePerKg: 3400, machinability: 2.5 }
    ],

    // Spring Materials
    springs: [
      { code: "INCONEL_X750", name: "Inconel X-750 (NACE MR0175 Standard)", baseCostPerSpring: 450, ratePerKg: 4600 },
      { code: "SS316", name: "SS 316 Spring Steel", baseCostPerSpring: 180, ratePerKg: 1900 },
      { code: "HASTELLOY_C", name: "Hastelloy C-276 Spring", baseCostPerSpring: 850, ratePerKg: 5200 }
    ],

    // Seat / Seal Materials
    seats: [
      { code: "EPDM", name: "EPDM Rubber (-30°C to 120°C)", baseCost: 350, type: "Resilient Soft Seat" },
      { code: "VITON", name: "Viton / FKM (-20°C to 200°C)", baseCost: 750, type: "Resilient Soft Seat" },
      { code: "NBR", name: "NBR / Nitrile (-20°C to 90°C)", baseCost: 280, type: "Resilient Soft Seat" },
      { code: "PTFE", name: "PTFE / Teflon (-50°C to 180°C)", baseCost: 650, type: "Resilient Soft Seat" },
      { code: "INTEGRAL_STELLITE", name: "Integral Stellite Gr. 6 Metal-to-Metal Seat", baseCost: 1800, type: "Metal-to-Metal Hardfacing" },
      { code: "BODY_INTEGRAL", name: "Body Integral Metal Seat", baseCost: 450, type: "Metal-to-Metal" }
    ],

    // Bearings / Washers
    bearings: [
      { code: "PTFE_BEARING", name: "PTFE / RPTFE Sleeve Bearings", cost: 120 },
      { code: "SS316_BEARING", name: "SS 316 + PTFE Lined Bearings", cost: 250 },
      { code: "STELLITE_BEARING", name: "Stellite Hardfaced Bearings", cost: 650 }
    ]
  },

  // Base Weight Master Table for Class 150# Wafer DPCV (Standard WCB in kg)
  // Components: Body (Casting), Flap/Disc (Pair of 2), Hinge Pin, Stop Pin, Spring, Bearings
  baseWeight150Wafer: {
    '2"':   { body: 2.30,  flap: 0.75,  hingePin: 0.12, stopPin: 0.12, spring: 0.08, others: 0.15, baseMachining: 420 },
    '2.5"': { body: 3.10,  flap: 1.05,  hingePin: 0.16, stopPin: 0.16, spring: 0.10, others: 0.18, baseMachining: 500 },
    '3"':   { body: 4.20,  flap: 1.45,  hingePin: 0.22, stopPin: 0.22, spring: 0.14, others: 0.22, baseMachining: 620 },
    '4"':   { body: 6.80,  flap: 2.30,  hingePin: 0.35, stopPin: 0.35, spring: 0.20, others: 0.30, baseMachining: 850 },
    '5"':   { body: 9.80,  flap: 3.40,  hingePin: 0.50, stopPin: 0.50, spring: 0.28, others: 0.40, baseMachining: 1100 },
    '6"':   { body: 13.80, flap: 4.80,  hingePin: 0.75, stopPin: 0.75, spring: 0.38, others: 0.52, baseMachining: 1450 },
    '8"':   { body: 23.50, flap: 8.20,  hingePin: 1.25, stopPin: 1.25, spring: 0.55, others: 0.75, baseMachining: 2100 },
    '10"':  { body: 37.00, flap: 13.20, hingePin: 1.90, stopPin: 1.90, spring: 0.85, others: 1.15, baseMachining: 3100 },
    '12"':  { body: 56.00, flap: 19.50, hingePin: 2.70, stopPin: 2.70, spring: 1.20, others: 1.50, baseMachining: 4300 },
    '14"':  { body: 78.00, flap: 27.50, hingePin: 3.60, stopPin: 3.60, spring: 1.60, others: 2.10, baseMachining: 5800 },
    '16"':  { body: 110.0, flap: 38.00, hingePin: 5.10, stopPin: 5.10, spring: 2.20, others: 2.80, baseMachining: 7600 },
    '18"':  { body: 148.0, flap: 51.00, hingePin: 6.60, stopPin: 6.60, spring: 2.90, others: 3.50, baseMachining: 9800 },
    '20"':  { body: 195.0, flap: 67.00, hingePin: 8.50, stopPin: 8.50, spring: 3.60, others: 4.40, baseMachining: 12500 },
    '24"':  { body: 310.0, flap: 105.0, hingePin: 12.8, stopPin: 12.8, spring: 5.20, others: 6.20, baseMachining: 18000 }
  },

  // Operational Defaults
  operationalDefaults: {
    hydroTestingChargePerValve: 450,
    paintingAndCoatingPerKg: 18,
    exportPackingPerKg: 12,
    defaultMarginPercent: 22,
    defaultDiscountPercent: 0,
    gstPercent: 18
  },

  // Standard Valve Configurations Quick Presets
  presets: [
    {
      name: "Standard Carbon Steel (WCB / CF8M Trim)",
      bodyMat: "WCB",
      flapMat: "CF8M",
      hingePinMat: "SS316",
      stopPinMat: "SS316",
      springMat: "INCONEL_X750",
      seatMat: "EPDM"
    },
    {
      name: "Full Stainless Steel 316 (All CF8M / SS316)",
      bodyMat: "CF8M",
      flapMat: "CF8M",
      hingePinMat: "SS316",
      stopPinMat: "SS316",
      springMat: "INCONEL_X750",
      seatMat: "VITON"
    },
    {
      name: "Stainless Steel 304 (All CF8 / SS304)",
      bodyMat: "CF8",
      flapMat: "CF8",
      hingePinMat: "SS304",
      stopPinMat: "SS304",
      springMat: "INCONEL_X750",
      seatMat: "EPDM"
    },
    {
      name: "Duplex 2205 (Full 4A / Duplex)",
      bodyMat: "4A",
      flapMat: "4A",
      hingePinMat: "DUPLEX_F51",
      stopPinMat: "DUPLEX_F51",
      springMat: "INCONEL_X750",
      seatMat: "INTEGRAL_STELLITE"
    },
    {
      name: "Super Duplex 2507 (Full 5A / Super Duplex)",
      bodyMat: "5A",
      flapMat: "5A",
      hingePinMat: "SDUPLEX_F53",
      stopPinMat: "SDUPLEX_F53",
      springMat: "INCONEL_X750",
      seatMat: "INTEGRAL_STELLITE"
    },
    {
      name: "High Temperature Metal-to-Metal (WCB / Stellite)",
      bodyMat: "WCB",
      flapMat: "CF8M",
      hingePinMat: "17_4PH",
      stopPinMat: "17_4PH",
      springMat: "INCONEL_X750",
      seatMat: "INTEGRAL_STELLITE"
    }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.EVO_DATA = EVO_DATA;
}
