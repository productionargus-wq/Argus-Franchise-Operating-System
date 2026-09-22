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

    // Upsert franchises so all 12 territories are guaranteed
    for (const fr of MOCK_FRANCHISES) {
      await FranchiseModel.findOneAndUpdate({ code: fr.code }, { $set: sanitize(fr) }, { upsert: true });
    }

    // Populate products if empty
    if ((await ProductModel.countDocuments()) < MOCK_PRODUCTS.length) {
      for (const p of MOCK_PRODUCTS) {
        await ProductModel.findOneAndUpdate({ sku: p.sku }, { $set: sanitize(p) }, { upsert: true });
      }
    }

    // Populate customers if empty
    if ((await CustomerModel.countDocuments()) < MOCK_CUSTOMERS.length) {
      for (const c of MOCK_CUSTOMERS) {
        await CustomerModel.findOneAndUpdate({ customerId: c.customerId }, { $set: sanitize(c) }, { upsert: true });
      }
    }

    // Populate leads if empty
    if ((await LeadModel.countDocuments()) < MOCK_LEADS.length) {
      for (const l of MOCK_LEADS) {
        await LeadModel.findOneAndUpdate({ leadId: l.leadId }, { $set: sanitize(l) }, { upsert: true });
      }
    }

    // Populate opportunities
    try {
      await OpportunityModel.collection.dropIndex("oppId_1");
    } catch (e) {
      // ignore
    }
    if ((await OpportunityModel.countDocuments()) === 0) {
      const opps = MOCK_OPPORTUNITIES.map((opp) => {
        const clean = sanitize(opp);
        clean.oppId = clean.opportunityId || clean.oppId || `OP-${Date.now()}`;
        return clean;
      });
      await OpportunityModel.insertMany(opps);
    }

    // Populate quotations
    try {
      await QuotationModel.collection.dropIndex("quoteId_1");
    } catch (e) {
      // ignore
    }
    if ((await QuotationModel.countDocuments()) === 0) {
      const quotes = MOCK_QUOTATIONS.map((q) => {
        const clean = sanitize(q);
        clean.oppId = clean.opportunityId || clean.oppId;
        return clean;
      });
      await QuotationModel.insertMany(quotes);
    }

    // Populate orders
    if ((await OrderModel.countDocuments()) === 0) {
      await OrderModel.insertMany(sanitizeList(MOCK_ORDERS));
    }

    // Populate installations
    if ((await InstallationModel.countDocuments()) === 0) {
      await InstallationModel.insertMany(sanitizeList(MOCK_INSTALLATIONS));
    }

    // Populate support tickets
    if ((await SupportTicketModel.countDocuments()) === 0) {
      await SupportTicketModel.insertMany(sanitizeList(MOCK_SUPPORT_TICKETS));
    }

    // Populate renewals
    if ((await RenewalModel.countDocuments()) === 0) {
      await RenewalModel.insertMany(sanitizeList(MOCK_RENEWALS));
    }

    // Populate commissions
    if ((await CommissionModel.countDocuments()) === 0) {
      await CommissionModel.insertMany(sanitizeList(MOCK_COMMISSIONS));
    }

    // Populate territories
    if ((await TerritoryModel.countDocuments()) === 0) {
      await TerritoryModel.insertMany(sanitizeList(MOCK_TERRITORIES));
    }

    // Populate users
    if ((await UserModel.countDocuments()) === 0) {
      await UserModel.insertMany(sanitizeList(MOCK_USERS));
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
