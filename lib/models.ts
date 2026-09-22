import mongoose, { Schema } from "mongoose";

// Franchise Schema
const FranchiseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: String,
    state: String,
    territoryDistricts: [String],
    pincodes: [String],
    agreementStartDate: String,
    agreementEndDate: String,
    status: { type: String, default: "Active" },
    annualTarget: { type: Number, default: 0 },
    achievedSales: { type: Number, default: 0 },
    collections: { type: Number, default: 0 },
    commissionEarned: { type: Number, default: 0 },
    commissionPaid: { type: Number, default: 0 },
    contactPerson: String,
    email: String,
    phone: String,
  },
  { timestamps: true }
);

// Product / Price Master Schema
const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    listPrice: { type: Number, required: true },
    franchisePurchasePrice: { type: Number, required: true },
    minSellingPrice: { type: Number, required: true },
    maxDiscountPercent: { type: Number, required: true },
    gstPercent: { type: Number, default: 18 },
    installationCharge: { type: Number, default: 0 },
    warrantyPeriodMonths: { type: Number, default: 12 },
    renewalAmcRules: String,
    description: String,
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Lead Schema
const LeadSchema = new Schema(
  {
    leadId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    companyName: { type: String, required: true },
    phone: String,
    email: String,
    source: String,
    industry: String,
    state: String,
    district: String,
    pincode: String,
    productInterest: String,
    ownerId: String,
    ownerName: String,
    franchiseId: { type: String, required: true },
    franchiseName: String,
    status: { type: String, default: "New" },
    nextFollowUpDate: String,
    territoryConflict: { type: Boolean, default: false },
    conflictNotes: String,
    notes: String,
  },
  { timestamps: true }
);

// Opportunity Schema
const OpportunitySchema = new Schema(
  {
    opportunityId: { type: String, required: true, unique: true },
    leadId: String,
    customerId: String,
    customerName: String,
    companyName: String,
    phone: String,
    email: String,
    franchiseId: { type: String, required: true },
    franchiseName: String,
    stage: { type: String, default: "New" },
    expectedValue: Number,
    product: String,
    requirementsNotes: String,
    demo: {
      demoId: String,
      scheduledDate: String,
      conductedDate: String,
      assignedEngineerId: String,
      assignedEngineerName: String,
      product: String,
      status: String,
      result: String,
      notes: String,
      attachments: [String],
    },
    timeline: [
      {
        stage: String,
        date: String,
        completed: Boolean,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Quotation Schema
const QuotationSchema = new Schema(
  {
    quoteId: { type: String, required: true, unique: true },
    opportunityId: String,
    customerId: String,
    customerName: String,
    companyName: String,
    franchiseId: { type: String, required: true },
    franchiseName: String,
    version: { type: Number, default: 1 },
    items: [
      {
        sku: String,
        name: String,
        listPrice: Number,
        minSellingPrice: Number,
        maxDiscountPercent: Number,
        appliedDiscountPercent: Number,
        unitPrice: Number,
        quantity: Number,
        gstPercent: Number,
        installationCharge: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    totalDiscount: Number,
    taxAmount: Number,
    installationTotal: Number,
    grandTotal: Number,
    status: { type: String, default: "Draft" },
    requiresSpecialApproval: { type: Boolean, default: false },
    approvalReason: String,
    specialApprovalBy: String,
    specialApprovalDate: String,
    rejectionReason: String,
    auditLogs: [
      {
        timestamp: String,
        user: String,
        action: String,
        details: String,
      },
    ],
    validUntil: String,
  },
  { timestamps: true }
);

// Order Schema
const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    quoteId: String,
    opportunityId: String,
    customerId: String,
    customerName: String,
    companyName: String,
    franchiseId: { type: String, required: true },
    franchiseName: String,
    poNumber: String,
    poDate: String,
    orderValue: Number,
    orderStatus: { type: String, default: "Confirmed" },
    paymentSchedule: [
      {
        milestoneName: String,
        percentage: Number,
        amount: Number,
        dueDate: String,
        receivedAmount: { type: Number, default: 0 },
        receivedDate: String,
        referenceNumber: String,
        status: { type: String, default: "Pending" },
      },
    ],
    materialDispatchedDate: String,
    deliveredDate: String,
  },
  { timestamps: true }
);

// Installation Schema
const InstallationSchema = new Schema(
  {
    installationId: { type: String, required: true, unique: true },
    orderId: String,
    customerId: String,
    customerName: String,
    companyName: String,
    franchiseId: { type: String, required: true },
    machineSerial: String,
    productName: String,
    assignedEngineerId: String,
    assignedEngineerName: String,
    scheduledDate: String,
    completedDate: String,
    checklist: {
      materialDelivered: { type: Boolean, default: false },
      preInstallCheck: { type: Boolean, default: false },
      machineInstalled: { type: Boolean, default: false },
      trainingCompleted: { type: Boolean, default: false },
      customerSignOff: { type: Boolean, default: false },
    },
    photos: [String],
    trainingDetails: {
      traineesCount: Number,
      operatorsTrained: [String],
      topicsCovered: [String],
    },
    customerSignOffData: {
      signeeName: String,
      signeeDesignation: String,
      signatureImage: String,
      signedAt: String,
    },
    status: { type: String, default: "Scheduled" },
  },
  { timestamps: true }
);

// Support Ticket Schema
const SupportTicketSchema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    customerId: String,
    customerName: String,
    companyName: String,
    franchiseId: { type: String, required: true },
    machineSerial: String,
    productName: String,
    category: String,
    priority: String,
    slaDeadline: String,
    slaHoursTotal: Number,
    slaBreached: { type: Boolean, default: false },
    assignedEngineerId: String,
    assignedEngineerName: String,
    status: { type: String, default: "Open" },
    issueDescription: String,
    comments: [
      {
        id: String,
        authorName: String,
        role: String,
        timestamp: String,
        message: String,
      },
    ],
    resolutionNotes: String,
    resolvedAt: String,
  },
  { timestamps: true }
);

// Customer Schema
const CustomerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactPerson: String,
    designation: String,
    email: String,
    phone: String,
    industry: String,
    address: String,
    district: String,
    state: String,
    pincode: String,
    gstin: String,
    franchiseId: { type: String, required: true },
    franchiseName: String,
    lifetimeValue: { type: Number, default: 0 },
    activeMachinesCount: { type: Number, default: 0 },
    pendingTicketsCount: { type: Number, default: 0 },
    nextRenewalDate: String,
    notes: String,
  },
  { timestamps: true }
);

// Model exports with Next.js hot-reload guard
export const FranchiseModel = mongoose.models.Franchise || mongoose.model("Franchise", FranchiseSchema);
export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export const LeadModel = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export const OpportunityModel = mongoose.models.Opportunity || mongoose.model("Opportunity", OpportunitySchema);
export const QuotationModel = mongoose.models.Quotation || mongoose.model("Quotation", QuotationSchema);
export const OrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
export const InstallationModel = mongoose.models.Installation || mongoose.model("Installation", InstallationSchema);
export const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
export const CustomerModel = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
