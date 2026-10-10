import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, orgId } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ valid: false, error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const authData = await dbRepository.getUserByEmail(normalizedEmail);

    if (!authData) {
      return NextResponse.json(
        {
          valid: false,
          code: "ACCOUNT_DELETED",
          error: "User account does not exist or has been deleted.",
        },
        { status: 401 }
      );
    }

    const { user, organization } = authData;

    // Check if user status is disabled
    if (user.status === "disabled") {
      return NextResponse.json(
        {
          valid: false,
          code: "ACCOUNT_DISABLED",
          error: "User account has been disabled.",
        },
        { status: 403 }
      );
    }

    // If orgId was provided, verify user still belongs to this org
    if (user.role !== "super_admin" && orgId && user.orgId !== orgId) {
      return NextResponse.json(
        {
          valid: false,
          code: "ORG_MISMATCH",
          error: "User organization mismatch.",
        },
        { status: 403 }
      );
    }

    // Check organization status if regular user
    if (organization) {
      if (organization.status === "SUSPENDED") {
        return NextResponse.json(
          {
            valid: false,
            code: "ORG_SUSPENDED",
            error: "Organization is suspended.",
          },
          { status: 403 }
        );
      }
      if (organization.status === "REJECTED") {
        return NextResponse.json(
          {
            valid: false,
            code: "ORG_REJECTED",
            error: "Organization registration was rejected.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      valid: true,
      user,
      organization,
    });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Auth verify POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const orgId = searchParams.get("orgId") || undefined;

    if (!email) {
      return NextResponse.json({ valid: false, error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const authData = await dbRepository.getUserByEmail(normalizedEmail);

    if (!authData) {
      return NextResponse.json(
        {
          valid: false,
          code: "ACCOUNT_DELETED",
          error: "User account does not exist or has been deleted.",
        },
        { status: 401 }
      );
    }

    const { user, organization } = authData;

    if (user.status === "disabled") {
      return NextResponse.json(
        {
          valid: false,
          code: "ACCOUNT_DISABLED",
          error: "User account has been disabled.",
        },
        { status: 403 }
      );
    }

    if (user.role !== "super_admin" && orgId && user.orgId !== orgId) {
      return NextResponse.json(
        {
          valid: false,
          code: "ORG_MISMATCH",
          error: "User organization mismatch.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      user,
      organization,
    });
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
    console.error("Auth verify GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
