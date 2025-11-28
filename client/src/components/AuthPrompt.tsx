import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

type AuthPromptProps = {
  onClose: () => void;
  onContinueGuest: () => void;
};

export default function AuthPrompt({ onClose, onContinueGuest }: AuthPromptProps) {
  const projectId = "031b64db-3233-44f3-9441-232194439c8a";
  const authBase = "https://api.stack-auth.com";
  const redirectUri = window.location.origin + "/auth/callback";
  const oauthUrl = `${authBase}/oauth/authorize?projectId=${projectId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

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
            <iframe src={oauthUrl} title="Login or Sign Up" className="w-full h-[520px] rounded border" />
            <Button onClick={onContinueGuest} variant="outline">Continue as Guest</Button>
          </div>
          <p className="text-xs text-muted-foreground">By continuing, you agree to our Terms and Privacy Policy.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
