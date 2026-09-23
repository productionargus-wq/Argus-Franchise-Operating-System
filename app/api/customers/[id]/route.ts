import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const customer = await dbRepository.getCustomerById(params.id, orgId);
    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const customerOrgId = customer.orgId || orgId;

    // Gather linked records scoped to the customer's organization
    const allOpps = await dbRepository.getOpportunities(customerOrgId);
    const allQuotes = await dbRepository.getQuotations(customerOrgId);
    const allOrders = await dbRepository.getOrders(customerOrgId);
    const allInstallations = await dbRepository.getInstallations(customerOrgId);
    const allTickets = await dbRepository.getSupportTickets(customerOrgId);
    const allRenewals = await dbRepository.getRenewals(customerOrgId);

    const opps = allOpps.filter((o) => o.customerId === customer._id || o.customerId === customer.customerId);
    const quotes = allQuotes.filter((q) => q.customerId === customer._id || q.customerId === customer.customerId);
    const orders = allOrders.filter((o) => o.customerId === customer._id || o.customerId === customer.customerId);
    const installations = allInstallations.filter((i) => i.customerId === customer._id || i.customerId === customer.customerId);
    const tickets = allTickets.filter((t) => t.customerId === customer._id || t.customerId === customer.customerId);
    const renewals = allRenewals.filter((r) => r.customerId === customer._id || r.customerId === customer.customerId);

  // Dynamic upsell suggestions based on installed base
  const upsells = [
    {
      sku: "ARG-ACC-4AXIS",
      title: "4th Axis Rotary Table Upgrade",
      reason: "Enhances VMC-700 capacity for multi-sided impellers and complex automotive brackets.",
      estimatedValue: 280000,
      readiness: "High Interest",
    },
    {
      sku: "ARG-SOFT-CAMPRO",
      title: "ArgusCAM Pro Multi-Axis License",
      reason: "Reduces cycle times by 18% with advanced trochoidal roughing algorithms.",
      estimatedValue: 150000,
      readiness: "In Evaluation",
    },
    {
      sku: "ARG-AMC-VMC-ANNUAL",
      title: "Spindle Warranty Extension (Year 2)",
      reason: "Warranty expires within 60 days. Protect critical 8000 RPM BT40 spindle.",
      estimatedValue: 72000,
      readiness: "Due Soon",
    },
  ];

    return NextResponse.json({
      customer,
      opportunities: opps,
      quotations: quotes,
      orders,
      installations,
      tickets,
      renewals,
      upsells,
    });
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") throw err;
    console.error(`Failed to fetch customer ${params.id}:`, err);
    return NextResponse.json({ error: err?.message || "Failed to fetch customer" }, { status: 500 });
  }
}
