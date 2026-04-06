/**
 * Unwraps typical API envelopes: { data: product }, { product }, or plain product.
 */
export function extractProductFromApiResponse(raw) {
  if (!raw || typeof raw !== "object") return null;
  const d = raw.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    if (d._id || d.name || Array.isArray(d.sizes)) return d;
    if (d.product && typeof d.product === "object") return d.product;
  }
  if (raw.product && typeof raw.product === "object") return raw.product;
  if (raw._id || raw.name || Array.isArray(raw.sizes)) return raw;
  return null;
}

/**
 * Turns API size fields into a single display/value string.
 * Avoids String(object) → "[object Object]" in <option> labels and values.
 */
export function resolveSizeLabel(raw, depth = 0) {
  if (raw == null || depth > 5) return "";
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t || t === "[object Object]") return "";
    return t;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const candidates = [
      raw.size,
      raw.label,
      raw.name,
      raw.volume,
      raw.ml,
      raw.capacity,
      raw.amount,
      raw.value,
      raw.text,
      raw.title,
      raw.variant,
      raw.bottleSize,
      raw.packSize,
      raw.dimension?.size,
      raw.dimensions?.size,
    ];
    for (const c of candidates) {
      if (c != null && c !== raw) {
        const inner = resolveSizeLabel(c, depth + 1);
        if (inner) return inner;
      }
    }
    for (const v of Object.values(raw)) {
      if (typeof v === "string") {
        const inner = resolveSizeLabel(v, depth + 1);
        if (inner) return inner;
      }
    }
  }
  return "";
}

function entrySizeLabel(entry) {
  return resolveSizeLabel(entry);
}

function coerceSizeArray(raw) {
  if (raw == null) return null;

  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    try {
      const parsed = JSON.parse(s);
      return coerceSizeArray(parsed);
    } catch {
      return null;
    }
  }

  if (Array.isArray(raw)) return raw;

  if (typeof raw === "object") {
    return Object.entries(raw)
      .map(([key, val]) => {
        if (val != null && typeof val === "object" && !Array.isArray(val)) {
          const sizeRaw =
            val.size ??
            val.label ??
            val.name ??
            (key && key.trim() && key !== "[object Object]" ? key : null);
          const sizeLabel = resolveSizeLabel(sizeRaw);
          if (!sizeLabel) return null;
          return { ...val, size: sizeLabel };
        }
        const sizeLabel = key && key.trim() ? key.trim() : null;
        if (!sizeLabel) return null;
        return { size: sizeLabel, price: Number(val) };
      })
      .filter(Boolean);
  }

  return null;
}

function pickRawSizesSource(product) {
  if (!product || typeof product !== "object") return null;

  const keys = [
    "sizes",
    "Sizes",
    "sizeVariants",
    "availableSizes",
    "variantSizes",
    "variants",
    "productSizes",
  ];

  for (const k of keys) {
    const v = product[k];
    if (v != null) return v;
  }

  // API shape: `size` is an array of variants [{ size, price, discountedPrice, basicPrice }, ...]
  if (Array.isArray(product.size) && product.size.length) {
    return product.size;
  }

  return null;
}

/**
 * Normalizes API `sizes` to a flat list. Supports:
 * - [{ size: "20ml", price: 199 }, ...]
 * - [{ label: "20ml", price: 199 }, ...]
 * - legacy string[] or single product.size + root price
 * - object map { "20ml": 199, "50ml": 299 }
 * - JSON string of the above
 */
export function normalizeSizeEntries(product) {
  if (!product) return [];

  const fallbackPrice = Number(product.discountedPrice ?? product.price ?? 0) || 0;
  const fallbackBasic =
    product.basicPrice != null && !Number.isNaN(Number(product.basicPrice))
      ? Number(product.basicPrice)
      : null;

  const raw = pickRawSizesSource(product);
  const asArray = coerceSizeArray(raw);

  if (Array.isArray(asArray) && asArray.length) {
    return asArray
      .map((entry) => {
        if (entry && typeof entry === "object" && !Array.isArray(entry)) {
          const size = entrySizeLabel(entry);
          if (!size) return null;
          const price = Number(
            entry.discountedPrice ?? entry.price ?? entry.sellingPrice ?? fallbackPrice
          );
          const basic =
            entry.basicPrice != null && !Number.isNaN(Number(entry.basicPrice))
              ? Number(entry.basicPrice)
              : entry.mrp != null && !Number.isNaN(Number(entry.mrp))
              ? Number(entry.mrp)
              : fallbackBasic;
          return {
            size,
            price: Number.isFinite(price) ? price : fallbackPrice,
            basicPrice: basic != null && Number.isFinite(basic) ? basic : null,
          };
        }
        if (typeof entry === "string" && entry.trim()) {
          return {
            size: entry.trim(),
            price: fallbackPrice,
            basicPrice: fallbackBasic,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Legacy: single string size on product (not the variant array above)
  if (!Array.isArray(product.size)) {
    const rootSizeLabel = resolveSizeLabel(product.size);
    if (rootSizeLabel) {
      return [
        {
          size: rootSizeLabel,
          price: fallbackPrice,
          basicPrice: fallbackBasic,
        },
      ];
    }
  }

  return [];
}

export function getSizeEntry(product, sizeKey) {
  const entries = normalizeSizeEntries(product);
  if (!entries.length) return null;
  if (!sizeKey) return entries[0];
  return entries.find((e) => e.size === sizeKey) || entries[0];
}

export function getPriceForSize(product, sizeKey) {
  const entry = getSizeEntry(product, sizeKey);
  if (entry) return entry.price;
  return Number(product?.discountedPrice ?? product?.price ?? 0) || 0;
}
