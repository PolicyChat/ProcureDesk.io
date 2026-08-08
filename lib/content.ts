// ---------------------------------------------------------------------------
// ALL site copy lives here. Components contain no hardcoded strings.
// To rebrand, change BRAND and DOMAIN below.
// ---------------------------------------------------------------------------

export const BRAND = "ProcureDesk";
export const DOMAIN = "procuredesk.io";

export const CONTACT_EMAIL = `hello@${DOMAIN}`;

export const META = {
  title: `${BRAND} — Fractional procurement for small business`,
  description:
    "Senior procurement expertise on demand. Vendor negotiations, contract renewals, and spend visibility for a fraction of the cost of a full-time hire.",
};

export const NAV = {
  links: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Services", href: "/#services" },
    { label: "Vendors", href: "/vendors" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  cta: { label: "Free spend analysis", href: "/free-analysis" },
  menuOpenLabel: "Open menu",
  menuCloseLabel: "Close menu",
};

export const HERO = {
  eyebrow: "Fractional procurement for small business",
  headline: "Big-company buying power. Without the big-company payroll.",
  subhead:
    "ProcureDesk gives you a senior procurement team on demand — vendor negotiations, contract renewals, and full spend visibility — for a fraction of the cost of one full-time hire.",
  primaryCta: { label: "Get your free spend analysis", href: "/free-analysis" },
  secondaryCta: { label: "See pricing", href: "/pricing" },
  bullets: [
    "Average 18% savings on addressable spend",
    "No long-term contracts — month to month",
    "First insights within 10 business days",
  ],
};

export const STATS = {
  heading: "The numbers our clients care about",
  items: [
    { value: "18%", label: "average savings on addressable spend" },
    { value: "$4.2M", label: "negotiated for clients last year" },
    { value: "10 days", label: "from kickoff to first savings insight" },
    { value: "92%", label: "of renewals closed at or below target" },
  ],
};

export const PROBLEM = {
  eyebrow: "The problem",
  heading: "You're overpaying — and nobody owns the problem.",
  intro:
    "Under roughly 200 employees, almost no company has a dedicated buyer. Purchasing gets split across founders, office managers, and whoever signed the contract first. Vendors know it — and price accordingly.",
  cards: [
    {
      icon: "refresh",
      title: "Renewals on autopilot",
      body: "SaaS, insurance, and telecom contracts auto-renew at list price. Every missed renewal window is money you never get back.",
    },
    {
      icon: "scale",
      title: "No leverage at the table",
      body: "Vendors negotiate every day. You negotiate once a year. Without benchmarks and playbooks, you take the first number offered.",
    },
    {
      icon: "eye-off",
      title: "Zero spend visibility",
      body: "Spend is scattered across cards, invoices, and inboxes. You can't cut what you can't see — and duplicate tools pile up quietly.",
    },
  ],
};

export const HOW_IT_WORKS = {
  id: "how-it-works",
  eyebrow: "How it works",
  heading: "From spend chaos to a savings plan in three steps",
  steps: [
    {
      number: "01",
      title: "Free spend analysis",
      body: "Share your vendor list or last 12 months of spend exports. We map your top vendors, contract dates, and benchmark pricing — no commitment required.",
    },
    {
      number: "02",
      title: "Prioritized savings plan",
      body: "Within 10 business days you get a readout: where you're overpaying, which renewals are coming, and what we'd tackle first — with dollar estimates attached.",
    },
    {
      number: "03",
      title: "We negotiate and manage",
      body: "Pick a plan and we get to work: running negotiations, tracking every renewal, and reporting savings you can point to at your next board meeting.",
    },
  ],
};

export const SERVICES = {
  id: "services",
  eyebrow: "What we do",
  heading: "A full procurement function, sized for your business",
  intro:
    "Everything a dedicated procurement lead would own — available by the month, without recruiting, onboarding, or a six-figure salary.",
  items: [
    {
      icon: "handshake",
      title: "Vendor negotiation",
      body: "We run the process end to end: benchmarks, counters, and terms. You approve the final deal.",
    },
    {
      icon: "calendar",
      title: "Renewal management",
      body: "Every contract in one calendar with alerts far enough ahead to actually negotiate.",
    },
    {
      icon: "search",
      title: "SaaS & spend audits",
      body: "Find duplicate tools, unused seats, and zombie subscriptions — then cut them.",
    },
    {
      icon: "compass",
      title: "Supplier sourcing",
      body: "Need a new vendor? We shortlist, run the RFQ, and pressure-test pricing before you sign.",
    },
    {
      icon: "clipboard",
      title: "Purchasing process setup",
      body: "Lightweight approval workflows and buying policies that don't slow your team down.",
    },
    {
      icon: "chart",
      title: "Spend reporting",
      body: "A clear monthly view of where money goes, what changed, and what we saved you.",
    },
  ],
};

export const TESTIMONIALS = {
  eyebrow: "Client results",
  heading: "Small teams. Real savings.",
  items: [
    {
      quote:
        "ProcureDesk renegotiated our top eight contracts and cut our software spend by 22% in one quarter. It paid for itself before the second invoice.",
      name: "Dana Whitfield",
      role: "COO, 45-person logistics company",
    },
    {
      quote:
        "I was the 'procurement department' on top of my real job. Handing renewals to ProcureDesk gave me ten hours a month back — and better prices than I ever got.",
      name: "Marcus Lee",
      role: "Head of Finance, e-commerce brand",
    },
    {
      quote:
        "The free analysis alone found $60k in duplicate tooling. Signing up after that was the easiest budget decision of the year.",
      name: "Priya Raman",
      role: "Founder, healthcare services startup",
    },
  ],
};

export const PRICING_PREVIEW = {
  eyebrow: "Pricing",
  heading: "Start free. Scale when the savings show up.",
  body: "Every engagement starts with a free spend analysis. From there, choose a helpdesk subscription or a full fractional procurement team — both month to month.",
  cta: { label: "See full pricing", href: "/pricing" },
};

export type PricingTier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  badge?: string;
  highlighted?: boolean;
};

export const PRICING = {
  eyebrow: "Pricing",
  heading: "Simple plans. Measurable savings.",
  intro:
    "No long-term contracts. No percentage-of-savings games. A flat monthly rate that's a fraction of one procurement hire.",
  // Paid-tier hrefs are Stripe Payment Link placeholders — swap them for real
  // Payment Links when Stripe is set up.
  tiers: [
    {
      name: "Spend Snapshot",
      price: "$0",
      cadence: "one-time",
      description: "See what you'd save before spending a dollar.",
      features: [
        "Analysis of your top 20 vendors",
        "Contract & renewal date mapping",
        "Benchmark-based savings estimate",
        "30-minute readout call",
      ],
      cta: { label: "Get your free analysis", href: "/free-analysis" },
    },
    {
      name: "Procurement Helpdesk",
      price: "$790",
      cadence: "per month",
      description: "Expert answers and air cover for every buying decision.",
      features: [
        "Unlimited procurement questions",
        "Contract reviews — up to 4 per month",
        "Renewal calendar with proactive alerts",
        "Negotiation playbooks & benchmarks",
        "48-hour response time",
      ],
      cta: { label: "Start with Helpdesk", href: "#stripe-helpdesk" },
      badge: "Most popular",
    },
    {
      name: "Fractional Team",
      price: "$3,900",
      cadence: "per month",
      description: "We run procurement for you, end to end.",
      features: [
        "Everything in Helpdesk",
        "We negotiate for you — up to 6 active deals",
        "Vendor consolidation & sourcing",
        "Quarterly savings reports for your board",
        "Dedicated procurement lead",
      ],
      cta: { label: "Start with Fractional Team", href: "#stripe-fractional" },
      badge: "Best value",
      highlighted: true,
    },
  ] as PricingTier[],
  guarantee:
    "If our free analysis doesn't find savings worth at least 3× the Helpdesk subscription, we'll tell you — and suggest you don't hire us.",
  faqTeaser: { label: "Questions? Read the FAQ", href: "/#faq" },
};

export const VENDORS_PAGE = {
  eyebrow: "Vendor categories",
  heading: "The spend categories where we win",
  intro:
    "We negotiate across the vendor categories that dominate small-business budgets. If it renews, we can probably make it cheaper.",
  categories: [
    {
      icon: "cloud",
      title: "SaaS & software",
      body: "Seats, tiers, and multi-year terms. The single biggest source of quiet overspend.",
      savings: "Typical savings: 15–30%",
    },
    {
      icon: "shield",
      title: "Insurance",
      body: "General liability, cyber, workers' comp — re-marketed and rebid on schedule.",
      savings: "Typical savings: 10–20%",
    },
    {
      icon: "wifi",
      title: "Telecom & internet",
      body: "Business internet, phone systems, and mobile fleets priced against real market rates.",
      savings: "Typical savings: 20–35%",
    },
    {
      icon: "truck",
      title: "Shipping & logistics",
      body: "Parcel and freight agreements audited and renegotiated against volume benchmarks.",
      savings: "Typical savings: 12–25%",
    },
    {
      icon: "building",
      title: "Facilities & office",
      body: "Cleaning, security, supplies, and coffee — small contracts that add up fast.",
      savings: "Typical savings: 10–20%",
    },
    {
      icon: "card",
      title: "Payment processing",
      body: "Interchange audits and processor negotiations that shave basis points off every sale.",
      savings: "Typical savings: 10–25%",
    },
    {
      icon: "megaphone",
      title: "Marketing & agencies",
      body: "Ad tools, data providers, and agency retainers scoped and priced properly.",
      savings: "Typical savings: 10–20%",
    },
    {
      icon: "laptop",
      title: "IT & hardware",
      body: "Laptops, licenses, and managed IT contracts bought on business terms, not retail.",
      savings: "Typical savings: 8–18%",
    },
  ],
  process: {
    eyebrow: "Our negotiation process",
    heading: "How a ProcureDesk negotiation runs",
    steps: [
      {
        title: "Benchmark",
        body: "We price your contract against current market data and comparable deals we've closed.",
      },
      {
        title: "Strategy",
        body: "Timing, alternatives, and walk-away points agreed with you before we approach the vendor.",
      },
      {
        title: "Negotiate",
        body: "We run the back-and-forth — pricing, terms, and protections — and keep you updated.",
      },
      {
        title: "You approve",
        body: "Nothing is signed without you. You see the final deal and the savings math side by side.",
      },
    ],
  },
  cta: {
    heading: "Wondering what your vendors should cost?",
    body: "Send us your vendor list. We'll show you the gap between what you pay and what you should pay.",
    button: { label: "Get your free spend analysis", href: "/free-analysis" },
  },
};

export const LEAD_FORM = {
  eyebrow: "Free spend analysis",
  heading: "Find out what you're overpaying — free",
  intro:
    "Tell us a little about your company and we'll schedule your free spend analysis. No commitment, no sales pressure — just a clear picture of your savings opportunity.",
  benefits: [
    "Your top 20 vendors benchmarked against market pricing",
    "A renewal calendar so nothing auto-renews unnoticed",
    "A dollar estimate of savings, delivered in a 30-minute readout",
  ],
  nextSteps: {
    heading: "What happens next",
    steps: [
      "We email you within one business day to schedule a 20-minute intro call.",
      "You share a vendor list or spend export — we sign an NDA first if you'd like.",
      "Within 10 business days, you get your savings readout. What you do with it is up to you.",
    ],
  },
  fields: {
    name: { label: "Your name", placeholder: "Jordan Smith" },
    email: { label: "Work email", placeholder: "jordan@company.com" },
    company: { label: "Company", placeholder: "Acme Inc." },
    phone: { label: "Phone (optional)", placeholder: "(555) 123-4567" },
    segment: {
      label: "Industry",
      options: [
        "Startup / technology",
        "Professional services",
        "E-commerce / retail",
        "Healthcare",
        "Manufacturing / logistics",
        "Other",
      ],
    },
    annualSpendBand: {
      label: "Annual vendor spend",
      options: ["Under $250k", "$250k – $1M", "$1M – $5M", "Over $5M"],
    },
  },
  submitLabel: "Request my free analysis",
  submittingLabel: "Sending…",
  successHeading: "Request received!",
  successBody:
    "Thanks — we'll be in touch within one business day to schedule your intro call. Keep an eye on your inbox.",
  errorMessage: "Something went wrong. Please try again or email us directly.",
  privacyNote: "We'll only use your details to run your analysis. No spam, ever.",
};

export const FAQ = {
  id: "faq",
  eyebrow: "FAQ",
  heading: "Questions founders ask us",
  items: [
    {
      question: "Is the spend analysis really free?",
      answer:
        "Yes — completely. We benchmark your top vendors, map your renewals, and hand you a savings estimate with no obligation. Some companies take the readout and act on it themselves. Enough of them hire us that the math works out.",
    },
    {
      question: "How is this different from hiring a procurement manager?",
      answer:
        "A good procurement hire costs $120k+ a year, takes months to recruit, and covers one person's expertise. ProcureDesk gives you a team with category benchmarks and live market data, starting at a fraction of that — with no recruiting risk and no severance if priorities change.",
    },
    {
      question: "Do you take a percentage of savings?",
      answer:
        "No. Flat monthly pricing only. Percentage-of-savings models reward inflated baselines and quick wins over durable ones. We'd rather earn renewals by saving you money every month.",
    },
    {
      question: "Will vendors know we've hired you?",
      answer:
        "Your call. We can negotiate openly as your procurement team, or work behind the scenes preparing benchmarks, scripts, and counters while your team fronts the conversation. Both work — vendors take negotiations more seriously either way.",
    },
    {
      question: "What size company is this for?",
      answer:
        "Our sweet spot is 10–200 employees with $250k to $5M in annual vendor spend — big enough to have real leverage, small enough that no one owns procurement. Outside that range, the free analysis will tell you honestly whether we're a fit.",
    },
    {
      question: "How fast will we see savings?",
      answer:
        "Your savings readout arrives within 10 business days. Realized savings depend on your renewal calendar — quick wins like unused seats and duplicate tools land in the first month, while big contract renegotiations land at renewal. Most clients cover their subscription within the first quarter.",
    },
  ],
};

export const FINAL_CTA = {
  heading: "Stop paying list price.",
  body: "Your vendors have professional negotiators. Now you do too. Start with a free spend analysis and see the gap for yourself.",
  button: { label: "Get your free spend analysis", href: "/free-analysis" },
  note: "Free analysis · No commitment · Results in 10 business days",
};

export const MOBILE_CTA = {
  label: "Get free spend analysis",
  href: "/free-analysis",
};

export const FOOTER = {
  tagline: "Fractional procurement for small business.",
  columns: [
    {
      heading: "Company",
      links: [
        { label: "How it works", href: "/#how-it-works" },
        { label: "Services", href: "/#services" },
        { label: "Vendor categories", href: "/vendors" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      heading: "Get started",
      links: [
        { label: "Free spend analysis", href: "/free-analysis" },
        { label: "FAQ", href: "/#faq" },
        { label: `Email us`, href: `mailto:${CONTACT_EMAIL}` },
      ],
    },
  ],
  legal: `© ${new Date().getFullYear()} ${BRAND}. All rights reserved.`,
};
