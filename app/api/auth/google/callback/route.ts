import { NextResponse } from "next/server";
import { dbRepository } from "@/lib/dbRepository";

export const dynamic = "force-dynamic";

function decodeGoogleJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    let credential = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      credential = (formData.get("credential") as string) || "";
    } else {
      const body = await request.json().catch(() => ({}));
      credential = body.credential || "";
    }

    if (!credential) {
      return new Response(
        `<!DOCTYPE html><html><body style="background:#293033;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;"><p>Authentication failed: Missing credential.</p><script>setTimeout(() => window.location.replace('/login'), 2000);</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const payload = decodeGoogleJwt(credential);
    if (!payload || !payload.email) {
      return new Response(
        `<!DOCTYPE html><html><body style="background:#293033;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;"><p>Invalid Google credential token.</p><script>setTimeout(() => window.location.replace('/login'), 2000);</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const name = payload.name || normalizedEmail.split("@")[0] || "User";
    const avatar = payload.picture || "";

    console.log(`[Google Callback] Received auth token for email: ${normalizedEmail}`);

    const authData = await dbRepository.getUserByEmail(normalizedEmail);

    if (!authData) {
      console.warn(`[Google Callback] 403 Forbidden: Email ${normalizedEmail} is not registered.`);
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Access Denied - Unregistered Account</title>
  <style>
    body { background-color: #293033; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #1E2426; padding: 32px; border-radius: 16px; border: 1px solid #3A4448; max-width: 440px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h2 { color: #EF4444; margin-bottom: 12px; font-size: 20px; }
    p { color: #94A3B8; font-size: 13px; line-height: 1.6; margin-bottom: 20px; }
    .btn { background: #FF6600; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Access Denied: Unregistered Account</h2>
    <p>The Google account <strong>${normalizedEmail}</strong> is not registered in our system.<br>Please contact your Head Office administrator to grant you access, or register your organization.</p>
    <a href="/login" class="btn">Return to Sign In</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.replace('/access-denied?email=' + encodeURIComponent('${normalizedEmail}'));
    }, 2000);
  </script>
</body>
</html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const { user, organization } = authData;

    let redirectUrl = "/dashboard";
    if (user.role === "super_admin") {
      redirectUrl = "/super-admin";
    } else if (organization && organization.status === "PENDING_APPROVAL") {
      redirectUrl = "/pending-approval";
    } else if (organization && organization.status === "REJECTED") {
      redirectUrl = "/login?error=org_rejected";
    } else if (organization && organization.status === "SUSPENDED") {
      redirectUrl = "/login?error=org_suspended";
    } else if (user.role === "head_office_admin" || user.role === "finance_accounts") {
      redirectUrl = "/ho/dashboard";
    }

    const sessionPayload = {
      user: {
        id: user.id || user._id,
        name: user.name || name,
        email: user.email,
        role: user.role,
        orgId: user.orgId || null,
        orgName: organization?.name || user.orgName || null,
        franchiseId: user.franchiseId || null,
        franchiseName: user.franchiseName || undefined,
        avatar: user.avatar || avatar || undefined,
        status: user.status || "active",
      },
      organization: organization || null,
    };

    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Argus Franchise Operating System - Authenticating</title>
  <style>
    body { background-color: #293033; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .spinner { width: 38px; height: 38px; border: 3px solid rgba(255, 102, 0, 0.2); border-top: 3px solid #FF6600; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    .status { font-size: 13px; color: #94A3B8; font-weight: 500; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="status">Signing in as ${name}...</div>
  <script>
    try {
      const session = ${JSON.stringify(sessionPayload)};
      localStorage.setItem("argus_auth_session", JSON.stringify(session));
      localStorage.setItem("argus_current_user_id", ${JSON.stringify(user.id || user._id)});
      window.location.replace("${redirectUrl}");
    } catch (e) {
      console.error("Session storage error:", e);
      window.location.replace("${redirectUrl}");
    }
  </script>
</body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("Google Auth callback error:", error);
    return new Response(
      `<!DOCTYPE html><html><body style="background:#293033;color:white;font-family:sans-serif;padding:40px;"><p>Authentication processing error: ${error?.message || "Internal server error"}</p><script>setTimeout(() => window.location.replace('/login'), 3000);</script></body></html>`,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return new Response(
    `<!DOCTYPE html><html><body style="background:#293033;color:white;font-family:sans-serif;padding:40px;"><p>Redirecting to sign in...</p><script>window.location.replace('/login');</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
