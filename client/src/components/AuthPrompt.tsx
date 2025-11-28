import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

type AuthPromptProps = {
  onClose: () => void;
  onContinueGuest: () => void;
};

export default function AuthPrompt({ onClose, onContinueGuest }: AuthPromptProps) {
  const projectId = "031b64db-3233-44f3-9441-232194439c8a";
  const stackAuthBase = "https://app.stack-auth.com";
  const redirectUri = window.location.origin + "/auth/callback";

  const handleLogin = () => {
    const url = `${stackAuthBase}/login?projectId=${projectId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const handleSignup = () => {
    const url = `${stackAuthBase}/signup?projectId=${projectId}&redirectUri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  return (
    <Dialog open onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue your checkout</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p>Choose how you want to continue:</p>
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleLogin} variant="default">Login</Button>
            <Button onClick={handleSignup} variant="secondary">Sign Up</Button>
            <Button onClick={onContinueGuest} variant="outline">Continue as Guest</Button>
          </div>
          <p className="text-xs text-muted-foreground">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
