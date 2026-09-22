import mongoose, { Schema, Model } from "mongoose";

// FRANCHISE SCHEMA
const FranchiseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    state: { type: String, default: "Tamil Nadu" },
    territoryDistricts: [{ type: String }],
    pincodes: [{ type: String }],
    agreementStartDate: { type: String },
    agreementEndDate: { type: String },
    status: { type: String, default: "Active", enum: ["Active", "Inactive", "Suspended"] },
    annualTarget: { type: Number, default: 12000000 },
    achievedSales: { type: Number, default: 0 },
    collections: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
    commissionPaid: { type: Number, default: 0 },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  { strict: false, timestamps: true }
);

// PRODUCT SCHEMA
const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    listPrice: { type: Number, default: 0 },
    franchisePurchasePrice: { type: Number, default: 0 },
    minSellingPrice: { type: Number, default: 0 },
    maxDiscountPercent: { type: Number, default: 10 },
    gstPercent: { type: Number, default: 18 },
    installationCharge: { type: Number, default: 0 },
    warrantyPeriodMonths: { type: Number, default: 12 },
    renewalAmcRules: { type: String },
    description: { type: String },
    inStock: { type: Boolean, default: true },
  },
  { strict: false, timestamps: true }
);

// CUSTOMER SCHEMA
const CustomerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String },
    designation: { type: String },
    email: { type: String },
    phone: { type: String },
    industry: { type: String },
    address: { type: String },
    district: { type: String },
    state: { type: String },
    pincode: { type: String },
    gstin: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    lifetimeValue: { type: Number, default: 0 },
    activeMachinesCount: { type: Number, default: 0 },
    pendingTicketsCount: { type: Number, default: 0 },
    nextRenewalDate: { type: String },
    notes: { type: String },
  },
  { strict: false, timestamps: true }
);

// LEAD SCHEMA
const LeadSchema = new Schema(
  {
    leadId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    companyName: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    source: { type: String },
    industry: { type: String },
    state: { type: String },
    district: { type: String },
    pincode: { type: String, index: true },
    productInterest: { type: String },
    ownerId: { type: String },
    ownerName: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    status: { type: String, default: "New" },
    nextFollowUpDate: { type: String },
    territoryConflict: { type: Boolean, default: false },
    conflictNotes: { type: String },
    notes: { type: String },
  },
  { strict: false, timestamps: true }
);

// OPPORTUNITY SCHEMA
const OpportunitySchema = new Schema(
  {
    opportunityId: { type: String, index: true },
    oppId: { type: String, index: true },
    leadId: { type: String, index: true },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    productInterest: { type: String },
    stage: { type: String, default: "Discovery" },
    expectedValue: { type: Number, default: 0 },
    probabilityPercent: { type: Number, default: 20 },
    expectedCloseDate: { type: String },
    assignedTo: { type: String },
    notes: { type: String },
    demo: { type: Schema.Types.Mixed },
    quotationId: { type: String },
  },
  { strict: false, timestamps: true }
);

// QUOTATION SCHEMA
const QuotationSchema = new Schema(
  {
    quoteId: { type: String, index: true },
    oppId: { type: String, index: true },
    opportunityId: { type: String, index: true },
    customerId: { type: String },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    items: [{ type: Schema.Types.Mixed }],
    subtotal: { type: Number, default: 0 },
    specialDiscountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    approvalStatus: { type: String, default: "Not Required" },
    requiresHoApproval: { type: Boolean, default: false },
    approvedBy: { type: String },
    approvedAt: { type: String },
    rejectionReason: { type: String },
    status: { type: String, default: "Draft" },
    validUntil: { type: String },
    terms: { type: String },
  },
  { strict: false, timestamps: true }
);

// SALES ORDER SCHEMA
const OrderSchema = new Schema(
  {
    orderId: { type: String, index: true },
    quoteId: { type: String, index: true },
    poNumber: { type: String },
    poDate: { type: String },
    customerId: { type: String },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    items: [{ type: Schema.Types.Mixed }],
    orderValue: { type: Number, default: 0 },
    paymentSchedule: [{ type: Schema.Types.Mixed }],
    orderStatus: { type: String, default: "Draft" },
    estimatedDispatchDate: { type: String },
    actualDispatchDate: { type: String },
    trackingNumber: { type: String },
  },
  { strict: false, timestamps: true }
);

// INSTALLATION SCHEMA
const InstallationSchema = new Schema(
  {
    installationId: { type: String, index: true },
    orderId: { type: String, index: true },
    customerId: { type: String },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    machineSerial: { type: String, index: true },
    productName: { type: String },
    siteReadinessStatus: { type: String, default: "Pending" },
    serviceEngineerId: { type: String },
    serviceEngineerName: { type: String },
    scheduledDate: { type: String },
    completedDate: { type: String },
    checklist: [{ type: Schema.Types.Mixed }],
    status: { type: String, default: "Scheduled" },
    operatorTrainingSigned: { type: Boolean, default: false },
    customerSignoff: { type: Schema.Types.Mixed },
    notes: { type: String },
  },
  { strict: false, timestamps: true }
);

// SUPPORT TICKET SCHEMA
const SupportTicketSchema = new Schema(
  {
    ticketId: { type: String, index: true },
    customerId: { type: String },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    machineSerial: { type: String },
    productName: { type: String },
    category: { type: String, default: "Breakdown" },
    priority: { type: String, default: "Medium" },
    slaHoursTotal: { type: Number, default: 24 },
    slaDeadline: { type: String },
    slaBreached: { type: Boolean, default: false },
    assignedEngineerId: { type: String },
    assignedEngineerName: { type: String },
    status: { type: String, default: "Open" },
    issueDescription: { type: String },
    resolutionNotes: { type: String },
    resolvedAt: { type: String },
    comments: [{ type: Schema.Types.Mixed }],
  },
  { strict: false, timestamps: true }
);

// RENEWAL SCHEMA
const RenewalSchema = new Schema(
  {
    renewalId: { type: String, index: true },
    customerId: { type: String },
    customerName: { type: String },
    companyName: { type: String },
    franchiseId: { type: String, index: true },
    machineSerial: { type: String },
    productName: { type: String },
    contractType: { type: String, default: "AMC" },
    contractValue: { type: Number, default: 0 },
    startDate: { type: String },
    expiryDate: { type: String },
    status: { type: String, default: "Pending" },
    remindersSent: [{ type: Schema.Types.Mixed }],
    assignedTo: { type: String },
  },
  { strict: false, timestamps: true }
);

// COMMISSION SCHEMA
const CommissionSchema = new Schema(
  {
    commissionId: { type: String, index: true },
    franchiseId: { type: String, index: true },
    franchiseName: { type: String },
    orderId: { type: String, index: true },
    orderValue: { type: Number, default: 0 },
    eligibleRevenue: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 8 },
    calculatedAmount: { type: Number, default: 0 },
    status: { type: String, default: "Calculated" },
    paidDate: { type: String },
    paymentReference: { type: String },
  },
  { strict: false, timestamps: true }
);

// TERRITORY SCHEMA
const TerritorySchema = new Schema(
  {
    country: { type: String, default: "India" },
    state: { type: String },
    district: { type: String },
    pincodeRange: [{ type: String }],
    assignedFranchiseId: { type: String, index: true },
    assignedFranchiseName: { type: String },
    isProtected: { type: Boolean, default: true },
  },
  { strict: false, timestamps: true }
);

// USER SCHEMA
const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true },
    franchiseId: { type: String },
    franchiseName: { type: String },
    avatar: { type: String },
  },
  { strict: false, timestamps: true }
);

// EXPORT MONGOOSE MODELS (Singleton-safe across Next.js reloads)
export const FranchiseModel: Model<any> =
  mongoose.models.Franchise || mongoose.model("Franchise", FranchiseSchema);

export const ProductModel: Model<any> =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export const CustomerModel: Model<any> =
  mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);

export const LeadModel: Model<any> =
  mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

export const OpportunityModel: Model<any> =
  mongoose.models.Opportunity || mongoose.model("Opportunity", OpportunitySchema);

export const QuotationModel: Model<any> =
  mongoose.models.Quotation || mongoose.model("Quotation", QuotationSchema);

export const OrderModel: Model<any> =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

export const InstallationModel: Model<any> =
  mongoose.models.Installation || mongoose.model("Installation", InstallationSchema);

export const SupportTicketModel: Model<any> =
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);

export const RenewalModel: Model<any> =
  mongoose.models.Renewal || mongoose.model("Renewal", RenewalSchema);

export const CommissionModel: Model<any> =
  mongoose.models.Commission || mongoose.model("Commission", CommissionSchema);

export const TerritoryModel: Model<any> =
  mongoose.models.Territory || mongoose.model("Territory", TerritorySchema);

export const UserModel: Model<any> =
  mongoose.models.User || mongoose.model("User", UserSchema);
