import { normalizeSizeEntries, getPriceForSize, resolveSizeLabel } from "./productSizes";

/**
 * Gift catalog items may be marked as:
 * - `productCategory: { type: "gift", ... }` (API shape; `category` may be a display name)
 * - flat `category` or string `productCategory` equal to "gift"
 */
export function isGiftProduct(product) {
  if (!product) return false;
  const pc = product.productCategory;
  if (pc && typeof pc === "object") {
    const t = String(pc.type ?? "").trim().toLowerCase();
    if (t === "gift") return true;
  }
  const flat =
    typeof pc === "string"
      ? pc
      : product.category ?? "";
  return String(flat).trim().toLowerCase() === "gift";
}

function normSize(s) {
  return String(s ?? "").trim().toLowerCase();
}

/**
 * Non-gift products that offer a variant matching `giftSizeLabel`.
 * If none match (e.g. gift size is "Gift Box"), returns all non-gift products.
 */
export function filterPickableProductsForGiftSize(allProducts, giftSizeLabel) {
  const list = Array.isArray(allProducts) ? allProducts : [];
  const nonGift = list.filter((p) => p && !isGiftProduct(p));
  const target = normSize(giftSizeLabel);
  if (!target) return nonGift;

  const matched = nonGift.filter((p) => {
    const entries = normalizeSizeEntries(p);
    return entries.some((e) => normSize(e.size) === target);
  });

  return matched.length ? matched : nonGift;
}

export function computeGiftBundleUnitPrice(giftProduct, giftSize, chosenPairs) {
  const giftPrice = getPriceForSize(giftProduct, giftSize);
  const chosenSum = (chosenPairs || []).reduce((sum, { product, size }) => {
    const sz = resolveSizeLabel(size) || size;
    return sum + getPriceForSize(product, sz);
  }, 0);
  return giftPrice + chosenSum;
}

export function buildGiftSubmitPayload(giftProductId, giftSize, chosenPairs) {
  return {
    giftProductId,
    giftSize: resolveSizeLabel(giftSize) || String(giftSize || "").trim(),
    chosenProducts: (chosenPairs || []).map(({ product, size }) => ({
      productId: product._id,
      size: resolveSizeLabel(size) || String(size || "").trim(),
    })),
  };
}
