import type {
  ContentItem,
  Decision,
  MetricCardData,
  SourceFile,
} from "@/lib/types";

/**
 * Mock data for the Phase 1 front-end prototype.
 * No backend — this is the clickable sales demo. Mushnoom is a physician-founded
 * functional-mushroom wellness brand, so the copy stays on structure/function
 * claims and one item is deliberately flagged to show the compliance gate working.
 *
 * When Phase 2 lands, these shapes are read from Supabase instead; the UI is
 * written against lib/types.ts so nothing visual has to change.
 */

export const CLIENT = {
  id: "mushnoom",
  name: "Mushnoom",
  mode: "execution" as const,
};

// --- Overview metric cards (Spec §5.1) ----------------------------------------
export const METRIC_CARDS: MetricCardData[] = [
  {
    key: "repeat_rate",
    label: "Repeat purchase rate",
    value: "38.4%",
    delta: "+3.2pts",
    direction: "up",
    goodDirection: "up",
    caption: "60-day window vs prior 60 days",
  },
  {
    key: "subscription_rate",
    label: "Subscription rate",
    value: "21.7%",
    delta: "+1.4pts",
    direction: "up",
    goodDirection: "up",
    caption: "Subscribe-and-save on new orders",
  },
  {
    key: "email_revenue",
    label: "Email-attributed revenue",
    value: "$24,910",
    delta: "+12.1%",
    direction: "up",
    goodDirection: "up",
    caption: "Klaviyo, last 30 days",
  },
  {
    key: "blended_cac",
    label: "Blended CAC",
    value: "$31.20",
    delta: "-8.6%",
    direction: "down",
    goodDirection: "down",
    caption: "All paid + organic, last 30 days",
  },
];

// --- "This week" row ----------------------------------------------------------
export const THIS_WEEK = {
  published: 6,
  awaitingReview: 3,
  scheduled: 5,
  generatedToday: 4,
};

// --- Decision log (the moat: change -> data -> result) (Spec §5.1) -----------
export const DECISIONS: Decision[] = [
  {
    id: "d1",
    date: "2026-05-28",
    lever: "Moved Lion's Mane education carousel from Sunday to Tuesday 8am",
    rationale: "Tue 8–10am drove 2.3x saves vs weekend slots over trailing 4 weeks",
    predicted: "+15% saves on education pillar",
    actual: "+22% saves, +9% profile visits",
    status: "win",
  },
  {
    id: "d2",
    date: "2026-05-21",
    lever: "Added FDA disclaimer overlay to all founder-voice reels",
    rationale: "Compliance pass flagged 3 of 7 reels missing disclaimer at publish",
    predicted: "No engagement impact, removes compliance risk",
    actual: "No measurable drop in completion rate",
    status: "win",
  },
  {
    id: "d3",
    date: "2026-05-14",
    lever: "Shifted email-capture CTA from blog to subscription landing page",
    rationale: "Subscription LP converts 4.1% vs blog 1.8% on cold IG traffic",
    predicted: "+10% email-attributed revenue",
    actual: "+12.1% email-attributed revenue",
    status: "win",
  },
  {
    id: "d4",
    date: "2026-05-07",
    lever: "Tested static product cards against carousels on cold audiences",
    rationale: "Hypothesis: simpler creative lowers CAC on prospecting",
    predicted: "-15% CAC on prospecting set",
    actual: "Still measuring — 9 days of data",
    status: "pending",
  },
];

// --- Source files in the Drive folder (Spec §5.2) ----------------------------
export const SOURCE_FILES: SourceFile[] = [
  {
    id: "sf1",
    clientId: "mushnoom",
    name: "founder-lions-mane-morning.mp4",
    type: "video",
    driveFileId: "drive_abc123",
    durationSec: 92,
    ingestedAt: "2026-06-02T14:10:00Z",
    transcript:
      "Hey, it's Dr. Raemy. A lot of you ask what I actually take in the morning. " +
      "I start with our Lion's Mane blend — it's a functional mushroom that's been " +
      "studied for supporting focus and mental clarity. I stir it into coffee, no " +
      "earthy taste. The reason I formulated it this way is dose consistency: most " +
      "powders are under-dosed. This is structure-function support, not a treatment " +
      "for any condition — these statements haven't been evaluated by the FDA.",
  },
  {
    id: "sf2",
    clientId: "mushnoom",
    name: "reishi-evening-routine.mp4",
    type: "video",
    driveFileId: "drive_def456",
    durationSec: 78,
    ingestedAt: "2026-06-01T19:42:00Z",
    transcript:
      "Winding down at night is a skill. I take Reishi about an hour before bed. " +
      "Reishi is traditionally used to support a calm evening routine and help the " +
      "body relax. I am not saying it cures insomnia — I'm saying it's part of a " +
      "consistent wind-down ritual that helps me. Pair it with no screens and a " +
      "warm room.",
  },
  {
    id: "sf3",
    clientId: "mushnoom",
    name: "cordyceps-pre-workout.mp4",
    type: "video",
    driveFileId: "drive_ghi789",
    durationSec: 64,
    ingestedAt: "2026-05-31T11:05:00Z",
    transcript:
      "Before training I use Cordyceps. It's been studied for supporting endurance " +
      "and oxygen utilization during exercise. Twenty minutes before, mixed in water. " +
      "This supports your workout — it doesn't replace it.",
  },
  {
    id: "sf4",
    clientId: "mushnoom",
    name: "ingredient-sourcing-doc.pdf",
    type: "doc",
    driveFileId: "drive_jkl012",
    ingestedAt: "2026-05-30T09:20:00Z",
    transcript:
      "Sourcing brief: all fruiting-body extracts, third-party tested for heavy " +
      "metals and beta-glucan content. US-grown where possible. Batch COAs available " +
      "on request. Talking points: potency, purity, transparency.",
  },
];

// --- Content items across every status (drives generator, review, calendar) ---
export const CONTENT_ITEMS: ContentItem[] = [
  // -- DRAFTS (fresh from the generator) --------------------------------------
  {
    id: "c1",
    clientId: "mushnoom",
    sourceFileId: "sf1",
    sourceFileName: "founder-lions-mane-morning.mp4",
    format: "carousel",
    platform: "instagram",
    pillar: "education",
    copy: {
      hook: "The morning mushroom most people under-dose",
      slides: [
        "The morning mushroom most people under-dose",
        "Lion's Mane is studied for supporting focus and mental clarity.",
        "Most powders are under-dosed — potency is everything.",
        "Dr. Raemy formulated ours for dose consistency in your coffee.",
        "No earthy taste. Just your morning, dialed in.",
      ],
      caption:
        "Why we built our Lion's Mane the way we did. Supports focus and clarity — " +
        "made to actually mix into your coffee. *These statements have not been " +
        "evaluated by the FDA.",
      hashtags: ["#lionsmane", "#functionalmushrooms", "#focus", "#mushnoom"],
    },
    assetUrl: null,
    status: "draft",
    scheduledFor: null,
    postedAt: null,
    claimsChecked: false,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: null,
    createdAt: "2026-06-03T08:12:00Z",
  },
  {
    id: "c2",
    clientId: "mushnoom",
    sourceFileId: "sf3",
    sourceFileName: "cordyceps-pre-workout.mp4",
    format: "static",
    platform: "instagram",
    pillar: "product",
    copy: {
      hook: "Your 20-minutes-before-training ritual",
      slides: ["Cordyceps, 20 minutes before you train."],
      caption:
        "Studied for supporting endurance and oxygen utilization during exercise. " +
        "It supports your workout — it doesn't replace it. *Not evaluated by the FDA.",
      hashtags: ["#cordyceps", "#preworkout", "#endurance", "#mushnoom"],
    },
    assetUrl: null,
    status: "draft",
    scheduledFor: null,
    postedAt: null,
    claimsChecked: false,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: null,
    createdAt: "2026-06-03T08:15:00Z",
  },

  // -- IN REVIEW (in the queue; one flagged for a disease claim) --------------
  {
    id: "c3",
    clientId: "mushnoom",
    sourceFileId: "sf2",
    sourceFileName: "reishi-evening-routine.mp4",
    format: "reel",
    platform: "instagram",
    pillar: "founder",
    copy: {
      hook: "The 1-hour-before-bed ritual",
      slides: [
        "The 1-hour-before-bed ritual",
        "Reishi, traditionally used to support a calm evening.",
        "No screens. Warm room. Wind down on purpose.",
      ],
      caption:
        "Reishi cures insomnia and treats your anxiety so you finally sleep. Part of " +
        "my nightly wind-down. *These statements have not been evaluated by the FDA.",
      hashtags: ["#reishi", "#sleep", "#eveningroutine", "#mushnoom"],
    },
    assetUrl: null,
    status: "in_review",
    scheduledFor: null,
    postedAt: null,
    claimsChecked: false,
    claimsVerdict: "review_claim",
    claimsFlags: [
      {
        location: "caption",
        excerpt: "Reishi cures insomnia and treats your anxiety",
        reason:
          "Disease claims ('cures insomnia', 'treats your anxiety') are not allowed. " +
          "Rephrase to structure/function language, e.g. 'supports a calm evening routine'.",
        severity: "high",
      },
    ],
    approvedBy: null,
    createdAt: "2026-06-02T20:01:00Z",
  },
  {
    id: "c4",
    clientId: "mushnoom",
    sourceFileId: "sf1",
    sourceFileName: "founder-lions-mane-morning.mp4",
    format: "reel",
    platform: "tiktok",
    pillar: "founder",
    copy: {
      hook: "What a doctor actually takes every morning",
      slides: [
        "What a doctor actually takes every morning",
        "Lion's Mane, stirred into coffee.",
        "Formulated for dose consistency.",
      ],
      caption:
        "Dr. Raemy's morning. Supports focus and mental clarity. *Not evaluated by " +
        "the FDA. Not intended to diagnose, treat, cure, or prevent any disease.",
      hashtags: ["#doctor", "#lionsmane", "#morningroutine", "#mushnoom"],
    },
    assetUrl: null,
    status: "in_review",
    scheduledFor: null,
    postedAt: null,
    claimsChecked: false,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: null,
    createdAt: "2026-06-02T20:05:00Z",
  },
  {
    id: "c5",
    clientId: "mushnoom",
    sourceFileId: "sf4",
    sourceFileName: "ingredient-sourcing-doc.pdf",
    format: "carousel",
    platform: "instagram",
    pillar: "social_proof",
    copy: {
      hook: "What 'third-party tested' actually means",
      slides: [
        "What 'third-party tested' actually means",
        "Every batch tested for heavy metals.",
        "Beta-glucan content verified — not just listed.",
        "Fruiting body, not mycelium-on-grain.",
        "COAs available on request.",
      ],
      caption:
        "Potency, purity, transparency — the three things we won't compromise. " +
        "*These statements have not been evaluated by the FDA.",
      hashtags: ["#thirdpartytested", "#purity", "#transparency", "#mushnoom"],
    },
    assetUrl: null,
    status: "in_review",
    scheduledFor: null,
    postedAt: null,
    claimsChecked: false,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: null,
    createdAt: "2026-06-02T20:09:00Z",
  },

  // -- SCHEDULED (approved + claims-checked -> on the calendar) ---------------
  {
    id: "c6",
    clientId: "mushnoom",
    sourceFileId: "sf3",
    sourceFileName: "cordyceps-pre-workout.mp4",
    format: "carousel",
    platform: "instagram",
    pillar: "education",
    copy: {
      hook: "Cordyceps before you train: the why",
      slides: [
        "Cordyceps before you train: the why",
        "Studied for supporting endurance.",
        "And oxygen utilization during exercise.",
        "20 minutes before, in water.",
      ],
      caption: "Supports your workout — doesn't replace it. *Not evaluated by the FDA.",
      hashtags: ["#cordyceps", "#endurance", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c6.png",
    status: "scheduled",
    scheduledFor: "2026-06-04T13:00:00Z",
    postedAt: null,
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-05-31T12:00:00Z",
  },
  {
    id: "c7",
    clientId: "mushnoom",
    sourceFileId: "sf1",
    sourceFileName: "founder-lions-mane-morning.mp4",
    format: "static",
    platform: "instagram",
    pillar: "product",
    copy: {
      hook: "Mixes clear. No earthy taste.",
      slides: ["Mixes clear. No earthy taste."],
      caption: "Supports focus and clarity. *Not evaluated by the FDA.",
      hashtags: ["#lionsmane", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c7.png",
    status: "scheduled",
    scheduledFor: "2026-06-05T15:30:00Z",
    postedAt: null,
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-05-31T12:05:00Z",
  },
  {
    id: "c8",
    clientId: "mushnoom",
    sourceFileId: "sf2",
    sourceFileName: "reishi-evening-routine.mp4",
    format: "reel",
    platform: "tiktok",
    pillar: "lifestyle",
    copy: {
      hook: "Wind-down, on purpose",
      slides: ["Wind-down, on purpose", "Reishi an hour before bed."],
      caption: "Supports a calm evening routine. *Not evaluated by the FDA.",
      hashtags: ["#reishi", "#winddown", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c8.mp4",
    status: "scheduled",
    scheduledFor: "2026-06-06T01:00:00Z",
    postedAt: null,
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-05-31T12:10:00Z",
  },
  {
    id: "c9",
    clientId: "mushnoom",
    sourceFileId: "sf4",
    sourceFileName: "ingredient-sourcing-doc.pdf",
    format: "carousel",
    platform: "instagram",
    pillar: "social_proof",
    copy: {
      hook: "Why fruiting body matters",
      slides: [
        "Why fruiting body matters",
        "Mycelium-on-grain is mostly starch.",
        "Fruiting body is where the beta-glucans live.",
        "We test to prove it.",
      ],
      caption: "Potency you can verify. *Not evaluated by the FDA.",
      hashtags: ["#fruitingbody", "#betaglucans", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c9.png",
    status: "scheduled",
    scheduledFor: "2026-06-09T13:00:00Z",
    postedAt: null,
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "c10",
    clientId: "mushnoom",
    sourceFileId: "sf3",
    sourceFileName: "cordyceps-pre-workout.mp4",
    format: "static",
    platform: "instagram",
    pillar: "product",
    copy: {
      hook: "20 minutes before.",
      slides: ["20 minutes before."],
      caption: "Cordyceps, in water, before you train. *Not evaluated by the FDA.",
      hashtags: ["#cordyceps", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c10.png",
    status: "scheduled",
    scheduledFor: "2026-06-11T15:00:00Z",
    postedAt: null,
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-06-01T10:05:00Z",
  },

  // -- POSTED (history; feeds "published this week") --------------------------
  {
    id: "c11",
    clientId: "mushnoom",
    sourceFileId: "sf1",
    sourceFileName: "founder-lions-mane-morning.mp4",
    format: "carousel",
    platform: "instagram",
    pillar: "education",
    copy: {
      hook: "The under-dosing problem",
      slides: ["The under-dosing problem", "Most powders skimp.", "We don't."],
      caption: "Potency is the whole point. *Not evaluated by the FDA.",
      hashtags: ["#lionsmane", "#mushnoom"],
    },
    assetUrl: "https://example.supabase.co/storage/v1/object/public/assets/c11.png",
    status: "posted",
    scheduledFor: "2026-06-02T13:00:00Z",
    postedAt: "2026-06-02T13:00:30Z",
    claimsChecked: true,
    claimsVerdict: "ok",
    claimsFlags: [],
    approvedBy: "nikit@raemy.ai",
    createdAt: "2026-05-30T09:00:00Z",
  },
];
