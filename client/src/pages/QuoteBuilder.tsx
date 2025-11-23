import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DeviceModel = {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  year: number | null;
  imageUrl: string | null;
};

type DeviceVariant = {
  id: string;
  modelId: string;
  storageSizeGb: number | null;
  color: string | null;
  carrierLock: string | null;
};

type ConditionProfile = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type PricingResult = {
  basePrice: number;
  penalties: {
    financed?: number;
    noPower?: number;
    functionalIssue?: number;
    crackedGlass?: number;
    activationLock?: number;
  };
  totalPenalty: number;
  finalOffer: number;
  currency: string;
  pricingRuleId: string;
};

export default function QuoteBuilder() {
  const [, params] = useRoute("/sell/quote/:slug");
  const slug = params?.slug;
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [powersOn, setPowersOn] = useState("");
  const [screenCondition, setScreenCondition] = useState("");
  const [cracks, setCracks] = useState("");
  const [financed, setFinanced] = useState("");
  const [blacklisted, setBlacklisted] = useState("");
  const [activationLock, setActivationLock] = useState("");
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);

  // Fetch device model
  const { data: model, isLoading: modelLoading } = useQuery<DeviceModel>({
    queryKey: ["/api/models", slug],
    queryFn: async () => {
      const res = await fetch(`/api/models/${slug}`);
      if (!res.ok) throw new Error("Failed to load device");
      return res.json();
    },
    enabled: !!slug,
  });

  // Fetch variants for this model
  const { data: variants = [], isLoading: variantsLoading } = useQuery<DeviceVariant[]>({
    queryKey: ["/api/models", model?.id, "variants"],
    queryFn: async () => {
      const res = await fetch(`/api/models/${model?.id}/variants`);
      if (!res.ok) throw new Error("Failed to load variants");
      return res.json();
    },
    enabled: !!model?.id,
  });

  // Fetch condition profiles
  const { data: conditions = [], isLoading: conditionsLoading } = useQuery<ConditionProfile[]>({
    queryKey: ["/api/conditions"],
    queryFn: async () => {
      const res = await fetch("/api/conditions");
      if (!res.ok) throw new Error("Failed to load conditions");
      return res.json();
    },
  });

  // Pricing calculation mutation
  const pricingMutation = useMutation({
    mutationFn: async (data: {
      deviceVariantId: string;
      conditionProfileId: string;
      claimedIssues: any;
    }) => {
      const res = await apiRequest("POST", "/api/pricing/calculate", data);
      return await res.json();
    },
    onSuccess: (data: PricingResult) => {
      setPricingResult(data);
    },
    onError: (error: any) => {
      toast({
        title: "Error calculating price",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Calculate pricing when we have all required data and move to step 4
  useEffect(() => {
    if (step === 4 && selectedVariantId && selectedConditionId && !pricingResult && !pricingMutation.isPending) {
      const claimedIssues = {
        isFinanced: financed === "yes",
        noPower: powersOn === "no",
        functionalIssue: screenCondition === "issues",
        crackedGlass: cracks === "major" || cracks === "hairline",
        activationLock: activationLock === "no_not_sure",
      };

      pricingMutation.mutate({
        deviceVariantId: selectedVariantId,
        conditionProfileId: selectedConditionId,
        claimedIssues,
      });
    }
  }, [step, selectedVariantId, selectedConditionId]);

  const getConditionEstimate = () => {
    if (powersOn === "no") return "Broken";
    if (screenCondition === "issues" || cracks === "major") return "Fair";
    if (cracks === "hairline") return "Good";
    return "Flawless";
  };

  // Get unique storage options from variants
  const storageOptions = Array.from(
    new Set(variants.map(v => v.storageSizeGb).filter((s): s is number => s !== null))
  ).sort((a, b) => a - b);

  // Get unique carrier options from variants
  const carrierOptions = Array.from(
    new Set(variants.map(v => v.carrierLock).filter((c): c is string => c !== null))
  );

  const nextStep = () => {
    if (!canProceed()) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields before continuing.",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      // Reset pricing when going back to change answers
      if (step === 4) {
        setPricingResult(null);
        pricingMutation.reset();
      }
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedVariantId && selectedConditionId;
    if (step === 2) return powersOn && screenCondition && cracks;
    if (step === 3) return financed && blacklisted && activationLock;
    return true;
  };

  const isLoading = modelLoading || variantsLoading || conditionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading device information...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Device not found</h2>
            <p className="text-muted-foreground mb-4">We couldn't find the device you're looking for.</p>
            <Button asChild>
              <Link href="/sell">Browse Devices</Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1 bg-muted/20">
        <section className="py-8">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Quote for {model.name}</h2>
                  <span className="text-sm text-muted-foreground">Step {step} of 4</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span className={step >= 1 ? "text-foreground font-medium" : ""}>Specs</span>
                  <span className={step >= 2 ? "text-foreground font-medium" : ""}>Condition</span>
                  <span className={step >= 3 ? "text-foreground font-medium" : ""}>Details</span>
                  <span className={step >= 4 ? "text-foreground font-medium" : ""}>Offer</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2">
                  <Card className="p-8">
                    {/* Step 1: Specs */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Choose Specifications</h3>
                          <p className="text-muted-foreground">Tell us about your device variant and condition</p>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-4 block">Device Variant *</Label>
                          {variants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No variants available for this model</p>
                          ) : (
                            <div className="space-y-2">
                              {variants.map((variant) => (
                                <button
                                  key={variant.id}
                                  onClick={() => setSelectedVariantId(variant.id)}
                                  className={`w-full p-4 rounded-md border-2 transition-all hover-elevate text-left ${
                                    selectedVariantId === variant.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border"
                                  }`}
                                  data-testid={`button-variant-${variant.id}`}
                                >
                                  <div className="font-semibold">
                                    {variant.storageSizeGb && `${variant.storageSizeGb}GB`}
                                    {variant.color && ` - ${variant.color}`}
                                    {variant.carrierLock && ` - ${variant.carrierLock}`}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-4 block">Condition *</Label>
                          {conditions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Loading conditions...</p>
                          ) : (
                            <div className="space-y-2">
                              {conditions.map((condition) => (
                                <button
                                  key={condition.id}
                                  onClick={() => setSelectedConditionId(condition.id)}
                                  className={`w-full p-4 rounded-md border-2 transition-all hover-elevate text-left ${
                                    selectedConditionId === condition.id
                                      ? "border-primary bg-primary/5"
                                      : "border-border"
                                  }`}
                                  data-testid={`button-condition-${condition.slug}`}
                                >
                                  <div className="font-semibold">{condition.name}</div>
                                  {condition.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{condition.description}</p>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Condition */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Device Condition</h3>
                          <p className="text-muted-foreground">Answer honestly for an accurate quote</p>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Does the phone power on? *</Label>
                          <RadioGroup value={powersOn} onValueChange={setPowersOn}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="yes" id="powers-yes" data-testid="radio-powers-yes" />
                                <Label htmlFor="powers-yes" className="flex-1 cursor-pointer font-normal">Yes</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="no" id="powers-no" data-testid="radio-powers-no" />
                                <Label htmlFor="powers-no" className="flex-1 cursor-pointer font-normal">No</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Is the screen fully functional? *</Label>
                          <RadioGroup value={screenCondition} onValueChange={setScreenCondition}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="perfect" id="screen-perfect" data-testid="radio-screen-perfect" />
                                <Label htmlFor="screen-perfect" className="flex-1 cursor-pointer font-normal">Yes, works perfectly</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="issues" id="screen-issues" data-testid="radio-screen-issues" />
                                <Label htmlFor="screen-issues" className="flex-1 cursor-pointer font-normal">No, has issues (lines, dead pixels, touch problems)</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Any cracks on screen or back glass? *</Label>
                          <RadioGroup value={cracks} onValueChange={setCracks}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="none" id="cracks-none" data-testid="radio-cracks-none" />
                                <Label htmlFor="cracks-none" className="flex-1 cursor-pointer font-normal">No cracks</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="hairline" id="cracks-hairline" data-testid="radio-cracks-hairline" />
                                <Label htmlFor="cracks-hairline" className="flex-1 cursor-pointer font-normal">Minor hairline cracks</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="major" id="cracks-major" data-testid="radio-cracks-major" />
                                <Label htmlFor="cracks-major" className="flex-1 cursor-pointer font-normal">Major cracks or shattered</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Activation & Finance */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Activation & Finance</h3>
                          <p className="text-muted-foreground">Important details about device ownership</p>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Is the device paid off? *</Label>
                          <RadioGroup value={financed} onValueChange={setFinanced}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="yes_paid" id="finance-paid" data-testid="radio-finance-paid" />
                                <Label htmlFor="finance-paid" className="flex-1 cursor-pointer font-normal">Yes, paid off completely</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="yes" id="finance-financed" data-testid="radio-finance-financed" />
                                <Label htmlFor="finance-financed" className="flex-1 cursor-pointer font-normal">No, still making payments</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="not_sure" id="finance-unsure" data-testid="radio-finance-unsure" />
                                <Label htmlFor="finance-unsure" className="flex-1 cursor-pointer font-normal">Not sure</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Is the device blacklisted or reported lost/stolen? *</Label>
                          <RadioGroup value={blacklisted} onValueChange={setBlacklisted}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="no" id="blacklist-no" data-testid="radio-blacklist-no" />
                                <Label htmlFor="blacklist-no" className="flex-1 cursor-pointer font-normal">No, it's clean</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="yes" id="blacklist-yes" data-testid="radio-blacklist-yes" />
                                <Label htmlFor="blacklist-yes" className="flex-1 cursor-pointer font-normal">Yes or not sure</Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-semibold mb-3 block">Is Find My iPhone / Activation Lock off? *</Label>
                          <RadioGroup value={activationLock} onValueChange={setActivationLock}>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="yes" id="lock-off" data-testid="radio-lock-off" />
                                <Label htmlFor="lock-off" className="flex-1 cursor-pointer font-normal">
                                  Yes, it's turned off
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-md border hover-elevate">
                                <RadioGroupItem value="no_not_sure" id="lock-on" data-testid="radio-lock-on" />
                                <Label htmlFor="lock-on" className="flex-1 cursor-pointer font-normal">
                                  No or not sure
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Offer Result */}
                    {step === 4 && (
                      <div className="space-y-6">
                        {pricingMutation.isPending ? (
                          <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Calculating your offer...</p>
                          </div>
                        ) : pricingResult ? (
                          <>
                            <div className="text-center py-6">
                              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                              </div>
                              <h3 className="text-3xl font-bold mb-2">Your Instant Offer</h3>
                              <div className="text-6xl font-bold text-primary my-6 tabular-nums">
                                ${pricingResult.finalOffer.toFixed(2)}
                              </div>
                              <p className="text-muted-foreground">
                                Offer valid for 14 days once accepted
                              </p>
                            </div>

                            <Card className="p-6 bg-muted/40">
                              <h4 className="font-semibold mb-4">Offer Breakdown</h4>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Base price</span>
                                  <span className="font-medium">${pricingResult.basePrice.toFixed(2)}</span>
                                </div>
                                {pricingResult.totalPenalty > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Condition adjustments</span>
                                    <span className="font-medium text-destructive">-${pricingResult.totalPenalty.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold">
                                  <span>Final Offer</span>
                                  <span className="text-primary">${pricingResult.finalOffer.toFixed(2)}</span>
                                </div>
                              </div>
                            </Card>
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-destructive">Failed to calculate offer. Please try again.</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <Button asChild className="w-full" size="lg" data-testid="button-accept-login">
                            <Link href="/login">
                              Sign in & Accept Offer
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full" size="lg" data-testid="button-accept-register">
                            <Link href="/register">
                              Create Account & Accept
                            </Link>
                          </Button>
                          <p className="text-center text-xs text-muted-foreground">
                            Continue as guest option coming soon
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    {step < 4 && (
                      <div className="flex gap-3 mt-8 pt-6 border-t">
                        {step > 1 && (
                          <Button variant="outline" onClick={prevStep} data-testid="button-prev">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                          </Button>
                        )}
                        <Button 
                          onClick={nextStep} 
                          disabled={!canProceed()}
                          className="ml-auto"
                          data-testid="button-next"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Sidebar - Current Estimate */}
                <div>
                  <Card className="p-6 sticky top-4">
                    <h4 className="font-semibold mb-4">Current Estimate</h4>
                    <div className="text-center py-6 bg-primary/5 rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Estimated value</p>
                      {pricingResult ? (
                        <p className="text-4xl font-bold text-primary tabular-nums">${pricingResult.finalOffer.toFixed(2)}</p>
                      ) : (
                        <p className="text-4xl font-bold text-muted-foreground tabular-nums">-</p>
                      )}
                    </div>
                    {step >= 2 && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Condition</span>
                          <span className="font-medium">{getConditionEstimate()}</span>
                        </div>
                      </div>
                    )}
                    {selectedVariantId && (
                      <div className="space-y-2 text-sm mt-4">
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Variant</span>
                          <span className="font-medium">Selected</span>
                        </div>
                        {selectedConditionId && (
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Condition</span>
                            <span className="font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
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
