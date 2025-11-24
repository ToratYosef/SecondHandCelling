import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export function InstantQuoteWidget() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'brand' | 'model' | 'details' | 'info'>('brand');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Device selection
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [storage, setStorage] = useState("");
  const [carrier, setCarrier] = useState("");
  const [condition, setCondition] = useState("");
  
  // Customer info
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentUsername, setPaymentUsername] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Calculated price
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const { data: brands = [] } = useQuery<any[]>({
    queryKey: ["/api/brands"],
  });

  const { data: models = [] } = useQuery<any[]>({
    queryKey: ["/api/models", selectedBrand],
    queryFn: async () => {
      if (!selectedBrand) return [];
      const res = await fetch(`/api/models?brandId=${selectedBrand}`);
      if (!res.ok) throw new Error("Failed to fetch models");
      return res.json();
    },
    enabled: !!selectedBrand,
  });

  const { data: conditions = [] } = useQuery<any[]>({
    queryKey: ["/api/conditions"],
  });

  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const carrierOptions = ["Unlocked", "AT&T", "Verizon", "T-Mobile"];

  const handleCalculatePrice = () => {
    // Simple price calculation (in production, call backend)
    let basePrice = 400;
    
    if (storage === "128GB") basePrice = 450;
    else if (storage === "256GB") basePrice = 500;
    else if (storage === "512GB") basePrice = 550;
    else if (storage === "1TB") basePrice = 600;
    
    if (carrier !== "Unlocked") basePrice -= 30;
    
    if (condition === "good") basePrice -= 50;
    else if (condition === "fair") basePrice -= 100;
    
    setCalculatedPrice(basePrice);
    setStep('info');
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    try {
      // Get condition ID
      const conditionProfile = conditions.find((c: any) => 
        (condition === "excellent" && c.code === "A") ||
        (condition === "good" && c.code === "B") ||
        (condition === "fair" && c.code === "C")
      );
      
      if (!conditionProfile) {
        throw new Error("Condition profile not found");
      }
      
      // Create order
      const orderPayload = {
        payoutMethod: paymentMethod,
        payoutDetailsJson: JSON.stringify({ username: paymentUsername }),
        totalOriginalOffer: calculatedPrice,
        currency: "USD",
        notesCustomer: `Name: ${name}, Email: ${email}, Phone: ${phone}, Address: ${address}, ${city}, ${state}, ${zipCode}`,
      };
      
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();
      
      // Create order item
      const itemPayload = {
        deviceModelId: selectedModel,
        deviceVariantId: null,
        claimedConditionProfileId: conditionProfile.id,
        originalOfferAmount: calculatedPrice,
      };
      
      await fetch(`/api/orders/${order.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemPayload),
      });
      
      // Generate shipping label immediately
      await fetch(`/api/orders/${order.id}/generate-label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
        }),
      });
      
      // Redirect to success page
      setLocation(`/success?order=${order.orderNumber}`);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBrandData = brands.find((b: any) => b.id === selectedBrand);
  const selectedModelData = models.find((m: any) => m.id === selectedModel);

  return (
    <Card className="p-6 md:p-8">
      {step === 'brand' && (
        <div className="space-y-4">
          <Label className="text-base">Select Brand</Label>
          <RadioGroup value={selectedBrand} onValueChange={setSelectedBrand}>
            {brands.map((brand: any) => (
              <label
                key={brand.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-all ${
                  selectedBrand === brand.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem value={brand.id} />
                <span className="font-medium">{brand.name}</span>
              </label>
            ))}
          </RadioGroup>
          <Button 
            onClick={() => setStep('model')} 
            disabled={!selectedBrand}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}
      
      {step === 'model' && (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setStep('brand')} className="mb-2">
            ← Back
          </Button>
          <Label className="text-base">Select Model</Label>
          <RadioGroup value={selectedModel} onValueChange={setSelectedModel}>
            {models.map((model: any) => (
              <label
                key={model.id}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-all ${
                  selectedModel === model.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem value={model.id} />
                <span className="font-medium">{model.name}</span>
              </label>
            ))}
          </RadioGroup>
          <Button 
            onClick={() => setStep('details')} 
            disabled={!selectedModel}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      )}
      
      {step === 'details' && (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setStep('model')} className="mb-2">
            ← Back
          </Button>
          
          <div>
            <Label>Storage *</Label>
            <RadioGroup value={storage} onValueChange={setStorage} className="grid grid-cols-2 gap-2 mt-2">
              {storageOptions.map((opt) => (
                <label key={opt} className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${storage === opt ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value={opt} />
                  <span>{opt}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label>Carrier *</Label>
            <RadioGroup value={carrier} onValueChange={setCarrier} className="grid grid-cols-2 gap-2 mt-2">
              {carrierOptions.map((opt) => (
                <label key={opt} className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${carrier === opt ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value={opt} />
                  <span>{opt}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label>Condition *</Label>
            <RadioGroup value={condition} onValueChange={setCondition} className="space-y-2 mt-2">
              <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${condition === 'excellent' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="excellent" />
                <div>
                  <div className="font-medium">Excellent</div>
                  <div className="text-sm text-muted-foreground">Like new, no visible wear</div>
                </div>
              </label>
              <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${condition === 'good' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="good" />
                <div>
                  <div className="font-medium">Good</div>
                  <div className="text-sm text-muted-foreground">Minor wear, fully functional</div>
                </div>
              </label>
              <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${condition === 'fair' ? 'border-primary bg-primary/5' : ''}`}>
                <RadioGroupItem value="fair" />
                <div>
                  <div className="font-medium">Fair</div>
                  <div className="text-sm text-muted-foreground">Visible wear or minor issues</div>
                </div>
              </label>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={handleCalculatePrice} 
            disabled={!storage || !carrier || !condition}
            className="w-full"
          >
            Get My Offer
          </Button>
        </div>
      )}
      
      {step === 'info' && calculatedPrice !== null && (
        <div className="space-y-6">
          <div className="text-center p-6 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Your Instant Offer</p>
            <p className="text-4xl font-bold text-primary">${calculatedPrice}</p>
            <p className="text-sm text-muted-foreground mt-2">{selectedModelData?.name} • {storage}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} placeholder="NY" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input id="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
            
            <div>
              <Label>Payment Method *</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2 mt-2">
                {['zelle', 'paypal', 'venmo'].map((method) => (
                  <label key={method} className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer ${paymentMethod === method ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value={method} />
                    <span className="capitalize">{method}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            
            {paymentMethod && (
              <div>
                <Label htmlFor="paymentUsername">{paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} Username *</Label>
                <Input id="paymentUsername" value={paymentUsername} onChange={(e) => setPaymentUsername(e.target.value)} />
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(c) => setAcceptedTerms(c as boolean)} />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the <a href="/legal/terms" className="text-primary hover:underline">Terms</a> and <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>
            
            <Button 
              onClick={handleSubmitOrder}
              disabled={!email || !name || !phone || !address || !city || !state || !zipCode || !paymentMethod || !paymentUsername || !acceptedTerms || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Order'
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
