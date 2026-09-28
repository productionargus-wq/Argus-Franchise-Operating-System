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
    const allProducts = await dbRepository.getProducts(customerOrgId);

    const opps = allOpps.filter((o) => o.customerId === customer._id || o.customerId === customer.customerId);
    const quotes = allQuotes.filter((q) => q.customerId === customer._id || q.customerId === customer.customerId);
    const orders = allOrders.filter((o) => o.customerId === customer._id || o.customerId === customer.customerId);
    const installations = allInstallations.filter((i) => i.customerId === customer._id || i.customerId === customer.customerId);
    const tickets = allTickets.filter((t) => t.customerId === customer._id || t.customerId === customer.customerId);
    const renewals = allRenewals.filter((r) => r.customerId === customer._id || r.customerId === customer.customerId);

    // DYNAMIC UPSELL MATRIX GENERATION
    const upsells: Array<{
      sku: string;
      title: string;
      reason: string;
      estimatedValue: number;
      readiness: string;
      isCustom?: boolean;
    }> = [];

    // 1. User-created custom upsell opportunities stored on the customer
    if (Array.isArray((customer as any).customUpsells)) {
      for (const custom of (customer as any).customUpsells) {
        if (custom && custom.title) {
          upsells.push({
            sku: custom.sku || `UP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            title: custom.title,
            reason: custom.reason || `Custom growth opportunity identified for ${customer.companyName}.`,
            estimatedValue: Number(custom.estimatedValue) || 100000,
            readiness: custom.readiness || "In Evaluation",
            isCustom: true,
          });
        }
      }
    }

    // 2. Identify products already purchased by this customer
    const purchasedSkus = new Set<string>();
    const purchasedProductNames: string[] = [];
    orders.forEach((o) => {
      o.items?.forEach((it: any) => {
        if (it.sku) purchasedSkus.add(it.sku);
        if (it.name) purchasedProductNames.push(it.name);
      });
    });
    installations.forEach((inst) => {
      if (inst.productName) purchasedProductNames.push(inst.productName);
    });

    const primaryInstalledName =
      purchasedProductNames[0] || (customer.industry ? `${customer.industry} Machinery` : "Installed Base");

    // 3. Dynamic Catalog Upsells from the Organization's Actual Product Catalog
    allProducts.forEach((p) => {
      if (!purchasedSkus.has(p.sku)) {
        let reason = "";
        let readiness = "In Evaluation";
        const val = p.listPrice || p.minSellingPrice || 100000;

        const cat = String(p.category || "");
        if (cat === "Software" || cat.toLowerCase().includes("software")) {
          reason = `Deploy ${p.name} license to accelerate CAM programming, optimize toolpaths, and integrate with ${customer.companyName}'s shop floor.`;
          readiness = "High Interest";
        } else if (cat === "CNC Accessories" || cat.toLowerCase().includes("accessor")) {
          reason = `Direct upgrade compatible with ${primaryInstalledName} to expand multi-axis capabilities and reduce setup times.`;
          readiness = "In Evaluation";
        } else if (cat === "AMC / Service" || cat.toLowerCase().includes("amc") || cat.toLowerCase().includes("service")) {
          reason = `Comprehensive annual preventive maintenance contract ensuring calibration, spindle health, and priority uptime at ${customer.companyName}.`;
          readiness = "Due Soon";
        } else {
          reason = `Scale ${customer.companyName}'s production throughput in ${customer.industry || "manufacturing"} with the ${p.name}.`;
          readiness = orders.length > 0 ? "High Interest" : "In Evaluation";
        }

        upsells.push({
          sku: p.sku,
          title: p.name,
          reason,
          estimatedValue: val,
          readiness,
        });
      }
    });

    // 4. Equipment Service / AMC Recommendation for active installations without active renewal
    installations.forEach((inst) => {
      const hasActiveRenewal = renewals.some(
        (r) => r.machineSerial && r.machineSerial === inst.machineSerial && r.status === "Active"
      );
      if (!hasActiveRenewal) {
        const amcSku = `AMC-${inst.machineSerial || inst.installationId}`;
        if (!upsells.some((u) => u.sku === amcSku)) {
          upsells.push({
            sku: amcSku,
            title: `Extended Care & AMC: ${inst.productName || "Equipment"} (${inst.machineSerial})`,
            reason: `Active machine in the field. Proactive annual service contract locks in calibration and prevents breakdown stoppage.`,
            estimatedValue: 65000,
            readiness: "Due Soon",
          });
        }
      }
    });

    // 5. Critical Spares Kit if customer had breakdown tickets
    if (tickets.length > 0 && !upsells.some((u) => u.sku.startsWith("SPARE-"))) {
      upsells.push({
        sku: `SPARE-${customer.customerId || "CUST"}`,
        title: "Critical Consumables & Spares Overhaul Kit",
        reason: `Based on past maintenance tickets, stocking critical sensors, seals, and tool wear spares on-site mitigates emergency downtime.`,
        estimatedValue: 48000,
        readiness: "High Priority",
      });
    }

    // 6. Capacity Line Expansion if customer already ordered equipment
    if (orders.length > 0 && purchasedProductNames.length > 0) {
      const topProduct = purchasedProductNames[0];
      const expansionSku = `EXP-${customer.customerId || "CUST"}`;
      if (!upsells.some((u) => u.sku === expansionSku)) {
        upsells.push({
          sku: expansionSku,
          title: `${topProduct} - Capacity Expansion Unit`,
          reason: `Customer demonstrates strong order history. High fleet utilization indicates readiness to add a second ${topProduct} cell.`,
          estimatedValue: orders[0]?.orderValue || 1500000,
          readiness: "In Evaluation",
        });
      }
    }

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const orgId = body.orgId || searchParams.get("orgId");
    const updated = await dbRepository.updateCustomer(params.id, body, orgId);
    if (!updated) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
