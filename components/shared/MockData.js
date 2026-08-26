// AutoCare Pro Central Mock Data Store

export const initialVehicles = [
  {
    id: "v-1",
    brand: "BMW",
    model: "3 Series M Sport",
    year: 2023,
    registration: "MH 02 FJ 8899",
    vin: "WBA5R11080FK29104",
    fuelType: "Petrol (Turbo)",
    mileage: "18,420 km",
    numericMileage: 18420,
    lastService: "12 May 2026",
    nextServiceDue: "28 Aug 2026",
    healthScore: 92,
    healthStatus: "Excellent",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    color: "Mineral Grey Metallic",
    healthBreakdown: {
      engine: { status: "Excellent", score: 98, detail: "Synthetic 0W-30 pressure optimal" },
      brakes: { status: "Good", score: 85, detail: "Front pads 65%, Rear pads 70% life" },
      battery: { status: "Excellent", score: 96, detail: "12.8V rest voltage (AGM Battery)" },
      tyres: { status: "Attention Needed", score: 72, detail: "Front Left tread 3.2mm - Recommend rotation" }
    }
  },
  {
    id: "v-2",
    brand: "Mercedes-Benz",
    model: "C-Class C200",
    year: 2024,
    registration: "MH 01 DX 4004",
    vin: "W1K2060421F093120",
    fuelType: "Mild Hybrid Petrol",
    mileage: "9,150 km",
    numericMileage: 9150,
    lastService: "04 Feb 2026",
    nextServiceDue: "15 Oct 2026",
    healthScore: 97,
    healthStatus: "Optimal",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    color: "Obsidian Black",
    healthBreakdown: {
      engine: { status: "Excellent", score: 99, detail: "EQ Boost system operating normally" },
      brakes: { status: "Excellent", score: 94, detail: "Ceramic pads 90% life" },
      battery: { status: "Excellent", score: 98, detail: "48V Auxiliary & 12V Main 100%" },
      tyres: { status: "Excellent", score: 95, detail: "Pirelli P-Zero 6.5mm uniform tread" }
    }
  },
  {
    id: "v-3",
    brand: "Hyundai",
    model: "Creta SX (O) Turbo",
    year: 2022,
    registration: "DL 03 CA 1290",
    vin: "MALC141CMNM109382",
    fuelType: "Petrol DCT",
    mileage: "34,800 km",
    numericMileage: 34800,
    lastService: "10 Dec 2025",
    nextServiceDue: "10 Dec 2026",
    healthScore: 84,
    healthStatus: "Good",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
    color: "Titan Grey",
    healthBreakdown: {
      engine: { status: "Good", score: 88, detail: "DCT Clutch fluid check advised at 40k km" },
      brakes: { status: "Good", score: 82, detail: "Disc rotors clean, fluid flush recommended" },
      battery: { status: "Good", score: 80, detail: "Battery age 3.5 yrs (Health 78%)" },
      tyres: { status: "Attention Needed", score: 70, detail: "Rear Right slow air bleed detected" }
    }
  },
  {
    id: "v-4",
    brand: "Tata",
    model: "Safari Dark Edition",
    year: 2023,
    registration: "KA 05 MN 9012",
    vin: "MAT612089N9P10492",
    fuelType: "Kryotec 2.0 Diesel",
    mileage: "26,100 km",
    numericMileage: 26100,
    lastService: "15 Mar 2026",
    nextServiceDue: "15 Sep 2026",
    healthScore: 89,
    healthStatus: "Good",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    color: "Oberon Black",
    healthBreakdown: {
      engine: { status: "Excellent", score: 94, detail: "DPF soot level 12% (Normal)" },
      brakes: { status: "Good", score: 86, detail: "Front disc pads changed at 20k km" },
      battery: { status: "Excellent", score: 91, detail: "Heavy-duty alternator output 14.2V" },
      tyres: { status: "Good", score: 85, detail: "All-terrain 18-inch alloy tread 5.2mm" }
    }
  }
];

export const servicePackages = [
  {
    id: "srv-pkg-1",
    title: "General Service",
    badge: "Most Popular",
    duration: "3.5 Hours",
    price: 6499,
    description: "Complete 50-point inspection, fully synthetic oil replacement, oil filter, air filter, spark plug check & OBD-II scanner diagnostics.",
    iconName: "Wrench",
    included: [
      "Engine synthetic oil replacement",
      "Oil & AC cabin filter change",
      "50-Point electronic vehicle scan",
      "Brake cleaning & pad inspection",
      "Coolant & brake fluid top-up",
      "Wheel alignment & balancing check"
    ]
  },
  {
    id: "srv-pkg-2",
    title: "Oil Change",
    badge: "Quick Express",
    duration: "1.5 Hours",
    price: 3200,
    description: "Premium Motul/Castrol Fully Synthetic 5W-30/0W-30 engine oil swap with OEM oil filter replacement and sump washer renewal.",
    iconName: "Droplet",
    included: [
      "Engine oil flush & synthetic refill",
      "OEM Spin-on / Element oil filter",
      "Underbody leak & sump inspection",
      "Wiper fluid & battery electrolyte check"
    ]
  },
  {
    id: "srv-pkg-3",
    title: "Brake Service",
    badge: "Safety First",
    duration: "2.5 Hours",
    price: 4800,
    description: "Front & rear brake pad removal, anti-squeal lubrication, rotor resurfacing check, fluid bleeding, and ABS pressure test.",
    iconName: "ShieldAlert",
    included: [
      "Front & rear disc brake disassembly",
      "Caliper pin greasing & de-glazing",
      "Brake fluid Dot-4 flush & bleed",
      "ABS sensor & line pressure scan"
    ]
  },
  {
    id: "srv-pkg-4",
    title: "AC Service",
    badge: "Seasonal Special",
    duration: "2.0 Hours",
    price: 2900,
    description: "R134a/R1234yf refrigerant gas pressure test & top-up, evaporator foam cleaning, cabin HEPA filter swap, and anti-bacterial ozone treatment.",
    iconName: "Wind",
    included: [
      "AC compressor efficiency test",
      "Refrigerant gas vacuuming & refill",
      "Cabin HEPA filter replacement",
      "Ozone anti-bacterial cabin duct sanitization"
    ]
  },
  {
    id: "srv-pkg-5",
    title: "Wheel Alignment",
    badge: "Precision Care",
    duration: "1.0 Hour",
    price: 1500,
    description: "3D Laser camera alignment, dynamic wheel balancing with computerised counterweights, tyre rotation, and tread depth analysis.",
    iconName: "Disc",
    included: [
      "4-Wheel 3D laser alignment",
      "Dynamic wheel balancing with weights",
      "Tyre tread depth & pressure check",
      "Suspension bush & tie rod inspection"
    ]
  },
  {
    id: "srv-pkg-6",
    title: "Full Inspection",
    badge: "Pre-Purchase / Audit",
    duration: "1.5 Hours",
    price: 1999,
    description: "Deep sensor diagnostics, paint thickness measurement, transmission scan, battery health graph, and digital PDF condition report.",
    iconName: "FileCheck",
    included: [
      "Full ECU diagnostic trouble code scan",
      "Battery CCA load graph analysis",
      "Undercarriage & suspension Bushing check",
      "Comprehensive digital PDF report with photos"
    ]
  }
];

export const activeTrackingData = {
  serviceId: "SRV-2026-1048",
  vehicle: "BMW 3 Series M Sport",
  registration: "MH 02 FJ 8899",
  serviceType: "General Service",
  advisor: {
    name: "Rahul Sharma",
    title: "Senior Technical Service Advisor",
    phone: "+91 98201 44521",
    rating: "4.9 ★",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    experience: "8+ Years in Luxury European Auto"
  },
  mechanic: {
    name: "Vikram Singh",
    role: "Master BMW Certified Technician",
    bay: "Bay 04 (Performance Lift)"
  },
  estimatedCompletion: "Today, 6:30 PM",
  currentProgressPercent: 72,
  timeline: [
    {
      stage: "Booking Confirmed",
      time: "09:00 AM",
      date: "26 Aug 2026",
      status: "completed",
      description: "Slot reserved for BMW 3 Series. Digital check-in token generated."
    },
    {
      stage: "Vehicle Received",
      time: "10:15 AM",
      date: "26 Aug 2026",
      status: "completed",
      description: "Vehicle received at Workshop Bay 04. Odometer: 18,420 km. Inventory video recorded."
    },
    {
      stage: "Inspection Completed",
      time: "11:00 AM",
      date: "26 Aug 2026",
      status: "completed",
      description: "Computerised OBD-II scan finished. Brake pad life at 65%. Engine oil viscosity tested."
    },
    {
      stage: "Estimate Approved",
      time: "11:30 AM",
      date: "26 Aug 2026",
      status: "completed",
      description: "Customer approved estimate of ₹6,499. Work order assigned to Tech Master Vikram."
    },
    {
      stage: "Service In Progress",
      time: "02:15 PM",
      date: "26 Aug 2026",
      status: "active",
      description: "Synthetic oil drained, filter replaced. Currently performing 3D Laser wheel alignment."
    },
    {
      stage: "Quality Check",
      time: "05:45 PM (Est.)",
      date: "26 Aug 2026",
      status: "upcoming",
      description: "Final diagnostic reset, torque check on wheel lug nuts, and 5km road test."
    },
    {
      stage: "Ready for Pickup",
      time: "06:30 PM (Est.)",
      date: "26 Aug 2026",
      status: "upcoming",
      description: "Foam wash, interior vacuuming, sanitisation & invoice ready."
    }
  ],
  inspectionItems: [
    { item: "Engine Oil Viscosity & Level", result: "Replaced with 5W-30 Synthetic", status: "pass" },
    { item: "Oil Filter & Sump Gasket", result: "Brand New OEM Filter Installed", status: "pass" },
    { item: "Front & Rear Brake Pads", result: "65% Life Remaining (No replacement needed)", status: "pass" },
    { item: "Air & Cabin HEPA Filters", result: "Replaced Cabin Air Filter", status: "pass" },
    { item: "Tyre Tread & Alignment", result: "Front Left Adjusted via 3D Laser", status: "in_progress" },
    { item: "ECU Fault Memory Clearing", result: "Pending Road Test", status: "pending" }
  ]
};

export const serviceHistoryList = [
  {
    serviceId: "SRV-2026-1048",
    vehicleId: "v-1",
    vehicleName: "BMW 3 Series",
    registration: "MH 02 FJ 8899",
    serviceType: "General Service",
    date: "26 Aug 2026",
    amount: 6499,
    status: "In Progress",
    advisor: "Rahul Sharma",
    mileage: "18,420 km",
    partsReplaced: ["BMW OEM Synthetic 5W30 (5.2L)", "OEM Oil Filter", "HEPA Cabin Filter"],
    laborCost: 1800,
    partsCost: 4699
  },
  {
    serviceId: "SRV-2026-0892",
    vehicleId: "v-1",
    vehicleName: "BMW 3 Series",
    registration: "MH 02 FJ 8899",
    serviceType: "Wheel Alignment",
    date: "12 May 2026",
    amount: 1500,
    status: "Completed",
    advisor: "Rahul Sharma",
    mileage: "14,200 km",
    partsReplaced: ["Balancing Weights (40g)"],
    laborCost: 1200,
    partsCost: 300
  },
  {
    serviceId: "SRV-2026-0410",
    vehicleId: "v-2",
    vehicleName: "Mercedes-Benz C-Class",
    registration: "MH 01 DX 4004",
    serviceType: "Oil Change",
    date: "04 Feb 2026",
    amount: 3850,
    status: "Completed",
    advisor: "Aniket Varma",
    mileage: "9,150 km",
    partsReplaced: ["Mercedes 0W30 Synthetic Oil (6.0L)", "OEM Oil Filter"],
    laborCost: 1000,
    partsCost: 2850
  },
  {
    serviceId: "SRV-2025-9201",
    vehicleId: "v-3",
    vehicleName: "Hyundai Creta",
    registration: "DL 03 CA 1290",
    serviceType: "AC Service",
    date: "10 Dec 2025",
    amount: 2900,
    status: "Completed",
    advisor: "Priya Nair",
    mileage: "31,400 km",
    partsReplaced: ["R134a Refrigerant Gas (450g)", "AC Cabin Air Filter"],
    laborCost: 1400,
    partsCost: 1500
  },
  {
    serviceId: "SRV-2025-7720",
    vehicleId: "v-4",
    vehicleName: "Tata Safari",
    registration: "KA 05 MN 9012",
    serviceType: "Brake Service",
    date: "15 Mar 2026",
    amount: 4800,
    status: "Completed",
    advisor: "Aniket Varma",
    mileage: "20,100 km",
    partsReplaced: ["Brake Pads Front Set", "Brake Fluid DOT4 (1L)"],
    laborCost: 1500,
    partsCost: 3300
  },
  {
    serviceId: "SRV-2026-1102",
    vehicleId: "v-2",
    vehicleName: "Mercedes-Benz C-Class",
    registration: "MH 01 DX 4004",
    serviceType: "Full Inspection",
    date: "15 Oct 2026",
    amount: 1999,
    status: "Scheduled",
    advisor: "Rahul Sharma",
    mileage: "Target: 12,000 km",
    partsReplaced: [],
    laborCost: 1999,
    partsCost: 0
  }
];

export const workshopAnalytics = {
  kpis: {
    todayBookings: { value: 24, change: "+14%", isPositive: true },
    vehiclesInService: { value: 12, capacity: "16 Bays", percent: 75 },
    readyForDelivery: { value: 5, pendingPickup: "3 Confirmed" },
    todayRevenue: { value: "₹84,500", target: "₹95,000", percent: 89 }
  },
  pipeline: [
    {
      title: "Scheduled",
      count: 4,
      color: "border-sky-500/30 text-sky-400 bg-sky-500/10",
      items: [
        { id: "WO-101", customer: "Saurav Sharma", vehicle: "BMW 3 Series", reg: "MH 02 FJ 8899", time: "10:30 AM", type: "General Service", advisor: "Rahul S." },
        { id: "WO-102", customer: "Rohan Kapoor", vehicle: "Audi A6", reg: "MH 04 ER 2211", time: "11:45 AM", type: "AC Service", advisor: "Priya N." },
        { id: "WO-103", customer: "Karan Johar", vehicle: "Jaguar XF", reg: "MH 02 AB 9999", time: "02:00 PM", type: "Brake Service", advisor: "Aniket V." },
        { id: "WO-104", customer: "Simran Gill", vehicle: "Kia Seltos", reg: "HR 26 DQ 5544", time: "03:30 PM", type: "Oil Change", advisor: "Rahul S." }
      ]
    },
    {
      title: "Vehicle Received",
      count: 3,
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
      items: [
        { id: "WO-098", customer: "Aditya Roy", vehicle: "Porsche Macan", reg: "MH 01 PA 7007", time: "Received 09:30 AM", type: "Full Inspection", advisor: "Rahul S." },
        { id: "WO-099", customer: "Neha Gupta", vehicle: "Volvo XC90", reg: "KA 01 MC 3321", time: "Received 10:00 AM", type: "General Service", advisor: "Priya N." },
        { id: "WO-100", customer: "Vikram Mehta", vehicle: "Mahindra XUV700", reg: "MH 12 RN 8812", time: "Received 10:15 AM", type: "Wheel Alignment", advisor: "Aniket V." }
      ]
    },
    {
      title: "Inspection",
      count: 2,
      color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
      items: [
        { id: "WO-096", customer: "Siddharth M.", vehicle: "Mercedes E-Class", reg: "MH 02 EM 4444", time: "Diagnostics Active", type: "Brake Service", advisor: "Priya N." },
        { id: "WO-097", customer: "Pooja Hegde", vehicle: "BMW X5", reg: "MH 01 BX 5500", time: "Underbody Check", type: "General Service", advisor: "Rahul S." }
      ]
    },
    {
      title: "In Service",
      count: 5,
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      items: [
        { id: "WO-091", customer: "Saurav Sharma", vehicle: "BMW 3 Series", reg: "MH 02 FJ 8899", time: "Bay 04 - 72%", type: "General Service", advisor: "Rahul S.", tech: "Vikram S." },
        { id: "WO-092", customer: "Tarun Bajaj", vehicle: "Toyota Fortuner", reg: "DL 01 TF 9090", time: "Bay 02 - 60%", type: "Brake Service", advisor: "Aniket V.", tech: "Amit K." },
        { id: "WO-093", customer: "Riddhima Sen", vehicle: "Honda City", reg: "WB 02 HC 1122", time: "Bay 01 - 80%", type: "AC Service", advisor: "Priya N.", tech: "Suresh R." },
        { id: "WO-094", customer: "Deepak Chawla", vehicle: "Skoda Octavia", reg: "MH 14 SO 3030", time: "Bay 05 - 40%", type: "Transmission Service", advisor: "Rahul S.", tech: "Vikram S." },
        { id: "WO-095", customer: "Manish M.", vehicle: "Range Rover Velar", reg: "MH 02 RR 1111", time: "Bay 06 - 55%", type: "Air Suspension Repair", advisor: "Aniket V.", tech: "Amit K." }
      ]
    },
    {
      title: "Quality Check",
      count: 2,
      color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      items: [
        { id: "WO-089", customer: "Gaurav Sen", vehicle: "Jeep Compass", reg: "MH 03 JC 7788", time: "Road Test Passed", type: "General Service", advisor: "Rahul S." },
        { id: "WO-090", customer: "Ira Khan", vehicle: "Mini Cooper", reg: "MH 01 MC 2020", time: "Diagnostic Clear", type: "Brake Service", advisor: "Priya N." }
      ]
    },
    {
      title: "Ready",
      count: 3,
      color: "border-teal-500/30 text-teal-400 bg-teal-500/10",
      items: [
        { id: "WO-086", customer: "Aman Gupta", vehicle: "BMW M4 Coupe", reg: "MH 02 M4 0007", time: "Washed & Detailed", type: "General Service", advisor: "Rahul S." },
        { id: "WO-087", customer: "Shreya Ghoshal", vehicle: "Audi Q7", reg: "MH 01 AQ 7000", time: "Invoice Generated", type: "Full Inspection", advisor: "Aniket V." },
        { id: "WO-088", customer: "Varun Dhawan", vehicle: "Mercedes G-Wagon", reg: "MH 02 GW 9999", time: "Customer En-route", type: "Oil Change", advisor: "Priya N." }
      ]
    }
  ],
  technicians: [
    { name: "Vikram Singh", role: "European Master Tech", bay: "Bay 04", activeJobs: 2, status: "Busy", load: 85 },
    { name: "Amit Kumar", role: "SUV & Drivetrain Spec.", bay: "Bay 02", activeJobs: 2, status: "Busy", load: 80 },
    { name: "Suresh Rao", role: "Electrical & AC Specialist", bay: "Bay 01", activeJobs: 1, status: "Available", load: 50 },
    { name: "Rajesh Varma", role: "Brake & Suspension Spec.", bay: "Bay 03", activeJobs: 1, status: "Available", load: 45 }
  ],
  categoryBreakdown: [
    { name: "General Service", percent: 45, count: "54 Vehicles", color: "bg-emerald-500" },
    { name: "Oil Change", percent: 22, count: "26 Vehicles", color: "bg-sky-500" },
    { name: "Brake Service", percent: 15, count: "18 Vehicles", color: "bg-purple-500" },
    { name: "AC Service", percent: 11, count: "13 Vehicles", color: "bg-amber-500" },
    { name: "Wheel Alignment", percent: 7, count: "8 Vehicles", color: "bg-teal-500" }
  ]
};
