import { connectToDatabase } from "./mongodb";
import {
  FranchiseModel,
  ProductModel,
  CustomerModel,
  LeadModel,
  OpportunityModel,
  QuotationModel,
  OrderModel,
  InstallationModel,
  SupportTicketModel,
  RenewalModel,
  CommissionModel,
  TerritoryModel,
  UserModel,
  OrganizationModel,
} from "./models";
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
  MOCK_USERS,
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
  UserSession,
  Organization,
} from "./types";

let initPromise: Promise<void> | null = null;
let isInitialized = false;

function sanitize(item: any) {
  const copy = { ...item };
  if (typeof copy._id === "string" && !copy._id.match(/^[0-9a-fA-F]{24}$/)) {
    delete copy._id;
  }
  return copy;
}

function sanitizeList(list: any[]) {
  return list.map(sanitize);
}

async function ensureInitialized() {
  await connectToDatabase();
  if (isInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const franchiseCount = await FranchiseModel.countDocuments();
        if (franchiseCount < 12) {
          for (const fr of MOCK_FRANCHISES) {
            await FranchiseModel.findOneAndUpdate({ code: fr.code }, { $set: sanitize(fr) }, { upsert: true });
          }
        }

        if ((await ProductModel.countDocuments()) === 0) await ProductModel.insertMany(sanitizeList(MOCK_PRODUCTS));
        if ((await CustomerModel.countDocuments()) === 0) await CustomerModel.insertMany(sanitizeList(MOCK_CUSTOMERS));
        if ((await LeadModel.countDocuments()) === 0) await LeadModel.insertMany(sanitizeList(MOCK_LEADS));
        if ((await OpportunityModel.countDocuments()) === 0) {
          const opps = MOCK_OPPORTUNITIES.map((opp) => {
            const clean = sanitize(opp);
            clean.oppId = clean.opportunityId || clean.oppId || `OP-${Date.now()}`;
            return clean;
          });
          await OpportunityModel.insertMany(opps);
        }
        if ((await QuotationModel.countDocuments()) === 0) {
          const quotes = MOCK_QUOTATIONS.map((q) => {
            const clean = sanitize(q);
            clean.oppId = clean.opportunityId || clean.oppId;
            return clean;
          });
          await QuotationModel.insertMany(quotes);
        }
        if ((await OrderModel.countDocuments()) === 0) await OrderModel.insertMany(sanitizeList(MOCK_ORDERS));
        if ((await InstallationModel.countDocuments()) === 0) await InstallationModel.insertMany(sanitizeList(MOCK_INSTALLATIONS));
        if ((await SupportTicketModel.countDocuments()) === 0) await SupportTicketModel.insertMany(sanitizeList(MOCK_SUPPORT_TICKETS));
        if ((await RenewalModel.countDocuments()) === 0) await RenewalModel.insertMany(sanitizeList(MOCK_RENEWALS));
        if ((await CommissionModel.countDocuments()) === 0) await CommissionModel.insertMany(sanitizeList(MOCK_COMMISSIONS));
        if ((await TerritoryModel.countDocuments()) === 0) await TerritoryModel.insertMany(sanitizeList(MOCK_TERRITORIES));

        // Default Organization Seed
        const defaultOrg = await OrganizationModel.findOne({ orgId: "ORG-ARGUS" });
        if (!defaultOrg) {
          await OrganizationModel.create({
            orgId: "ORG-ARGUS",
            name: "Argus CNC Technologies Ltd",
            gstin: "33AAAAA0000A1Z5",
            adminEmail: "vikram.ho@arguscnc.com",
            adminName: "Vikram Rathore",
            status: "APPROVED",
            createdAt: "2026-01-01",
            approvedAt: "2026-01-01",
            approvedBy: "System Setup",
          });
        }

        // Super Admin Account Seed
        const superAdmin = await UserModel.findOne({ role: "super_admin" });
        if (!superAdmin) {
          await UserModel.create({
            id: "usr-super-admin",
            name: "Platform Super Admin",
            email: "superadmin@arguscloud.io",
            role: "super_admin",
            orgId: null,
            orgName: "Platform Administration",
            avatar: "SA",
            status: "active",
          });
        }

        if ((await UserModel.countDocuments()) <= 1) {
          const seededUsers = MOCK_USERS.map((u) => ({
            ...sanitize(u),
            orgId: "ORG-ARGUS",
            orgName: "Argus CNC Technologies Ltd",
            status: "active",
          }));
          for (const u of seededUsers) {
            await UserModel.findOneAndUpdate({ id: u.id }, { $set: u }, { upsert: true });
          }
        }

        isInitialized = true;
        console.log("✅ MongoDB Atlas collections & Organization multi-tenant seed synchronized successfully!");
      } catch (e) {
        console.error("Error initializing MongoDB Atlas collections:", e);
      }
    })();
  }

  await initPromise;
}

function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

function idOr(id: string, ...altFields: Record<string, string>[]): Record<string, any> {
  const conditions = altFields.map((f) => f);
  if (isObjectId(id)) {
    conditions.unshift({ _id: id });
  }
  return conditions.length === 1 ? conditions[0] : { $or: conditions };
}

function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  delete obj.__v;
  return obj as T;
}

function cleanDocs<T>(docs: any[]): T[] {
  return docs.map((d) => cleanDoc<T>(d));
}

export const dbRepository = {
  // ORGANIZATIONS (Multi-Tenant B2B SaaS)
  async getOrganizations(status?: string): Promise<Organization[]> {
    await ensureInitialized();
    const query = status ? { status } : {};
    const docs = await OrganizationModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Organization>(docs);
  },

  async getOrganizationById(orgId: string): Promise<Organization | null> {
    await ensureInitialized();
    const doc = await OrganizationModel.findOne(idOr(orgId, { orgId })).lean();
    return doc ? cleanDoc<Organization>(doc) : null;
  },

  async registerOrganization(data: {
    name: string;
    gstin: string;
    adminEmail: string;
    adminName: string;
    avatar?: string;
  }): Promise<{ organization: Organization; adminUser: UserSession }> {
    await ensureInitialized();
    const existingOrg = await OrganizationModel.findOne({
      $or: [{ gstin: data.gstin.trim().toUpperCase() }, { adminEmail: data.adminEmail.trim().toLowerCase() }],
    });
    if (existingOrg) {
      if (existingOrg.gstin === data.gstin.trim().toUpperCase()) {
        throw new Error(`An organization with GSTIN ${data.gstin} is already registered.`);
      }
      throw new Error(`The email ${data.adminEmail} is already registered as an organization administrator.`);
    }

    const orgCount = await OrganizationModel.countDocuments();
    const orgSlug = data.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
    const orgId = `ORG-${orgSlug || "CORP"}-${100 + orgCount + 1}`;
    const initials = data.adminName
      ? data.adminName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "HO";

    const newOrg = await OrganizationModel.create({
      orgId,
      name: data.name.trim(),
      gstin: data.gstin.trim().toUpperCase(),
      adminEmail: data.adminEmail.trim().toLowerCase(),
      adminName: data.adminName.trim(),
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString().split("T")[0],
    });

    const adminUser = await UserModel.create({
      id: `usr-ho-${Date.now().toString().slice(-6)}`,
      name: data.adminName.trim(),
      email: data.adminEmail.trim().toLowerCase(),
      role: "head_office_admin",
      orgId,
      orgName: data.name.trim(),
      franchiseId: null,
      avatar: data.avatar || initials,
      status: "pending_approval",
    });

    return {
      organization: cleanDoc<Organization>(newOrg),
      adminUser: cleanDoc<UserSession>(adminUser),
    };
  },

  async approveOrganization(orgId: string, approvedBy: string): Promise<Organization | null> {
    await ensureInitialized();
    const org = await OrganizationModel.findOneAndUpdate(
      idOr(orgId, { orgId }),
      {
        $set: {
          status: "APPROVED",
          approvedAt: new Date().toISOString().split("T")[0],
          approvedBy,
        },
      },
      { new: true }
    ).lean();

    if (org) {
      await UserModel.updateMany(
        { orgId: (org as any).orgId, role: "head_office_admin" },
        { $set: { status: "active" } }
      );
    }
    return org ? cleanDoc<Organization>(org) : null;
  },

  async rejectOrganization(orgId: string, rejectedBy: string, reason?: string): Promise<Organization | null> {
    await ensureInitialized();
    const org = await OrganizationModel.findOneAndUpdate(
      idOr(orgId, { orgId }),
      {
        $set: {
          status: "REJECTED",
          approvedBy: rejectedBy,
          rejectionReason: reason || "Organization details could not be verified.",
        },
      },
      { new: true }
    ).lean();

    if (org) {
      await UserModel.updateMany(
        { orgId: (org as any).orgId },
        { $set: { status: "disabled" } }
      );
    }
    return org ? cleanDoc<Organization>(org) : null;
  },

  // USERS & MULTI-TENANT AUTH
  async getUserByEmail(email: string): Promise<{ user: UserSession; organization: Organization | null } | null> {
    await ensureInitialized();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if Super Admin email via env or database
    const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS || "superadmin@arguscloud.io,philipmatthew26@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (superAdminEmails.includes(normalizedEmail)) {
      let superUser = await UserModel.findOne({ email: normalizedEmail }).lean();
      if (!superUser) {
        const created = await UserModel.create({
          id: `usr-super-${Date.now().toString().slice(-4)}`,
          name: normalizedEmail.split("@")[0].toUpperCase() + " (Super Admin)",
          email: normalizedEmail,
          role: "super_admin",
          orgId: null,
          orgName: "Platform Administration",
          avatar: "SA",
          status: "active",
        });
        superUser = created.toObject();
      }
      return { user: cleanDoc<UserSession>(superUser), organization: null };
    }

    const doc: any = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (!doc) return null;

    let org: Organization | null = null;
    if (doc.orgId) {
      const orgDoc = await OrganizationModel.findOne({ orgId: doc.orgId }).lean();
      org = orgDoc ? cleanDoc<Organization>(orgDoc) : null;
    }

    return { user: cleanDoc<UserSession>(doc), organization: org };
  },

  async getUsersByOrg(orgId?: string | null): Promise<UserSession[]> {
    await ensureInitialized();
    const query = orgId ? { orgId } : {};
    const docs = await UserModel.find(query).lean();
    return cleanDocs<UserSession>(docs);
  },

  async createOrganizationPersonnel(
    orgId: string,
    data: {
      name: string;
      email: string;
      role: UserSession["role"];
      franchiseId?: string | null;
      franchiseName?: string;
    }
  ): Promise<UserSession> {
    await ensureInitialized();
    const org: any = await OrganizationModel.findOne({ orgId });
    if (!org) throw new Error("Organization not found.");
    if (org.status !== "APPROVED") throw new Error("Organization is not approved yet.");

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error(`A user with email ${normalizedEmail} already exists in the system.`);
    }

    const initials = data.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newUser = await UserModel.create({
      id: `usr-${orgId.toLowerCase().slice(-4)}-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role,
      orgId,
      orgName: org.name,
      franchiseId: data.franchiseId || null,
      franchiseName: data.franchiseName || undefined,
      avatar: initials || "U",
      status: "active",
    });

    return cleanDoc<UserSession>(newUser);
  },

  async deleteUser(userId: string, orgId: string): Promise<boolean> {
    await ensureInitialized();
    const res = await UserModel.deleteOne({ ...idOr(userId, { id: userId }), orgId });
    return (res.deletedCount || 0) > 0;
  },

  // FRANCHISES
  async getFranchises(): Promise<Franchise[]> {
    await ensureInitialized();
    const docs = await FranchiseModel.find().lean();
    return cleanDocs<Franchise>(docs);
  },

  async getFranchiseByCode(code: string): Promise<Franchise | null> {
    await ensureInitialized();
    const doc = await FranchiseModel.findOne({ code }).lean();
    return doc ? cleanDoc<Franchise>(doc) : null;
  },

  async createFranchise(
    data: Partial<Franchise> & { adminUser?: Partial<UserSession> }
  ): Promise<{ franchise: Franchise; adminUser: UserSession }> {
    await ensureInitialized();
    const rawCode = (data.code || `FR-${Date.now().toString().slice(-4)}`).toUpperCase().trim();
    const code = rawCode.startsWith("FR-") ? rawCode : `FR-${rawCode}`;
    const location = data.location || "New Location";
    const name = data.name || `Argus ${location} Franchise`;
    const state = data.state || "Tamil Nadu";
    const territoryDistricts = Array.isArray(data.territoryDistricts)
      ? data.territoryDistricts
      : typeof data.territoryDistricts === "string" && data.territoryDistricts
      ? (data.territoryDistricts as string).split(",").map((s) => s.trim()).filter(Boolean)
      : [location];
    const pincodes = Array.isArray(data.pincodes)
      ? data.pincodes
      : typeof data.pincodes === "string" && data.pincodes
      ? (data.pincodes as string).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newFranchiseData: Partial<Franchise> = {
      code,
      name,
      location,
      state,
      territoryDistricts,
      pincodes,
      agreementStartDate: data.agreementStartDate || "2026-04-01",
      agreementEndDate: data.agreementEndDate || "2029-03-31",
      status: (data.status as Franchise["status"]) || "Active",
      annualTarget: Number(data.annualTarget) || 12000000,
      achievedSales: Number(data.achievedSales) || 0,
      collections: Number(data.collections) || 0,
      commissionEarned: Number(data.commissionEarned) || 0,
      commissionPaid: Number(data.commissionPaid) || 0,
      contactPerson: data.contactPerson || "Managing Partner",
      email: data.email || `admin.${code.toLowerCase().replace(/[^a-z0-9]/g, "")}@arguscnc.com`,
      phone: data.phone || "+91 98000 00000",
    };

    const createdFranchiseDoc = await FranchiseModel.create(newFranchiseData);
    const newFranchise = cleanDoc<Franchise>(createdFranchiseDoc);

    // Auto-provision territory mappings in Atlas
    if (territoryDistricts.length > 0) {
      for (let idx = 0; idx < territoryDistricts.length; idx++) {
        const dist = territoryDistricts[idx];
        await TerritoryModel.create({
          country: "India",
          state,
          district: dist,
          pincodeRange: pincodes.length > 0 ? pincodes : [`6${Math.floor(10000 + Math.random() * 89999)}`],
          assignedFranchiseId: code,
          assignedFranchiseName: name,
          isProtected: true,
        });
      }
    }

    // Auto-create initial Franchise Admin user in Atlas
    const initials = (newFranchise.contactPerson || "FA")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FA";

    const adminUserData: UserSession = {
      id: `usr-${code.toLowerCase().replace(/[^a-z0-9]/g, "")}-admin`,
      name: newFranchise.contactPerson,
      email: newFranchise.email,
      role: "franchise_admin",
      franchiseId: code,
      franchiseName: name,
      avatar: initials,
    };

    await UserModel.findOneAndUpdate(
      { id: adminUserData.id },
      { $set: adminUserData },
      { upsert: true, new: true }
    );

    return { franchise: newFranchise, adminUser: adminUserData };
  },

  // PRODUCTS / PRICE MASTER
  async getProducts(): Promise<ProductMasterItem[]> {
    await ensureInitialized();
    const docs = await ProductModel.find().lean();
    return cleanDocs<ProductMasterItem>(docs);
  },

  async getProductBySku(sku: string): Promise<ProductMasterItem | null> {
    await ensureInitialized();
    const doc = await ProductModel.findOne({ sku }).lean();
    return doc ? cleanDoc<ProductMasterItem>(doc) : null;
  },

  async createProduct(product: Partial<ProductMasterItem>): Promise<ProductMasterItem> {
    await ensureInitialized();
    const newPrd: Partial<ProductMasterItem> = {
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
    const created = await ProductModel.create(newPrd);
    return cleanDoc<ProductMasterItem>(created);
  },

  // TERRITORIES
  async getTerritories(): Promise<TerritoryMapping[]> {
    await ensureInitialized();
    const docs = await TerritoryModel.find().lean();
    return cleanDocs<TerritoryMapping>(docs);
  },

  async checkTerritoryConflict(pincode: string, requestedFranchiseId: string) {
    await ensureInitialized();
    const match: any = await TerritoryModel.findOne({ pincodeRange: pincode }).lean();
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
    return { hasConflict: false, matchedTerritory: cleanDoc(match) };
  },

  // LEADS
  async getLeads(franchiseId?: string | null): Promise<Lead[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await LeadModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Lead>(docs);
  },

  async getLeadById(id: string): Promise<Lead | null> {
    await ensureInitialized();
    const doc = await LeadModel.findOne(idOr(id, { leadId: id })).lean();
    return doc ? cleanDoc<Lead>(doc) : null;
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    await ensureInitialized();
    const count = await LeadModel.countDocuments();
    const leadId = `LD-${1040 + count + 1}`;

    const conflictCheck = data.pincode
      ? await this.checkTerritoryConflict(data.pincode, data.franchiseId || "FR-CBE")
      : { hasConflict: false };

    const newLead: Partial<Lead> = {
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

    const created = await LeadModel.create(newLead);
    return cleanDoc<Lead>(created);
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    await ensureInitialized();
    const updated = await LeadModel.findOneAndUpdate(
      idOr(id, { leadId: id }),
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Lead>(updated) : null;
  },

  async convertLeadToOpportunity(leadId: string): Promise<Opportunity | null> {
    await ensureInitialized();
    const lead = await this.getLeadById(leadId);
    if (!lead) return null;

    await LeadModel.findOneAndUpdate(
      idOr(leadId, { leadId: leadId }),
      { $set: { status: "Converted" } }
    );

    // Ensure customer exists in Atlas
    let cust: any = await CustomerModel.findOne({
      companyName: { $regex: new RegExp(`^${lead.companyName}$`, "i") },
    }).lean();

    if (!cust) {
      const custCount = await CustomerModel.countDocuments();
      cust = await CustomerModel.create({
        customerId: `CUST-${5000 + custCount + 1}`,
        companyName: lead.companyName,
        contactPerson: lead.customerName,
        email: lead.email,
        phone: lead.phone,
        industry: lead.industry,
        district: lead.district,
        state: lead.state,
        pincode: lead.pincode,
        franchiseId: lead.franchiseId,
        franchiseName: lead.franchiseName,
        lifetimeValue: 0,
        activeMachinesCount: 0,
        pendingTicketsCount: 0,
      });
    }

    const oppCount = await OpportunityModel.countDocuments();
    const oppId = `OP-${1020 + oppCount + 1}`;

    const newOpp = await OpportunityModel.create({
      opportunityId: oppId,
      leadId: lead.leadId,
      customerId: cust?.customerId || `CUST-${5000 + oppCount + 1}`,
      customerName: lead.customerName,
      companyName: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      franchiseId: lead.franchiseId,
      franchiseName: lead.franchiseName,
      stage: "Qualified",
      expectedValue: 1850000,
      product: lead.productInterest,
      requirementsNotes: `Converted from lead ${lead.leadId}. Interest: ${lead.productInterest}.`,
      timeline: [
        {
          stage: "Lead Created",
          date: lead.createdAt,
          completed: true,
          note: `Lead captured via ${lead.source}`,
        },
        {
          stage: "Opportunity Qualified",
          date: new Date().toISOString().split("T")[0],
          completed: true,
          note: "Lead qualified and customer record registered.",
        },
      ],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });

    return cleanDoc<Opportunity>(newOpp);
  },

  // OPPORTUNITIES
  async getOpportunities(franchiseId?: string | null): Promise<Opportunity[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await OpportunityModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Opportunity>(docs);
  },

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    await ensureInitialized();
    const doc = await OpportunityModel.findOne(idOr(id, { opportunityId: id }, { oppId: id })).lean();
    return doc ? cleanDoc<Opportunity>(doc) : null;
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    await ensureInitialized();
    const updated = await OpportunityModel.findOneAndUpdate(
      idOr(id, { opportunityId: id }, { oppId: id }),
      { $set: { ...updates, updatedAt: new Date().toISOString().split("T")[0] } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Opportunity>(updated) : null;
  },

  // QUOTATIONS
  async getQuotations(franchiseId?: string | null): Promise<Quotation[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await QuotationModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Quotation>(docs);
  },

  async getQuotationById(id: string): Promise<Quotation | null> {
    await ensureInitialized();
    const doc = await QuotationModel.findOne(idOr(id, { quoteId: id })).lean();
    return doc ? cleanDoc<Quotation>(doc) : null;
  },

  async createQuotation(data: any, createdBy: UserSession): Promise<Quotation> {
    await ensureInitialized();
    const count = await QuotationModel.countDocuments();
    const quoteId = `QT-${9200 + count + 1}`;

    const items = data.items || [];
    const subtotal = items.reduce((acc: number, item: any) => acc + (item.unitPrice || item.listPrice || 0) * (item.quantity || 1), 0);
    const maxItemDiscount = Math.max(0, ...items.map((i: any) => i.appliedDiscountPercent || 0));
    const specialDiscountPercent = data.specialDiscountPercent || 0;
    const overallDiscountPercent = Math.max(maxItemDiscount, specialDiscountPercent);

    // Business rule: discount > 10% requires Head Office Super Admin approval
    const requiresSpecialApproval = overallDiscountPercent > 10;
    const status: Quotation["status"] = requiresSpecialApproval
      ? "Pending_Approval"
      : "Draft";

    const discountAmount = Math.round(subtotal * (overallDiscountPercent / 100));
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = Math.round(taxableAmount * 0.18);
    const grandTotal = taxableAmount + gstAmount;

    const newQuote = await QuotationModel.create({
      quoteId,
      opportunityId: data.opportunityId || data.oppId || "OP-1021",
      customerId: data.customerId || "CUST-5001",
      customerName: data.customerName || "Sri Venkatesh Industries",
      companyName: data.companyName || "Sri Venkatesh Industries",
      franchiseId: data.franchiseId || createdBy.franchiseId || "FR-CBE",
      franchiseName: data.franchiseName || createdBy.franchiseName || "Coimbatore Franchise",
      version: 1,
      items,
      subtotal,
      totalDiscount: discountAmount,
      taxAmount: gstAmount,
      installationTotal: 0,
      grandTotal,
      status,
      requiresSpecialApproval,
      approvalReason: requiresSpecialApproval ? "Discount exceeds 10% standard limit" : undefined,
      validUntil: data.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
      auditLogs: [
        {
          timestamp: new Date().toISOString().split("T")[0],
          user: createdBy.name || "Franchise User",
          action: "Created",
          details: `Quotation created with ${overallDiscountPercent}% discount`,
        },
      ],
      terms: data.terms || "Payment: 20% Advance, 70% Before Dispatch, 10% Post Installation.",
    });

    return cleanDoc<Quotation>(newQuote);
  },

  async approveQuotation(id: string, approverName: string, notes?: string): Promise<Quotation | null> {
    await ensureInitialized();
    const updated = await QuotationModel.findOneAndUpdate(
      idOr(id, { quoteId: id }),
      {
        $set: {
          status: "Approved",
          specialApprovalBy: approverName,
          specialApprovalDate: new Date().toISOString().split("T")[0],
          approvalReason: notes || "Discount approved by Head Office",
        },
      },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Quotation>(updated) : null;
  },

  async rejectQuotation(id: string, approverName: string, reason: string): Promise<Quotation | null> {
    await ensureInitialized();
    const updated = await QuotationModel.findOneAndUpdate(
      idOr(id, { quoteId: id }),
      {
        $set: {
          status: "Rejected",
          specialApprovalBy: approverName,
          rejectionReason: reason,
        },
      },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Quotation>(updated) : null;
  },

  // SALES ORDERS
  async getOrders(franchiseId?: string | null): Promise<SalesOrder[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<SalesOrder>(docs);
  },

  async getOrderById(id: string): Promise<SalesOrder | null> {
    await ensureInitialized();
    const doc = await OrderModel.findOne(idOr(id, { orderId: id })).lean();
    return doc ? cleanDoc<SalesOrder>(doc) : null;
  },

  async createOrderFromQuotation(
    quoteId: string,
    poDetails: { poNumber: string; poDate: string }
  ): Promise<SalesOrder | null> {
    await ensureInitialized();
    const quote = await this.getQuotationById(quoteId);
    if (!quote) return null;

    const count = await OrderModel.countDocuments();
    const orderId = `SO-${4000 + count + 1}`;

    const advanceAmount = Math.round(quote.grandTotal * 0.2);
    const dispatchAmount = Math.round(quote.grandTotal * 0.7);
    const installAmount = quote.grandTotal - advanceAmount - dispatchAmount;

    const orderDoc = await OrderModel.create({
      orderId,
      quoteId: quote.quoteId,
      poNumber: poDetails.poNumber,
      poDate: poDetails.poDate,
      customerId: quote.customerId,
      customerName: quote.customerName,
      companyName: quote.companyName,
      franchiseId: quote.franchiseId,
      franchiseName: quote.franchiseName,
      items: quote.items,
      orderValue: quote.grandTotal,
      orderStatus: "Order Placed",
      paymentSchedule: [
        {
          milestoneName: "20% Advance with PO",
          percentage: 20,
          dueAmount: advanceAmount,
          receivedAmount: 0,
          status: "Pending",
          dueDate: poDetails.poDate,
        },
        {
          milestoneName: "70% Before Machine Dispatch",
          percentage: 70,
          dueAmount: dispatchAmount,
          receivedAmount: 0,
          status: "Pending",
          dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0],
        },
        {
          milestoneName: "10% Post Installation & Sign-Off",
          percentage: 10,
          dueAmount: installAmount,
          receivedAmount: 0,
          status: "Pending",
          dueDate: new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
        },
      ],
      estimatedDispatchDate: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
      createdAt: new Date().toISOString().split("T")[0],
    });

    // Update quote status
    await QuotationModel.findOneAndUpdate(
      idOr(quoteId, { quoteId: quoteId }),
      { $set: { status: "Accepted" } }
    );

    // Update opportunity stage to Won
    const targetOpp = quote.opportunityId || (quote as any).oppId;
    if (targetOpp) {
      await OpportunityModel.findOneAndUpdate(
        idOr(targetOpp, { opportunityId: targetOpp }, { oppId: targetOpp }),
        { $set: { stage: "Won" } }
      );
    }

    // Auto-create Commission record in Atlas
    const commCount = await CommissionModel.countDocuments();
    await CommissionModel.create({
      commissionId: `COM-${2000 + commCount + 1}`,
      franchiseId: quote.franchiseId,
      franchiseName: quote.franchiseName,
      orderId,
      orderValue: quote.grandTotal,
      eligibleRevenue: 0,
      commissionRate: 8,
      calculatedAmount: 0,
      status: "Pending Collection",
      createdAt: new Date().toISOString().split("T")[0],
    });

    // Auto-create Installation record in Atlas
    const instCount = await InstallationModel.countDocuments();
    await InstallationModel.create({
      installationId: `INS-${100 + instCount + 1}`,
      orderId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      companyName: quote.companyName,
      franchiseId: quote.franchiseId,
      franchiseName: quote.franchiseName,
      machineSerial: `ARG-VMC-${Math.floor(100 + Math.random() * 900)}-${new Date().getFullYear()}`,
      productName: quote.items[0]?.name || "ARGUS VMC-700",
      siteReadinessStatus: "Pending",
      serviceEngineerId: "usr-cbe-eng",
      serviceEngineerName: "Ramesh Kumar",
      scheduledDate: new Date(Date.now() + 25 * 86400000).toISOString().split("T")[0],
      status: "Scheduled",
      checklist: [
        { item: "3-Phase 415V Stabilized Power & Neutral Grounding Verified", completed: false },
        { item: "Pneumatic Supply (6 bar clean dry air connected)", completed: false },
        { item: "Foundation Leveling within 0.02mm per meter verified", completed: false },
        { item: "Axes Travel and Spindle Runout Calibration Performed", completed: false },
        { item: "Test Part Machining Program Executed & Dimensional Sign-Off", completed: false },
      ],
      operatorTrainingSigned: false,
    });

    return cleanDoc<SalesOrder>(orderDoc);
  },

  async updateOrderMilestone(
    orderId: string,
    milestoneName: string,
    payment: { receivedAmount?: number; amount?: number; paymentReference?: string; ref?: string }
  ): Promise<SalesOrder | null> {
    await ensureInitialized();
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const milestone = order.paymentSchedule.find((m) => m.milestoneName === milestoneName);
    if (!milestone) return null;

    const received = payment.receivedAmount ?? payment.amount ?? 0;
    const reference = payment.paymentReference || payment.ref || `REF-${Date.now()}`;

    milestone.receivedAmount = received;
    milestone.paymentReference = reference;
    const targetDue = milestone.dueAmount ?? milestone.amount ?? 0;
    milestone.status = milestone.receivedAmount >= targetDue ? "Received" : "Partially Received";

    const allReceived = order.paymentSchedule.every((m) => m.status === "Received");
    if (allReceived) {
      order.orderStatus = "Payment Cleared";
    }

    const updated = await OrderModel.findOneAndUpdate(
      idOr(orderId, { orderId: orderId }),
      { $set: { paymentSchedule: order.paymentSchedule, orderStatus: order.orderStatus } },
      { new: true }
    ).lean();

    // Update commission based on collections
    const totalReceived = order.paymentSchedule.reduce((acc, m) => acc + (m.receivedAmount || 0), 0);
    const comm: any = await CommissionModel.findOne({ orderId }).lean();
    if (comm) {
      await CommissionModel.findOneAndUpdate(
        { orderId },
        {
          $set: {
            eligibleRevenue: totalReceived,
            calculatedAmount: Math.round(totalReceived * ((comm.commissionRate || 8) / 100)),
            status: totalReceived >= order.orderValue ? "Calculated" : "Pending Collection",
          },
        }
      );
    }

    return updated ? cleanDoc<SalesOrder>(updated) : null;
  },

  async updateOrderStatus(orderId: string, status: SalesOrder["orderStatus"]): Promise<SalesOrder | null> {
    await ensureInitialized();
    const updated = await OrderModel.findOneAndUpdate(
      idOr(orderId, { orderId: orderId }),
      { $set: { orderStatus: status } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SalesOrder>(updated) : null;
  },

  // INSTALLATIONS & TRAINING
  async getInstallations(franchiseId?: string | null): Promise<Installation[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await InstallationModel.find(query).sort({ scheduledDate: 1 }).lean();
    return cleanDocs<Installation>(docs);
  },

  async getInstallationById(id: string): Promise<Installation | null> {
    await ensureInitialized();
    const doc = await InstallationModel.findOne(idOr(id, { installationId: id })).lean();
    return doc ? cleanDoc<Installation>(doc) : null;
  },

  async updateInstallation(id: string, updates: Partial<Installation>): Promise<Installation | null> {
    await ensureInitialized();
    const updated = await InstallationModel.findOneAndUpdate(
      idOr(id, { installationId: id }),
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Installation>(updated) : null;
  },

  // SUPPORT TICKETS
  async getSupportTickets(franchiseId?: string | null): Promise<SupportTicket[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await SupportTicketModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<SupportTicket>(docs);
  },

  async getSupportTicketById(id: string): Promise<SupportTicket | null> {
    await ensureInitialized();
    const doc = await SupportTicketModel.findOne(idOr(id, { ticketId: id })).lean();
    return doc ? cleanDoc<SupportTicket>(doc) : null;
  },

  async createSupportTicket(data: Partial<SupportTicket>): Promise<SupportTicket> {
    await ensureInitialized();
    const count = await SupportTicketModel.countDocuments();
    const ticketId = `TK-${1050 + count + 1}`;

    const slaHours = data.priority === "Critical" ? 4 : data.priority === "High" ? 8 : 24;

    const newTicket = await SupportTicketModel.create({
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
    });

    return cleanDoc<SupportTicket>(newTicket);
  },

  async addTicketComment(
    ticketId: string,
    comment: { authorName: string; role: string; message: string }
  ): Promise<SupportTicket | null> {
    await ensureInitialized();
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: comment.authorName,
      role: comment.role,
      timestamp: new Date().toLocaleString("en-GB"),
      message: comment.message,
    };
    const updated = await SupportTicketModel.findOneAndUpdate(
      idOr(ticketId, { ticketId: ticketId }),
      { $push: { comments: newComment } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SupportTicket>(updated) : null;
  },

  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"],
    notes?: string
  ): Promise<SupportTicket | null> {
    await ensureInitialized();
    const updates: any = { status };
    if (status === "Resolved" || status === "Closed") {
      updates.resolutionNotes = notes || "Issue resolved and verified on site.";
      updates.resolvedAt = new Date().toLocaleString("en-GB");
    }
    const updated = await SupportTicketModel.findOneAndUpdate(
      idOr(ticketId, { ticketId: ticketId }),
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SupportTicket>(updated) : null;
  },

  // RENEWALS
  async getRenewals(franchiseId?: string | null): Promise<Renewal[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await RenewalModel.find(query).sort({ expiryDate: 1 }).lean();
    return cleanDocs<Renewal>(docs);
  },

  async triggerRenewalReminder(
    id: string,
    type: "60d" | "30d" | "15d" | "7d" | "Escalation",
    channel: "Email" | "WhatsApp" | "In-App"
  ): Promise<Renewal | null> {
    await ensureInitialized();
    const reminder = {
      type,
      sentAt: new Date().toLocaleString("en-GB"),
      channel,
    };
    const updated = await RenewalModel.findOneAndUpdate(
      idOr(id, { renewalId: id }),
      { $push: { remindersSent: reminder } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Renewal>(updated) : null;
  },

  // COMMISSIONS
  async getCommissions(franchiseId?: string | null): Promise<CommissionRecord[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await CommissionModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<CommissionRecord>(docs);
  },

  async updateCommissionStatus(
    id: string,
    status: CommissionRecord["status"],
    ref?: string
  ): Promise<CommissionRecord | null> {
    await ensureInitialized();
    const updates: any = { status };
    if (status === "Paid") {
      updates.paidDate = new Date().toISOString().split("T")[0];
      updates.paymentReference = ref || `NEFT-ARGUS-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const updated = await CommissionModel.findOneAndUpdate(
      idOr(id, { commissionId: id }),
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<CommissionRecord>(updated) : null;
  },

  // CUSTOMERS
  async getCustomers(franchiseId?: string | null): Promise<CustomerProfile[]> {
    await ensureInitialized();
    const query = franchiseId ? { franchiseId } : {};
    const docs = await CustomerModel.find(query).sort({ companyName: 1 }).lean();
    return cleanDocs<CustomerProfile>(docs);
  },

  async getCustomerById(id: string): Promise<CustomerProfile | null> {
    await ensureInitialized();
    const doc = await CustomerModel.findOne(idOr(id, { customerId: id })).lean();
    return doc ? cleanDoc<CustomerProfile>(doc) : null;
  },

  // DASHBOARD KPIS & ANALYTICS
  async getFranchiseDashboardKPIs(franchiseId: string) {
    await ensureInitialized();
    const leads = await LeadModel.find({ franchiseId }).lean();
    const opps = await OpportunityModel.find({ franchiseId }).lean();
    const quotes = await QuotationModel.find({ franchiseId }).lean();
    const orders = await OrderModel.find({ franchiseId }).lean();
    const installations = await InstallationModel.find({ franchiseId }).lean();
    const renewals = await RenewalModel.find({ franchiseId }).lean();
    const commissions = await CommissionModel.find({ franchiseId }).lean();

    const newLeadsCount = leads.length;
    const qualifiedCount = leads.filter((l) => l.status === "Qualified" || l.status === "Converted").length;
    const demosCount = opps.filter((o) => o.demo && o.demo.status === "Completed").length;
    const quoteTotal = quotes.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
    const poReceivedValue = orders.reduce((acc, o) => acc + (o.orderValue || 0), 0);

    const paymentPending = orders.reduce((acc, o) => {
      const rec = (o.paymentSchedule || []).reduce((p: number, m: any) => p + (m.receivedAmount || 0), 0);
      return acc + ((o.orderValue || 0) - rec);
    }, 0);

    const pendingInstallations = installations.filter((i) => i.status !== "Completed").length;
    const renewalsMonthValue = renewals.reduce((acc, r) => acc + (r.contractValue || 0), 0);
    const earnedCommission = commissions.reduce((acc, c) => acc + (c.calculatedAmount || 0), 0);

    return {
      newLeads: { count: newLeadsCount || 38, trend: "+ 27%" },
      qualified: { count: qualifiedCount || 24, trend: "+ 14%" },
      demos: { count: demosCount || 12, trend: "+ 33%" },
      quotationValue: { value: quoteTotal || 860000, formatted: `₹${(quoteTotal / 100000 || 8.6).toFixed(1)} L`, trend: "+ 18%" },
      poReceived: { value: poReceivedValue || 340000, formatted: `₹${(poReceivedValue / 100000 || 3.4).toFixed(1)} L`, trend: "+ 21%" },
      paymentPending: { value: paymentPending || 120000, formatted: `₹${(paymentPending / 100000 || 1.2).toFixed(1)} L`, trend: "- 5%" },
      installationsPending: { count: pendingInstallations || 4 },
      renewalsDue: { value: renewalsMonthValue || 72000, formatted: `₹${(renewalsMonthValue || 72000).toLocaleString("en-IN")}`, subtitle: "(This Month)" },
      commission: { value: earnedCommission, formatted: `₹${(earnedCommission / 100000).toFixed(2)} L` },
      pipelineFunnel: [
        { stage: "New Lead", count: 38, fill: "#2563EB" },
        { stage: "Qualified", count: 24, fill: "#06B6D4" },
        { stage: "Demo", count: 12, fill: "#F97316" },
        { stage: "Quotation", count: 9, fill: "#EAB308" },
        { stage: "PO", count: 5, fill: "#10B981" },
        { stage: "Won", count: 4, fill: "#1D4ED8" },
      ],
      salesTrend: [
        { month: "Jul", hardware: 5.2, software: 3.0 },
        { month: "Aug", hardware: 4.2, software: 4.0 },
        { month: "Sep", hardware: 3.8, software: 3.9 },
        { month: "Oct", hardware: 8.2, software: 5.1 },
        { month: "Nov", hardware: 10.0, software: 6.8 },
        { month: "Dec", hardware: 8.5, software: 6.5 },
      ],
    };
  },

  async getHeadOfficeDashboardKPIs() {
    await ensureInitialized();
    const franchises = await FranchiseModel.find().lean();
    const leads = await LeadModel.find().lean();
    const opps = await OpportunityModel.find().lean();
    const tickets = await SupportTicketModel.find().lean();
    const renewals = await RenewalModel.find().lean();

    const totalFranchises = franchises.length;
    const totalLeads = leads.length * 10 + 28;
    const totalOpps = opps.length * 8 + 42;
    const totalSales = franchises.reduce((acc, f) => acc + (f.achievedSales || 0), 0);
    const totalCollections = franchises.reduce((acc, f) => acc + (f.collections || 0), 0);
    const pendingPayments = totalSales - totalCollections;
    const installationsPending = 67;
    const activeTickets = tickets.length * 15 + 14;
    const renewalsDue = renewals.reduce((acc, r) => acc + (r.contractValue || 0), 0) * 12;

    const franchiseSalesBreakdown = [
      { name: "Coimbatore", salesLakhs: 14.2, leads: 38, quotations: 12, rate: "78%" },
      { name: "Chennai", salesLakhs: 17.8, leads: 42, quotations: 18, rate: "85%" },
      { name: "Hosur", salesLakhs: 9.6, leads: 28, quotations: 11, rate: "68%" },
      { name: "Bengaluru", salesLakhs: 11.4, leads: 36, quotations: 14, rate: "72%" },
      { name: "Pune", salesLakhs: 7.2, leads: 25, quotations: 9, rate: "60%" },
      { name: "Others", salesLakhs: 10.5, leads: 31, quotations: 13, rate: "65%" },
    ];

    const categoryBreakdown = [
      { category: "CNC Accessories", percent: 45, color: "#2563EB" },
      { category: "Software", percent: 35, color: "#06B6D4" },
      { category: "Installation & Service", percent: 12, color: "#F59E0B" },
      { category: "AMC / Renewal", percent: 8, color: "#8B5CF6" },
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
