import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";

export default function Privacy() {
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
              <h1>Privacy Policy</h1>
              <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

              <h2>1. Introduction</h2>
              <p>
                SecondHandCell ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our device buyback services.
              </p>

              <h2>2. Information We Collect</h2>
              
              <h3>2.1 Personal Information</h3>
              <p>We collect personal information that you provide directly to us, including:</p>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, shipping address</li>
                <li><strong>Account Information:</strong> Username, password (encrypted), account preferences</li>
                <li><strong>Payment Information:</strong> PayPal email, bank account details (last 4 digits only), mailing address for checks</li>
                <li><strong>Device Information:</strong> IMEI/serial numbers, device model, condition descriptions</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>When you access our website, we automatically collect:</p>
              <ul>
                <li><strong>Log Data:</strong> IP address, browser type, operating system, pages visited, time stamps</li>
                <li><strong>Device Data:</strong> Device type, unique device identifiers</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                <li><strong>Usage Data:</strong> Features used, actions taken, time spent on pages</li>
              </ul>

              <h3>2.3 Information from Third Parties</h3>
              <p>We may receive information from:</p>
              <ul>
                <li><strong>Shipping Carriers:</strong> Tracking information, delivery confirmations</li>
                <li><strong>Payment Processors:</strong> Payment status, transaction IDs (we do not store full credit card numbers)</li>
                <li><strong>Device Databases:</strong> IMEI blacklist status, manufacturer warranty information</li>
              </ul>

              <h2>3. How We Use Your Information</h2>
              <p>We use collected information for the following purposes:</p>
              <ul>
                <li><strong>Service Delivery:</strong> Processing quotes, managing orders, inspecting devices, issuing payments</li>
                <li><strong>Communication:</strong> Sending order updates, responding to inquiries, providing support</li>
                <li><strong>Account Management:</strong> Creating and maintaining your account, authenticating users</li>
                <li><strong>Security:</strong> Preventing fraud, detecting suspicious activity, enforcing our terms</li>
                <li><strong>Analytics:</strong> Understanding user behavior, improving our services, developing new features</li>
                <li><strong>Marketing:</strong> Sending promotional offers (only with your consent; you may opt out anytime)</li>
                <li><strong>Legal Compliance:</strong> Meeting legal obligations, responding to legal requests</li>
              </ul>

              <h2>4. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>

              <h3>4.1 Service Providers</h3>
              <p>Third-party vendors who perform services on our behalf:</p>
              <ul>
                <li>Shipping carriers (UPS, FedEx, USPS)</li>
                <li>Payment processors (PayPal, Stripe)</li>
                <li>Data wipe certification services</li>
                <li>Cloud hosting providers</li>
                <li>Analytics providers (Google Analytics)</li>
              </ul>

              <h3>4.2 Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>

              <h3>4.3 Legal Requirements</h3>
              <p>We may disclose information when required by law or to:</p>
              <ul>
                <li>Comply with legal processes (subpoenas, court orders)</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate fraud or security issues</li>
              </ul>

              <h3>4.4 With Your Consent</h3>
              <p>
                We may share information in other situations with your explicit consent.
              </p>

              <h2>5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul>
                <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit, AES-256 encryption for sensitive data at rest</li>
                <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for admin accounts</li>
                <li><strong>Data Minimization:</strong> We only collect and retain data necessary for our services</li>
                <li><strong>Device Wiping:</strong> DOD 5220.22-M certified data erasure on all devices we receive</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and penetration testing</li>
              </ul>
              <p>
                However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.
              </p>

              <h2>6. Data Retention</h2>
              <p>We retain your information for as long as necessary to:</p>
              <ul>
                <li>Provide our services (active accounts: indefinitely; inactive accounts: 3 years)</li>
                <li>Comply with legal obligations (transaction records: 7 years)</li>
                <li>Resolve disputes (dispute records: 3 years after resolution)</li>
                <li>Enforce our agreements (contract records: duration + 7 years)</li>
              </ul>
              <p>
                You may request deletion of your account at any time. Note that some information may be retained for legal or 
                legitimate business purposes.
              </p>

              <h2>7. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data (subject to retention obligations)</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails via the link in each email</li>
                <li><strong>Cookie Control:</strong> Manage cookie preferences through your browser settings</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@secondhandcell.com.
              </p>

              <h2>8. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under 18. We do not knowingly collect information from children. 
                If we become aware that we have collected information from a child under 18, we will take steps to delete it promptly.
              </p>

              <h2>9. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>

              <h2>10. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. 
                We encourage you to read their privacy policies.
              </p>

              <h2>11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. 
                Material changes will be communicated via email or prominent notice on our website.
              </p>

              <h2>12. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@secondhandcell.com<br />
                <strong>Support:</strong> support@secondhandcell.com<br />
                <strong>Mail:</strong> SecondHandCell, Privacy Department, [Address]
              </p>

              <h2>13. California Residents</h2>
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul>
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information (with exceptions)</li>
                <li>Right to opt-out of the sale of personal information (we do not sell your information)</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
              <p>
                To exercise these rights, contact us at privacy@secondhandcell.com with "California Privacy Rights" in the subject line.
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
