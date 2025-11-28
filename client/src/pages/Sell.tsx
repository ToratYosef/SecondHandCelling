import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Check, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getApiUrl } from "@/lib/api";
import AuthPrompt from "@/components/AuthPrompt";

type DeviceBrand = {
  id: string;
  name: string;
  slug: string;
};

type DeviceModel = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  year: number | null;
};

export default function Sell() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'brand' | 'model' | 'questions' | 'quote' | 'shipping' | 'payment' | 'confirmed'>('brand');
  
  // Selection state
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [storage, setStorage] = useState<string>("");
  const [carrier, setCarrier] = useState<string>("");
  const [hasCracks, setHasCracks] = useState<string>("");
  const [isFullyFunctional, setIsFullyFunctional] = useState<string>("");
  const [hasActivationLock, setHasActivationLock] = useState<string>("");
  const [isBlacklisted, setIsBlacklisted] = useState<string>("");
  const [calculatedOffer, setCalculatedOffer] = useState<number>(0);
  
  // Shipping state
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingOption, setShippingOption] = useState<"label" | "kit">("label");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"zelle" | "paypal" | "venmo" | "">("");
  const [paymentUsername, setPaymentUsername] = useState("");
  const [paymentUsernameConfirm, setPaymentUsernameConfirm] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { data: brands = [] } = useQuery<DeviceBrand[]>({
    queryKey: ["/api/brands"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/brands"));
      if (!res.ok) throw new Error("Failed to load brands");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: models = [] } = useQuery<DeviceModel[]>({
    queryKey: ["/api/models", "by-brand", selectedBrand],
    queryFn: async () => {
      if (!selectedBrand) return [];
      
      // Use query param route for now (will switch to RESTful after backend deployment)
      const res = await fetch(getApiUrl(`/api/models?brandId=${selectedBrand}`));
      if (!res.ok) throw new Error("Failed to load models");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedBrand,
  });

  const { data: conditions = [] } = useQuery<any[]>({
    queryKey: ["/api/conditions"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/conditions"));
      if (!res.ok) throw new Error("Failed to load conditions");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const storageOptions = ["64GB", "128GB", "256GB", "512GB", "1TB"];
  const carrierOptions = ["AT&T", "Verizon", "T-Mobile", "Unlocked"];

  // Parse URL parameters and pre-fill form
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceSlug = params.get('device');
    const storageParam = params.get('storage');
    const carrierParam = params.get('carrier');
    const powerParam = params.get('power');
    const functionalityParam = params.get('functionality');
    const qualityParam = params.get('quality');

    // Pre-fill storage
    if (storageParam && storageOptions.includes(storageParam)) {
      setStorage(storageParam);
    }

    // Pre-fill carrier
    if (carrierParam && carrierOptions.includes(carrierParam)) {
      setCarrier(carrierParam);
    }

    // Pre-fill activation lock (power)
    if (powerParam === 'on' || powerParam === 'off') {
      setHasActivationLock(powerParam === 'on' ? 'yes' : 'no');
    }

    // Pre-fill functionality
    if (functionalityParam === 'working' || functionalityParam === 'broken') {
      setIsFullyFunctional(functionalityParam === 'working' ? 'yes' : 'no');
    }

    // Pre-fill quality (cracks)
    if (qualityParam === 'pristine' || qualityParam === 'damaged') {
      setHasCracks(qualityParam === 'pristine' ? 'no' : 'yes');
    }

    // Find and select device by slug
    if (deviceSlug && models.length > 0) {
      const model = models.find((m: DeviceModel) => m.slug === deviceSlug);
      if (model) {
        setSelectedModel(model.id);
        setSelectedBrand(model.brandId);
        setStep('questions');
      }
    }
  }, [models]);

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId);
    setStep('model');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setStep('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateOffer = () => {
    // Check for rejection conditions first
    if (hasActivationLock === "yes") {
      setRejectionReason("FMI/Activation Lock");
      setShowRejectionDialog(true);
      return;
    }
    if (isBlacklisted === "yes") {
      setRejectionReason("Blacklisted");
      setShowRejectionDialog(true);
      return;
    }

    // Simple pricing logic (in real app, this would call backend)
    let basePrice = 400;
    
    // Adjust by storage
    if (storage === "128GB") basePrice = 450;
    else if (storage === "256GB") basePrice = 500;
    else if (storage === "512GB") basePrice = 550;
    else if (storage === "1TB") basePrice = 600;
    
    // Carrier penalty
    if (carrier !== "Unlocked") basePrice -= 30;
    
    // Damage penalties
    if (hasCracks === "yes") basePrice -= 100;
    if (isFullyFunctional === "no") basePrice -= 150;
    
    setCalculatedOffer(Math.max(basePrice, 50));
    setStep('quote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueAsGuest = () => {
    setShowAuthPrompt(false);
    setStep('shipping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShippingSubmit = () => {
    setShowPaymentDialog(true);
  };

  const handlePaymentMethodSelect = (method: "zelle" | "paypal" | "venmo") => {
    setPaymentMethod(method);
  };

  const handlePaymentSubmit = async () => {
    if (paymentUsername !== paymentUsernameConfirm) {
      alert("Usernames do not match!");
      return;
    }

    const orderPayload = {
      customerInfo: {
        email: shippingEmail,
        name: shippingEmail,
        phone,
      },
      devices: [
        {
          modelId: selectedModel,
          storage,
          carrier,
          condition: { hasCracks, isFullyFunctional, hasActivationLock, isBlacklisted },
          price: calculatedOffer,
          quantity: 1,
        },
      ],
      shippingAddress: shippingOption === "kit" || shippingOption === "label"
        ? {
            street1: address,
            city,
            state,
            postalCode: zipCode,
            contactName: shippingEmail,
            phone,
          }
        : undefined,
      paymentMethod,
      notes: `Shipping: ${shippingOption}; payout: ${paymentMethod}; username: ${paymentUsername}`,
    };

    try {
      const res = await fetch(getApiUrl("/api/submit-order"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.details || err.error || "Failed to submit order");
      }

      const result = await res.json();
      const number = result.orderNumber || result.order?.orderNumber || result.order?.id;
      setShowPaymentDialog(false);
      setLocation(`/success?order=${number}`);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      alert("Order submission failed: " + err.message);
    }
  };

  const selectedBrandData = brands.find(b => b.id === selectedBrand);
  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in duration-700">Get an Instant Offer</h1>
            <p className="text-lg text-muted-foreground">
              Answer a few questions to get your quote in seconds
            </p>
          </div>

          {/* Step 1: Select Brand */}
          {step === 'brand' && (
            <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Select Your Device Brand</h2>
              <div className={`grid gap-4 ${brands.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : brands.length === 2 ? 'grid-cols-2' : brands.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandSelect(brand.id)}
                    className="backdrop-blur-md bg-card/50 border-2 border-border/50 rounded-lg hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1 active:scale-95 p-6 text-center transition-all duration-300 group"
                    data-testid={`button-brand-${brand.slug}`}
                  >
                    <Smartphone className="w-12 h-12 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <p className="font-semibold">{brand.name}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 2: Select Model */}
          {step === 'model' && (
            <Card className="p-8 backdrop-blur-md bg-card/50 border-border/50 hover:shadow-2xl transition-all duration-500">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('brand');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mb-4 hover:bg-primary/10 transition-colors"
                data-testid="button-back"
              >
                ← Back to Brands
              </Button>
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Select Your {selectedBrandData?.name} Model
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className="p-6 backdrop-blur-md bg-card/50 border-2 border-border/50 rounded-lg hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:-translate-y-1 active:scale-95 text-left transition-all duration-300"
                    data-testid={`button-model-${model.slug}`}
                  >
                    <p className="font-semibold text-lg">{model.name}</p>
                    {model.year && (
                      <p className="text-sm text-muted-foreground">({model.year})</p>
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 3: Condition Questions */}
          {step === 'questions' && (
            <Card className="p-8">
              <Button
                variant="ghost"
                onClick={() => {
                  setStep('model');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mb-4"
                data-testid="button-back-to-model"
              >
                ← Back to Models
              </Button>
              
              <h2 className="text-2xl font-semibold mb-2">
                {selectedModelData?.name}
              </h2>
              <p className="text-muted-foreground mb-8">Answer a few questions about your device</p>

              <div className="space-y-8">
                {/* Storage */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Storage Capacity *</Label>
                  <RadioGroup value={storage} onValueChange={setStorage}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {storageOptions.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                            storage === option ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <RadioGroupItem value={option} id={option} />
                          <span className="font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Carrier */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Carrier *</Label>
                  <RadioGroup value={carrier} onValueChange={setCarrier}>
                    <div className="grid grid-cols-2 gap-3">
                      {carrierOptions.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                            carrier === option ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <RadioGroupItem value={option} id={option} />
                          <span className="font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Cracks */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Any cracks on screen or back glass? *</Label>
                  <RadioGroup value={hasCracks} onValueChange={setHasCracks}>
                    <div className="grid md:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          hasCracks === "no" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="no" id="no-cracks" />
                        <span className="font-medium">No Cracks</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          hasCracks === "yes" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="yes" id="yes-cracks" />
                        <span className="font-medium">Yes, has cracks</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Functionality */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Is phone fully functional? (charging, battery above 80% capacity, etc.) *
                  </Label>
                  <RadioGroup value={isFullyFunctional} onValueChange={setIsFullyFunctional}>
                    <div className="grid md:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          isFullyFunctional === "yes" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="yes" id="functional-yes" />
                        <span className="font-medium">Yes, fully functional</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          isFullyFunctional === "no" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="no" id="functional-no" />
                        <span className="font-medium">No, has issues</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Activation Lock */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Activation Lock / Find My iPhone (FMI) *</Label>
                  <RadioGroup value={hasActivationLock} onValueChange={setHasActivationLock}>
                    <div className="grid md:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          hasActivationLock === "no" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="no" id="fmi-no" />
                        <span className="font-medium">No, disabled</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          hasActivationLock === "yes" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="yes" id="fmi-yes" />
                        <span className="font-medium">Yes, still enabled</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Blacklisted */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Is device blacklisted/blocked? *</Label>
                  <RadioGroup value={isBlacklisted} onValueChange={setIsBlacklisted}>
                    <div className="grid md:grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          isBlacklisted === "no" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="no" id="blacklist-no" />
                        <span className="font-medium">No, clean IMEI</span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          isBlacklisted === "yes" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="yes" id="blacklist-yes" />
                        <span className="font-medium">Yes, blacklisted</span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button
                onClick={calculateOffer}
                className="w-full mt-8"
                size="lg"
                disabled={!storage || !carrier || !hasCracks || !isFullyFunctional || !hasActivationLock || !isBlacklisted}
                data-testid="button-get-offer"
              >
                Get My Instant Offer
              </Button>
            </Card>
          )}

          {/* Step 4: Quote Display */}
          {step === 'quote' && (
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Your Instant Offer</h2>
                <div className="text-5xl font-bold text-primary my-6">
                  ${calculatedOffer.toFixed(2)}
                </div>
                <p className="text-muted-foreground">Valid for 14 days</p>
              </div>

              <div className="bg-muted/40 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4">Device Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device:</span>
                    <span className="font-medium">{selectedModelData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">{storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier:</span>
                    <span className="font-medium">{carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium">
                      {hasCracks === "no" && isFullyFunctional === "yes" ? "Excellent" : 
                       hasCracks === "yes" || isFullyFunctional === "no" ? "Good with issues" : "Good"}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowAuthPrompt(true)}
                className="w-full"
                size="lg"
                data-testid="button-continue-guest"
              >
                Continue
              </Button>
            </Card>
          )}

          {/* Step 5: Shipping Information */}
          {step === 'shipping' && (
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Shipping Option *</Label>
                  <RadioGroup value={shippingOption} onValueChange={(v) => setShippingOption(v as "label" | "kit")}>
                    <div className="space-y-3">
                      <label
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          shippingOption === "label" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="label" id="label" className="mt-1" />
                        <div>
                          <span className="font-medium block">Free Shipping Label</span>
                          <span className="text-sm text-muted-foreground">Print at home and ship in your own box</span>
                        </div>
                      </label>
                      <label
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover-elevate transition-all ${
                          shippingOption === "kit" ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <RadioGroupItem value="kit" id="kit" className="mt-1" />
                        <div>
                          <span className="font-medium block">Shipping Kit ($10)</span>
                          <span className="text-sm text-muted-foreground">We'll mail you a box with packaging materials</span>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    data-testid="input-address"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      data-testid="input-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="NY"
                      data-testid="input-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="10001"
                      data-testid="input-zip"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    data-testid="checkbox-terms"
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the <a href="/legal/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleShippingSubmit}
                className="w-full mt-6"
                size="lg"
                disabled={!shippingEmail || !address || !city || !state || !zipCode || !phone || !acceptedTerms}
                data-testid="button-continue-payment"
              >
                Continue to Payment
              </Button>
            </Card>
          )}

          {/* Step 6: Confirmed */}
          {step === 'confirmed' && (
            <Card className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your order has been submitted successfully
              </p>

              <div className="bg-muted/40 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-mono font-medium">SHC-Q-{Math.floor(Math.random() * 10000).toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Device:</span>
                    <span className="font-medium">{selectedModelData?.name} - {storage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offer Amount:</span>
                    <span className="font-bold text-primary">${calculatedOffer.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-medium">{shippingOption === "kit" ? "Kit ($10)" : "Free Label"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payout Method:</span>
                    <span className="font-medium capitalize">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>What's next?</strong> We've sent a confirmation email to {shippingEmail}. 
                  {shippingOption === "label" 
                    ? " Your shipping label is attached - print it and ship your device!" 
                    : " Your shipping kit will arrive in 2-3 business days."}
                </p>
              </div>

              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-return-home"
              >
                Return to Home
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>
              Choose how you'd like to receive your payment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!paymentMethod ? (
              <div className="grid gap-3">
                <button
                  onClick={() => handlePaymentMethodSelect("zelle")}
                  className="p-4 border-2 rounded-lg hover-elevate active-elevate-2 text-left transition-all"
                  data-testid="button-zelle"
                >
                  <p className="font-semibold">Zelle</p>
                  <p className="text-sm text-muted-foreground">Instant transfer</p>
                </button>
                <button
                  onClick={() => handlePaymentMethodSelect("paypal")}
                  className="p-4 border-2 rounded-lg hover-elevate active-elevate-2 text-left transition-all"
                  data-testid="button-paypal"
                >
                  <p className="font-semibold">PayPal</p>
                  <p className="text-sm text-muted-foreground">Fast and secure</p>
                </button>
                <button
                  onClick={() => handlePaymentMethodSelect("venmo")}
                  className="p-4 border-2 rounded-lg hover-elevate active-elevate-2 text-left transition-all"
                  data-testid="button-venmo"
                >
                  <p className="font-semibold">Venmo</p>
                  <p className="text-sm text-muted-foreground">Quick payment</p>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-username" className="capitalize">
                    {paymentMethod} Username *
                  </Label>
                  <Input
                    id="payment-username"
                    value={paymentUsername}
                    onChange={(e) => setPaymentUsername(e.target.value)}
                    placeholder={`Enter your ${paymentMethod} username`}
                    data-testid="input-payment-username"
                  />
                </div>
                <div>
                  <Label htmlFor="payment-username-confirm" className="capitalize">
                    Confirm {paymentMethod} Username *
                  </Label>
                  <Input
                    id="payment-username-confirm"
                    value={paymentUsernameConfirm}
                    onChange={(e) => setPaymentUsernameConfirm(e.target.value)}
                    placeholder={`Confirm your ${paymentMethod} username`}
                    data-testid="input-payment-username-confirm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPaymentMethod("");
                      setPaymentUsername("");
                      setPaymentUsernameConfirm("");
                    }}
                    className="flex-1"
                    data-testid="button-back-payment"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePaymentSubmit}
                    className="flex-1"
                    disabled={!paymentUsername || !paymentUsernameConfirm}
                    data-testid="button-submit-payment"
                  >
                    Submit Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <AuthPrompt
          onClose={() => setShowAuthPrompt(false)}
          onContinueGuest={handleContinueAsGuest}
        />
      )}

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Device Not Accepted
            </DialogTitle>
            <DialogDescription className="pt-4">
              We do not accept devices with {rejectionReason}. 
              {rejectionReason.includes("FMI") || rejectionReason.includes("Activation Lock") 
                ? " Please disable Find My iPhone and remove the activation lock before selling your device."
                : " Please ensure your device has a clean IMEI before attempting to sell."}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setShowRejectionDialog(false);
              setStep('questions');
            }}
            data-testid="button-close-rejection"
          >
            Go Back
          </Button>
        </DialogContent>
      </Dialog>

      <PublicFooter />
    </div>
  );
}
