import { CustomerSidebar } from "@/components/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function AccountSettings() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("(555) 123-4567");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [offerUpdates, setOfferUpdates] = useState(true);
  const [shipmentUpdates, setShipmentUpdates] = useState(true);
  const [payoutUpdates, setPayoutUpdates] = useState(true);

  return (
    <div className="flex min-h-screen">
      <CustomerSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and notifications</p>
          </div>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>

                <Button data-testid="button-save-personal">Save Changes</Button>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password"
                    type="password"
                    data-testid="input-current-password"
                  />
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password"
                    type="password"
                    data-testid="input-new-password"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    data-testid="input-confirm-password"
                  />
                </div>

                <Button data-testid="button-change-password">Update Password</Button>
              </div>
            </Card>

            {/* Email Notifications */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Email Notifications</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    data-testid="switch-email-notifications"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="offer-updates">Offer Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about quote status and expirations
                    </p>
                  </div>
                  <Switch 
                    id="offer-updates"
                    checked={offerUpdates}
                    onCheckedChange={setOfferUpdates}
                    disabled={!emailNotifications}
                    data-testid="switch-offer-updates"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shipment-updates">Shipment Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Tracking and delivery notifications
                    </p>
                  </div>
                  <Switch 
                    id="shipment-updates"
                    checked={shipmentUpdates}
                    onCheckedChange={setShipmentUpdates}
                    disabled={!emailNotifications}
                    data-testid="switch-shipment-updates"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payout-updates">Payout Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Payment processing and completion notifications
                    </p>
                  </div>
                  <Switch 
                    id="payout-updates"
                    checked={payoutUpdates}
                    onCheckedChange={setPayoutUpdates}
                    disabled={!emailNotifications}
                    data-testid="switch-payout-updates"
                  />
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-destructive">
              <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Deleting your account is permanent and cannot be undone. All your data, including quotes, orders, and payout history will be permanently removed.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" data-testid="button-delete-account">
                Delete My Account
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
