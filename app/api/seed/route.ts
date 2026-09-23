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

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const targetOrg = searchParams.get("orgId") || "ORG-TEMP";

    // Upsert franchises so all 12 territories are guaranteed
    for (const fr of MOCK_FRANCHISES) {
      await FranchiseModel.findOneAndUpdate({ code: fr.code, orgId: targetOrg }, { $set: { ...sanitize(fr), orgId: targetOrg } }, { upsert: true });
    }

    // Populate products if empty
    if ((await ProductModel.countDocuments({ orgId: targetOrg })) < MOCK_PRODUCTS.length) {
      for (const p of MOCK_PRODUCTS) {
        await ProductModel.findOneAndUpdate({ sku: p.sku, orgId: targetOrg }, { $set: { ...sanitize(p), orgId: targetOrg } }, { upsert: true });
      }
    }

    // Populate customers if empty
    if ((await CustomerModel.countDocuments({ orgId: targetOrg })) < MOCK_CUSTOMERS.length) {
      for (const c of MOCK_CUSTOMERS) {
        await CustomerModel.findOneAndUpdate({ customerId: c.customerId, orgId: targetOrg }, { $set: { ...sanitize(c), orgId: targetOrg } }, { upsert: true });
      }
    }

    // Populate leads if empty
    if ((await LeadModel.countDocuments({ orgId: targetOrg })) < MOCK_LEADS.length) {
      for (const l of MOCK_LEADS) {
        await LeadModel.findOneAndUpdate({ leadId: l.leadId, orgId: targetOrg }, { $set: { ...sanitize(l), orgId: targetOrg } }, { upsert: true });
      }
    }

    // Populate opportunities
    if ((await OpportunityModel.countDocuments({ orgId: targetOrg })) === 0) {
      const opps = MOCK_OPPORTUNITIES.map((opp) => {
        const clean = sanitize(opp);
        clean.orgId = targetOrg;
        clean.oppId = clean.opportunityId || clean.oppId || `OP-${Date.now()}`;
        return clean;
      });
      await OpportunityModel.insertMany(opps);
    }

    // Populate quotations
    if ((await QuotationModel.countDocuments({ orgId: targetOrg })) === 0) {
      const quotes = MOCK_QUOTATIONS.map((q) => {
        const clean = sanitize(q);
        clean.orgId = targetOrg;
        clean.oppId = clean.opportunityId || clean.oppId;
        return clean;
      });
      await QuotationModel.insertMany(quotes);
    }

    // Populate orders
    if ((await OrderModel.countDocuments({ orgId: targetOrg })) === 0) {
      await OrderModel.insertMany(MOCK_ORDERS.map((o) => ({ ...sanitize(o), orgId: targetOrg })));
    }

    // Populate installations
    if ((await InstallationModel.countDocuments({ orgId: targetOrg })) === 0) {
      await InstallationModel.insertMany(MOCK_INSTALLATIONS.map((i) => ({ ...sanitize(i), orgId: targetOrg })));
    }

    // Populate support tickets
    if ((await SupportTicketModel.countDocuments({ orgId: targetOrg })) === 0) {
      await SupportTicketModel.insertMany(MOCK_SUPPORT_TICKETS.map((s) => ({ ...sanitize(s), orgId: targetOrg })));
    }

    // Populate renewals
    if ((await RenewalModel.countDocuments({ orgId: targetOrg })) === 0) {
      await RenewalModel.insertMany(MOCK_RENEWALS.map((r) => ({ ...sanitize(r), orgId: targetOrg })));
    }

    // Populate commissions
    if ((await CommissionModel.countDocuments({ orgId: targetOrg })) === 0) {
      await CommissionModel.insertMany(MOCK_COMMISSIONS.map((c) => ({ ...sanitize(c), orgId: targetOrg })));
    }

    // Populate territories
    if ((await TerritoryModel.countDocuments({ orgId: targetOrg })) === 0) {
      await TerritoryModel.insertMany(MOCK_TERRITORIES.map((t) => ({ ...sanitize(t), orgId: targetOrg })));
    }

    // Populate users
    if ((await UserModel.countDocuments({ orgId: targetOrg })) === 0) {
      await UserModel.insertMany(MOCK_USERS.map((u) => ({ ...sanitize(u), orgId: targetOrg, orgName: "Industrial CNC Systems" })));
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
