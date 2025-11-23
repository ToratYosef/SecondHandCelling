import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FAQ() {
  const faqCategories = [
    {
      category: "General",
      faqs: [
        {
          question: "What devices do you accept?",
          answer: "We accept smartphones (iPhone, Samsung, Google Pixel, etc.), tablets (iPad, Samsung Tab, etc.), smartwatches (Apple Watch, Samsung Galaxy Watch, etc.), and select laptops. If you can find it in our catalog, we'll buy it!"
        },
        {
          question: "How long does the entire process take?",
          answer: "From quote to payment typically takes 5-7 business days. This includes shipping time (2-3 days), inspection (1 business day), and payout processing (1-3 days depending on your chosen method). PayPal payouts are usually same-day once you accept the offer."
        },
        {
          question: "Can I sell multiple devices at once?",
          answer: "Absolutely! You can add multiple devices to a single quote. Just make sure to package them securely and include all items in one shipment using the provided label."
        },
        {
          question: "Do you accept devices from other countries?",
          answer: "Currently, we only accept devices from customers within the United States. The device can be international models (unlocked), but must be shipped from a US address."
        }
      ]
    },
    {
      category: "Pricing & Offers",
      faqs: [
        {
          question: "How do you determine the offer price?",
          answer: "Our pricing is based on real-time market demand, device model, storage capacity, carrier lock status, and condition. We analyze thousands of data points daily to ensure competitive, fair pricing."
        },
        {
          question: "Is my quote guaranteed?",
          answer: "Yes! Your quote is locked in for 14 days from the time you accept it, as long as the device condition matches what you described. If there's a condition mismatch, we'll provide a revised offer that you can accept or decline."
        },
        {
          question: "What if my device condition doesn't match my description?",
          answer: "We'll send you a detailed inspection report and a revised offer. You have 3 business days to accept the new offer or decline it. If you decline, we'll ship your device back to you completely free of charge - no restocking fees, no hidden costs."
        },
        {
          question: "Can my offer increase after inspection?",
          answer: "While rare, if our inspection finds your device is in better condition than you described, we will increase your payout to reflect the actual value. We believe in honest, transparent pricing in both directions."
        },
        {
          question: "Do you charge any fees?",
          answer: "Never. We don't charge inspection fees, processing fees, or return shipping fees. The offer you see is what you get (pending inspection confirmation)."
        }
      ]
    },
    {
      category: "Shipping & Packaging",
      faqs: [
        {
          question: "How does free shipping work?",
          answer: "Once you accept your quote, you can either print a prepaid shipping label at home or request a free mail-in kit. The label covers all shipping costs via USPS, UPS, or FedEx (we'll select the best option). You just need to pack the device and drop it off."
        },
        {
          question: "What should I include in the package?",
          answer: "Only send the device itself. Remove any cases, screen protectors, SIM cards, and memory cards. Do NOT include charging cables, boxes, or accessories unless specifically requested during the quote process."
        },
        {
          question: "How should I pack my device?",
          answer: "Wrap the device in bubble wrap or protective padding. Use a sturdy box (a small USPS flat rate box works great). Make sure the device can't move around inside. If you requested a mail-in kit, we'll include packaging materials."
        },
        {
          question: "Do I need insurance?",
          answer: "Our prepaid labels include insurance up to $500. For devices quoted above $500, we automatically upgrade to a fully insured shipping method at no cost to you."
        },
        {
          question: "What if my device gets lost or damaged in shipping?",
          answer: "All shipments are insured. If your device is lost or damaged during transit, file a claim with the carrier and we'll help you through the process. You'll receive the full quoted amount once the claim is approved."
        }
      ]
    },
    {
      category: "Payments & Payouts",
      faqs: [
        {
          question: "What payment methods do you offer?",
          answer: "We offer PayPal (same day), bank transfer/ACH (1-3 business days), paper check (mailed within 2 business days), and select gift cards (instant). You can choose your preferred method when creating your quote."
        },
        {
          question: "When will I receive my payment?",
          answer: "PayPal payouts are processed within 24 hours of accepting the final offer. Bank transfers take 1-3 business days. Checks are mailed within 2 business days. Gift cards are delivered instantly to your email."
        },
        {
          question: "Can I change my payout method?",
          answer: "Yes, you can update your payout method in your account settings at any time before the final offer is accepted. Once payment processing begins, the method cannot be changed."
        },
        {
          question: "Is there a minimum payout amount?",
          answer: "No, we have no minimum. However, for devices valued under $10, we may offer store credit or gift cards instead of cash payouts."
        }
      ]
    },
    {
      category: "Data Wipe & Security",
      faqs: [
        {
          question: "Do I need to wipe my device before shipping?",
          answer: "Yes, absolutely. For your security, you must perform a factory reset and sign out of all accounts (iCloud, Google, Samsung, etc.) before shipping. We provide detailed step-by-step guides for every device type."
        },
        {
          question: "What if I forget to wipe my device?",
          answer: "If activation lock is on or we detect personal data, we'll contact you immediately and pause the inspection. You'll have 48 hours to remotely disable locks. If you can't, we'll return the device at no cost."
        },
        {
          question: "What do you do with my data?",
          answer: "Once we receive a device, we perform a certified data wipe that meets DOD 5220.22-M standards, completely erasing all data. We then verify the wipe was successful before reselling or recycling the device."
        },
        {
          question: "How do I remove activation lock?",
          answer: "For iPhones/iPads: Go to Settings > [Your Name] > Find My > Find My iPhone > Toggle OFF. You'll need your Apple ID password. For Android: Settings > Security > Find My Device > Toggle OFF. Visit our Data Wipe Guide for detailed instructions."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted-foreground">
                Find answers to common questions about selling your device to SecondHandCell
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
              {faqCategories.map((category, idx) => (
                <div key={idx}>
                  <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.faqs.map((faq, faqIdx) => (
                      <AccordionItem key={faqIdx} value={`${idx}-${faqIdx}`} className="border rounded-lg px-6">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Our support team is here to help. Reach out and we'll get back to you within 24 hours.
                </p>
                <Button asChild size="lg" data-testid="button-contact-support">
                  <Link href="/support">
                    Contact Support
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
