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
  SuperAdminModel,
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
        const TEMP_ORG = "ORG-TEMP";

        // One-time migration: Tag any legacy records that lack orgId or have ORG-ARGUS with ORG-TEMP
        await Promise.all([
          FranchiseModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          ProductModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          CustomerModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          LeadModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          OpportunityModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          QuotationModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          OrderModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          InstallationModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          SupportTicketModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          RenewalModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          CommissionModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          TerritoryModel.updateMany({ $or: [{ orgId: { $exists: false } }, { orgId: "ORG-ARGUS" }] }, { $set: { orgId: TEMP_ORG } }),
          UserModel.updateMany({ orgId: "ORG-ARGUS" }, { $set: { orgId: TEMP_ORG, orgName: "Demo CNC Systems (Template)" } }),
          OrganizationModel.updateMany({ orgId: "ORG-ARGUS" }, { $set: { orgId: TEMP_ORG, name: "Demo CNC Systems (Template)" } }),
        ]);

        // Multi-tenant index migration: ensure old global single-field unique indexes are replaced with compound { orgId: 1, ... }
        const indexMigrations = [
          { model: LeadModel, indexName: "leadId_1", field: "leadId" },
          { model: CustomerModel, indexName: "customerId_1", field: "customerId" },
          { model: OrderModel, indexName: "orderId_1", field: "orderId" },
          { model: InstallationModel, indexName: "installationId_1", field: "installationId" },
          { model: RenewalModel, indexName: "renewalId_1", field: "renewalId" },
          { model: SupportTicketModel, indexName: "ticketId_1", field: "ticketId" },
          { model: ProductModel, indexName: "sku_1", field: "sku" },
          { model: CommissionModel, indexName: "commissionId_1", field: "commissionId" },
          { model: FranchiseModel, indexName: "code_1", field: "code" },
        ];
        for (const item of indexMigrations) {
          try {
            const indexes = await item.model.collection.indexes();
            const hasOldUnique = indexes.find((i: any) => i.name === item.indexName && i.unique);
            if (hasOldUnique) {
              await item.model.collection.dropIndex(item.indexName);
              await item.model.collection.createIndex({ orgId: 1, [item.field]: 1 }, { unique: true });
            }
          } catch (e) {
            // Ignore if index doesn't exist or already dropped
          }
        }

        const franchiseCount = await FranchiseModel.countDocuments();
        if (franchiseCount < 12) {
          for (const fr of MOCK_FRANCHISES) {
            await FranchiseModel.findOneAndUpdate(
              { code: fr.code, orgId: TEMP_ORG },
              { $set: { ...sanitize(fr), orgId: TEMP_ORG } },
              { upsert: true }
            );
          }
        }

        if ((await ProductModel.countDocuments()) === 0) {
          await ProductModel.insertMany(MOCK_PRODUCTS.map((p) => ({ ...sanitize(p), orgId: TEMP_ORG })));
        }
        if ((await CustomerModel.countDocuments()) === 0) {
          await CustomerModel.insertMany(MOCK_CUSTOMERS.map((c) => ({ ...sanitize(c), orgId: TEMP_ORG })));
        }
        if ((await LeadModel.countDocuments()) === 0) {
          await LeadModel.insertMany(MOCK_LEADS.map((l) => ({ ...sanitize(l), orgId: TEMP_ORG })));
        }
        if ((await OpportunityModel.countDocuments()) === 0) {
          const opps = MOCK_OPPORTUNITIES.map((opp) => {
            const clean = sanitize(opp);
            clean.orgId = TEMP_ORG;
            clean.oppId = clean.opportunityId || clean.oppId || `OP-${Date.now()}`;
            return clean;
          });
          await OpportunityModel.insertMany(opps);
        }
        if ((await QuotationModel.countDocuments()) === 0) {
          const quotes = MOCK_QUOTATIONS.map((q) => {
            const clean = sanitize(q);
            clean.orgId = TEMP_ORG;
            clean.oppId = clean.opportunityId || clean.oppId;
            return clean;
          });
          await QuotationModel.insertMany(quotes);
        }
        if ((await OrderModel.countDocuments()) === 0) {
          await OrderModel.insertMany(MOCK_ORDERS.map((o) => ({ ...sanitize(o), orgId: TEMP_ORG })));
        }
        if ((await InstallationModel.countDocuments()) === 0) {
          await InstallationModel.insertMany(MOCK_INSTALLATIONS.map((i) => ({ ...sanitize(i), orgId: TEMP_ORG })));
        }
        if ((await SupportTicketModel.countDocuments()) === 0) {
          await SupportTicketModel.insertMany(MOCK_SUPPORT_TICKETS.map((s) => ({ ...sanitize(s), orgId: TEMP_ORG })));
        }
        if ((await RenewalModel.countDocuments()) === 0) {
          await RenewalModel.insertMany(MOCK_RENEWALS.map((r) => ({ ...sanitize(r), orgId: TEMP_ORG })));
        }
        if ((await CommissionModel.countDocuments()) === 0) {
          await CommissionModel.insertMany(MOCK_COMMISSIONS.map((c) => ({ ...sanitize(c), orgId: TEMP_ORG })));
        }
        if ((await TerritoryModel.countDocuments()) === 0) {
          await TerritoryModel.insertMany(MOCK_TERRITORIES.map((t) => ({ ...sanitize(t), orgId: TEMP_ORG })));
        }

        // Default Organization Seed (Template Org)
        const defaultOrg = await OrganizationModel.findOne({ orgId: TEMP_ORG });
        if (!defaultOrg) {
          await OrganizationModel.create({
            orgId: TEMP_ORG,
            name: "Demo CNC Systems (Template)",
            gstin: "33AAAAA0000A1Z5",
            adminEmail: "vikram.ho@arguscnc.com",
            adminName: "Vikram Rathore",
            status: "APPROVED",
            createdAt: "2026-01-01",
            approvedAt: "2026-01-01",
            approvedBy: "System Setup",
          });
        }

        // Super admins are strictly managed in the dedicated super_admins collection.
        await UserModel.deleteMany({ role: "super_admin" });

        if ((await UserModel.countDocuments({ orgId: TEMP_ORG })) <= 1) {
          const seededUsers = MOCK_USERS.map((u) => ({
            ...sanitize(u),
            orgId: TEMP_ORG,
            orgName: "Demo CNC Systems (Template)",
            status: "active",
          }));
          for (const u of seededUsers) {
            await UserModel.findOneAndUpdate({ id: u.id }, { $set: u }, { upsert: true });
          }
        }

        isInitialized = true;
        console.log("✅ MongoDB Atlas collections & Organization multi-tenant seed synchronized successfully with ORG-TEMP!");
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

    // 1. Check SuperAdmin in dedicated super_admins collection
    // No hardcoded emails: Only emails explicitly inserted into the super_admins collection can access Super Admin
    const superAdminDoc: any = await SuperAdminModel.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") },
      active: { $ne: false },
    }).lean();

    if (superAdminDoc) {
      const superUser: UserSession = {
        id: superAdminDoc._id?.toString() || `usr-super-${normalizedEmail.replace(/[^a-z0-9]/g, "")}`,
        name: superAdminDoc.name || normalizedEmail.split("@")[0].toUpperCase() + " (Super Admin)",
        email: normalizedEmail,
        role: "super_admin",
        orgId: null,
        orgName: "Platform Administration",
        franchiseId: null,
        avatar: "SA",
        status: "active",
      };
      return { user: superUser, organization: null };
    }

    // 2. Check regular organization UserModel (Head Office Admin, Franchise Admin, Engineers, etc.)
    // Note: super_admin role can never originate from UserModel
    const doc: any = await UserModel.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`, "i") },
      role: { $ne: "super_admin" },
    }).lean();

    if (!doc) return null;

    let org: Organization | null = null;
    if (doc.orgId) {
      const orgDoc = await OrganizationModel.findOne({ orgId: doc.orgId }).lean();
      org = orgDoc ? cleanDoc<Organization>(orgDoc) : null;
    }

    return { user: cleanDoc<UserSession>(doc), organization: org };
  },

  async getSuperAdmins(): Promise<any[]> {
    await ensureInitialized();
    const docs = await SuperAdminModel.find().lean();
    return cleanDocs(docs);
  },

  async addSuperAdmin(email: string, name?: string): Promise<any> {
    await ensureInitialized();
    const normalized = email.trim().toLowerCase();
    const created = await SuperAdminModel.findOneAndUpdate(
      { email: normalized },
      {
        $set: {
          email: normalized,
          name: name || normalized.split("@")[0],
          active: true,
          role: "super_admin",
        },
      },
      { upsert: true, new: true }
    ).lean();
    return cleanDoc(created);
  },

  async getUsersByOrg(orgId?: string | null): Promise<UserSession[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const docs = await UserModel.find({ orgId }).lean();
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
  async getFranchises(orgId?: string | null): Promise<Franchise[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const docs = await FranchiseModel.find({ orgId }).lean();
    return cleanDocs<Franchise>(docs);
  },

  async getFranchiseByCode(code: string, orgId?: string | null): Promise<Franchise | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const doc = await FranchiseModel.findOne({ code, orgId }).lean();
    return doc ? cleanDoc<Franchise>(doc) : null;
  },

  async createFranchise(
    data: Partial<Franchise> & { adminUser?: Partial<UserSession> },
    orgId?: string | null
  ): Promise<{ franchise: Franchise; adminUser: UserSession }> {
    await ensureInitialized();
    const activeOrgId = data.orgId || orgId || "ORG-TEMP";
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
      orgId: activeOrgId,
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
          orgId: activeOrgId,
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
      orgId: activeOrgId,
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

  async updateFranchise(
    id: string,
    data: Partial<Franchise>,
    orgId?: string | null
  ): Promise<Franchise | null> {
    await ensureInitialized();
    if (!orgId) return null;

    const territoryDistricts = Array.isArray(data.territoryDistricts)
      ? data.territoryDistricts
      : typeof data.territoryDistricts === "string" && data.territoryDistricts
      ? (data.territoryDistricts as string).split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const pincodes = Array.isArray(data.pincodes)
      ? data.pincodes
      : typeof data.pincodes === "string" && data.pincodes
      ? (data.pincodes as string).split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const updateFields: any = { ...data };
    delete updateFields._id;
    delete updateFields.orgId;
    if (territoryDistricts !== undefined) updateFields.territoryDistricts = territoryDistricts;
    if (pincodes !== undefined) updateFields.pincodes = pincodes;
    if (data.annualTarget !== undefined) updateFields.annualTarget = Number(data.annualTarget) || 0;
    if (data.achievedSales !== undefined) updateFields.achievedSales = Number(data.achievedSales) || 0;
    if (data.collections !== undefined) updateFields.collections = Number(data.collections) || 0;
    if (data.commissionEarned !== undefined) updateFields.commissionEarned = Number(data.commissionEarned) || 0;
    if (data.commissionPaid !== undefined) updateFields.commissionPaid = Number(data.commissionPaid) || 0;

    const query = {
      ...idOr(id, { code: id }),
      orgId,
    };

    const updated = await FranchiseModel.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true }
    ).lean() as any;

    if (!updated) return null;

    if (updated.code) {
      // 1. Synchronize TerritoryModel for this franchise
      const territoryUpdate: any = {};
      if (data.name) territoryUpdate.assignedFranchiseName = data.name.trim();
      if (pincodes !== undefined) territoryUpdate.pincodeRange = pincodes;
      if (data.state) territoryUpdate.state = data.state;
      if (territoryDistricts !== undefined && territoryDistricts.length > 0) {
        territoryUpdate.district = territoryDistricts[0];
      }
      if (Object.keys(territoryUpdate).length > 0) {
        await TerritoryModel.updateMany(
          { assignedFranchiseId: updated.code, orgId },
          { $set: territoryUpdate }
        );
      }

      // 2. Synchronize UserModel for Franchise Admin
      const userUpdate: any = {};
      if (data.contactPerson) userUpdate.name = data.contactPerson.trim();
      if (data.email) userUpdate.email = data.email.trim().toLowerCase();
      if (data.name) userUpdate.franchiseName = data.name.trim();
      if (data.contactPerson) {
        const initials = data.contactPerson
          .split(" ")
          .map((n: string) => n[0])
          .filter(Boolean)
          .join("")
          .slice(0, 2)
          .toUpperCase();
        if (initials) userUpdate.avatar = initials;
      }
      if (Object.keys(userUpdate).length > 0) {
        await UserModel.updateMany(
          { franchiseId: updated.code, orgId, role: "franchise_admin" },
          { $set: userUpdate }
        );
      }
    }

    return cleanDoc<Franchise>(updated);
  },

  async deleteFranchise(id: string, orgId?: string | null): Promise<boolean> {
    await ensureInitialized();
    if (!orgId) return false;

    const query = {
      ...idOr(id, { code: id }),
      orgId,
    };

    const franchise = await FranchiseModel.findOne(query).lean() as any;
    if (!franchise) return false;

    await FranchiseModel.deleteOne(query);

    if (franchise.code) {
      await TerritoryModel.deleteMany({ assignedFranchiseId: franchise.code, orgId });
    }

    return true;
  },

  // PRODUCTS / PRICE MASTER (Per-Organization)
  async getProducts(orgId?: string | null): Promise<ProductMasterItem[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const docs = await ProductModel.find({ orgId }).lean();
    return cleanDocs<ProductMasterItem>(docs);
  },

  async getProductBySku(sku: string, orgId?: string | null): Promise<ProductMasterItem | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const doc = await ProductModel.findOne({ sku, orgId }).lean();
    return doc ? cleanDoc<ProductMasterItem>(doc) : null;
  },

  async createProduct(product: Partial<ProductMasterItem>, orgId?: string | null): Promise<ProductMasterItem> {
    await ensureInitialized();
    const activeOrgId = product.orgId || orgId || "ORG-TEMP";
    const newPrd: Partial<ProductMasterItem> = {
      orgId: activeOrgId,
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

  async deleteProduct(id: string, orgId?: string | null): Promise<boolean> {
    await ensureInitialized();
    if (!orgId) return false;
    const query = {
      ...idOr(id, { sku: id }),
      orgId,
    };
    const res = await ProductModel.deleteOne(query);
    return (res.deletedCount || 0) > 0;
  },

  // TERRITORIES
  async getTerritories(orgId?: string | null): Promise<TerritoryMapping[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const docs = await TerritoryModel.find({ orgId }).lean();
    return cleanDocs<TerritoryMapping>(docs);
  },

  async checkTerritoryConflict(pincode: string, requestedFranchiseId: string, orgId?: string | null) {
    await ensureInitialized();
    const query: any = { pincodeRange: pincode };
    if (orgId) query.orgId = orgId;
    const match: any = await TerritoryModel.findOne(query).lean();
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
  async getLeads(orgId?: string | null, franchiseId?: string | null): Promise<Lead[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await LeadModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Lead>(docs);
  },

  async getLeadById(id: string, orgId?: string | null): Promise<Lead | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { leadId: id }), orgId };
    const doc = await LeadModel.findOne(query).lean();
    return doc ? cleanDoc<Lead>(doc) : null;
  },

  async createLead(data: Partial<Lead>, orgId?: string | null): Promise<Lead> {
    await ensureInitialized();
    const activeOrgId = data.orgId || orgId || "ORG-TEMP";
    let leadId = data.leadId;
    if (!leadId) {
      const count = await LeadModel.countDocuments({ orgId: activeOrgId });
      let candidate = `LD-${1040 + count + 1}`;
      let exists = await LeadModel.findOne({ orgId: activeOrgId, leadId: candidate });
      let offset = 1;
      while (exists) {
        candidate = `LD-${1040 + count + 1 + offset}`;
        exists = await LeadModel.findOne({ orgId: activeOrgId, leadId: candidate });
        offset++;
      }
      leadId = candidate;
    }

    // 1. Determine Franchise Assignment dynamically
    let assignedFranchiseId = data.franchiseId || "";
    let assignedFranchiseName = data.franchiseName || "";

    // If franchiseId is provided, look up franchise name if missing
    if (assignedFranchiseId && !assignedFranchiseName) {
      const fr: any = await FranchiseModel.findOne({ code: assignedFranchiseId, orgId: activeOrgId }).lean();
      if (fr) assignedFranchiseName = fr.name;
    }

    // Auto-route by PIN code if franchiseId is not provided
    if (!assignedFranchiseId && data.pincode) {
      const territoryMatch: any = await TerritoryModel.findOne({
        pincodeRange: data.pincode.trim(),
        orgId: activeOrgId,
      }).lean();
      if (territoryMatch && territoryMatch.assignedFranchiseId) {
        assignedFranchiseId = territoryMatch.assignedFranchiseId;
        assignedFranchiseName = territoryMatch.assignedFranchiseName;
      }
    }

    // Territory conflict check (only if both pincode and assigned franchise exist)
    const conflictCheck = (data.pincode && assignedFranchiseId)
      ? await this.checkTerritoryConflict(data.pincode, assignedFranchiseId, activeOrgId)
      : { hasConflict: false };

    const newLead: Partial<Lead> = {
      orgId: activeOrgId,
      leadId,
      customerName: data.customerName || "Prospective Client",
      companyName: data.companyName || "Industrial Partner",
      phone: data.phone || "",
      email: data.email || "",
      source: data.source || "Website",
      industry: data.industry || "Auto Components",
      state: data.state || "Tamil Nadu",
      district: data.district || "",
      pincode: data.pincode || "",
      productInterest: data.productInterest || "ARG-VMC-700",
      ownerId: data.ownerId || (assignedFranchiseId ? `usr-${assignedFranchiseId.toLowerCase().replace(/[^a-z0-9]/g, "")}-sales` : "usr-ho-sales"),
      ownerName: data.ownerName || (assignedFranchiseName ? `${assignedFranchiseName}` : "Head Office Direct"),
      franchiseId: assignedFranchiseId || undefined,
      franchiseName: assignedFranchiseName || "Head Office Direct",
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

  async updateLead(id: string, updates: Partial<Lead>, orgId?: string | null): Promise<Lead | null> {
    await ensureInitialized();
    const query: any = idOr(id, { leadId: id });
    if (orgId) query.orgId = orgId;

    const existing: any = await LeadModel.findOne(query).lean();
    if (!existing) return null;

    const activeOrgId = existing.orgId || orgId;
    const sanitizedUpdates: any = { ...updates };
    delete sanitizedUpdates._id;

    const newPincode = sanitizedUpdates.pincode !== undefined ? sanitizedUpdates.pincode : existing.pincode;
    let newFranchiseId = sanitizedUpdates.franchiseId !== undefined ? sanitizedUpdates.franchiseId : existing.franchiseId;
    let newFranchiseName = sanitizedUpdates.franchiseName !== undefined ? sanitizedUpdates.franchiseName : existing.franchiseName;

    if (newFranchiseId && (!newFranchiseName || sanitizedUpdates.franchiseId !== existing.franchiseId)) {
      const fr: any = await FranchiseModel.findOne({ code: newFranchiseId, orgId: activeOrgId }).lean();
      if (fr) {
        newFranchiseName = fr.name;
        sanitizedUpdates.franchiseName = fr.name;
      }
    }

    if (!newFranchiseId && newPincode) {
      const territoryMatch: any = await TerritoryModel.findOne({
        pincodeRange: String(newPincode).trim(),
        orgId: activeOrgId,
      }).lean();
      if (territoryMatch && territoryMatch.assignedFranchiseId) {
        newFranchiseId = territoryMatch.assignedFranchiseId;
        newFranchiseName = territoryMatch.assignedFranchiseName;
        sanitizedUpdates.franchiseId = newFranchiseId;
        sanitizedUpdates.franchiseName = newFranchiseName;
      }
    }

    if (newPincode && newFranchiseId) {
      const conflictCheck = await this.checkTerritoryConflict(newPincode, newFranchiseId, activeOrgId);
      sanitizedUpdates.territoryConflict = conflictCheck.hasConflict;
      sanitizedUpdates.conflictNotes = conflictCheck.hasConflict
        ? `PIN ${newPincode} matches territory assigned to ${(conflictCheck as any).assignedTo}`
        : undefined;
    }

    const updated = await LeadModel.findOneAndUpdate(
      query,
      { $set: sanitizedUpdates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Lead>(updated) : null;
  },

  async deleteLead(id: string, orgId?: string | null): Promise<boolean> {
    await ensureInitialized();
    if (!orgId) return false;
    const query: any = {
      ...idOr(id, { leadId: id }),
      orgId,
    };
    const res = await LeadModel.deleteOne(query);
    return (res.deletedCount || 0) > 0;
  },

  async convertLeadToOpportunity(leadId: string, orgId?: string | null): Promise<Opportunity | null> {
    await ensureInitialized();
    const lead = await this.getLeadById(leadId, orgId);
    if (!lead) return null;
    const activeOrgId = lead.orgId || orgId || "ORG-TEMP";

    await LeadModel.findOneAndUpdate(
      { ...idOr(leadId, { leadId }), ...(orgId ? { orgId } : {}) },
      { $set: { status: "Converted" } }
    );

    // Ensure customer exists in Atlas
    let cust: any = await CustomerModel.findOne({
      orgId: activeOrgId,
      companyName: { $regex: new RegExp(`^${lead.companyName}$`, "i") },
    }).lean();

    if (!cust) {
      const custCount = await CustomerModel.countDocuments({ orgId: activeOrgId });
      cust = await CustomerModel.create({
        orgId: activeOrgId,
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

    const oppCount = await OpportunityModel.countDocuments({ orgId: activeOrgId });
    const oppId = `OP-${1020 + oppCount + 1}`;

    const newOpp = await OpportunityModel.create({
      orgId: activeOrgId,
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
  async getOpportunities(orgId?: string | null, franchiseId?: string | null): Promise<Opportunity[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await OpportunityModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Opportunity>(docs);
  },

  async getOpportunityById(id: string, orgId?: string | null): Promise<Opportunity | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { opportunityId: id }, { oppId: id }), orgId };
    const doc = await OpportunityModel.findOne(query).lean();
    return doc ? cleanDoc<Opportunity>(doc) : null;
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>, orgId?: string | null): Promise<Opportunity | null> {
    await ensureInitialized();
    const query: any = idOr(id, { opportunityId: id }, { oppId: id });
    if (orgId) query.orgId = orgId;
    const updated = await OpportunityModel.findOneAndUpdate(
      query,
      { $set: { ...updates, updatedAt: new Date().toISOString().split("T")[0] } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Opportunity>(updated) : null;
  },

  // QUOTATIONS
  async getQuotations(orgId?: string | null, franchiseId?: string | null): Promise<Quotation[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await QuotationModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<Quotation>(docs);
  },

  async getQuotationById(id: string, orgId?: string | null): Promise<Quotation | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { quoteId: id }), orgId };
    const doc = await QuotationModel.findOne(query).lean();
    return doc ? cleanDoc<Quotation>(doc) : null;
  },

  async createQuotation(data: any, createdBy: UserSession, orgId?: string | null): Promise<Quotation> {
    await ensureInitialized();
    const activeOrgId = data.orgId || orgId || createdBy.orgId || "ORG-TEMP";
    const count = await QuotationModel.countDocuments({ orgId: activeOrgId });
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
      orgId: activeOrgId,
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

  async approveQuotation(id: string, approverName: string, notes?: string, orgId?: string | null): Promise<Quotation | null> {
    await ensureInitialized();
    const query: any = idOr(id, { quoteId: id });
    if (orgId) query.orgId = orgId;
    const updated = await QuotationModel.findOneAndUpdate(
      query,
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

  async rejectQuotation(id: string, approverName: string, reason: string, orgId?: string | null): Promise<Quotation | null> {
    await ensureInitialized();
    const query: any = idOr(id, { quoteId: id });
    if (orgId) query.orgId = orgId;
    const updated = await QuotationModel.findOneAndUpdate(
      query,
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
  async getOrders(orgId?: string | null, franchiseId?: string | null): Promise<SalesOrder[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<SalesOrder>(docs);
  },

  async getOrderById(id: string, orgId?: string | null): Promise<SalesOrder | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { orderId: id }), orgId };
    const doc = await OrderModel.findOne(query).lean();
    return doc ? cleanDoc<SalesOrder>(doc) : null;
  },

  async createOrderFromQuotation(
    quoteId: string,
    poDetails: { poNumber: string; poDate: string },
    orgId?: string | null
  ): Promise<SalesOrder | null> {
    await ensureInitialized();
    const quote = await this.getQuotationById(quoteId, orgId);
    if (!quote) return null;
    const activeOrgId = quote.orgId || orgId || "ORG-TEMP";

    const count = await OrderModel.countDocuments({ orgId: activeOrgId });
    const orderId = `SO-${4000 + count + 1}`;

    const advanceAmount = Math.round(quote.grandTotal * 0.2);
    const dispatchAmount = Math.round(quote.grandTotal * 0.7);
    const installAmount = quote.grandTotal - advanceAmount - dispatchAmount;

    const orderDoc = await OrderModel.create({
      orgId: activeOrgId,
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
      { ...idOr(quoteId, { quoteId }), ...(orgId ? { orgId } : {}) },
      { $set: { status: "Accepted" } }
    );

    // Update opportunity stage to Won
    const targetOpp = quote.opportunityId || (quote as any).oppId;
    if (targetOpp) {
      await OpportunityModel.findOneAndUpdate(
        { ...idOr(targetOpp, { opportunityId: targetOpp }, { oppId: targetOpp }), ...(orgId ? { orgId } : {}) },
        { $set: { stage: "Won" } }
      );
    }

    // Auto-create Commission record in Atlas
    const commCount = await CommissionModel.countDocuments({ orgId: activeOrgId });
    await CommissionModel.create({
      orgId: activeOrgId,
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
    const instCount = await InstallationModel.countDocuments({ orgId: activeOrgId });
    await InstallationModel.create({
      orgId: activeOrgId,
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
    payment: { receivedAmount?: number; amount?: number; paymentReference?: string; ref?: string },
    orgId?: string | null
  ): Promise<SalesOrder | null> {
    await ensureInitialized();
    const order = await this.getOrderById(orderId, orgId);
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

    const query: any = idOr(orderId, { orderId });
    if (orgId) query.orgId = orgId;

    const updated = await OrderModel.findOneAndUpdate(
      query,
      { $set: { paymentSchedule: order.paymentSchedule, orderStatus: order.orderStatus } },
      { new: true }
    ).lean();

    // Update commission based on collections
    const totalReceived = order.paymentSchedule.reduce((acc, m) => acc + (m.receivedAmount || 0), 0);
    const commQuery: any = { orderId };
    if (orgId) commQuery.orgId = orgId;
    const comm: any = await CommissionModel.findOne(commQuery).lean();
    if (comm) {
      await CommissionModel.findOneAndUpdate(
        commQuery,
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

  async updateOrderStatus(orderId: string, status: SalesOrder["orderStatus"], orgId?: string | null): Promise<SalesOrder | null> {
    await ensureInitialized();
    const query: any = idOr(orderId, { orderId });
    if (orgId) query.orgId = orgId;
    const updated = await OrderModel.findOneAndUpdate(
      query,
      { $set: { orderStatus: status } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SalesOrder>(updated) : null;
  },

  // INSTALLATIONS & TRAINING
  async getInstallations(orgId?: string | null, franchiseId?: string | null): Promise<Installation[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await InstallationModel.find(query).sort({ scheduledDate: 1 }).lean();
    return cleanDocs<Installation>(docs);
  },

  async getInstallationById(id: string, orgId?: string | null): Promise<Installation | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { installationId: id }), orgId };
    const doc = await InstallationModel.findOne(query).lean();
    return doc ? cleanDoc<Installation>(doc) : null;
  },

  async updateInstallation(id: string, updates: Partial<Installation>, orgId?: string | null): Promise<Installation | null> {
    await ensureInitialized();
    const query: any = idOr(id, { installationId: id });
    if (orgId) query.orgId = orgId;
    const updated = await InstallationModel.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Installation>(updated) : null;
  },

  // SUPPORT TICKETS
  async getSupportTickets(orgId?: string | null, franchiseId?: string | null): Promise<SupportTicket[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await SupportTicketModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<SupportTicket>(docs);
  },

  async getSupportTicketById(id: string, orgId?: string | null): Promise<SupportTicket | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { ticketId: id }), orgId };
    const doc = await SupportTicketModel.findOne(query).lean();
    return doc ? cleanDoc<SupportTicket>(doc) : null;
  },

  async createSupportTicket(data: Partial<SupportTicket>, orgId?: string | null): Promise<SupportTicket> {
    await ensureInitialized();
    const activeOrgId = data.orgId || orgId || "ORG-TEMP";
    const count = await SupportTicketModel.countDocuments({ orgId: activeOrgId });
    const ticketId = `TK-${1050 + count + 1}`;

    const slaHours = data.priority === "Critical" ? 4 : data.priority === "High" ? 8 : 24;

    const newTicket = await SupportTicketModel.create({
      orgId: activeOrgId,
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
    comment: { authorName: string; role: string; message: string },
    orgId?: string | null
  ): Promise<SupportTicket | null> {
    await ensureInitialized();
    const newComment = {
      id: `c-${Date.now()}`,
      authorName: comment.authorName,
      role: comment.role,
      timestamp: new Date().toLocaleString("en-GB"),
      message: comment.message,
    };
    const query: any = idOr(ticketId, { ticketId });
    if (orgId) query.orgId = orgId;
    const updated = await SupportTicketModel.findOneAndUpdate(
      query,
      { $push: { comments: newComment } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SupportTicket>(updated) : null;
  },

  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"],
    notes?: string,
    orgId?: string | null
  ): Promise<SupportTicket | null> {
    await ensureInitialized();
    const updates: any = { status };
    if (status === "Resolved" || status === "Closed") {
      updates.resolutionNotes = notes || "Issue resolved and verified on site.";
      updates.resolvedAt = new Date().toLocaleString("en-GB");
    }
    const query: any = idOr(ticketId, { ticketId });
    if (orgId) query.orgId = orgId;
    const updated = await SupportTicketModel.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<SupportTicket>(updated) : null;
  },

  // RENEWALS
  async getRenewals(orgId?: string | null, franchiseId?: string | null): Promise<Renewal[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await RenewalModel.find(query).sort({ expiryDate: 1 }).lean();
    return cleanDocs<Renewal>(docs);
  },

  async triggerRenewalReminder(
    id: string,
    type: "60d" | "30d" | "15d" | "7d" | "Escalation",
    channel: "Email" | "WhatsApp" | "In-App",
    orgId?: string | null
  ): Promise<Renewal | null> {
    await ensureInitialized();
    const reminder = {
      type,
      sentAt: new Date().toLocaleString("en-GB"),
      channel,
    };
    const query: any = idOr(id, { renewalId: id });
    if (orgId) query.orgId = orgId;
    const updated = await RenewalModel.findOneAndUpdate(
      query,
      { $push: { remindersSent: reminder } },
      { new: true }
    ).lean();
    return updated ? cleanDoc<Renewal>(updated) : null;
  },

  // COMMISSIONS
  async getCommissions(orgId?: string | null, franchiseId?: string | null): Promise<CommissionRecord[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await CommissionModel.find(query).sort({ createdAt: -1 }).lean();
    return cleanDocs<CommissionRecord>(docs);
  },

  async updateCommissionStatus(
    id: string,
    status: CommissionRecord["status"],
    ref?: string,
    orgId?: string | null
  ): Promise<CommissionRecord | null> {
    await ensureInitialized();
    const updates: any = { status };
    if (status === "Paid") {
      updates.paidDate = new Date().toISOString().split("T")[0];
      updates.paymentReference = ref || `NEFT-ARGUS-${Math.floor(10000 + Math.random() * 90000)}`;
    }
    const query: any = idOr(id, { commissionId: id });
    if (orgId) query.orgId = orgId;
    const updated = await CommissionModel.findOneAndUpdate(
      query,
      { $set: updates },
      { new: true }
    ).lean();
    return updated ? cleanDoc<CommissionRecord>(updated) : null;
  },

  // CUSTOMERS
  async getCustomers(orgId?: string | null, franchiseId?: string | null): Promise<CustomerProfile[]> {
    await ensureInitialized();
    if (!orgId) return [];
    const query: any = { orgId };
    if (franchiseId) query.franchiseId = franchiseId;
    const docs = await CustomerModel.find(query).sort({ companyName: 1 }).lean();
    return cleanDocs<CustomerProfile>(docs);
  },

  async getCustomerById(id: string, orgId?: string | null): Promise<CustomerProfile | null> {
    await ensureInitialized();
    if (!orgId) return null;
    const query: any = { ...idOr(id, { customerId: id }), orgId };
    const doc = await CustomerModel.findOne(query).lean();
    return doc ? cleanDoc<CustomerProfile>(doc) : null;
  },

  // DASHBOARD KPIS & ANALYTICS
  async getFranchiseDashboardKPIs(franchiseId: string, orgId?: string | null) {
    await ensureInitialized();
    if (!orgId) {
      return {
        newLeads: { count: 0, trend: "0%" },
        qualified: { count: 0, trend: "0%" },
        demos: { count: 0, trend: "0%" },
        quotationValue: { value: 0, formatted: "₹0.0 L", trend: "0%" },
        poReceived: { value: 0, formatted: "₹0.0 L", trend: "0%" },
        paymentPending: { value: 0, formatted: "₹0.0 L", trend: "0%" },
        installationsPending: { count: 0 },
        renewalsDue: { value: 0, formatted: "₹0", subtitle: "(This Month)" },
        commission: { value: 0, formatted: "₹0.00 L" },
        pipelineFunnel: [
          { stage: "New Lead", count: 0, fill: "#2563EB" },
          { stage: "Qualified", count: 0, fill: "#06B6D4" },
          { stage: "Demo", count: 0, fill: "#F97316" },
          { stage: "Quotation", count: 0, fill: "#EAB308" },
          { stage: "PO", count: 0, fill: "#10B981" },
          { stage: "Won", count: 0, fill: "#1D4ED8" },
        ],
        salesTrend: [
          { month: "Jan", hardware: 0, software: 0 },
          { month: "Feb", hardware: 0, software: 0 },
          { month: "Mar", hardware: 0, software: 0 },
          { month: "Apr", hardware: 0, software: 0 },
          { month: "May", hardware: 0, software: 0 },
          { month: "Jun", hardware: 0, software: 0 },
        ],
      };
    }
    const query: any = { franchiseId, orgId };

    const leads = await LeadModel.find(query).lean();
    const opps = await OpportunityModel.find(query).lean();
    const quotes = await QuotationModel.find(query).lean();
    const orders = await OrderModel.find(query).lean();
    const installations = await InstallationModel.find(query).lean();
    const renewals = await RenewalModel.find(query).lean();
    const commissions = await CommissionModel.find(query).lean();

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
      newLeads: { count: newLeadsCount, trend: newLeadsCount > 0 ? "+ 10%" : "0%" },
      qualified: { count: qualifiedCount, trend: qualifiedCount > 0 ? "+ 5%" : "0%" },
      demos: { count: demosCount, trend: demosCount > 0 ? "+ 8%" : "0%" },
      quotationValue: { value: quoteTotal, formatted: `₹${(quoteTotal / 100000).toFixed(1)} L`, trend: quoteTotal > 0 ? "+ 12%" : "0%" },
      poReceived: { value: poReceivedValue, formatted: `₹${(poReceivedValue / 100000).toFixed(1)} L`, trend: poReceivedValue > 0 ? "+ 15%" : "0%" },
      paymentPending: { value: paymentPending, formatted: `₹${(paymentPending / 100000).toFixed(1)} L`, trend: "0%" },
      installationsPending: { count: pendingInstallations },
      renewalsDue: { value: renewalsMonthValue, formatted: `₹${renewalsMonthValue.toLocaleString("en-IN")}`, subtitle: "(This Month)" },
      commission: { value: earnedCommission, formatted: `₹${(earnedCommission / 100000).toFixed(2)} L` },
      pipelineFunnel: [
        { stage: "New Lead", count: leads.filter(l => l.status === "New").length, fill: "#2563EB" },
        { stage: "Qualified", count: qualifiedCount, fill: "#06B6D4" },
        { stage: "Demo", count: demosCount, fill: "#F97316" },
        { stage: "Quotation", count: quotes.length, fill: "#EAB308" },
        { stage: "PO", count: orders.length, fill: "#10B981" },
        { stage: "Won", count: opps.filter(o => o.stage === "Won").length, fill: "#1D4ED8" },
      ],
      salesTrend: [
        { month: "Jan", hardware: 0, software: 0 },
        { month: "Feb", hardware: 0, software: 0 },
        { month: "Mar", hardware: 0, software: 0 },
        { month: "Apr", hardware: 0, software: 0 },
        { month: "May", hardware: 0, software: 0 },
        { month: "Jun", hardware: Number((poReceivedValue / 100000).toFixed(1)), software: 0 },
      ],
    };
  },

  async getHeadOfficeDashboardKPIs(orgId?: string | null) {
    await ensureInitialized();
    if (!orgId) {
      return {
        totalFranchises: 0,
        totalLeads: 0,
        totalOpps: 0,
        totalSales: "₹0.0 L",
        pendingPayments: "₹0.0 L",
        installationsPending: 0,
        activeTickets: 0,
        renewalsDue: "₹0.0 L",
        franchiseSalesBreakdown: [],
        categoryBreakdown: [
          { category: "CNC Accessories", percent: 0, color: "#2563EB" },
          { category: "Software", percent: 0, color: "#06B6D4" },
          { category: "Installation & Service", percent: 0, color: "#F59E0B" },
          { category: "AMC / Renewal", percent: 0, color: "#8B5CF6" },
        ],
        alerts: [],
      };
    }
    const query = { orgId };

    const franchises = await FranchiseModel.find(query).lean();
    const leads = await LeadModel.find(query).lean();
    const opps = await OpportunityModel.find(query).lean();
    const quotes = await QuotationModel.find(query).lean();
    const orders = await OrderModel.find(query).lean();
    const tickets = await SupportTicketModel.find(query).lean();
    const renewals = await RenewalModel.find(query).lean();
    const installations = await InstallationModel.find(query).lean();

    const totalFranchises = franchises.length;
    const totalLeads = leads.length;
    const totalOpps = opps.length;
    const totalSales = orders.reduce((acc, o) => acc + (o.orderValue || 0), 0) || franchises.reduce((acc, f) => acc + (f.achievedSales || 0), 0);
    const totalCollections = franchises.reduce((acc, f) => acc + (f.collections || 0), 0);
    const pendingPayments = Math.max(0, totalSales - totalCollections);
    const installationsPending = installations.filter(i => i.status !== "Completed").length;
    const activeTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;
    const renewalsDue = renewals.reduce((acc, r) => acc + (r.contractValue || 0), 0);

    const franchiseSalesBreakdown = franchises.map((f) => ({
      name: f.location || f.name,
      salesLakhs: Number(((f.achievedSales || 0) / 100000).toFixed(1)),
      leads: leads.filter((l) => l.franchiseId === f.code).length,
      quotations: quotes.filter((q) => q.franchiseId === f.code).length,
      rate: `${f.annualTarget ? Math.min(100, Math.round(((f.achievedSales || 0) / f.annualTarget) * 100)) : 0}%`,
    }));

    const categoryBreakdown = [
      { category: "CNC Accessories", percent: totalSales > 0 ? 45 : 0, color: "#2563EB" },
      { category: "Software", percent: totalSales > 0 ? 35 : 0, color: "#06B6D4" },
      { category: "Installation & Service", percent: totalSales > 0 ? 12 : 0, color: "#F59E0B" },
      { category: "AMC / Renewal", percent: totalSales > 0 ? 8 : 0, color: "#8B5CF6" },
    ];

    const alerts: any[] = [];
    const pendingQuotes = quotes.filter((q) => q.requiresSpecialApproval && q.status === "Pending_Approval");
    for (const pq of pendingQuotes.slice(0, 2)) {
      alerts.push({
        id: `alt-q-${pq.quoteId}`,
        type: "special_approval",
        title: "Special Price Approval Required",
        desc: `${pq.quoteId}: ${pq.customerName || "Client"} special discount requested. Requires HO Approval.`,
        link: `/quotations/${pq.quoteId}`,
        severity: "critical",
      });
    }

    const urgentTickets = tickets.filter((t) => (t.priority === "Critical" || t.priority === "High") && (t.status === "Open" || t.status === "In Progress"));
    for (const ut of urgentTickets.slice(0, 2)) {
      alerts.push({
        id: `alt-t-${ut.ticketId}`,
        type: "sla_warning",
        title: `${ut.priority} Support Ticket SLA`,
        desc: `${ut.ticketId}: ${ut.customerName || "Customer"} - ${ut.issueDescription || "Breakdown"}.`,
        link: `/support/${ut.ticketId}`,
        severity: "critical",
      });
    }

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
