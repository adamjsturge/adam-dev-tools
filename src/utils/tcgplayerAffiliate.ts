/**
 * TCGPlayer Affiliate Link Generator
 *
 * Uses Impact partner URL format to generate affiliate links.
 */

const AFFILIATE_CONFIG = {
  publisherId: "6856630",
  programId: "1830156",
  advertiserId: "21018",
};

/**
 * Generate an affiliate link for a TCGPlayer product URL
 */
export function getAffiliateLink(productUrl: string): string {
  const { publisherId, programId, advertiserId } = AFFILIATE_CONFIG;
  const encodedUrl = encodeURIComponent(productUrl);

  return `https://partner.tcgplayer.com/c/${publisherId}/${programId}/${advertiserId}?u=${encodedUrl}`;
}
