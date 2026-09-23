export type UserRole =
  | "super_admin"
  | "head_office_admin"
  | "franchise_admin"
  | "franchise_sales"
  | "service_engineer"
  | "finance_accounts";

export interface Organization {
  _id?: string;
  orgId: string;
  name: string;
  gstin: string;
  adminEmail: string;
  adminName: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId?: string | null; // null for Super Admin
  orgName?: string | null;
  franchiseId: string | null; // null for Head Office
  franchiseName?: string;
  avatar?: string;
  status?: "active" | "pending_approval" | "disabled";
}

export interface Franchise {
  _id: string;
  orgId?: string;
  code: string;
  name: string;
  location: string;
  state: string;
  territoryDistricts: string[];
  pincodes: string[];
  agreementStartDate: string;
  agreementEndDate: string;
  status: "Active" | "Inactive" | "Suspended";
  annualTarget: number;
  achievedSales: number;
  collections: number;
  commissionEarned: number;
  commissionPaid: number;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface TerritoryMapping {
  _id: string;
  orgId?: string;
  country: string;
  state: string;
  district: string;
  pincodeRange: string[];
  assignedFranchiseId: string;
  assignedFranchiseName: string;
  isProtected: boolean;
}

export interface ProductMasterItem {
  _id: string;
  orgId?: string;
  sku: string;
  name: string;
  category: "CNC Machines" | "CNC Accessories" | "Software" | "AMC / Service" | "Spare Parts";
  listPrice: number;
  franchisePurchasePrice: number;
  minSellingPrice: number;
  maxDiscountPercent: number; // e.g. 10%
  gstPercent: number; // e.g. 18%
  installationCharge: number;
  warrantyPeriodMonths: number;
  renewalAmcRules: string;
  description: string;
  inStock: boolean;
}

export interface Lead {
  _id: string;
  orgId?: string;
  leadId: string; // e.g. LD-1042
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  source: "Exhibition" | "Website" | "Referral" | "Direct Call" | "Social Media";
  industry: "Auto Components" | "Aerospace" | "Tool & Die" | "General Engg" | "Medical Devices";
  state: string;
  district: string;
  pincode: string;
  productInterest: string;
  ownerId: string;
  ownerName: string;
  franchiseId: string;
  franchiseName: string;
  status: "New" | "Qualified" | "In Progress" | "Converted" | "Lost";
  nextFollowUpDate: string;
  territoryConflict?: boolean;
  conflictNotes?: string;
  createdAt: string;
  notes?: string;
}

export interface DemoDetails {
  demoId: string;
  scheduledDate: string;
  conductedDate?: string;
  assignedEngineerId: string;
  assignedEngineerName: string;
  product: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";
  result?: "Positive" | "Needs Follow-up" | "Machine Spec Change Required" | "Competitor Chosen";
  notes?: string;
  attachments?: string[];
}

export interface Opportunity {
  _id: string;
  orgId?: string;
  opportunityId: string; // e.g. OP-1023
  leadId?: string;
  customerId: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  franchiseId: string;
  franchiseName: string;
  stage: "New" | "Qualified" | "Demo" | "Quotation" | "Negotiation" | "PO Expected" | "Won" | "Lost";
  expectedValue: number;
  product: string;
  requirementsNotes: string;
  demo?: DemoDetails;
  timeline: {
    stage: string;
    date: string;
    completed: boolean;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  sku: string;
  name: string;
  listPrice: number;
  minSellingPrice: number;
  maxDiscountPercent: number;
  appliedDiscountPercent: number;
  unitPrice: number;
  quantity: number;
  gstPercent: number;
  installationCharge: number;
  total: number;
}

export interface Quotation {
  _id: string;
  orgId?: string;
  quoteId: string; // e.g. QT-9203
  opportunityId: string;
  customerId: string;
  customerName: string;
  companyName: string;
  franchiseId: string;
  franchiseName: string;
  version: number;
  items: QuotationItem[];
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  installationTotal: number;
  grandTotal: number;
  status: "Draft" | "Pending_Approval" | "Approved" | "Sent" | "Accepted" | "Rejected";
  requiresSpecialApproval: boolean;
  approvalReason?: string;
  specialApprovalBy?: string;
  specialApprovalDate?: string;
  rejectionReason?: string;
  auditLogs: {
    timestamp: string;
    user: string;
    action: string;
    details: string;
  }[];
  validUntil: string;
  createdAt: string;
}

export interface PaymentMilestone {
  milestoneName: "Advance" | "Before Dispatch" | "Post Installation" | string;
  percentage: number;
  amount: number;
  dueAmount?: number;
  dueDate: string;
  receivedAmount: number;
  receivedDate?: string;
  referenceNumber?: string;
  paymentReference?: string;
  status: "Pending" | "Received" | "Overdue" | "Partially Received";
}

export interface SalesOrder {
  _id: string;
  orgId?: string;
  orderId: string; // e.g. SO-1023
  quoteId: string;
  opportunityId: string;
  customerId: string;
  customerName: string;
  companyName: string;
  franchiseId: string;
  franchiseName: string;
  poNumber: string;
  poDate: string;
  orderValue: number;
  orderStatus: "Confirmed" | "Production/Stock" | "QC" | "Dispatch" | "Delivered" | "Payment Cleared" | "Order Placed" | string;
  paymentSchedule: PaymentMilestone[];
  materialDispatchedDate?: string;
  deliveredDate?: string;
  createdAt: string;
}

export interface InstallationChecklist {
  materialDelivered: boolean;
  preInstallCheck: boolean;
  machineInstalled: boolean;
  trainingCompleted: boolean;
  customerSignOff: boolean;
}

export interface Installation {
  _id: string;
  orgId?: string;
  installationId: string; // e.g. INS-1023
  orderId: string;
  customerId: string;
  customerName: string;
  companyName: string;
  franchiseId: string;
  machineSerial: string;
  productName: string;
  assignedEngineerId: string;
  assignedEngineerName: string;
  scheduledDate: string;
  completedDate?: string;
  checklist: InstallationChecklist;
  photos: string[];
  trainingDetails: {
    traineesCount: number;
    operatorsTrained: string[];
    topicsCovered: string[];
  };
  customerSignOffData?: {
    signeeName: string;
    signeeDesignation: string;
    signatureImage: string; // data URL
    signedAt: string;
  };
  status: "Scheduled" | "In Progress" | "Completed" | "Pending Sign-off";
}

export interface SupportTicket {
  _id: string;
  orgId?: string;
  ticketId: string; // e.g. TK-1056
  customerId: string;
  customerName: string;
  companyName: string;
  franchiseId: string;
  machineSerial: string;
  productName: string;
  category: "Breakdown" | "Calibration" | "Software" | "Spares" | "General";
  priority: "Critical" | "High" | "Medium" | "Low";
  slaDeadline: string; // ISO string
  slaHoursTotal: number;
  slaBreached: boolean;
  assignedEngineerId: string;
  assignedEngineerName: string;
  status: "Open" | "In Progress" | "Waiting Spares" | "Resolved" | "Closed";
  issueDescription: string;
  comments: {
    id: string;
    authorName: string;
    role: string;
    timestamp: string;
    message: string;
  }[];
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface Renewal {
  _id: string;
  orgId?: string;
  renewalId: string; // e.g. RN-402
  customerId: string;
  customerName: string;
  companyName: string;
  franchiseId: string;
  franchiseName: string;
  machineSerial: string;
  productOrModule: string;
  expiryDate: string;
  daysRemaining: number;
  contractValue: number;
  status: "Active" | "Notice_60d" | "Notice_30d" | "Notice_15d" | "Notice_7d" | "Expired" | "Renewed";
  remindersSent: {
    type: "60d" | "30d" | "15d" | "7d" | "Escalation";
    sentAt: string;
    channel: "Email" | "WhatsApp" | "In-App";
  }[];
}

export interface CommissionRecord {
  _id: string;
  orgId?: string;
  commissionId: string; // e.g. COMM-7801
  franchiseId: string;
  franchiseName: string;
  orderId: string;
  customerName: string;
  eligibleRevenue: number;
  commissionRate: number; // e.g. 8%
  calculatedAmount: number;
  status: "Calculated" | "Approved" | "Payable" | "Paid";
  paymentReference?: string;
  paidDate?: string;
  createdAt: string;
}

export interface CustomerProfile {
  _id: string;
  orgId?: string;
  customerId: string; // e.g. CUST-5001
  companyName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  industry: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  gstin: string;
  franchiseId: string;
  franchiseName: string;
  lifetimeValue: number;
  activeMachinesCount: number;
  pendingTicketsCount: number;
  nextRenewalDate: string;
  notes: string;
}
