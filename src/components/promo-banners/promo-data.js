import sirius1 from "../../images/sirius1.JPG";
import sirius2 from "../../images/sirius2.JPG";
import sirius3 from "../../images/sirius3.JPG";
import sirius4 from "../../images/sirius4.JPG";
import sirius5 from "../../images/sirius5.JPG";
import banner2 from "../../images/banner-2.jpg";

/** Home — after hero / feature bar, before API product grids */
export const homeAfterFeatures = [
  {
    eyebrow: "Limited offer",
    title: "Tester packs available",
    subtitle: "Worth ₹1,000 — discover your signature scent",
    image: banner2,
    to: "/shop",
  },
  {
    eyebrow: "New in",
    title: "Premium blends",
    subtitle: "Handpicked notes for day and night",
    image: sirius1,
    to: "/shop",
  },
  {
    eyebrow: "Perks",
    title: "Free shipping above ₹499",
    subtitle: "Stock up and save on delivery — automatically applied",
    image: sirius2,
    to: "/shop",
  },
];

/** Home — after shop-by-category listing, before lifestyle grid */
export const homeBetweenGrids = [
  {
    eyebrow: "Gift season",
    title: "Luxury packaging",
    subtitle: "Every order arrives protected and presentation-ready",
    image: sirius4,
    to: "/shop",
  },
  {
    eyebrow: "We're here",
    title: "24×7 customer care",
    subtitle: "Questions on notes, orders, or delivery? Just ask.",
    image: sirius3,
    to: "/shop",
  },
  {
    eyebrow: "Build a wardrobe",
    title: "Layer your scents",
    subtitle: "Day citrus, night oud — mix to match your mood",
    image: sirius5,
    to: "/shop",
  },
];

/** Home — after category cards, before market stats */
export const homeBeforeStats = [
  {
    eyebrow: "Members",
    title: "Exclusive drops",
    subtitle: "Early access to limited batches and bundles",
    image: sirius1,
    to: "/shop",
  },
  {
    eyebrow: "Trust",
    title: "99%+ happy noses",
    subtitle: "Join thousands who chose Sirius for longevity & quality",
    image: sirius2,
    to: "/shop",
  },
];

/** Shop — under page hero */
export const shopUnderHero = [
  {
    eyebrow: "Try risk-free",
    title: "Sampler sets live",
    subtitle: "₹1,000 value testers — find your match before full size",
    image: banner2,
    to: "/shop",
  },
  {
    eyebrow: "Curated",
    title: "Shop by mood",
    subtitle: "Fresh, spicy, woody — filters to narrow your search",
    image: sirius3,
    to: "/shop",
  },
  {
    eyebrow: "Delivery",
    title: "Tracked & insured",
    subtitle: "Bottles packed to survive the journey",
    image: sirius4,
    to: "/shop",
  },
];

/** Cart — after banner */
export const cartAfterHero = [
  {
    eyebrow: "Secure",
    title: "PhonePe & encrypted checkout",
    subtitle: "Your payment details stay protected",
    image: sirius3,
    to: "/shop",
  },
  {
    eyebrow: "Not sure yet?",
    title: "Grab a tester kit",
    subtitle: "₹1,000 trial value — add on your next order",
    image: banner2,
    to: "/shop",
  },
];

/** Cart — before coupon / checkout block (only meaningful when cart has items; parent can hide) */
export const cartBeforeCheckout = [
  {
    eyebrow: "Stack savings",
    title: "Coupons & offers",
    subtitle: "Apply a code below when you're logged in",
    image: sirius5,
    to: "/shop",
  },
  {
    eyebrow: "Complete the look",
    title: "One more fragrance?",
    subtitle: "Layer a complementary scent from the shop",
    image: sirius1,
    to: "/shop",
  },
];

/** Product detail — between description & reviews */
export const productBetweenDescReviews = [
  {
    eyebrow: "Still exploring?",
    title: "More from Sirius",
    subtitle: "Browse bestsellers and hidden gems in the shop",
    image: sirius2,
    to: "/shop",
  },
  {
    eyebrow: "New buyers",
    title: "Start with testers",
    subtitle: "Worth ₹1,000 — sample before you invest",
    image: banner2,
    to: "/shop",
  },
];

/** Login */
export const loginAfterHero = [
  {
    eyebrow: "Welcome",
    title: "Sign in & save your cart",
    subtitle: "Sync orders, addresses, and exclusive promos",
    image: sirius4,
    to: "/shop",
  },
  {
    eyebrow: "First visit?",
    title: "Explore testers first",
    subtitle: "₹1,000 value packs to try our range",
    image: sirius1,
    to: "/shop",
  },
];

/** Orders — under banner */
export const ordersUnderHero = [
  {
    eyebrow: "Reorder fast",
    title: "Your favourites await",
    subtitle: "Jump back to the shop and repeat your scent",
    image: sirius5,
    to: "/shop",
  },
  {
    eyebrow: "Support",
    title: "Need help with delivery?",
    subtitle: "Our team is on chat & email around the clock",
    image: sirius3,
    to: "/shop",
  },
];

/** Policy — between Privacy Policy and Terms & Conditions */
export const policyBetweenPrivacyAndTerms = [
  {
    eyebrow: "Our promise",
    title: "Transparent & secure",
    subtitle: "We protect your data while you enjoy premium fragrance",
    image: sirius2,
    to: "/shop",
  },
];

/** Policy — before Return & Refund section */
export const policyBeforeReturns = [
  {
    eyebrow: "Happy nose guarantee",
    title: "We stand by every bottle",
    subtitle: "Read return windows below — we keep it fair",
    image: sirius4,
    to: "/shop",
  },
];

/** Account — after hero */
export const accountAfterHero = [
  {
    eyebrow: "Your profile",
    title: "Manage details & addresses",
    subtitle: "Keep shipping info current for faster checkout",
    image: sirius4,
    to: "/shop",
  },
  {
    eyebrow: "Rewards",
    title: "Shop & unlock perks",
    subtitle: "Members get first access to limited drops",
    image: sirius1,
    to: "/shop",
  },
];

/** Members page — after hero */
export const membersAfterHero = [
  {
    eyebrow: "Insider",
    title: "Member-only offers",
    subtitle: "Stack savings on full sizes after you join the circle",
    image: banner2,
    to: "/shop",
  },
  {
    eyebrow: "Try first",
    title: "Testers worth ₹1,000",
    subtitle: "Sample the line before you commit to a bottle",
    image: sirius5,
    to: "/shop",
  },
];
