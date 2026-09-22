import mongoose, { Schema } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/argus_franchise_os";

// Schemas
const FranchiseSchema = new Schema({}, { strict: false });
const ProductSchema = new Schema({}, { strict: false });
const CustomerSchema = new Schema({}, { strict: false });
const LeadSchema = new Schema({}, { strict: false });
const OpportunitySchema = new Schema({}, { strict: false });
const QuotationSchema = new Schema({}, { strict: false });
const OrderSchema = new Schema({}, { strict: false });
const InstallationSchema = new Schema({}, { strict: false });
const SupportTicketSchema = new Schema({}, { strict: false });
const RenewalSchema = new Schema({}, { strict: false });
const CommissionSchema = new Schema({}, { strict: false });
const TerritorySchema = new Schema({}, { strict: false });

const Franchises = mongoose.model("Franchise", FranchiseSchema);
const Products = mongoose.model("Product", ProductSchema);
const Customers = mongoose.model("Customer", CustomerSchema);
const Leads = mongoose.model("Lead", LeadSchema);
const Opportunities = mongoose.model("Opportunity", OpportunitySchema);
const Quotations = mongoose.model("Quotation", QuotationSchema);
const Orders = mongoose.model("Order", OrderSchema);
const Installations = mongoose.model("Installation", InstallationSchema);
const SupportTickets = mongoose.model("SupportTicket", SupportTicketSchema);
const Renewals = mongoose.model("Renewal", RenewalSchema);
const Commissions = mongoose.model("Commission", CommissionSchema);
const Territories = mongoose.model("Territory", TerritorySchema);

// Data
const MOCK_FRANCHISES = [
  {
    code: "FR-CBE",
    name: "Coimbatore Franchise",
    location: "Coimbatore, Tamil Nadu",
    state: "Tamil Nadu",
    territoryDistricts: ["Coimbatore", "Tiruppur", "Erode", "Nilgiris"],
    pincodes: ["641001", "641002", "641004", "641014", "641035", "641601"],
    agreementStartDate: "2023-01-01",
    agreementEndDate: "2026-12-31",
    status: "Active",
    annualTarget: 15000000,
    achievedSales: 11420000,
    collections: 9800000,
    commissionEarned: 913600,
    commissionPaid: 840000,
    contactPerson: "Sundaramurthy K",
    email: "admin.cbe@arguscnc.com",
    phone: "+91 98421 00211",
  },
  {
    code: "FR-CHE",
    name: "Chennai Franchise",
    location: "Chennai, Tamil Nadu",
    state: "Tamil Nadu",
    territoryDistricts: ["Chennai", "Kanchipuram", "Chengalpattu", "Thiruvallur"],
    pincodes: ["600001", "600028", "600032", "600058", "600096"],
    agreementStartDate: "2022-06-01",
    agreementEndDate: "2025-05-31",
    status: "Active",
    annualTarget: 18000000,
    achievedSales: 13800000,
    collections: 12200000,
    commissionEarned: 1104000,
    commissionPaid: 1050000,
    contactPerson: "Balaji Natarajan",
    email: "admin.chennai@arguscnc.com",
    phone: "+91 98400 44512",
  },
  {
    code: "FR-BLR",
    name: "Bangalore Franchise",
    location: "Bangalore, Karnataka",
    state: "Karnataka",
    territoryDistricts: ["Bangalore Urban", "Bangalore Rural", "Ramnagar"],
    pincodes: ["560001", "560058", "560068", "560100"],
    agreementStartDate: "2023-03-15",
    agreementEndDate: "2026-03-14",
    status: "Active",
    annualTarget: 16000000,
    achievedSales: 10400000,
    collections: 9100000,
    commissionEarned: 832000,
    commissionPaid: 750000,
    contactPerson: "Girish Gowda",
    email: "admin.blr@arguscnc.com",
    phone: "+91 98450 11984",
  },
  {
    code: "FR-MDU",
    name: "Madurai Franchise",
    location: "Madurai, Tamil Nadu",
    state: "Tamil Nadu",
    territoryDistricts: ["Madurai", "Dindigul", "Theni", "Virudhunagar"],
    pincodes: ["625001", "625020"],
    agreementStartDate: "2023-08-01",
    agreementEndDate: "2026-07-31",
    status: "Active",
    annualTarget: 9000000,
    achievedSales: 6800000,
    collections: 5900000,
    commissionEarned: 544000,
    commissionPaid: 480000,
    contactPerson: "Murugesan P",
    email: "admin.mdu@arguscnc.com",
    phone: "+91 97890 22345",
  },
  {
    code: "FR-SLM",
    name: "Salem Franchise",
    location: "Salem, Tamil Nadu",
    state: "Tamil Nadu",
    territoryDistricts: ["Salem", "Namakkal", "Dharmapuri"],
    pincodes: ["636001", "636004"],
    agreementStartDate: "2024-01-01",
    agreementEndDate: "2027-12-31",
    status: "Active",
    annualTarget: 8000000,
    achievedSales: 5500000,
    collections: 4800000,
    commissionEarned: 440000,
    commissionPaid: 400000,
    contactPerson: "Kandasamy V",
    email: "admin.slm@arguscnc.com",
    phone: "+91 94432 87654",
  },
];

const MOCK_PRODUCTS = [
  {
    sku: "ARG-VMC-700",
    name: "ARGUS VMC-700 3-Axis Vertical Machining Center",
    category: "CNC Machines",
    listPrice: 1850000,
    franchisePurchasePrice: 1480000,
    minSellingPrice: 1650000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 45000,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Standard 1-year AMC @ 5% of machine invoice post warranty",
    description: "High precision 8000 RPM BT40 spindle, 700x450mm travel, Siemens 828D CNC control.",
    inStock: true,
  },
  {
    sku: "ARG-CL-200",
    name: "ARGUS CNC Lathe CL-200 Slant Bed",
    category: "CNC Machines",
    listPrice: 1250000,
    franchisePurchasePrice: 1000000,
    minSellingPrice: 1125000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 35000,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Standard 1-year AMC @ 6% of invoice value",
    description: "Rigid 8-station hydraulic turret, max turning diameter 250mm, Fanuc 0i-TF control.",
    inStock: true,
  },
  {
    sku: "ARG-ACC-4AXIS",
    name: "4th Axis Rotary Table (200mm Dia) with Tailstock",
    category: "CNC Accessories",
    listPrice: 280000,
    franchisePurchasePrice: 220000,
    minSellingPrice: 250000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 10000,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Bundled with VMC AMC",
    description: "Precision harmonic drive rotary indexing table for 4-axis simultaneous milling.",
    inStock: true,
  },
  {
    sku: "ARG-SOFT-CAMPRO",
    name: "ArgusCAM Pro Multi-Axis CAM Software Suite",
    category: "Software",
    listPrice: 150000,
    franchisePurchasePrice: 105000,
    minSellingPrice: 135000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 5000,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Annual Software Maintenance & Updates @ ₹25,000/year",
    description: "Complete CAD/CAM suite with post-processors tailored for ARGUS CNC machines.",
    inStock: true,
  },
  {
    sku: "ARG-AMC-VMC-ANNUAL",
    name: "Comprehensive Annual Maintenance Contract (VMC-700)",
    category: "AMC / Service",
    listPrice: 72000,
    franchisePurchasePrice: 50000,
    minSellingPrice: 65000,
    maxDiscountPercent: 10,
    gstPercent: 18,
    installationCharge: 0,
    warrantyPeriodMonths: 12,
    renewalAmcRules: "Includes 4 preventive maintenance visits + breakdown support within 24h SLA",
    description: "Preventive maintenance, spindle runout calibration, ball screw backlash check.",
    inStock: true,
  },
];

const MOCK_CUSTOMERS = [
  {
    customerId: "CUST-5001",
    companyName: "Sri Venkatesh Industries",
    contactPerson: "Mr. M. Karthik",
    designation: "Managing Director",
    email: "karthik@srivenkateshind.com",
    phone: "+91 98765 43210",
    industry: "Auto Components",
    address: "SF No. 44/2, SIDCO Industrial Estate, Kurichi",
    district: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641021",
    gstin: "33AAAAA0000A1Z5",
    franchiseId: "FR-CBE",
    franchiseName: "Coimbatore Franchise",
    lifetimeValue: 1945000,
    activeMachinesCount: 3,
    pendingTicketsCount: 1,
    nextRenewalDate: "2025-01-15",
    notes: "Key Tier-2 automotive precision machining vendor. High potential for 4th-axis upsell.",
  },
  {
    customerId: "CUST-5002",
    companyName: "Kavitha Precision Engineering",
    contactPerson: "Mr. R. Kavitha Kumar",
    designation: "Plant Head",
    email: "kavitha@precisionengg.in",
    phone: "+91 98422 11987",
    industry: "Tool & Die",
    address: "Plot 12, Industrial Area, Peelamedu",
    district: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641004",
    gstin: "33BBBBB1111B1Z2",
    franchiseId: "FR-CBE",
    franchiseName: "Coimbatore Franchise",
    lifetimeValue: 1250000,
    activeMachinesCount: 2,
    pendingTicketsCount: 0,
    nextRenewalDate: "2025-03-10",
    notes: "Specializes in injection molds and die casting dies.",
  },
];

const MOCK_LEADS = [
  {
    leadId: "LD-1041",
    customerName: "Senthil Nathan",
    companyName: "Apex Tooling Solutions",
    phone: "+91 98433 87123",
    email: "senthil@apextooling.in",
    source: "Exhibition",
    industry: "Tool & Die",
    state: "Tamil Nadu",
    district: "Coimbatore",
    pincode: "641018",
    productInterest: "ARG-VMC-700",
    ownerId: "usr-cbe-sales",
    ownerName: "Karthik M",
    franchiseId: "FR-CBE",
    franchiseName: "Coimbatore Franchise",
    status: "Qualified",
    nextFollowUpDate: "2024-12-18",
    createdAt: "2024-12-05",
    notes: "Met at INTEC 2024. Wants spindle speed > 10,000 RPM for aluminum die machining.",
  },
  {
    leadId: "LD-1043",
    customerName: "G. Rajesh",
    companyName: "Rajesh Hi-Tech Valves",
    phone: "+91 97899 44321",
    email: "rajesh@hitechvalves.com",
    source: "Website",
    industry: "General Engg",
    state: "Tamil Nadu",
    district: "Tiruppur",
    pincode: "641601",
    productInterest: "ARG-CL-200",
    ownerId: "usr-cbe-sales",
    ownerName: "Karthik M",
    franchiseId: "FR-CBE",
    franchiseName: "Coimbatore Franchise",
    status: "New",
    nextFollowUpDate: "2024-12-20",
    territoryConflict: true,
    conflictNotes: "PIN 641601 near boundary with Salem Franchise territory. Requires HO verification.",
    createdAt: "2024-12-10",
    notes: "Needs CNC lathe for stainless steel valve bodies.",
  },
];

async function seedAtlas() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas!");

    // Clean and seed
    await Franchises.deleteMany({});
    await Franchises.insertMany(MOCK_FRANCHISES);
    console.log(`✅ Seeded ${MOCK_FRANCHISES.length} Franchises`);

    await Products.deleteMany({});
    await Products.insertMany(MOCK_PRODUCTS);
    console.log(`✅ Seeded ${MOCK_PRODUCTS.length} Products`);

    await Customers.deleteMany({});
    await Customers.insertMany(MOCK_CUSTOMERS);
    console.log(`✅ Seeded ${MOCK_CUSTOMERS.length} Customers`);

    await Leads.deleteMany({});
    await Leads.insertMany(MOCK_LEADS);
    console.log(`✅ Seeded ${MOCK_LEADS.length} Leads`);

    console.log("🎉 MongoDB Atlas seed completed successfully!");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding Atlas:", err);
  }
}

seedAtlas();
