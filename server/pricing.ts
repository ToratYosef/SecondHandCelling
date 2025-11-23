import { storage } from "./storage";
import type { BuybackPricingRule } from "@shared/schema";

export interface PricingInput {
  deviceVariantId: string;
  conditionProfileId: string;
  claimedIssues?: {
    isFinanced?: boolean;
    noPower?: boolean;
    functionalIssue?: boolean;
    crackedGlass?: boolean;
    activationLock?: boolean;
  };
}

export interface PricingResult {
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
}

export async function calculateDeviceOffer(
  input: PricingInput
): Promise<PricingResult | null> {
  const pricingRule = await storage.getPricingRuleByVariantAndCondition(
    input.deviceVariantId,
    input.conditionProfileId
  );

  if (!pricingRule) {
    return null;
  }

  const basePrice = parseFloat(pricingRule.basePrice);
  const penalties: PricingResult["penalties"] = {};
  let totalPenalty = 0;

  if (input.claimedIssues?.isFinanced && pricingRule.financedDevicePenaltyAmount) {
    const penalty = parseFloat(pricingRule.financedDevicePenaltyAmount);
    penalties.financed = penalty;
    totalPenalty += penalty;
  }

  if (input.claimedIssues?.noPower && pricingRule.noPowerPenaltyAmount) {
    const penalty = parseFloat(pricingRule.noPowerPenaltyAmount);
    penalties.noPower = penalty;
    totalPenalty += penalty;
  }

  if (input.claimedIssues?.functionalIssue && pricingRule.functionalIssuePenaltyAmount) {
    const penalty = parseFloat(pricingRule.functionalIssuePenaltyAmount);
    penalties.functionalIssue = penalty;
    totalPenalty += penalty;
  }

  if (input.claimedIssues?.crackedGlass && pricingRule.crackedGlassPenaltyAmount) {
    const penalty = parseFloat(pricingRule.crackedGlassPenaltyAmount);
    penalties.crackedGlass = penalty;
    totalPenalty += penalty;
  }

  if (input.claimedIssues?.activationLock && pricingRule.activationLockPenaltyAmount) {
    const penalty = parseFloat(pricingRule.activationLockPenaltyAmount);
    penalties.activationLock = penalty;
    totalPenalty += penalty;
  }

  let finalOffer = basePrice - totalPenalty;

  const minOffer = pricingRule.minOfferAmount ? parseFloat(pricingRule.minOfferAmount) : 0;
  const maxOffer = pricingRule.maxOfferAmount ? parseFloat(pricingRule.maxOfferAmount) : Infinity;

  finalOffer = Math.max(minOffer, Math.min(maxOffer, finalOffer));

  return {
    basePrice,
    penalties,
    totalPenalty,
    finalOffer,
    currency: pricingRule.currency,
    pricingRuleId: pricingRule.id,
  };
}
