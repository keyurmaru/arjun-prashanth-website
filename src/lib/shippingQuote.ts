import { getCheapestShippingQuote } from "@/lib/shiprocket";

// Falls back here if Shiprocket is unreachable or the pincode isn't
// serviceable — checkout must never hard-fail just because a live rate
// lookup failed. Matches the Shipping & Delivery policy's flat domestic
// rate as the "we don't know better" default.
const FLAT_FALLBACK_PAISE = 6000;

export interface ShippingResult {
  shippingPaise: number;
  /** false when this is the flat fallback, not a real Shiprocket quote. */
  live: boolean;
  courierName?: string;
  etd?: string;
}

export async function computeShippingPaise(pincode: string, totalWeightKg: number): Promise<ShippingResult> {
  try {
    const quote = await getCheapestShippingQuote(pincode, totalWeightKg);
    return { shippingPaise: quote.ratePaise, live: true, courierName: quote.courierName, etd: quote.etd };
  } catch (err) {
    console.error(`[shipping] Live quote failed for pincode ${pincode}, using flat fallback:`, err);
    return { shippingPaise: FLAT_FALLBACK_PAISE, live: false };
  }
}
