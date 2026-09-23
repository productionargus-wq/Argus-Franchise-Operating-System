"use client";

import React, { useState, useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
  mode: "login" | "register";
  label?: string;
  disabled?: boolean;
  onAuthenticated: (email: string, name: string) => void;
  isLoading?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleSignInButton({
  mode,
  label,
  disabled = false,
  onAuthenticated,
  isLoading = false,
}: GoogleSignInButtonProps) {
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "378804509607-1g9lguuc8gvv52ojira20hisr0citcsj.apps.googleusercontent.com";

  // Decode JWT payload returned by Google Identity Services
  const handleCredentialResponse = (response: any) => {
    if (!response?.credential) return;
    try {
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.email) {
        onAuthenticated(
          payload.email.toLowerCase(),
          payload.name || payload.email.split("@")[0]
        );
      }
    } catch (e) {
      console.error("Failed to decode Google Identity credential:", e);
    }
  };

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initGIS = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: mode === "register" ? "signup_with" : "signin_with",
              shape: "rectangular",
              logo_alignment: "center",
              width: 360,
            });
            setGisLoaded(true);
          }
        } catch (err) {
          console.warn("Google GIS initialization notice:", err);
        }
      }
    };

    // If script already loaded
    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      // Poll briefly for GIS script readiness
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGIS();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, mode]);

  const defaultLabel =
    mode === "register" ? "Sign up with Google" : "Sign in with Google";

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Loading overlay when authenticating */}
      {isLoading ? (
        <div className="w-full h-11 py-2 px-4 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-2xs">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-[#FF6600] rounded-full animate-spin"></div>
          <span>Authenticating with Google...</span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {/* Official Google Identity Services Render Container */}
          <div
            ref={googleBtnContainerRef}
            className={`w-full flex justify-center items-center overflow-hidden min-h-[44px] ${
              disabled ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
            } ${!gisLoaded ? "hidden" : ""}`}
          />

          {/* Placeholder while GIS script initializes */}
          {!gisLoaded && (
            <div className="w-full max-w-[360px] h-[44px] py-2 px-4 bg-white border border-slate-300 rounded-lg flex items-center justify-center gap-3 shadow-2xs animate-pulse">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-xs font-semibold text-slate-600">
                {label || defaultLabel}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
