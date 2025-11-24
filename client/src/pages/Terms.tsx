import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <section className="py-16 relative overflow-hidden">
          {/* Dark luxury background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="backdrop-blur-md bg-card/50 border border-border/50 rounded-xl p-8 md:p-12 hover:shadow-2xl transition-all duration-500">
                <div className="prose prose-slate max-w-none dark:prose-invert">
              <h1>Terms of Service</h1>
              <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using SecondHandCell's device buyback services, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old to sell devices to SecondHandCell. By using our services, you represent and warrant that:
              </p>
              <ul>
                <li>You are the legal owner of the device(s) you are selling</li>
                <li>The device(s) are not stolen, lost, or obtained through fraudulent means</li>
                <li>The device(s) are free of any liens, encumbrances, or financing obligations</li>
                <li>You have the legal right to transfer ownership of the device(s)</li>
              </ul>

              <h2>3. Quote and Pricing</h2>
              <p>
                Quotes provided by SecondHandCell are estimates based on the information you provide about your device's condition. 
                The final offer may differ based on our inspection findings.
              </p>
              <ul>
                <li><strong>Quote Validity:</strong> Initial quotes are valid for 14 days from the date of acceptance, provided the device is shipped within 5 business days</li>
                <li><strong>Condition Assessment:</strong> Our inspection team will verify the device condition against your description</li>
                <li><strong>Revised Offers:</strong> If the actual condition differs from your description, we will provide a revised offer</li>
                <li><strong>Acceptance Period:</strong> You have 3 business days to accept or decline a revised offer</li>
              </ul>

              <h2>4. Device Requirements</h2>
              <p>All devices submitted must meet the following requirements:</p>
              <ul>
                <li>Must be free of activation locks (Find My iPhone, Google Find My Device, etc.)</li>
                <li>Must be factory reset with all personal data removed</li>
                <li>Must not be blacklisted, reported lost, or reported stolen</li>
                <li>Must not have outstanding financing or carrier obligations (unless disclosed in quote)</li>
                <li>Must be free of iCloud/Google account locks</li>
              </ul>

              <h2>5. Shipping</h2>
              <p>
                SecondHandCell provides prepaid shipping labels at no cost to you. You are responsible for:
              </p>
              <ul>
                <li>Packaging the device securely to prevent damage during transit</li>
                <li>Removing all SIM cards, memory cards, and personal accessories</li>
                <li>Dropping off the package at an authorized carrier location</li>
                <li>Ensuring the device is properly wiped and reset before shipping</li>
              </ul>
              <p>
                We are not responsible for devices lost or damaged during shipping if you choose to use your own shipping method 
                instead of our provided label.
              </p>

              <h2>6. Inspection Process</h2>
              <p>
                Upon receiving your device, we will:
              </p>
              <ul>
                <li>Inspect the device within 1-2 business days of receipt</li>
                <li>Verify physical condition, functionality, and IMEI/serial number</li>
                <li>Check for activation locks, blacklist status, and financing obligations</li>
                <li>Compare findings against your original description</li>
              </ul>

              <h2>7. Payment</h2>
              <p>
                Payment will be processed within 24 hours of your acceptance of the final offer. Payment methods include:
              </p>
              <ul>
                <li><strong>PayPal:</strong> Same-day processing (typically within 24 hours)</li>
                <li><strong>Bank Transfer:</strong> 1-3 business days</li>
                <li><strong>Check:</strong> Mailed within 2 business days</li>
                <li><strong>Gift Card:</strong> Instant delivery via email</li>
              </ul>
              <p>
                SecondHandCell is not responsible for delays caused by third-party payment processors, incorrect payment information 
                provided by you, or banking institution processing times.
              </p>

              <h2>8. Declined Offers and Returns</h2>
              <p>
                If you decline a revised offer or if we cannot purchase your device due to activation locks, blacklist status, 
                or other issues, we will return your device to you free of charge within 5-7 business days.
              </p>

              <h2>9. Data Security</h2>
              <p>
                While we strongly recommend that you backup and erase all data before shipping, SecondHandCell will perform 
                a certified data wipe on all devices we receive. However, we are not responsible for any data loss or 
                data breaches that occur before the device is in our possession.
              </p>

              <h2>10. Prohibited Items</h2>
              <p>
                You may not sell devices that:
              </p>
              <ul>
                <li>Are stolen, lost, or obtained through illegal means</li>
                <li>Have unpaid financing or carrier obligations (unless disclosed and accepted in quote)</li>
                <li>Are blacklisted or reported as lost/stolen with a carrier</li>
                <li>Contain illegal content or contraband</li>
                <li>Are government-issued or restricted devices without proper authorization</li>
              </ul>

              <h2>11. Limitation of Liability</h2>
              <p>
                SecondHandCell's liability is limited to the quoted purchase price of the device. We are not liable for:
              </p>
              <ul>
                <li>Loss of data or personal information not properly wiped by you</li>
                <li>Consequential, incidental, or indirect damages</li>
                <li>Third-party claims related to devices sold to us</li>
                <li>Devices lost or damaged during return shipping (we will file insurance claims when applicable)</li>
              </ul>

              <h2>12. Dispute Resolution</h2>
              <p>
                Any disputes arising from these terms or your use of our services shall be resolved through binding arbitration 
                in accordance with the rules of the American Arbitration Association. You waive any right to participate in 
                class action lawsuits or class-wide arbitration.
              </p>

              <h2>13. Modification of Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon 
                posting to our website. Your continued use of our services constitutes acceptance of the modified terms.
              </p>

              <h2>14. Contact Information</h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> legal@secondhandcell.com<br />
                <strong>Support:</strong> support@secondhandcell.com
              </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
