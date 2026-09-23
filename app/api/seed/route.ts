import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
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
} from "@/lib/models";
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
} from "@/lib/mockData";

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

export async function GET() {
  try {
    await connectToDatabase();

    const TEMP_ORG = "ORG-TEMP";

    // Upsert franchises so all 12 territories are guaranteed
    for (const fr of MOCK_FRANCHISES) {
      await FranchiseModel.findOneAndUpdate({ code: fr.code, orgId: TEMP_ORG }, { $set: { ...sanitize(fr), orgId: TEMP_ORG } }, { upsert: true });
    }

    // Populate products if empty
    if ((await ProductModel.countDocuments({ orgId: TEMP_ORG })) < MOCK_PRODUCTS.length) {
      for (const p of MOCK_PRODUCTS) {
        await ProductModel.findOneAndUpdate({ sku: p.sku, orgId: TEMP_ORG }, { $set: { ...sanitize(p), orgId: TEMP_ORG } }, { upsert: true });
      }
    }

    // Populate customers if empty
    if ((await CustomerModel.countDocuments({ orgId: TEMP_ORG })) < MOCK_CUSTOMERS.length) {
      for (const c of MOCK_CUSTOMERS) {
        await CustomerModel.findOneAndUpdate({ customerId: c.customerId, orgId: TEMP_ORG }, { $set: { ...sanitize(c), orgId: TEMP_ORG } }, { upsert: true });
      }
    }

    // Populate leads if empty
    if ((await LeadModel.countDocuments({ orgId: TEMP_ORG })) < MOCK_LEADS.length) {
      for (const l of MOCK_LEADS) {
        await LeadModel.findOneAndUpdate({ leadId: l.leadId, orgId: TEMP_ORG }, { $set: { ...sanitize(l), orgId: TEMP_ORG } }, { upsert: true });
      }
    }

    // Populate opportunities
    if ((await OpportunityModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      const opps = MOCK_OPPORTUNITIES.map((opp) => {
        const clean = sanitize(opp);
        clean.orgId = TEMP_ORG;
        clean.oppId = clean.opportunityId || clean.oppId || `OP-${Date.now()}`;
        return clean;
      });
      await OpportunityModel.insertMany(opps);
    }

    // Populate quotations
    if ((await QuotationModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      const quotes = MOCK_QUOTATIONS.map((q) => {
        const clean = sanitize(q);
        clean.orgId = TEMP_ORG;
        clean.oppId = clean.opportunityId || clean.oppId;
        return clean;
      });
      await QuotationModel.insertMany(quotes);
    }

    // Populate orders
    if ((await OrderModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await OrderModel.insertMany(MOCK_ORDERS.map((o) => ({ ...sanitize(o), orgId: TEMP_ORG })));
    }

    // Populate installations
    if ((await InstallationModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await InstallationModel.insertMany(MOCK_INSTALLATIONS.map((i) => ({ ...sanitize(i), orgId: TEMP_ORG })));
    }

    // Populate support tickets
    if ((await SupportTicketModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await SupportTicketModel.insertMany(MOCK_SUPPORT_TICKETS.map((s) => ({ ...sanitize(s), orgId: TEMP_ORG })));
    }

    // Populate renewals
    if ((await RenewalModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await RenewalModel.insertMany(MOCK_RENEWALS.map((r) => ({ ...sanitize(r), orgId: TEMP_ORG })));
    }

    // Populate commissions
    if ((await CommissionModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await CommissionModel.insertMany(MOCK_COMMISSIONS.map((c) => ({ ...sanitize(c), orgId: TEMP_ORG })));
    }

    // Populate territories
    if ((await TerritoryModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await TerritoryModel.insertMany(MOCK_TERRITORIES.map((t) => ({ ...sanitize(t), orgId: TEMP_ORG })));
    }

    // Populate users
    if ((await UserModel.countDocuments({ orgId: TEMP_ORG })) === 0) {
      await UserModel.insertMany(MOCK_USERS.map((u) => ({ ...sanitize(u), orgId: TEMP_ORG, orgName: "Demo CNC Systems (Template)" })));
    }

    const counts = {
      franchises: await FranchiseModel.countDocuments(),
      products: await ProductModel.countDocuments(),
      customers: await CustomerModel.countDocuments(),
      leads: await LeadModel.countDocuments(),
      opportunities: await OpportunityModel.countDocuments(),
      quotations: await QuotationModel.countDocuments(),
      orders: await OrderModel.countDocuments(),
      installations: await InstallationModel.countDocuments(),
      supportTickets: await SupportTicketModel.countDocuments(),
      renewals: await RenewalModel.countDocuments(),
      commissions: await CommissionModel.countDocuments(),
      territories: await TerritoryModel.countDocuments(),
      users: await UserModel.countDocuments(),
    };

    return NextResponse.json({ success: true, message: "MongoDB Atlas synchronized successfully!", counts });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
