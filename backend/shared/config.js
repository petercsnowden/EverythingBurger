const DEFAULTS = {
    currency: "usd",
    shippingCents: 500,
    shippingPerItemCents: 240,     // extra cents added per item beyond the base
    freeShippingThreshold: null, // item count at which shipping becomes free (null = never)
    maxQtyPerLine: 20,
    maxCartLines: 30,
    allowedShippingCountries: "US,CA"
};

function requireValue(source, name) {
    const value = source[name];
    if (!value || !String(value).trim()) {
        throw new Error("Missing required environment variable: " + name);
    }
    return String(value).trim();
}

function intValue(source, name, fallback) {
    const raw = source[name];
    if (raw == null || raw === "") {
        return fallback;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error("Invalid integer for " + name);
    }
    return parsed;
}

function countryList(raw) {
    return String(raw || DEFAULTS.allowedShippingCountries)
        .split(",")
        .map((code) => code.trim().toUpperCase())
        .filter(Boolean);
}

function buildShippingCalculator(source) {
    const baseCents = intValue(source, "SHIPPING_CENTS", DEFAULTS.shippingCents);
    const perItemCents = intValue(source, "SHIPPING_PER_ITEM_CENTS", DEFAULTS.shippingPerItemCents);
    const freeThresholdRaw = source.FREE_SHIPPING_THRESHOLD;
    const freeThreshold = freeThresholdRaw ? Number.parseInt(freeThresholdRaw, 10) : DEFAULTS.freeShippingThreshold;

    return function calculateShipping(itemCount) {
        if (freeThreshold != null && itemCount >= freeThreshold) {
            return 0;
        }
        return baseCents + perItemCents * Math.max(0, itemCount - 1);
    };
}

/* Builds config from any key/value source: process.env locally, the Worker
 * env binding in production. */
export function buildConfig(source) {
    const baseUrl = String(source.PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
    if (!baseUrl) {
        throw new Error("Missing required environment variable: PUBLIC_BASE_URL");
    }

    return {
        publicBaseUrl: baseUrl,
        stripeSecretKey: requireValue(source, "STRIPE_SECRET_KEY"),
        stripeWebhookSecret: requireValue(source, "STRIPE_WEBHOOK_SECRET"),
        currency: String(source.CURRENCY || DEFAULTS.currency).toLowerCase(),
        calculateShipping: buildShippingCalculator(source),
        maxQtyPerLine: intValue(source, "MAX_QTY_PER_LINE", DEFAULTS.maxQtyPerLine),
        maxCartLines: intValue(source, "MAX_CART_LINES", DEFAULTS.maxCartLines),
        allowedShippingCountries: countryList(source.ALLOWED_SHIPPING_COUNTRIES)
    };
}
