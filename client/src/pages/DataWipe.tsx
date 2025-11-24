import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DataWipe() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <section className="py-16 relative overflow-hidden">
          {/* Dark luxury background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block p-4 bg-blue-500/10 backdrop-blur-md rounded-full mb-6">
                <ShieldCheck className="w-16 h-16 text-blue-400 animate-pulse" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white animate-in fade-in duration-700">
                Data Wipe Guide
              </h1>
              <p className="text-xl text-white/60">
                Protect your privacy by properly erasing all personal data before shipping your device
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <Alert className="mb-12 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-lg hover:border-amber-600 transition-all duration-300 hover:shadow-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 animate-pulse" />
                <AlertDescription className="text-sm ml-2">
                  <strong>Important:</strong> Failure to properly wipe your device and disable activation locks will delay your payout. Devices with active locks will be returned to you at no charge.
                </AlertDescription>
              </Alert>

              <div className="space-y-12">
                {/* iPhone/iPad */}
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-4xl">🍎</span>
                    iPhone & iPad
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 1: Backup Your Data</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Connect to Wi-Fi and go to Settings → [Your Name] → iCloud → iCloud Backup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Back Up Now" and wait for completion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Alternatively, backup to iTunes/Finder on your computer</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 2: Sign Out of iCloud (Critical!)</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → [Your Name] → Scroll to bottom → "Sign Out"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Enter your Apple ID password when prompted</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>This will automatically disable "Find My iPhone"</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 3: Erase All Content and Settings</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → General → Transfer or Reset iPhone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Erase All Content and Settings"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Enter your passcode and confirm the erase</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 4: Remove from Apple Account (If Already Shipped)</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Visit iCloud.com and sign in with your Apple ID</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to "Find My iPhone" → All Devices</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Select your device and click "Remove from Account"</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Android */}
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-4xl">🤖</span>
                    Android (Samsung, Google Pixel, etc.)
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 1: Backup Your Data</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → System → Backup</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Back up now" to save to Google Drive</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Backup photos to Google Photos or your computer</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 2: Remove Google Account</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → Passwords & accounts (or Accounts)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Select your Google account and tap "Remove account"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>For Samsung: Also remove your Samsung account</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 3: Disable Find My Device</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → Security → Find My Device</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Toggle OFF and enter your password</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Step 4: Factory Reset</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to Settings → System → Reset options</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Erase all data (factory reset)"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Enter your PIN/password and confirm</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Apple Watch */}
                <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-4xl">⌚</span>
                    Apple Watch
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Option 1: Unpair from iPhone (Recommended)</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Open the Watch app on your iPhone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Go to "All Watches" and tap the (i) next to your watch</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Unpair Apple Watch" and confirm</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>This automatically disables Activation Lock</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-3">Option 2: Erase on Watch</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground ml-6">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>On the watch: Settings → General → Reset</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Tap "Erase All Content and Settings"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span>Enter your passcode and confirm</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Final Checklist */}
                <Card className="p-8 backdrop-blur-2xl bg-green-500/10 border-green-400/30">
                  <h2 className="text-2xl font-bold mb-6 text-white">Final Checklist Before Shipping</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Backed up all important photos, contacts, and data</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Signed out of all accounts (iCloud, Google, Samsung, etc.)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Disabled Find My iPhone/Find My Device/Activation Lock</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Performed factory reset to erase all content and settings</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Removed SIM card and any memory cards</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">Removed case and screen protector (device only)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
