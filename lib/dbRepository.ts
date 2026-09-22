import {
  MOCK_FRANCHISES,
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_LEADS,
  MOCK_OPPORTUNITIES,
  MOCK_QUOTATIONS,
  MOCK_ORDERS,
  MOCK_INSTALLATIONS,
  MOCK_SUPPORT_TICKETS,
  MOCK_RENEWALS,
  MOCK_COMMISSIONS,
  MOCK_TERRITORIES,
} from "./mockData";
import {
  Franchise,
  ProductMasterItem,
  CustomerProfile,
  Lead,
  Opportunity,
  Quotation,
  SalesOrder,
  Installation,
  SupportTicket,
  Renewal,
  CommissionRecord,
  TerritoryMapping,
} from "./types";

// In-memory persistent state store across API route invocations in Node runtime
interface Store {
  franchises: Franchise[];
  products: ProductMasterItem[];
  customers: CustomerProfile[];
  leads: Lead[];
  opportunities: Opportunity[];
  quotations: Quotation[];
  orders: SalesOrder[];
  installations: Installation[];
  supportTickets: SupportTicket[];
  renewals: Renewal[];
  commissions: CommissionRecord[];
  territories: TerritoryMapping[];
}

declare global {
  // eslint-disable-next-line no-var
  var __ARGUS_STORE__: Store | undefined;
}

function initStore(): Store {
  if (!global.__ARGUS_STORE__) {
    global.__ARGUS_STORE__ = {
      franchises: JSON.parse(JSON.stringify(MOCK_FRANCHISES)),
      products: JSON.parse(JSON.stringify(MOCK_PRODUCTS)),
      customers: JSON.parse(JSON.stringify(MOCK_CUSTOMERS)),
      leads: JSON.parse(JSON.stringify(MOCK_LEADS)),
      opportunities: JSON.parse(JSON.stringify(MOCK_OPPORTUNITIES)),
      quotations: JSON.parse(JSON.stringify(MOCK_QUOTATIONS)),
      orders: JSON.parse(JSON.stringify(MOCK_ORDERS)),
      installations: JSON.parse(JSON.stringify(MOCK_INSTALLATIONS)),
      supportTickets: JSON.parse(JSON.stringify(MOCK_SUPPORT_TICKETS)),
      renewals: JSON.parse(JSON.stringify(MOCK_RENEWALS)),
      commissions: JSON.parse(JSON.stringify(MOCK_COMMISSIONS)),
      territories: JSON.parse(JSON.stringify(MOCK_TERRITORIES)),
    };
  }
  return global.__ARGUS_STORE__;
}

const store = initStore();

export const dbRepository = {
  // FRANCHISES
  getFranchises(): Franchise[] {
    return store.franchises;
  },

  getFranchiseByCode(code: string): Franchise | undefined {
    return store.franchises.find((f) => f.code === code);
  },

  // PRODUCTS / PRICE MASTER
  getProducts(): ProductMasterItem[] {
    return store.products;
  },

  getProductBySku(sku: string): ProductMasterItem | undefined {
    return store.products.find((p) => p.sku === sku);
  },

  createProduct(product: Partial<ProductMasterItem>): ProductMasterItem {
    const newPrd: ProductMasterItem = {
      _id: `prd-${Date.now()}`,
      sku: product.sku || `ARG-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: product.name || "New Industrial Machine",
      category: product.category || "CNC Machines",
      listPrice: Number(product.listPrice) || 0,
      franchisePurchasePrice: Number(product.franchisePurchasePrice) || 0,
      minSellingPrice: Number(product.minSellingPrice) || 0,
      maxDiscountPercent: Number(product.maxDiscountPercent) || 10,
      gstPercent: Number(product.gstPercent) || 18,
      installationCharge: Number(product.installationCharge) || 0,
      warrantyPeriodMonths: Number(product.warrantyPeriodMonths) || 12,
      renewalAmcRules: product.renewalAmcRules || "Standard 1-year AMC",
      description: product.description || "",
      inStock: product.inStock !== false,
    };
    store.products.unshift(newPrd);
    return newPrd;
  },

  // TERRITORIES
  getTerritories(): TerritoryMapping[] {
    return store.territories;
  },

  checkTerritoryConflict(pincode: string, requestedFranchiseId: string) {
    const match = store.territories.find((t) => t.pincodeRange.includes(pincode));
    if (!match) {
      return { hasConflict: false, matchedTerritory: null };
    }
    if (match.assignedFranchiseId !== requestedFranchiseId) {
      return {
        hasConflict: true,
        isProtected: match.isProtected,
        assignedTo: match.assignedFranchiseName,
        district: match.district,
        state: match.state,
      };
    }
    return { hasConflict: false, matchedTerritory: match };
  },

  // LEADS
  getLeads(franchiseId?: string | null): Lead[] {
    if (!franchiseId) return store.leads;
    return store.leads.filter((l) => l.franchiseId === franchiseId);
  },

  getLeadById(id: string): Lead | undefined {
    return store.leads.find((l) => l._id === id || l.leadId === id);
  },

  createLead(data: Partial<Lead>): Lead {
    const nextNum = 1040 + store.leads.length + 1;
    const leadId = `LD-${nextNum}`;

    // Conflict check
    const conflictCheck = data.pincode
      ? this.checkTerritoryConflict(data.pincode, data.franchiseId || "FR-CBE")
      : { hasConflict: false };

    const newLead: Lead = {
      _id: `lead-${Date.now()}`,
      leadId,
      customerName: data.customerName || "Prospective Client",
      companyName: data.companyName || "Industrial Partner",
      phone: data.phone || "",
      email: data.email || "",
      source: data.source || "Website",
      industry: data.industry || "Auto Components",
      state: data.state || "Tamil Nadu",
      district: data.district || "Coimbatore",
      pincode: data.pincode || "641001",
      productInterest: data.productInterest || "ARG-VMC-700",
      ownerId: data.ownerId || "usr-cbe-sales",
      ownerName: data.ownerName || "Karthik M",
      franchiseId: data.franchiseId || "FR-CBE",
      franchiseName: data.franchiseName || "Coimbatore Franchise",
      status: "New",
      nextFollowUpDate: data.nextFollowUpDate || new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
      territoryConflict: conflictCheck.hasConflict,
      conflictNotes: conflictCheck.hasConflict
        ? `PIN ${data.pincode} matches territory assigned to ${(conflictCheck as any).assignedTo}`
        : undefined,
      createdAt: new Date().toISOString().split("T")[0],
      notes: data.notes || "",
    };

    store.leads.unshift(newLead);
    return newLead;
  },

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const index = store.leads.findIndex((l) => l._id === id || l.leadId === id);
    if (index === -1) return null;
    store.leads[index] = { ...store.leads[index], ...updates };
    return store.leads[index];
  },

  convertLeadToOpportunity(leadId: string): Opportunity | null {
    const lead = this.getLeadById(leadId);
    if (!lead) return null;

    lead.status = "Converted";

    // Ensure customer exists
    let cust = store.customers.find((c) => c.companyName.toLowerCase() === lead.companyName.toLowerCase());
    if (!cust) {
      cust = {
        _id: `cust-${Date.now()}`,
        customerId: `CUST-${5000 + store.customers.length + 1}`,
        companyName: lead.companyName,
        contactPerson: lead.customerName,
        designation: "Key Decision Maker",
        email: lead.email,
        phone: lead.phone,
        industry: lead.industry,
        address: `${lead.district}, ${lead.state}`,
        district: lead.district,
        state: lead.state,
        pincode: lead.pincode,
        gstin: `33${Math.random().toString(36).substring(2, 7).toUpperCase()}1Z5`,
        franchiseId: lead.franchiseId,
        franchiseName: lead.franchiseName,
        lifetimeValue: 0,
        activeMachinesCount: 0,
        pendingTicketsCount: 0,
        nextRenewalDate: "-",
        notes: `Converted from lead ${lead.leadId}`,
      };
      store.customers.unshift(cust);
    }

    const prd = store.products.find((p) => p.sku === lead.productInterest);
    const expectedValue = prd ? prd.listPrice : 1850000;

    const opNum = 1020 + store.opportunities.length + 1;
    const newOp: Opportunity = {
      _id: `op-${Date.now()}`,
      opportunityId: `OP-${opNum}`,
      leadId: lead._id,
      customerId: cust._id,
      customerName: lead.customerName,
      companyName: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      franchiseId: lead.franchiseId,
      franchiseName: lead.franchiseName,
      stage: "Qualified",
      expectedValue,
      product: prd ? prd.name : lead.productInterest,
      requirementsNotes: `Customer interest in ${lead.productInterest}. Lead Notes: ${lead.notes || "None"}`,
      timeline: [
        { stage: "New Lead", date: lead.createdAt, completed: true, note: `Originated via ${lead.source}` },
        { stage: "Qualified", date: new Date().toISOString().split("T")[0], completed: true, note: "Converted to Opportunity" },
        { stage: "Demo", date: "Pending", completed: false },
        { stage: "Quotation", date: "Pending", completed: false },
        { stage: "PO Expected", date: "Pending", completed: false },
      ],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    store.opportunities.unshift(newOp);
    return newOp;
  },

  // OPPORTUNITIES
  getOpportunities(franchiseId?: string | null): Opportunity[] {
    if (!franchiseId) return store.opportunities;
    return store.opportunities.filter((o) => o.franchiseId === franchiseId);
  },

  getOpportunityById(id: string): Opportunity | undefined {
    return store.opportunities.find((o) => o._id === id || o.opportunityId === id);
  },

  updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | null {
    const idx = store.opportunities.findIndex((o) => o._id === id || o.opportunityId === id);
    if (idx === -1) return null;
    store.opportunities[idx] = { ...store.opportunities[idx], ...updates, updatedAt: new Date().toISOString().split("T")[0] };
    return store.opportunities[idx];
  },

  // QUOTATIONS & PRICE CONTROL
  getQuotations(franchiseId?: string | null): Quotation[] {
    if (!franchiseId) return store.quotations;
    return store.quotations.filter((q) => q.franchiseId === franchiseId);
  },

  getQuotationById(id: string): Quotation | undefined {
    return store.quotations.find((q) => q._id === id || q.quoteId === id);
  },

  createQuotation(data: any, createdBy: string): Quotation {
    const nextNum = 9200 + store.quotations.length + 1;
    const quoteId = `QT-${nextNum}`;

    let requiresSpecialApproval = false;
    let approvalReason = "";

    // Check discount & min selling price violations across all items
    for (const item of data.items || []) {
      const prd = store.products.find((p) => p.sku === item.sku);
      if (prd) {
        if (item.appliedDiscountPercent > prd.maxDiscountPercent || item.unitPrice < prd.minSellingPrice) {
          requiresSpecialApproval = true;
          approvalReason = data.approvalReason || `Discount of ${item.appliedDiscountPercent}% exceeds policy maximum of ${prd.maxDiscountPercent}% on ${item.sku}.`;
          break;
        }
      }
    }

    const subtotal = data.items.reduce((acc: number, i: any) => acc + (i.unitPrice * i.quantity), 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const installationTotal = data.items.reduce((acc: number, i: any) => acc + (i.installationCharge || 0), 0);
    const grandTotal = subtotal + taxAmount + installationTotal;

    const newQuote: Quotation = {
      _id: `qt-${Date.now()}`,
      quoteId,
      opportunityId: data.opportunityId || "OP-1023",
      customerId: data.customerId || "cust-1",
      customerName: data.customerName || "Sri Venkatesh Industries",
      companyName: data.companyName || "Sri Venkatesh Industries",
      franchiseId: data.franchiseId || "FR-CBE",
      franchiseName: data.franchiseName || "Coimbatore Franchise",
      version: 1,
      items: data.items,
      subtotal,
      totalDiscount: data.items.reduce((acc: number, i: any) => acc + ((i.listPrice - i.unitPrice) * i.quantity), 0),
      taxAmount,
      installationTotal,
      grandTotal,
      status: requiresSpecialApproval ? "Pending_Approval" : "Approved",
      requiresSpecialApproval,
      approvalReason: requiresSpecialApproval ? approvalReason : undefined,
      auditLogs: [
        {
          timestamp: new Date().toLocaleString("en-GB"),
          user: createdBy,
          action: requiresSpecialApproval ? "Special Price Approval Requested" : "Quotation Created & Auto-Approved",
          details: requiresSpecialApproval
            ? `Requested special pricing with reason: ${approvalReason}`
            : "All items within allowed discount limits.",
        },
      ],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    };

    store.quotations.unshift(newQuote);
    return newQuote;
  },

  approveQuotation(quoteId: string, approverName: string, remarks?: string): Quotation | null {
    const quote = this.getQuotationById(quoteId);
    if (!quote) return null;
    quote.status = "Approved";
    quote.specialApprovalBy = approverName;
    quote.specialApprovalDate = new Date().toLocaleString("en-GB");
    quote.auditLogs.unshift({
      timestamp: new Date().toLocaleString("en-GB"),
      user: approverName,
      action: "Special Price Approved",
      details: remarks || "Price override authorized by Head Office Super Admin.",
    });
    return quote;
  },

  rejectQuotation(quoteId: string, rejecterName: string, reason: string): Quotation | null {
    const quote = this.getQuotationById(quoteId);
    if (!quote) return null;
    quote.status = "Rejected";
    quote.rejectionReason = reason;
    quote.auditLogs.unshift({
      timestamp: new Date().toLocaleString("en-GB"),
      user: rejecterName,
      action: "Special Price Rejected",
      details: `Rejected by Head Office: ${reason}`,
    });
    return quote;
  },

  // ORDERS & PAYMENTS
  getOrders(franchiseId?: string | null): SalesOrder[] {
    if (!franchiseId) return store.orders;
    return store.orders.filter((o) => o.franchiseId === franchiseId);
  },

  getOrderById(id: string): SalesOrder | undefined {
    return store.orders.find((o) => o._id === id || o.orderId === id);
  },

  createOrderFromQuotation(quoteId: string, poData: { poNumber: string; poDate: string }): SalesOrder | null {
    const quote = this.getQuotationById(quoteId);
    if (!quote) return null;

    const orderNum = 1020 + store.orders.length + 1;
    const orderId = `SO-${orderNum}`;
    const orderValue = quote.grandTotal;

    const newOrder: SalesOrder = {
      _id: `so-${Date.now()}`,
      orderId,
      quoteId: quote.quoteId,
      opportunityId: quote.opportunityId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      companyName: quote.companyName,
      franchiseId: quote.franchiseId,
      franchiseName: quote.franchiseName,
      poNumber: poData.poNumber || `PO-${Math.floor(10000 + Math.random() * 90000)}`,
      poDate: poData.poDate || new Date().toISOString().split("T")[0],
      orderValue,
      orderStatus: "Confirmed",
      paymentSchedule: [
        {
          milestoneName: "Advance",
          percentage: 30,
          amount: Math.round(orderValue * 0.3),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          receivedAmount: 0,
          status: "Pending",
        },
        {
          milestoneName: "Before Dispatch",
          percentage: 60,
          amount: Math.round(orderValue * 0.6),
          dueDate: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
          receivedAmount: 0,
          status: "Pending",
        },
        {
          milestoneName: "Post Installation",
          percentage: 10,
          amount: Math.round(orderValue * 0.1),
          dueDate: new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
          receivedAmount: 0,
          status: "Pending",
        },
      ],
      createdAt: new Date().toISOString().split("T")[0],
    };

    store.orders.unshift(newOrder);

    // Create corresponding installation placeholder
    const insNum = 1020 + store.installations.length + 1;
    const newIns: Installation = {
      _id: `ins-${Date.now()}`,
      installationId: `INS-${insNum}`,
      orderId: newOrder.orderId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      companyName: quote.companyName,
      franchiseId: quote.franchiseId,
      machineSerial: `ARG-CNC-${newOrder.orderId}-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: quote.items[0]?.name || "ARGUS CNC Machine",
      assignedEngineerId: "usr-cbe-eng",
      assignedEngineerName: "Ramesh Kumar",
      scheduledDate: new Date(Date.now() + 28 * 86400000).toISOString().split("T")[0],
      checklist: {
        materialDelivered: false,
        preInstallCheck: false,
        machineInstalled: false,
        trainingCompleted: false,
        customerSignOff: false,
      },
      photos: [],
      trainingDetails: {
        traineesCount: 0,
        operatorsTrained: [],
        topicsCovered: [],
      },
      status: "Scheduled",
    };
    store.installations.unshift(newIns);

    return newOrder;
  },

  updateOrderMilestone(orderId: string, milestoneName: string, paymentData: { amount: number; ref: string }): SalesOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const milestone = order.paymentSchedule.find((m) => m.milestoneName === milestoneName);
    if (milestone) {
      milestone.receivedAmount = paymentData.amount;
      milestone.receivedDate = new Date().toISOString().split("T")[0];
      milestone.referenceNumber = paymentData.ref;
      milestone.status = "Received";
    }

    // Check if commission should be generated
    const totalReceived = order.paymentSchedule.reduce((acc, m) => acc + m.receivedAmount, 0);
    if (totalReceived > 0) {
      // Find or create commission
      let comm = store.commissions.find((c) => c.orderId === order.orderId);
      if (!comm) {
        comm = {
          _id: `comm-${Date.now()}`,
          commissionId: `COMM-${Math.floor(7000 + Math.random() * 2000)}`,
          franchiseId: order.franchiseId,
          franchiseName: order.franchiseName,
          orderId: order.orderId,
          customerName: order.companyName,
          eligibleRevenue: totalReceived,
          commissionRate: 8,
          calculatedAmount: Math.round(totalReceived * 0.08),
          status: "Calculated",
          createdAt: new Date().toISOString().split("T")[0],
        };
        store.commissions.unshift(comm);
      } else {
        comm.eligibleRevenue = totalReceived;
        comm.calculatedAmount = Math.round(totalReceived * (comm.commissionRate / 100));
      }
    }

    return order;
  },

  updateOrderStatus(orderId: string, status: SalesOrder["orderStatus"]): SalesOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;
    order.orderStatus = status;
    return order;
  },

  // INSTALLATIONS & TRAINING
  getInstallations(franchiseId?: string | null): Installation[] {
    if (!franchiseId) return store.installations;
    return store.installations.filter((i) => i.franchiseId === franchiseId);
  },

  getInstallationById(id: string): Installation | undefined {
    return store.installations.find((i) => i._id === id || i.installationId === id);
  },

  updateInstallation(id: string, updates: Partial<Installation>): Installation | null {
    const idx = store.installations.findIndex((i) => i._id === id || i.installationId === id);
    if (idx === -1) return null;
    store.installations[idx] = { ...store.installations[idx], ...updates };
    return store.installations[idx];
  },

  // SUPPORT TICKETS
  getSupportTickets(franchiseId?: string | null): SupportTicket[] {
    if (!franchiseId) return store.supportTickets;
    return store.supportTickets.filter((t) => t.franchiseId === franchiseId);
  },

  getSupportTicketById(id: string): SupportTicket | undefined {
    return store.supportTickets.find((t) => t._id === id || t.ticketId === id);
  },

  createSupportTicket(data: Partial<SupportTicket>): SupportTicket {
    const nextNum = 1050 + store.supportTickets.length + 1;
    const ticketId = `TK-${nextNum}`;

    const slaHours = data.priority === "Critical" ? 4 : data.priority === "High" ? 8 : 24;

    const newTicket: SupportTicket = {
      _id: `tk-${Date.now()}`,
      ticketId,
      customerId: data.customerId || "cust-1",
      customerName: data.customerName || "Customer Rep",
      companyName: data.companyName || "Sri Venkatesh Industries",
      franchiseId: data.franchiseId || "FR-CBE",
      machineSerial: data.machineSerial || "ARG-VMC-700-0382023",
      productName: data.productName || "ARGUS VMC-700",
      category: data.category || "Breakdown",
      priority: data.priority || "High",
      slaHoursTotal: slaHours,
      slaDeadline: new Date(Date.now() + slaHours * 3600000).toISOString(),
      slaBreached: false,
      assignedEngineerId: data.assignedEngineerId || "usr-cbe-eng",
      assignedEngineerName: data.assignedEngineerName || "Ramesh Kumar",
      status: "Open",
      issueDescription: data.issueDescription || "Unspecified issue",
      comments: [],
      createdAt: new Date().toLocaleString("en-GB"),
    };

    store.supportTickets.unshift(newTicket);
    return newTicket;
  },

  addTicketComment(ticketId: string, comment: { authorName: string; role: string; message: string }): SupportTicket | null {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) return null;
    ticket.comments.push({
      id: `c-${Date.now()}`,
      authorName: comment.authorName,
      role: comment.role,
      timestamp: new Date().toLocaleString("en-GB"),
      message: comment.message,
    });
    return ticket;
  },

  updateTicketStatus(ticketId: string, status: SupportTicket["status"], notes?: string): SupportTicket | null {
    const ticket = this.getSupportTicketById(ticketId);
    if (!ticket) return null;
    ticket.status = status;
    if (status === "Resolved" || status === "Closed") {
      ticket.resolutionNotes = notes || "Issue resolved and verified on site.";
      ticket.resolvedAt = new Date().toLocaleString("en-GB");
    }
    return ticket;
  },

  // RENEWALS
  getRenewals(franchiseId?: string | null): Renewal[] {
    if (!franchiseId) return store.renewals;
    return store.renewals.filter((r) => r.franchiseId === franchiseId);
  },

  triggerRenewalReminder(id: string, type: "60d" | "30d" | "15d" | "7d" | "Escalation", channel: "Email" | "WhatsApp" | "In-App"): Renewal | null {
    const renewal = store.renewals.find((r) => r._id === id || r.renewalId === id);
    if (!renewal) return null;
    renewal.remindersSent.push({
      type,
      sentAt: new Date().toLocaleString("en-GB"),
      channel,
    });
    return renewal;
  },

  // COMMISSIONS
  getCommissions(franchiseId?: string | null): CommissionRecord[] {
    if (!franchiseId) return store.commissions;
    return store.commissions.filter((c) => c.franchiseId === franchiseId);
  },

  updateCommissionStatus(id: string, status: CommissionRecord["status"], ref?: string): CommissionRecord | null {
    const comm = store.commissions.find((c) => c._id === id || c.commissionId === id);
    if (!comm) return null;
    comm.status = status;
    if (status === "Paid") {
      comm.paidDate = new Date().toISOString().split("T")[0];
      comm.paymentReference = ref || `NEFT-ARGUS-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    return comm;
  },

  // CUSTOMERS
  getCustomers(franchiseId?: string | null): CustomerProfile[] {
    if (!franchiseId) return store.customers;
    return store.customers.filter((c) => c.franchiseId === franchiseId);
  },

  getCustomerById(id: string): CustomerProfile | undefined {
    return store.customers.find((c) => c._id === id || c.customerId === id);
  },

  // DASHBOARD KPIS & ANALYTICS
  getFranchiseDashboardKPIs(franchiseId: string) {
    const leads = store.leads.filter((l) => l.franchiseId === franchiseId);
    const opps = store.opportunities.filter((o) => o.franchiseId === franchiseId);
    const quotes = store.quotations.filter((q) => q.franchiseId === franchiseId);
    const orders = store.orders.filter((o) => o.franchiseId === franchiseId);
    const installations = store.installations.filter((i) => i.franchiseId === franchiseId);
    const renewals = store.renewals.filter((r) => r.franchiseId === franchiseId);
    const commissions = store.commissions.filter((c) => c.franchiseId === franchiseId);

    const newLeadsCount = leads.length;
    const qualifiedCount = leads.filter((l) => l.status === "Qualified" || l.status === "Converted").length;
    const demosCount = opps.filter((o) => o.demo && o.demo.status === "Completed").length;
    const quoteTotal = quotes.reduce((acc, q) => acc + q.grandTotal, 0);
    const poReceivedValue = orders.reduce((acc, o) => acc + o.orderValue, 0);

    const paymentPending = orders.reduce((acc, o) => {
      const rec = o.paymentSchedule.reduce((p, m) => p + m.receivedAmount, 0);
      return acc + (o.orderValue - rec);
    }, 0);

    const pendingInstallations = installations.filter((i) => i.status !== "Completed").length;
    const renewalsMonthValue = renewals.reduce((acc, r) => acc + r.contractValue, 0);
    const earnedCommission = commissions.reduce((acc, c) => acc + c.calculatedAmount, 0);

    return {
      newLeads: { count: newLeadsCount, trend: "+25%" },
      qualified: { count: qualifiedCount, trend: "+14%" },
      demos: { count: demosCount, trend: "+15%" },
      quotationValue: { value: quoteTotal, formatted: `₹${(quoteTotal / 100000).toFixed(1)} L`, trend: "+10%" },
      poReceived: { value: poReceivedValue, formatted: `₹${(poReceivedValue / 100000).toFixed(1)} L`, trend: "+21%" },
      paymentPending: { value: paymentPending, formatted: `₹${(paymentPending / 100000).toFixed(1)} L` },
      installationsPending: { count: pendingInstallations },
      renewalsDue: { value: renewalsMonthValue, formatted: `₹${renewalsMonthValue.toLocaleString("en-IN")}` },
      commission: { value: earnedCommission, formatted: `₹${(earnedCommission / 100000).toFixed(2)} L` },
      pipelineFunnel: [
        { stage: "Leads", count: newLeadsCount, fill: "#FF6600" },
        { stage: "Qualified", count: qualifiedCount, fill: "#FF8533" },
        { stage: "Demos", count: demosCount || 12, fill: "#FFA366" },
        { stage: "Quotation", count: quotes.length, fill: "#293033" },
        { stage: "PO Expected", count: orders.length, fill: "#10B981" },
      ],
      salesTrend: [
        { month: "Aug", hardware: 14.5, software: 1.8, spares: 1.2 },
        { month: "Sep", hardware: 16.2, software: 2.1, spares: 1.4 },
        { month: "Oct", hardware: 18.0, software: 2.5, spares: 1.8 },
        { month: "Nov", hardware: 21.4, software: 3.0, spares: 2.2 },
        { month: "Dec", hardware: 24.8, software: 3.5, spares: 2.8 },
      ],
    };
  },

  getHeadOfficeDashboardKPIs() {
    const totalFranchises = store.franchises.length;
    const totalLeads = store.leads.length * 10 + 28; // Scaled for consolidated multi-franchise representation
    const totalOpps = store.opportunities.length * 8 + 42;
    const totalSales = store.franchises.reduce((acc, f) => acc + f.achievedSales, 0);
    const totalCollections = store.franchises.reduce((acc, f) => acc + f.collections, 0);
    const pendingPayments = totalSales - totalCollections;
    const installationsPending = 67;
    const activeTickets = store.supportTickets.length * 15 + 14;
    const renewalsDue = store.renewals.reduce((acc, r) => acc + r.contractValue, 0) * 12;

    const franchiseSalesBreakdown = store.franchises.map((f) => ({
      name: f.name.replace(" Franchise", ""),
      code: f.code,
      leads: 38,
      quotations: 12,
      salesLakhs: (f.achievedSales / 100000).toFixed(1),
      rate: "78%",
    }));

    const categoryBreakdown = [
      { category: "CNC Machines & Accessories", percent: 58, color: "#FF6600" },
      { category: "CAM Software & Licenses", percent: 18, color: "#293033" },
      { category: "AMC & Service Contracts", percent: 14, color: "#10B981" },
      { category: "Tooling & Spare Parts", percent: 10, color: "#6366F1" },
    ];

    const alerts = [
      {
        id: "alt-1",
        type: "special_approval",
        title: "Special Price Approval Required",
        desc: "QT-9204: Apex Tooling Solutions requested 15% discount (Max allowed: 10%). Requires HO Approval.",
        link: "/quotations/QT-9204",
        severity: "critical",
      },
      {
        id: "alt-2",
        type: "territory_conflict",
        title: "Territory Boundary Conflict",
        desc: "Lead LD-1043 (Rajesh Hi-Tech Valves, PIN 641601) overlaps Coimbatore and Salem borders.",
        link: "/leads",
        severity: "warning",
      },
      {
        id: "alt-3",
        type: "sla_warning",
        title: "Critical Support SLA Alert",
        desc: "TK-1056: Sri Venkatesh Industries Spindle E-04 error (Critical 4h SLA deadline in 2 hours).",
        link: "/support",
        severity: "critical",
      },
    ];

    return {
      totalFranchises,
      totalLeads,
      totalOpps,
      totalSales: `₹${(totalSales / 100000).toFixed(1)} L`,
      pendingPayments: `₹${(pendingPayments / 100000).toFixed(1)} L`,
      installationsPending,
      activeTickets,
      renewalsDue: `₹${(renewalsDue / 100000).toFixed(1)} L`,
      franchiseSalesBreakdown,
      categoryBreakdown,
      alerts,
    };
  },
};
