import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { useEffect, useRef } from "react";
import { Button } from "../components/ui/button";

type AuthPromptProps = {
  onClose: () => void;
  onContinueGuest: () => void;
  onAuthSuccess: () => void;
};

export default function AuthPrompt({ onClose, onContinueGuest, onAuthSuccess }: AuthPromptProps) {
  const popupRef = useRef<Window | null>(null);
  const projectId = "031b64db-3233-44f3-9441-232194439c8a";
  const authBase = "https://api.stack-auth.com";
  const redirectUri = window.location.origin + "/auth/callback";
  const oauthUrl = `${authBase}/oauth/authorize?projectId=${projectId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data as any;
      if (data && data.type === "stack-auth:success") {
        // Close popup if still open
        try { popupRef.current?.close(); } catch {}
        onAuthSuccess();
        onClose();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onAuthSuccess, onClose]);

  const openPopup = () => {
    const w = 520, h = 640;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    popupRef.current = window.open(
      oauthUrl,
      "stack-auth",
      `popup=yes,width=${w},height=${h},left=${left},top=${top}`
    );
  };

  return (
    <Dialog open onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue your checkout</DialogTitle>
          <DialogDescription>Login or sign up without leaving this page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p>Choose how you want to continue:</p>
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={openPopup} variant="default">Login or Sign Up</Button>
            <Button onClick={onContinueGuest} variant="outline">Continue as Guest</Button>
          </div>
          <p className="text-xs text-muted-foreground">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
