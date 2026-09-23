import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, name, avatar, companyName, gstin } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. REGISTRATION WORKFLOW
    if (action === "register") {
      if (!companyName || !companyName.trim()) {
        return NextResponse.json({ error: "Company Name is required" }, { status: 400 });
      }
      // GSTIN is optional / flexible
      const cleanGstin = gstin && gstin.trim() ? gstin.trim().toUpperCase() : "NOT_PROVIDED";

      const result = await dbRepository.registerOrganization({
        name: companyName.trim(),
        gstin: cleanGstin,
        adminEmail: normalizedEmail,
        adminName: name || "Head Office Admin",
        avatar: avatar || undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Organization registered successfully and submitted for Super Admin approval.",
        organization: result.organization,
        user: result.adminUser,
      }, { status: 201 });
    }

    // 2. LOGIN WORKFLOW
    console.log(`[Google Auth] Received sign-in request for email: "${normalizedEmail}"`);
    const authData = await dbRepository.getUserByEmail(normalizedEmail);

    if (!authData) {
      console.warn(
        `[Google Auth] 403 Forbidden: Email "${normalizedEmail}" was not found in 'super_admins' collection nor in 'users' collection.`
      );
      return NextResponse.json(
        {
          error: `Access Denied: The Google account (${normalizedEmail}) is not registered in our system. Please contact your organization administrator or register your organization.`,
          code: "UNREGISTERED",
          email: normalizedEmail,
        },
        { status: 403 }
      );
    }

    const { user, organization } = authData;
    console.log(`[Google Auth] Authentication successful for "${normalizedEmail}". Role: ${user.role}`);

    // Super Admin Flow
    if (user.role === "super_admin") {
      return NextResponse.json({
        success: true,
        user,
        organization: null,
        redirectUrl: "/super-admin",
      });
    }

    // Tenant Organization Verification
    if (!organization) {
      return NextResponse.json(
        {
          error: "Your user account is not linked to an active organization.",
          code: "NO_ORGANIZATION",
        },
        { status: 403 }
      );
    }

    if (organization.status === "PENDING_APPROVAL") {
      return NextResponse.json({
        success: true,
        user,
        organization,
        status: "PENDING_APPROVAL",
        redirectUrl: "/pending-approval",
      });
    }

    if (organization.status === "REJECTED") {
      return NextResponse.json(
        {
          error: `Your organization (${organization.name}) registration was rejected by the Super Admin: ${organization.rejectionReason || "Verification failed."}`,
          code: "ORG_REJECTED",
          reason: organization.rejectionReason,
        },
        { status: 403 }
      );
    }

    if (organization.status === "SUSPENDED") {
      return NextResponse.json(
        {
          error: `Your organization (${organization.name}) has been suspended. Please contact platform support.`,
          code: "ORG_SUSPENDED",
        },
        { status: 403 }
      );
    }

    // Approved Organization - Route to appropriate persona dashboard
    const redirectUrl =
      user.role === "head_office_admin" || user.role === "finance_accounts"
        ? "/ho/dashboard"
        : "/dashboard";

    return NextResponse.json({
      success: true,
      user,
      organization,
      status: "APPROVED",
      redirectUrl,
    });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Google Auth API Error:", error);
    return NextResponse.json(
      { error: error?.message || "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
