import { useEffect } from "react";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    async function finishAuth() {
      if (!token) {
        setLocation("/sell");
        return;
      }
      try {
        const res = await fetch(getApiUrl(`/api/auth/stack/callback?token=${encodeURIComponent(token)}`), {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Auth callback failed");
        }
        // If opened as a popup, notify opener and close
        if (window.opener) {
          try {
            window.opener.postMessage({ type: "stack-auth:success" }, "*");
          } catch {}
          window.close();
        } else {
          setLocation("/sell");
        }
      } catch (e) {
        console.error(e);
        if (window.opener) {
          try {
            window.opener.postMessage({ type: "stack-auth:success" }, "*");
          } catch {}
          window.close();
        } else {
          setLocation("/sell");
        }
      }
    }

    finishAuth();
  }, [setLocation]);

  return null;
}