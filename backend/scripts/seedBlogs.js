'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../config/db');
const { disconnectDB } = require('../config/db');
const Blog = require('../models/mongoose/Blog');
const User = require('../models/mongoose/User');

/**
 * Seed blog articles for GrihaNivas editorial section.
 *
 * Flags:
 *   --reset    Delete all existing blogs first
 *   --dry-run  Print what would be created without touching the DB
 *
 * Run:
 *   npm run seed:blogs
 */

const slug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const BLOGS = [
  {
    title: 'Mumbai Property Market Outlook 2026: What Buyers Need to Know',
    category: 'market_trends',
    excerpt:
      'From Bandra to Powai, the Mumbai real estate market is shifting. Here is a zone-by-zone breakdown of price trends, inventory levels, and demand drivers heading into 2026.',
    content: `<h2>The Macro Picture</h2>
<p>Mumbai's real estate market in 2025 saw record registrations — over 1.3 lakh transactions — driven by end-user demand and improved infrastructure timelines. As we enter 2026, three themes dominate: coastal road connectivity, metro expansion to suburban corridors, and a normalisation of new-launch pricing after two years of aggressive appreciation.</p>

<h2>Zone-by-Zone Analysis</h2>
<h3>South Mumbai (Fort, Colaba, Cuffe Parade)</h3>
<p>Prices remain range-bound between ₹45,000–₹85,000/sq.ft with low liquidity. The coastal road project is expected to reduce commute times to BKC by 30 minutes from 2026 Q3, which should drive renewed interest from CXO-level buyers currently priced out of Worli and Lower Parel.</p>

<h3>Bandra West</h3>
<p>Demand has been unwavering. Inventory is critically thin at 18 months of supply versus a healthy 24–30 months. Expect prices to firm up 8–12% through 2026, particularly for sea-facing or hill-view units above the 10th floor.</p>

<h3>Andheri West & Jogeshwari</h3>
<p>The emerging story of 2026. Proximity to the airport, metro Line 7 stations, and consistently solid rental yields (3.5–4.2% gross) make this the de-facto recommendation for investors with ₹1.5–2.5 Cr budgets. New launches are being absorbed within 90 days of RERA registration.</p>

<h3>Powai</h3>
<p>Corporate campus effects are real. Proximity to SEEPZ and the Hiranandani Business Park creates structural rental demand. Resale 2 BHK units in the ₹1.8–2.5 Cr band are the sweet spot for rental investors — gross yields of 4% with low vacancy.</p>

<h2>What This Means for Buyers</h2>
<p>If you are a self-use buyer with a 24-month horizon, Andheri West and Powai offer the best risk-adjusted entry. If you are an investor seeking rental income, the same zones deliver. For prestige buyers willing to hold 5+ years, Bandra West and Worli continue to be irreplaceable.</p>`,
    tags: ['market trends', 'Mumbai property', '2026', 'investment', 'Bandra', 'Andheri'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-market-outlook-2026',
    },
    seoTitle: 'Mumbai Property Market Outlook 2026 — Zone-by-Zone Guide',
    seoDescription:
      'Zone-by-zone analysis of Mumbai property prices, demand drivers, and investment hotspots heading into 2026.',
    isPublished: true,
    publishedAt: new Date('2026-06-01'),
  },
  {
    title: 'A First-Time Buyer\'s Complete Guide to Stamp Duty in Maharashtra',
    category: 'legal',
    excerpt:
      'Stamp duty and registration charges can add 6–7% to your property cost in Maharashtra. Here is exactly how it is calculated, what the current rates are, and how to pay it correctly.',
    content: `<h2>What Is Stamp Duty?</h2>
<p>Stamp duty is a state government tax levied on property transactions. In Maharashtra, it is charged on the higher of the agreement value or the Ready Reckoner Rate (RRR) determined by the state government for that specific locality.</p>

<h2>Current Rates in Mumbai (2025–26)</h2>
<ul>
  <li><strong>Male buyer:</strong> 6% of property value</li>
  <li><strong>Female buyer:</strong> 5% of property value (1% concession)</li>
  <li><strong>Joint buyer (male + female):</strong> 5% of property value</li>
  <li><strong>Registration charge:</strong> ₹30,000 flat (for properties above ₹30 lakh)</li>
</ul>

<h2>How Is It Calculated?</h2>
<p>The stamp duty is calculated on the <strong>higher of the two values</strong>:</p>
<ol>
  <li>The agreement value (what you actually pay the builder/seller)</li>
  <li>The Ready Reckoner Rate (RRR) for that area and floor</li>
</ol>
<p>The RRR is published annually by the Maharashtra government and varies by locality, building age, and floor number.</p>

<h2>Worked Example</h2>
<p>Suppose you buy a 2 BHK in Andheri West at an agreement value of ₹1.89 Cr. The RRR for that locality is ₹1.75 Cr. Since ₹1.89 Cr > ₹1.75 Cr, stamp duty is calculated on ₹1.89 Cr.</p>
<ul>
  <li>Stamp duty at 6% (male): ₹1,89,00,000 × 6% = <strong>₹11,34,000</strong></li>
  <li>Registration charge: <strong>₹30,000</strong></li>
  <li>Total government charges: <strong>₹11,64,000</strong></li>
</ul>

<h2>How to Pay Stamp Duty</h2>
<p>In Maharashtra, stamp duty is paid via the <strong>GRAS (Government Receipt Accounting System)</strong> portal. You will generate a challan online, pay it at an authorised bank, and present it at the Sub-Registrar's office on the registration day along with the sale agreement and identity documents.</p>

<h2>Key Tips</h2>
<ul>
  <li>Always verify the current RRR for your specific locality at the IGR Maharashtra portal before calculating.</li>
  <li>For under-construction properties, stamp duty is paid at the time of agreement (before full payment).</li>
  <li>Female co-ownership (even with a male co-buyer) qualifies for the 5% rate — confirm with your lawyer.</li>
  <li>Stamp duty paid is eligible for deduction under Section 80C up to ₹1.5 lakh in the year of payment.</li>
</ul>`,
    tags: ['stamp duty', 'Maharashtra', 'legal', 'first-time buyer', 'registration'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-stamp-duty-guide',
    },
    seoTitle: 'Stamp Duty in Maharashtra 2025-26 — Complete Buyer Guide',
    seoDescription:
      'Current stamp duty rates, registration charges, and how to pay stamp duty for property purchase in Maharashtra.',
    isPublished: true,
    publishedAt: new Date('2026-05-20'),
  },
  {
    title: 'Top 5 Neighbourhoods to Buy a Home in Mumbai Under ₹2 Crore',
    category: 'buying_guide',
    excerpt:
      'Finding a home under ₹2 Crore in Mumbai requires strategy — but it is possible. We reveal the five localities with the best value-for-money and long-term appreciation potential.',
    content: `<h2>Yes, ₹2 Crore Still Works in Mumbai — If You Know Where to Look</h2>
<p>Mumbai's reputation as India's most expensive real estate market is well-deserved — but it does not mean affordable quality housing is a myth. With a ₹1.5–2 Crore budget, these five neighbourhoods offer genuine value, solid connectivity, and measurable appreciation history.</p>

<h2>1. Malad West</h2>
<p><strong>Budget range:</strong> ₹85 lakh – ₹1.8 Cr for 1–2 BHK<br>
<strong>Why it works:</strong> Malad West has benefitted from JVLR (Jogeshwari–Vikhroli Link Road) upgrades and remains one of the better-connected suburbs on the Western line. The area has a mix of old buildings with new-age renovated interiors and new society developments. 1 BHK units start around ₹75–85 lakh; 2 BHKs sit in the ₹1.2–1.8 Cr range.</p>
<p><strong>Watch for:</strong> Older buildings with no lift or single staircase. Always verify the society's maintenance fund and structural audit.</p>

<h2>2. Goregaon East</h2>
<p><strong>Budget range:</strong> ₹90 lakh – ₹1.9 Cr for 1–2 BHK<br>
<strong>Why it works:</strong> SEEPZ, Mindspace, and Film City create strong rental demand. Goregaon East has seen steady price appreciation of 8–10% CAGR over five years, making it a dual-use option (self-use + rental yield). Metro Line 7 has further reduced commute times.</p>

<h2>3. Thane West</h2>
<p><strong>Budget range:</strong> ₹70 lakh – ₹1.6 Cr for 2 BHK<br>
<strong>Why it works:</strong> Thane is no longer a suburb — it is a thriving city with its own commercial hubs. 2 BHK in Thane West for ₹90 lakh–₹1.4 Cr offers significantly more carpet area than equivalent budgets in Andheri or Malad. Infrastructure connectivity via the Eastern Freeway and upcoming Metro Line 4 is a growth catalyst.</p>

<h2>4. Mulund West</h2>
<p><strong>Budget range:</strong> ₹85 lakh – ₹1.7 Cr for 1–2 BHK<br>
<strong>Why it works:</strong> Mulund sits at the junction of the Eastern Express Highway and LBS Marg, offering great access to both the eastern suburbs and Thane. The area is known for clean, well-maintained societies. 2 BHK units with parking in the ₹1.2–1.6 Cr range are common.</p>

<h2>5. Vikhroli (West)</h2>
<p><strong>Budget range:</strong> ₹80 lakh – ₹1.8 Cr for 1–2 BHK<br>
<strong>Why it works:</strong> Godrej properties' anchor presence in Vikhroli has transformed perception significantly. JVLR makes east–west transit fast. With SEEPZ and Powai nearby, rental demand is consistent. Under-rated and under-priced relative to Powai, Vikhroli is one of the best emerging bets under ₹2 Cr.</p>

<h2>The Bottom Line</h2>
<p>All five localities offer some combination of connectivity, rental yield potential, and appreciation upside. Prioritise verified RERA registration, clear title, and OC status before committing to any property. Our advisory team can arrange site visits and document checks — reach out via the consultation form below.</p>`,
    tags: ['buying guide', 'affordable', 'Malad', 'Goregaon', 'Thane', 'Mulund'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-top-5-neighbourhoods',
    },
    seoTitle: 'Best Areas to Buy a Flat in Mumbai Under ₹2 Crore',
    seoDescription:
      'Top 5 Mumbai neighbourhoods for homebuyers with budgets under ₹2 crore, with prices, connectivity and investment insights.',
    isPublished: true,
    publishedAt: new Date('2026-05-10'),
  },
  {
    title: 'How to Read a RERA Certificate Before Buying an Under-Construction Flat',
    category: 'legal',
    excerpt:
      'The RERA certificate for a project contains far more information than most buyers realise. Here is what to look for — and the red flags to watch.',
    content: `<h2>Why RERA Matters More Than Your Builder's Brochure</h2>
<p>Since the Real Estate (Regulation and Development) Act came into force in Maharashtra, every under-construction project above a certain threshold must register with MahaRERA and publish a standardised certificate. This certificate is publicly accessible and contains information that the builder's marketing brochure will never volunteer.</p>

<h2>What the RERA Certificate Contains</h2>
<ul>
  <li><strong>Project registration number:</strong> Always verify this on the MahaRERA portal — do not rely on the builder's verbal confirmation.</li>
  <li><strong>Sanctioned plan details:</strong> Total units, total floors, and the specific wing layout — compare this with the brochure. Discrepancies are red flags.</li>
  <li><strong>Completion date:</strong> The date the builder committed to MahaRERA. Delays beyond this date trigger compensation provisions under RERA Section 18.</li>
  <li><strong>Escrow account details:</strong> 70% of all collections must be deposited in a dedicated escrow account. Check if this is reflected in the registration.</li>
  <li><strong>Litigation status:</strong> Any litigation, encumbrances, or liabilities declared by the promoter.</li>
  <li><strong>Promoter details:</strong> Director names, PAN, and previous project track record registered with MahaRERA.</li>
</ul>

<h2>Three Red Flags to Investigate Immediately</h2>
<ol>
  <li><strong>Completion date already passed:</strong> If the RERA completion date has lapsed without a registered extension, the project is technically in default. You have the right to cancel and seek refund + interest under Section 18.</li>
  <li><strong>No escrow account declared:</strong> This is a regulatory violation. The builder should not be collecting any payments from buyers without a declared escrow.</li>
  <li><strong>Mismatch between marketed units and sanctioned plan:</strong> Builders sometimes market floor layouts not yet approved in the sanctioned plan. Only buy what is on the sanctioned plan.</li>
</ol>

<h2>How to Verify on MahaRERA</h2>
<p>Visit <strong>maharerait.mahaonline.gov.in</strong>, click on "Registered Projects", and enter the RERA project number (usually P5180XXXXXXX for Mumbai). You can download the full registration document, view the complaints filed against the project, and check quarterly progress reports filed by the promoter.</p>

<h2>Before You Sign the Agreement</h2>
<p>Engage a registered legal practitioner to review: the Agreement for Sale, the RERA certificate, the sanctioned plan, and the title search report. Our team can connect you with empanelled lawyers who handle residential property transactions in Mumbai — use the consultation form below.</p>`,
    tags: ['RERA', 'legal', 'under construction', 'MahaRERA', 'buyer protection'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-rera-guide',
    },
    seoTitle: 'How to Read a MahaRERA Certificate — Mumbai Flat Buyer Guide',
    seoDescription:
      'What every under-construction flat buyer in Mumbai must check on the MahaRERA certificate before signing.',
    isPublished: true,
    publishedAt: new Date('2026-04-28'),
  },
  {
    title: 'Renting vs Buying in Mumbai in 2026: The Numbers-Driven Answer',
    category: 'investment',
    excerpt:
      'The rent-versus-buy debate is intensely personal — but in Mumbai it is also mathematical. We walk through the key ratios and scenarios to help you make the right call.',
    content: `<h2>The Price-to-Rent Ratio in Mumbai</h2>
<p>The simplest framework is the Price-to-Rent Ratio (P/R): the number of years of annual rent it would take to equal the purchase price. In most mature markets, a P/R above 20 suggests renting is more economical; below 15 suggests buying is better.</p>
<p>In Mumbai's key micro-markets:</p>
<ul>
  <li>Bandra West: P/R ~28–32 → <strong>Renting is cheaper on a pure cost basis</strong></li>
  <li>Andheri West: P/R ~22–26 → <strong>Borderline; appreciation story tilts toward buying</strong></li>
  <li>Powai: P/R ~20–24 → <strong>Balanced; depends on your loan rate and tenure</strong></li>
  <li>Thane West: P/R ~15–19 → <strong>Buying makes clear financial sense</strong></li>
</ul>

<h2>The EMI vs Rent Comparison</h2>
<p>On a ₹1.5 Cr flat in Andheri West with an 80% loan at 8.75% for 20 years:</p>
<ul>
  <li>EMI: ~₹1,31,000/month</li>
  <li>Market rent for equivalent flat: ~₹40,000–₹45,000/month</li>
</ul>
<p>The gap is ₹86,000–₹91,000/month. For a buyer, this gap is partly offset by principal repayment (which builds equity), tax benefits (Section 24b interest deduction up to ₹2 lakh/year for self-occupied), and property appreciation. But the cash-flow hit is real.</p>

<h2>When Buying Still Wins</h2>
<ul>
  <li><strong>You have a 7+ year horizon:</strong> Property appreciation over 7–10 years in prime Mumbai micro-markets has consistently outpaced rent increases, making the total cost of ownership competitive.</li>
  <li><strong>You prioritise stability:</strong> Security of tenure, the ability to renovate, and freedom from landlord decisions carry real non-financial value.</li>
  <li><strong>Down payment gives strong EMI terms:</strong> If you can put down 40–50%, EMI drops to the ₹70,000–₹85,000 range — much closer to equivalent rents.</li>
  <li><strong>Tier-2 suburbs (Thane, Mulund):</strong> The P/R ratio is low enough that buying clearly wins on pure economics.</li>
</ul>

<h2>When Renting Wins</h2>
<ul>
  <li>Your career or family situation may require moving in 3–5 years.</li>
  <li>You are in a high P/R zone like Bandra West and lack the down payment for a meaningful equity stake.</li>
  <li>You need liquidity to deploy in a higher-yield investment (unlikely for most retail investors).</li>
</ul>

<h2>The Bottom Line</h2>
<p>Mumbai's rent-vs-buy answer is nuanced. For buyers with a long horizon, moderate leverage, and properties in Andheri West, Powai, or Thane, buying still delivers superior long-term outcomes. For buyers in premium micro-markets with short horizons, renting is the rational choice. Get a personalised analysis from our advisory team — free consultation via the form below.</p>`,
    tags: ['renting vs buying', 'Mumbai', 'investment', 'EMI', 'home loan'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-rent-vs-buy',
    },
    seoTitle: 'Renting vs Buying in Mumbai 2026 — Numbers-Driven Guide',
    seoDescription:
      'Should you rent or buy in Mumbai in 2026? Price-to-rent ratios, EMI comparisons, and scenario analysis.',
    isPublished: true,
    publishedAt: new Date('2026-04-12'),
  },
  {
    title: 'The NRI Buyer\'s Guide to Purchasing Property in Mumbai',
    category: 'legal',
    excerpt:
      'Purchasing property in India as an NRI involves FEMA compliance, RBI permissions, and repatriation rules. Here is the complete playbook for NRI buyers targeting Mumbai real estate.',
    content: `<h2>Can NRIs Buy Property in India?</h2>
<p>Yes, NRIs (Non-Resident Indians) and PIOs (Persons of Indian Origin) are permitted to purchase residential and commercial property in India without any special RBI approval, subject to FEMA (Foreign Exchange Management Act) regulations. There are some restrictions on agricultural land, farmhouse, and plantation property — NRIs cannot purchase these without prior RBI approval.</p>

<h2>How Can NRIs Pay for Property?</h2>
<p>NRIs can pay for property in India using:</p>
<ul>
  <li><strong>NRE (Non-Resident External) Account funds:</strong> Fully repatriable. This is the cleanest option.</li>
  <li><strong>NRO (Non-Resident Ordinary) Account funds:</strong> Repatriation allowed up to USD 1 million per financial year after taxes.</li>
  <li><strong>Foreign currency remittance:</strong> Inward remittance through normal banking channels.</li>
  <li><strong>NRI Home Loan:</strong> Most Indian banks offer home loans to NRIs. EMI payments must be made from NRE/NRO accounts.</li>
</ul>
<p>Note: Cash payments in INR are not permitted for property transactions.</p>

<h2>Stamp Duty and Registration for NRI Buyers</h2>
<p>NRI buyers pay the same stamp duty as resident Indians — 6% for male buyers and 5% for female buyers in Mumbai, plus ₹30,000 flat registration charge. There is no additional surcharge for NRI buyers.</p>

<h2>Power of Attorney</h2>
<p>NRIs who cannot be physically present for registration can appoint a Power of Attorney (PoA) holder in India. The PoA must be executed at the Indian Consulate/Embassy in the country of residence and attested. The PoA holder can sign documents, make payments, and complete registration on behalf of the NRI.</p>

<h2>TDS on Property Purchase from NRI</h2>
<p>If you are buying property from an NRI seller (not a builder), you must deduct TDS at 20% (long-term capital gains rate) or 30% (short-term) on the sale consideration. This is a critical compliance point often missed by buyers in private sale transactions.</p>

<h2>Repatriation of Sale Proceeds</h2>
<p>When an NRI sells property in India, the net proceeds (after taxes) can be repatriated, subject to conditions: the property must have been purchased from inward remittances or NRE/NRO funds, the amount repatriated cannot exceed the original investment, and repatriation is limited to two properties in a lifetime (for the portion from NRO accounts).</p>

<h2>Our NRI Advisory Service</h2>
<p>GrihaNivas provides end-to-end NRI property advisory — from virtual site tours and shortlisting to PoA execution support, lawyer coordination, and repatriation guidance. Contact us via the form below or WhatsApp to book a consultation.</p>`,
    tags: ['NRI', 'FEMA', 'legal', 'Mumbai property', 'foreign buyer', 'repatriation'],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
      publicId: 'seed/blog-nri-guide',
    },
    seoTitle: 'NRI Property Purchase Guide for Mumbai — FEMA & Tax Rules',
    seoDescription:
      'Complete guide for NRI buyers purchasing property in Mumbai — FEMA compliance, stamp duty, PoA, and repatriation rules.',
    isPublished: true,
    publishedAt: new Date('2026-03-30'),
  },
];

const args = new Set(process.argv.slice(2));
const shouldReset = args.has('--reset');
const isDryRun = args.has('--dry-run');

const findAdmin = async () => User.findOne({ role: 'admin' }).select('_id');

const run = async () => {
  try {
    await connectDB();

    if (shouldReset) {
      if (isDryRun) {
        console.info('[dry-run] Would delete all existing blogs.');
      } else {
        const result = await Blog.deleteMany({});
        console.info(`Reset deleted: ${result.deletedCount} blogs.`);
      }
    }

    const admin = await findAdmin();
    if (!admin) {
      console.error('No admin user found. Run seed:admin first.');
      process.exitCode = 1;
      return;
    }

    let created = 0;
    let updated = 0;

    for (const blog of BLOGS) {
      const blogSlug = slug(blog.title);
      const payload = {
        ...blog,
        slug: blogSlug,
        author: admin._id,
      };

      if (isDryRun) {
        console.info(`[dry-run] Would upsert: "${payload.title}" (${blogSlug})`);
        continue;
      }

      const existing = await Blog.findOne({ slug: blogSlug }).select('_id');
      if (existing) {
        await Blog.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        await Blog.create(payload);
        created += 1;
      }
    }

    if (!isDryRun) {
      console.info('Blog seed complete.');
      console.info(`Created: ${created}`);
      console.info(`Updated: ${updated}`);
      console.info(`Total seeded: ${BLOGS.length}`);
    }
  } catch (err) {
    console.error('Blog seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

run();
