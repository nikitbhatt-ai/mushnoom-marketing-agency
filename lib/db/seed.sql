-- raemy ai — Mushnoom seed data, exported from Supabase (cpvxkqqujwiwmqrpeomn).
-- Run AFTER schema.sql against the new Postgres:
--   psql "$DATABASE_URL" -f lib/db/seed.sql
-- review_queue and post_log were empty at export time.

insert into clients (id,name,mode,brand_voice,created_at) values ('ae1aca52-9dae-4346-b9fe-a2bee7de78c1','Mushnoom','execution',E'{"tone": "clear, warm, credible, never hypey", "claims": "structure/function only", "guidelines": "Who we are: Mushnoom makes functional-mushroom supplements, founded by a physician. Our voice is the warm, approachable doctor friend who takes real science and explains it like a person — not a textbook. We make wellness feel credible AND attainable.\\n\\nWho we''re talking to (primary):\\n- Wellness Millennials (28–42): juggling stress, focus, and energy. DTC-native, time-poor, respond to science + convenience.\\n- Gen Z Biohackers (18–27): early adopters who discover us on TikTok and Instagram and love understanding \\"why it works.\\"\\nSecondary: Active Boomers (55–70) who want to stay sharp and well and are loyal, higher-spend buyers; and the fitness & performance crowd (25–45) using cordyceps for endurance and recovery.\\nThey''re social-native and aspirational — they''re buying the better version of their day, not just a supplement.\\n\\nTone & feel: Warm, approachable, and aspirational. Inspiring, lifestyle-forward, and credible. We''re the friend with an MD who makes feeling your best sound simple and within reach. Confident and uplifting — never clinical, never hypey.\\n\\nHow we write:\\n- Translate the science. Take the research or medical term and say it the way you''d explain it to a friend over coffee. If you must use a term like \\"neurogenesis,\\" immediately put it in plain words (\\"your brain making fresh connections\\").\\n- Be aspirational. Paint the better day — the focused morning, the calm wind-down, the energy that lasts. Inspire the lifestyle, then connect it to the mushroom.\\n- Short, plain sentences. One idea per line. Sound like a smart, encouraging friend, not a brochure.\\n- Lead with a relatable moment or an aspirational vision, then bring in the mushroom and the simple mechanism.\\n- Name the mushroom (lion''s mane, reishi, cordyceps) and the function it supports (focus, a calm evening, steady energy).\\n- Concrete over abstract: \\"the foggy hour after lunch\\" beats \\"cognitive optimization.\\"\\n- Emoji: use very few (0–1 per post), only when it genuinely adds warmth. NEVER use the mushroom emoji.\\n\\nWords we use: supports, helps, may support, your daily ritual, feel your sharpest, calm, clarity, steady energy, grounded, thrive, elevate, simple, science-backed.\\nWords we avoid: cure, treat, heal, fix, prevent, detox, miracle, \\"game-changer,\\" \\"doctors hate this,\\" fearmongering, jargon left unexplained, exclamation-heavy hype.\\n\\nClaims posture: Evidence-forward but accessible. Structure/function only. Some readers care about immunity or staying mentally sharp — speak to supporting normal, healthy function, never to preventing or treating any condition. When the science is early, say \\"early research suggests.\\"\\n\\nFormat conventions:\\n- Hook: one specific, scroll-stopping line — a relatable tension or an aspirational, surprising-but-true fact. Built to stop a TikTok/IG scroll. No clickbait.\\n- Carousel slides: one clear idea each, building logically, ending on a soft, inspiring CTA (\\"Here''s to your calmest evening yet — reishi might be worth a look.\\").\\n- Caption: warm, conversational, and uplifting, 2–4 short sentences, then the FDA disclaimer when a benefit is stated.\\n- Hashtags: 4–8, relevant and unhyped (#functionalmushrooms #lionsmane #focus #wellnessroutine). No spammy walls.\\n\\nSignature feel: A warm doctor friend who makes feeling your best feel simple and within reach. If a post sounds clinical, hypey, or like it could come from any supplement brand, it''s wrong."}'::jsonb,'2026-06-04 03:26:22.676483+00');

insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('96a0cc77-65e1-4aac-8339-cff5d9861c9a','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','google_drive','drive_abc123',NULL,'video','Hey, it''s Dr. Raemy. A lot of you ask what I actually take in the morning. I start with our Lion''s Mane blend — a functional mushroom studied for supporting focus and mental clarity. I stir it into coffee, no earthy taste. I formulated it for dose consistency: most powders are under-dosed. This is structure-function support, not a treatment for any condition — these statements haven''t been evaluated by the FDA.',NULL,'2026-06-04 03:26:22.676483+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('5f5d7159-b0bc-47f7-9189-6e77c3638fce','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','google_drive','drive_def456',NULL,'video','Winding down at night is a skill. I take Reishi about an hour before bed. Reishi is traditionally used to support a calm evening routine and help the body relax. I am not saying it cures insomnia — it''s part of a consistent wind-down ritual. Pair it with no screens and a warm room.',NULL,'2026-06-04 03:26:22.676483+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('abd78cb6-9ca3-4f07-ae74-7bf9166466b5','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','google_drive','drive_ghi789',NULL,'video','Before training I use Cordyceps. It''s been studied for supporting endurance and oxygen utilization during exercise. Twenty minutes before, mixed in water. This supports your workout — it doesn''t replace it.',NULL,'2026-06-04 03:26:22.676483+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('c946830c-fc5a-46de-802f-0b11f5f607fc','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','google_drive','drive_jkl012',NULL,'doc','Sourcing brief: all fruiting-body extracts, third-party tested for heavy metals and beta-glucan content. US-grown where possible. Batch COAs available on request. Talking points: potency, purity, transparency.',NULL,'2026-06-04 03:26:22.676483+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('e5f87f98-711a-40be-9b90-c28104526b48','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'https://pmc.ncbi.nlm.nih.gov/articles/PMC12030463/','doc','# Substantive Content: Lion''s Mane Mushroom (Hericium erinaceus) - Neuroprotective, Antioxidant, Anti-inflammatory, and Antimicrobial Properties

## Chemical Composition & Bioactive Compounds

**Key Bioactive Components:**
- **Polysaccharides** - particularly β-glucans with immunomodulatory, antimicrobial, and antitumor effects; heteropolysaccharides composed of glucose, mannose, galactose, and arabinose that reduce oxidative stress and regulate blood sugar
- **Terpenoids** - two major classes:
  - *Hericenones* (fruiting body): Phenolic terpenoids including A-L that stimulate NGF synthesis, promote neuroprotection, enhance cognitive function, and reduce inflammation
  - *Erinacines* (mycelium): Sesquiterpenoids A-Z2 with potent NGF stimulation, neurogenesis enhancement, blood-brain barrier penetration capability, and neuroprotective effects. Erinacine A is extensively studied for crossing the blood-brain barrier
- **Phenolic Compounds** - gallic acid, caffeic acid, p-coumaric acid with strong antioxidant capacity via ROS scavenging
- **Ergothioneine** - histidine-derived amino acid with potent antioxidant properties; actively transported into cells via OCTN1 transporter; levels detected at 0.34-1.30 mg/g depending on cultivation conditions
- **Bioactive Proteins** - lectins (immunomodulatory, antimicrobial), glucanases and chitinases (immune stimulation), laccases and peroxidases (antioxidant, antibacterial), ribosome-inactivating proteins (cytotoxic), hydrophobins (biofilm-related properties)

**Compound Concentration Ranges:**
- Hericenones: <20-500 µg/g dry weight (fruiting body)
- Erinacines: ~150 µg/g (mycelium)

**Nutritional Profile:** Proteins, dietary fiber, vitamins (B1, B2, B3, B5, B6, vitamin D precursors), minerals (selenium, zinc, potassium)

---

## Anti-Inflammatory Activity

**Mechanisms of Action:**

1. **NF-κB Pathway Inhibition**: Erinacines and hericenones inhibit phosphorylation of IκBα, preventing NF-κB activation and nuclear translocation, reducing production of pro-inflammatory cytokines (TNF-α, IL-6, IL-1β). Polysaccharides suppress NF-κB signaling in macrophages.

2. **COX-2 and iNOS Inhibition**: Hericenones inhibit cyclooxygenase-2, reducing prostaglandin E2 (PGE2) synthesis; suppress inducible nitric oxide synthase expression, reducing nitric oxide (NO) production linked to chronic inflammation.

3. **Nrf2 Pathway Activation**: Compounds activate nuclear factor erythroid 2-related factor 2 pathway, enhancing antioxidant enzyme expression (SOD, GPx), critical for protecting against neurodegeneration.

4. **Cytokine Modulation**: Polysaccharides downregulate pro-inflammatory cytokines (IL-6, TNF-α, IL-1β) and upregulate anti-inflammatory IL-10.

5. **Glial Cell Modulation**: Erinacines suppress glial cell activation and reduce IL-1β expression, particularly relevant in Alzheimer''s disease where microglial activation contributes to amyloid-beta plaque formation.

6. **Gut Microbiota Effects**: Polysaccharides act as prebiotics, reducing LPS-induced inflammation and improving gut barrier function.

**Study Evidence:**
- Polysaccharides and phenolic compounds significantly reduced LPS-induced TNF-α, IL-6, and nitric oxide in RAW 264.7 macrophages
- Erinacine A inhibited pro-inflammatory cytokine expression in BV-2 microglial cells
- In mouse Alzheimer''s disease model: erinacines reduced neuroinflammation and suppressed IL-1β expression
- H. erinaceus polysaccharides alleviated dextran sulfate sodium (DSS)-induced colitis in mice by restoring gut microbiota balance
- In high-fat-diet-induced obese mice: H. erinaceus extracts reduced systemic inflammation and improved insulin sensitivity

---

## Antioxidant Activity

**Mechanisms:**

1. **ROS Scavenging**: Bioactive compounds (hericenones, erinacines, polyphenolic compounds) scavenge reactive oxygen species, preventing oxidative damage to lipids, proteins, and DNA

2. **Antioxidant Enzyme Induction**: Upregulates activity of:
   - Superoxide dismutase (SOD) - converts superoxide radicals
   - Catalase (CAT) - breaks down hydrogen peroxide
   - Glutathione peroxidase (GPx) - protects from peroxide damage

3. **Lipid Peroxidation Inhibition**: Prevents lipid peroxidation, reducing malondialdehyde (MDA) levels linked to aging and cardiovascular disease

**Study Evidence:**
- H. erinaceus extract enhanced neuronal survival by reducing oxidative stress in brain cells, attributed to increased NGF levels and antioxidant defense mechanisms
- Treatment with mushroom extract significantly increased SOD, CAT, and GPx levels, protecting liver cells from oxidative damage
- DPPH and ABTS radical-scavenging activity comparable to vitamin C and tocopherols
- Supplementation reduced oxidative stress markers and improved endothelial function in hypertension animal model

---

## Antimicrobial Activity

**Mechanisms:**

1. **Cell Membrane Disruption**: Terpenoids and phenolic compounds disrupt bacterial and fungal cell membrane integrity by altering lipid bilayer stability, increasing permeability and causing intracellular leakage. Particularly effective against Gram-positive bacteria.

2. **Biofilm Inhibition**: Polysaccharides and terpenoids inhibit biofilm formation by interfering with quorum sensing pathways (bacterial communication system).

3. **Enzyme Inhibition & Metabolic Disruption**: Phenolic compounds inhibit key bacterial enzymes involved in cell wall synthesis, DNA replication, and energy metabolism; some erinacines and hericenones interfere with bacterial ATP production.

4. **ROS Induction in Microbes**: Bioactive compounds promote ROS generation in microbial cells, causing oxidative damage to proteins, lipids, and DNA; effective against antibiotic-resistant bacteria.

5. **Immune Response Modulation**: β-glucans stimulate macrophages, dendritic cells, and NK cells, boosting antimicrobial activity and pathogen clearance.

**Activity Spectrum:**
- **Gram-positive bacteria**: Potent activity against Staphylococcus aureus (including MRSA), Bacillus subtilis, Enterococcus faecalis
- **Gram-negative bacteria**: Lower activity; effects on Helicobacter pylori, Pseudomonas aeruginosa
- **Fungi**: Activity against Candida albicans, Aspergillus flavus

**Activity Type:** Predominantly bacteriostatic (inhibits growth); some bactericidal effects reported against Gram-positive bacteria (S. aureus, B. subtilis) from membrane-disrupting terpenoids.

**Synergistic Potential:** Bioactive compounds may act synergistically with conventional antibiotics, enhancing antimicrobial activity and potentially enhancing cell wall permeability to β-lactam antibiotics.

**Applications:**
- Adjuvant therapy with conventional antibiotics
- Topical antimicrobial agents for wound healing
- Natural food preservatives (inhibits Listeria monocytogenes, Salmonella spp.)

---

## Neuroprotective Properties & NGF Stimulation

**Key Mechanism:** Stimulation of nerve growth factor (NGF) synthesis by hericenones and erinacines, promoting neuronal growth, maintenance, and survival.

**Specific Compounds:**
- **Erinacine A**: Potent NGF stimulator; demonstrated ability to increase brain NGF levels and promote neurogenesis
- **Hericenones A-J**: Stimulate NGF synthesis with cognitive enhancement and memory improvement potential
- Both compound classes reduce neuroinflammation and oxidative stress in neuronal cells

**Bioavailability:** Erinacines, being lipophilic, exhibit better blood-brain barrier permeability compared to hydrophilic polysaccharides; among the few natural compounds with demonstrated BBB penetration capability.

**Clinical Applications:** Potential for preventing and managing Alzheimer''s disease, Parkinson''s disease, cognitive decline, mild cognitive impairment, and supporting recovery from brain/spinal cord injuries.

---

## Clinical Trial Data

1. **Cognitive Function in Mild Cognitive Impairment (50-80 year-old Japanese subjects):**
   - Randomized, double-blind, placebo-controlled study
   - 16-week H. erinaceus extract supplementation
   - Result: Significant improvements in cognitive performance; benefits declined after discontinuation, suggesting need for sustained intake

2. **Early-Stage Alzheimer''s Disease:**
   - Regular consumption improved memory recall
   - Reduced neuropsychiatric symptoms
   - Likely mechanism: NGF stimulation and neuroinflammation mitigation
   - Note: Larger-scale studies with longer follow-up needed

3. **Gastritis & Gastrointestinal Health:**
   - Significantly reduced inflammation-related symptoms
   - Improved mucosal healing
   - Modulated gut microbiota composition
   - Potential applications in IBS and inflammatory bowel disease

4. **Mood Disorders:**
   - Small-scale study: Participants reported reduced stress levels and improved mood regulation
   - Linked to influence on neurotrophic factors and brain inflammation pathways

**Overall Assessment:** Clinical research remains limited with small sample sizes and short durations; future trials needed with larger diverse populations, standardized formulations, and long-term safety/efficacy data.

---

## Calcium-Binding & Metal Ion Chelation Activity

**Functional Significance:**
- Calcium plays essential roles in neuronal excitability, synaptic plasticity, muscle contraction, and intracellular signaling
- Dysregulation of calcium homeostasis implicated in Alzheimer''s, Parkinson''s, and Huntington''s diseases
- Specific polysaccharides and proteins modulate calcium influx/efflux, potentially reducing excitotoxicity
- Calcium-binding proteins modulate oxidative stress and inflammation

**Metal Ion Chelation:** H. erinaceus displays metal ion chelating activity; bioavailable metal ions (Fe²⁺, Cu²⁺, Zn²⁺) essential for brain function but neurotoxic when dysregulated. Excess accumulation implicated in oxidative stress and protein aggregation in AD and PD.

**Mitochondrial Connection:** Calcium and metal ion homeostasis linked to mitochondrial function; finely tuned calcium signaling regulates ATP production and apoptosis. Imbalance causes mitochondrial dysfunction and increased ROS.

---

## Bioavailability & Delivery Challenges

**BBB Penetration:** Erinacines demonstrate ability to penetrate blood-brain barrier—key advantage over many natural compounds.

**Bioavailability Factors:**
- Digestion, metabolism, and systemic distribution influence target tissue reach
- Erinacines (lipophilic) exhibit better BBB permeability than β-glucans (hydrophilic)
- Polysaccharides primarily work through immune modulation rather than direct neuroprotection

**Enhancement Strategies:**
- Nanoparticle-based formulations and lipid carriers improve absorption and brain-targeting efficacy
- Encapsulation techniques improve stability and enable controlled release
- Further research needed on pharmacokinetics in humans (metabolism, half-life, optimal dosing)

---

## Cultivation Methods

**Log Cultivation:**
- Growth time: 6-12 months
- Yield: Low
- Cost: Low
- Difficulty: Moderate
- Mimics natural habitat; slow but high-quality; annual harvest for up to 5 years

**Sawdust Blocks (Indoor):**
- Growth time: 6-8 weeks
- Yield: High
- Cost: Medium
- Difficulty: High
- Fast, controlled conditions, high predictability; multiple harvests over weeks; commercial production

**Liquid Fermentation:**
- Growth time: 5-10 days
- Yield: Very high
- Cost: High
- Difficulty: Advanced
- Produces high mycelial biomass and bioactive compounds; pharmaceutical/nutraceutical applications

---

## Forms & Commercial Applications

- Capsules and tablets
- Powdered form
- Liquid extracts
- Functional beverages
- Protein bars
- Incorporated into soups, stews, protein powders, and health drinks
- Mild umami flavor enables easy incorporation into diverse recipes

---

## Safety, Regulatory Status, and Future Perspectives

**Safety Profile:**
- Generally Recognized As Safe (GRAS) when consumed as food
- Rodent studies show no significant organ damage or altered hematological parameters with oral administration
- Note: Those with mushroom allergies should avoid

**Regulatory Status:**
- **US**: Regulated as dietary supplement under DSHEA; requires label accuracy and product safety but no prior FDA approval if no disease claims made
- **EU**: Categorized under novel foods or food supplements (Regulation EU 2015/2283); health claims require EFSA scientific substantiation; no H. erinaceus health claims authorized to date
- **China & Japan**: Long-standing traditions; included in Chinese Pharmacopoeia and widely used in TCM; incorporated into health foods and Kampo formulations in Japan

**Challenges:**
- Significant variability in bioactive compound content influenced by strain, cultivation conditions, extraction methods, and post-harvest processing
- Lack of standardization in extraction methods and bioactive compound quantification
- Limited clinical validation
- Bioavailability and blood-brain barrier penetration require further elucidation

**Future Directions:**
- Biotechnological advancements (solid-state and submerged fermentation) for enhanced yield and purity
- Genetic and metabolic engineering to optimize bioactive compound biosynthesis
- Advanced extraction techniques: supercritical fluid extraction, ultrasound-assisted, microwave-assisted, enzyme-assisted extraction
- Implementation of analytical techniques (HPLC, MS, NMR) to ensure batch-to-batch consistency
- Standardization of cultivation conditions and genetically characterized strains
- Large-scale clinical trials with standardized formulations
- Development of novel delivery systems (nanoparticles, lipid carriers, encapsulation)
- Investigation of synergistic effects with conventional antibiotics
- Establish minimum effective concentrations of erinacines, hericenones, and polysaccharides',NULL,'2026-06-04 18:14:49.750678+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('f910a132-ed8c-45c5-b058-4a8907884ffe','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'https://pmc.ncbi.nlm.nih.gov/articles/PMC8622900/','doc','No substantive content available to extract.

The page content provided consists entirely of a reCAPTCHA security check message and does not contain any actual article, document, or informational material. The page has not loaded successfully, so there are no facts, findings, claims, quotes, or other usable source material to extract.

To extract meaningful content, you would need to provide the actual page content after the security verification has been completed.',NULL,'2026-06-04 19:12:20.89147+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('5471bd69-90a6-45df-b295-a6c274aa6122','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'https://pmc.ncbi.nlm.nih.gov/articles/PMC11614793/','doc','I cannot extract substantive content from this page because it only contains a reCAPTCHA security check message. The actual document content is not available in what was provided.

To get the substantive material you need, you''ll need to:
1. Complete the reCAPTCHA verification
2. Wait for the page to fully load
3. Then provide the actual page content (after the security check passes)

Please share the content from the destination page (pmc.ncbi.nlm.nih.gov) once you''ve accessed it.',NULL,'2026-06-04 19:15:22.46817+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('4d52abd4-7260-44ac-a5c1-f29f051a5857','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'https://pmc.ncbi.nlm.nih.gov/articles/PMC11614793/','doc','I can see this is a reCAPTCHA verification page with no substantive content to extract. The text shown is only:

- A browser check notice
- A reCAPTCHA message
- A redirect instruction

There are no facts, findings, claims, quotes, data, or other substantive material present on this page. This appears to be a security/access page rather than content.

To extract useful source material, you would need to access the actual article or document after the reCAPTCHA verification is complete.',NULL,'2026-06-04 19:16:09.796004+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('c87c0db0-0b93-469f-813c-d6a075d19d26','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'Integr Med Res. 2024 Sep 30;13(4):101089. doi: 10.1016/j.imr.2024.101089','doc','# Substantive Content: Reishi Mushroom Study – Cancer Patients

## Study Overview
Cross-sectional survey of 1,374 Chinese cancer patients using Reishi products (October–December 2022). Evaluated patient-reported symptom improvements and adverse effects after Reishi use.

## Key Findings – Symptom Improvements

**Primary Results:**
- Nausea improved "quite a bit" or "very much": 55%
- Fatigue improved "quite a bit" or "very much": 52%
- Poor appetite improved "quite a bit" or "very much": 51%
- Depression improved "quite a bit" or "very much": 50%

**Factors Associated with Higher Response Rates (Multivariable Analysis):**
- Age <65 years (AOR = 1.76, p = 0.001)
- Diagnosis ≥10 years ago (AOR = 1.78, p = 0.018)
- Duration of Reishi use:
  - 1–3 years (AOR = 1.53, p = 0.045)
  - 3–5 years (AOR = 2.04, p = 0.001)
  - >5 years (AOR = 2.07, p < 0.001)

## Adverse Events

125 participants (9.1%) reported adverse effects:
- Dry mouth: 5%
- Constipation: 4%
- Insomnia: 3%
- Pruritus: 3%
- Vertigo: 3%

## Reishi Bioactive Compounds

**Active constituents:**
- Basidiocarp, mycelia, and spores contain ~400 bioactive compounds
- **Triterpenoids**: anti-inflammatory, anti-tumor, cytotoxic activities; inhibit tumor invasion and metastasis
- **Polysaccharides (beta-glucans)**: activate macrophages and natural killer cells; support immune surveillance and tumor elimination
- Additional impacts: muscle function, antioxidant capacity, cardiovascular/hepatic function, immunomodulation, hormonal regulation, blood glucose control

## Study Population Characteristics
- Mean age: 68.4 years (range 25–100)
- Female: 64.8%
- Most common cancers: breast (27.1%), lung (20.1%)
- Mean time since diagnosis: 8.2 years
- Stage I–III: 67.7%
- 40.5% had completed surgical treatment at survey time
- Participants from 24 of 34 provincial regions in China

## Historical Context
- Reishi (Ganoderma Lucidum) used in Traditional Chinese Medicine for >2,000 years for "promoting vivacity and longevity"
- In China, breast cancer survivor Reishi use increased from 18.9% (1990s) to 58.4% (2006)
- Cultivated in China, Japan, Korea, Malaysia, North America, tropical/warm temperate regions of India
- Listed in American Herbal Pharmacopoeia, Chinese Pharmacopoeia
- Grows on dead/dying deciduous trees (oak, pyrus, maple)
- In many Asian countries, classified as prescription drug; globally available as dietary supplement/OTC product

## Study Methods
- Recruitment from Zhongke Health International LLC customer database
- Eligibility: cancer diagnosis (all types/stages), age ≥18, current/prior Reishi use, fluent Mandarin
- Survey delivery: online or by phone
- Symptom measurement: Edmonton Symptom Assessment System (ESAS) adapted (validated in Chinese, Cronbach''s alpha 0.72)
- Assessed 14 symptoms: pain, tiredness, nausea, depression, anxiety, drowsiness, poor appetite, shortness of breath, distress, pruritus, constipation, diarrhea, hot flash, insomnia
- Response scale: 0 = do not have symptom; 1 = no improvement; 2 = a little improvement; 3 = quite a bit improvement; 4 = very much improvement
- Adverse event assessment: predefined list plus open-ended reporting',NULL,'2026-06-04 19:24:30.737939+00');
insert into source_files (id,client_id,source,drive_file_id,name,type,transcript,frames_url,ingested_at) values ('7ae04db5-8b16-4426-9872-9348783c3288','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','url',NULL,'https://health.clevelandclinic.org/lions-mane-mushrooms-benefits','doc','# Lion''s Mane Mushroom Benefits

**Overview & Description**
Lion''s mane mushrooms (hericium erinaceus) are large, white edible fungi with icicle-like spikes that dangle downward. Other names: monkey head, bearded hedgehog, pom pom mushrooms. Taste similar to lobster or crab meat. Available fresh, dried, or cooked. Also come as supplements in capsule, liquid, and powder forms.

**Historical Use**
Long history in traditional Chinese medicine and Native American healing practices.

**Five Potential Health Benefits**

**1. Brain Health Support**
- Non-human studies show lion''s mane contains compounds that stimulate nerve growth factor (NGF) production, which helps grow brain cells and may enhance memory and focus
- Lab research suggests it may help grow and repair nerve cells after traumatic brain injury (TBI) like stroke
- Human study: 50- to 80-year-olds with mild cognitive impairment took 250-milligram tablets of lion''s mane dry powder three times daily for 16 weeks versus placebo. Those taking lion''s mane scored higher on cognitive tests than placebo group. Test scores decreased after stopping supplement.
- Sometimes referred to as "smart mushroom"

**2. Reduce Inflammation and Oxidative Stress**
- Lab research shows anti-inflammatory effects and antioxidant properties
- May help minimize inflammation and protect cells against damage
- Relevant to conditions like heart disease, rheumatoid arthritis, and certain cancers

**3. Protect Gut**
- Contains probiotics that support immune system and promote growth of healthy bacteria in digestive system
- Prevents growth of H. pylori bacteria, which can cause stomach ulcers
- 2019 non-human study showed lion''s mane might help treat ulcers
- Non-human study suggests it may reduce liver inflammation from excessive alcohol consumption
- Lab study shows it may help treat ulcerative colitis (inflammatory bowel disease)
- Appears to quiet down inflammation in gut

**4. Heart Health Support**
- Non-human studies suggest lion''s mane extracts may help keep cholesterol numbers in check
- May reduce high blood pressure
- Works by improving lipid metabolism (how body breaks down and stores fat for energy) and circulation
- Helps blood vessels stay healthy and function better

**5. Fight Cancer**
- Because of unique ingredients, may help fight cancer cells and slow spread of certain types of cancer (non-human research only)
- No human studies conducted yet

**Safety & Important Notes**
- Not FDA-approved
- No long-term human reliability data available
- No established consumption guidelines
- Generally appears safe unless allergic to mushrooms
- Registered dietitian Beth Czerwony recommends consulting healthcare provider before starting
- Recommends sourcing from trusted retailers with good reviews',NULL,'2026-06-04 22:10:43.81717+00');

insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('a175deb6-f761-4507-9f9a-542cd05c612d','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','96a0cc77-65e1-4aac-8339-cff5d9861c9a','carousel','instagram','{"hook": "The morning mushroom most people under-dose", "pillar": "education", "slides": ["The morning mushroom most people under-dose", "Lion''s Mane is studied for supporting focus and mental clarity.", "Most powders are under-dosed — potency is everything.", "Dr. Raemy formulated ours for dose consistency in your coffee.", "No earthy taste. Just your morning, dialed in."], "caption": "Why we built our Lion''s Mane the way we did. Supports focus and clarity. *These statements have not been evaluated by the FDA.", "hashtags": ["#lionsmane", "#functionalmushrooms", "#focus", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('661cc235-b4a3-4b0c-9dbf-9a2c1399e934','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','abd78cb6-9ca3-4f07-ae74-7bf9166466b5','static','instagram','{"hook": "Your 20-minutes-before-training ritual", "pillar": "product", "slides": ["Cordyceps, 20 minutes before you train."], "caption": "Studied for supporting endurance and oxygen utilization during exercise. It supports your workout — it doesn''t replace it. *Not evaluated by the FDA.", "hashtags": ["#cordyceps", "#preworkout", "#endurance", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('62e0a3ce-4ba8-414a-b646-02d239405421','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','5f5d7159-b0bc-47f7-9189-6e77c3638fce','reel','instagram','{"hook": "The 1-hour-before-bed ritual", "pillar": "founder", "slides": ["The 1-hour-before-bed ritual", "Reishi, traditionally used to support a calm evening.", "No screens. Warm room. Wind down on purpose."], "caption": "Reishi cures insomnia and treats your anxiety so you finally sleep. Part of my nightly wind-down. *These statements have not been evaluated by the FDA.", "hashtags": ["#reishi", "#sleep", "#eveningroutine", "#mushnoom"], "claims_flags": [{"reason": "Disease claims (''cures insomnia'', ''treats your anxiety'') are not allowed. Rephrase to structure/function language, e.g. ''supports a calm evening routine''.", "excerpt": "Reishi cures insomnia and treats your anxiety", "location": "caption", "severity": "high"}], "claims_verdict": "review_claim"}'::jsonb,NULL,'in_review',NULL,NULL,NULL,'false',NULL,'2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('2367ef55-0fdc-4fcf-8a8d-583fd086e9cc','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','96a0cc77-65e1-4aac-8339-cff5d9861c9a','reel','tiktok','{"hook": "What a doctor actually takes every morning", "pillar": "founder", "slides": ["What a doctor actually takes every morning", "Lion''s Mane, stirred into coffee.", "Formulated for dose consistency."], "caption": "Dr. Raemy''s morning. Supports focus and mental clarity. *Not evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#doctor", "#lionsmane", "#morningroutine", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,NULL,'in_review',NULL,NULL,NULL,'false',NULL,'2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('4a88a318-c9c6-4580-b326-02440044bdb8','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','c946830c-fc5a-46de-802f-0b11f5f607fc','carousel','instagram','{"hook": "What ''third-party tested'' actually means", "pillar": "social_proof", "slides": ["What ''third-party tested'' actually means", "Every batch tested for heavy metals.", "Beta-glucan content verified — not just listed.", "Fruiting body, not mycelium-on-grain.", "COAs available on request."], "caption": "Potency, purity, transparency — the three things we won''t compromise. *These statements have not been evaluated by the FDA.", "hashtags": ["#thirdpartytested", "#purity", "#transparency", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,NULL,'in_review',NULL,NULL,NULL,'false',NULL,'2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('efd04848-c8c7-41f4-8771-a0313ad48963','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','abd78cb6-9ca3-4f07-ae74-7bf9166466b5','carousel','instagram','{"hook": "Cordyceps before you train: the why", "pillar": "education", "slides": ["Cordyceps before you train: the why", "Studied for supporting endurance.", "And oxygen utilization during exercise.", "20 minutes before, in water."], "caption": "Supports your workout — doesn''t replace it. *Not evaluated by the FDA.", "hashtags": ["#cordyceps", "#endurance", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c6.png','scheduled','2026-06-04 13:00:00+00',NULL,NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('d6b47758-58be-420b-86d2-9a959d4baab8','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','96a0cc77-65e1-4aac-8339-cff5d9861c9a','static','instagram','{"hook": "Mixes clear. No earthy taste.", "pillar": "product", "slides": ["Mixes clear. No earthy taste."], "caption": "Supports focus and clarity. *Not evaluated by the FDA.", "hashtags": ["#lionsmane", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c7.png','scheduled','2026-06-05 15:30:00+00',NULL,NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('a7e11032-9eea-4d1b-a3d2-f3190bbbbb31','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','5f5d7159-b0bc-47f7-9189-6e77c3638fce','reel','tiktok','{"hook": "Wind-down, on purpose", "pillar": "lifestyle", "slides": ["Wind-down, on purpose", "Reishi an hour before bed."], "caption": "Supports a calm evening routine. *Not evaluated by the FDA.", "hashtags": ["#reishi", "#winddown", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c8.mp4','scheduled','2026-06-06 01:00:00+00',NULL,NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('48a82613-d976-451d-8277-493f4bcbb56f','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','c946830c-fc5a-46de-802f-0b11f5f607fc','carousel','instagram','{"hook": "Why fruiting body matters", "pillar": "social_proof", "slides": ["Why fruiting body matters", "Mycelium-on-grain is mostly starch.", "Fruiting body is where the beta-glucans live.", "We test to prove it."], "caption": "Potency you can verify. *Not evaluated by the FDA.", "hashtags": ["#fruitingbody", "#betaglucans", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c9.png','scheduled','2026-06-09 13:00:00+00',NULL,NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('0f072f77-9fd1-4ba3-9d14-6ff33209e4d4','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','abd78cb6-9ca3-4f07-ae74-7bf9166466b5','static','instagram','{"hook": "20 minutes before.", "pillar": "product", "slides": ["20 minutes before."], "caption": "Cordyceps, in water, before you train. *Not evaluated by the FDA.", "hashtags": ["#cordyceps", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c10.png','scheduled','2026-06-11 15:00:00+00',NULL,NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('7b18c88e-b81b-4026-b418-6adf01675a9a','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','96a0cc77-65e1-4aac-8339-cff5d9861c9a','carousel','instagram','{"hook": "The under-dosing problem", "pillar": "education", "slides": ["The under-dosing problem", "Most powders skimp.", "We don''t."], "caption": "Potency is the whole point. *Not evaluated by the FDA.", "hashtags": ["#lionsmane", "#mushnoom"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,'https://example.supabase.co/storage/v1/object/public/assets/c11.png','posted','2026-06-02 13:00:00+00','2026-06-02 13:00:30+00',NULL,'true','nikit@raemy.ai','2026-06-04 03:26:22.676483+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('d567959b-556e-40bf-a789-c91c940c10f0','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','e5f87f98-711a-40be-9b90-c28104526b48','carousel','instagram',E'{"hook": "Meet Lion''s Mane — the mushroom scientists are calling nature''s most fascinating brain-supporter. 🧠🍄 Here''s what''s actually inside it.", "pillar": "education", "slides": ["🍄 LION''S MANE 101\\nThe science behind the buzz — no hype, just what the research actually says.\\n(Swipe to learn →)", "🔬 TWO STAR COMPOUNDS\\nLion''s Mane contains two rare compound families found almost nowhere else in nature:\\n\\n• Hericenones — found in the fruiting body\\n• Erinacines — found in the mycelium\\n\\nBoth have been studied for their ability to support the body''s production of Nerve Growth Factor (NGF) — a protein involved in the growth and maintenance of neurons.*\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "🧠 WHAT IS NGF & WHY DOES IT MATTER?\\nNerve Growth Factor (NGF) plays a key role in keeping neurons healthy and functioning.\\n\\nHericenones and erinacines are among the only known natural compounds studied for their ability to support NGF synthesis — making Lion''s Mane uniquely interesting to neuroscientists.*\\n\\nErinacines are lipophilic, meaning early research suggests they may be able to cross the blood-brain barrier — a rare quality for a plant-based compound.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "🛡️ MORE THAN JUST BRAIN SUPPORT\\nLion''s Mane is packed with other bioactives too:\\n\\n• β-Glucans — well-studied polysaccharides that support immune function*\\n• Ergothioneine — a potent antioxidant amino acid that''s actively absorbed by cells\\n• Phenolic compounds (gallic acid, caffeic acid) — studied for antioxidant properties*\\n• Vitamins B1, B2, B3, B5, B6 + vitamin D precursors\\n\\nIt''s a genuinely complex organism — not a one-trick mushroom.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "📋 WHAT DOES THE CLINICAL RESEARCH ACTUALLY SAY?\\nOne randomized, double-blind, placebo-controlled study (16 weeks, adults 50–80 yrs) found significant improvements in cognitive performance scores with Lion''s Mane extract supplementation.*\\n\\nImportant context:\\n• Benefits appeared to decline after stopping supplementation\\n• Sample sizes across existing studies are still small\\n• Researchers call for larger, longer, more diverse trials\\n\\nThe science is promising — and still growing.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "⚠️ WHAT TO LOOK FOR ON A LABEL\\nNot all Lion''s Mane products are equal. Bioactive compound levels vary widely based on:\\n\\n🌱 Strain genetics\\n🪵 Cultivation method (log vs. sawdust vs. liquid fermentation)\\n⚗️ Extraction method\\n📦 Post-harvest processing\\n\\nLook for brands that specify whether the product uses fruiting body, mycelium, or both — and whether it''s standardized for key compounds like erinacines or β-glucans.", "✨ THE BOTTOM LINE\\nLion''s Mane has a genuinely interesting body of research behind it — especially around supporting focus, cognitive wellness, and a healthy inflammatory response.*\\n\\nAt Mushnoom, we''re physician-founded because we believe you deserve products built on real science, not trends.\\n\\n👇 Curious about adding Lion''s Mane to your routine? Explore our formulas via the link in bio.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease."], "caption": "Lion''s Mane is one of the most studied functional mushrooms on the planet — and the science behind it is genuinely fascinating. 🍄🧠\\n\\nSwipe through to learn what''s actually inside it, what the research says, and what to look for when choosing a quality product.\\n\\nPhysician-founded. Science-first. No hype.\\n\\n🔗 Explore our Lion''s Mane formulas → link in bio.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#LionsMane", "#FunctionalMushrooms", "#MushroomWellness", "#Nootropics", "#BrainHealth", "#Mushnoom", "#WellnessEducation", "#NGF", "#FunctionalFood", "#ScienceBackedWellness", "#MushoomSupplements", "#AdaptogenicMushrooms", "#HericiumErinaceus", "#CleanSupplements", "#PhysicianFounded"], "claims_flags": [], "claims_verdict": "ok"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 18:15:59.553727+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('a6044546-bec2-41c2-ac48-8a2a73aa23a1','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','f910a132-ed8c-45c5-b058-4a8907884ffe','carousel','instagram',E'{"hook": "You sat down to work an hour ago. You''ve reread the same sentence four times.", "pillar": "lifestyle", "slides": ["You sat down to work an hour ago.\\nYou''ve reread the same sentence four times.", "That mid-morning fog is real.\\nAnd it''s one of the most common things people want to shake.", "Lion''s mane is a functional mushroom that may support focus and mental clarity — your brain staying sharp when you need it most.", "Early research suggests lion''s mane supports the growth of new neural connections — basically, your brain firing on all cylinders.", "One simple addition to your morning routine.\\nNo overhaul required.", "Here''s to the focused morning you''ve been after.\\nLion''s mane might be worth a look."], "caption": "That foggy, distracted feeling mid-morning? You''re not alone in it. Lion''s mane is a functional mushroom that may support focus and mental clarity — making it a simple, science-backed addition to your daily routine. Start small, stay consistent, and see how your mornings feel. *These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#functionalmushrooms", "#lionsmane", "#focusanclarity", "#wellnessroutine", "#mushnoom", "#morningroutine"], "claims_flags": [{"reason": "Structure/function claim — confirm this is supported by cited lion''s mane research before publishing. Ensure ''staying sharp'' is not read as a disease/cognitive-decline prevention claim.", "excerpt": "may support focus and mental clarity — your brain staying sharp when you need it most", "location": "Slide 3", "severity": "high"}, {"reason": "''Supports the growth of new neural connections'' references neurogenesis/NGF research. Source material was unavailable — compliance reviewer must verify this is grounded in published, peer-reviewed studies and that ''early research suggests'' framing is retained. Also confirm ''firing on all cylinders'' does not imply treatment of a neurological condition.", "excerpt": "Early research suggests lion''s mane supports the growth of new neural connections — basically, your brain firing on all cylinders", "location": "Slide 4", "severity": "high"}, {"reason": "Repeated structure/function claim in caption. FDA disclaimer is present — verify placement is sufficiently proximate to the claim per FTC guidance.", "excerpt": "may support focus and mental clarity — making it a simple, science-backed addition to your daily routine", "location": "Caption", "severity": "low"}], "claims_verdict": "review_claim"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 19:13:23.317545+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('84359c88-62c1-4f8d-9c06-a03b72896b94','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','c87c0db0-0b93-469f-813c-d6a075d19d26','carousel','instagram',E'{"hook": "Reishi has been used for over 2,000 years. Here''s what a modern study found.", "pillar": "education", "slides": ["Reishi has been used for over 2,000 years. Here''s what a modern study found.", "Reishi (Ganoderma lucidum) isn''t new.\\n\\nTraditional Chinese Medicine has used it for millennia — prized for promoting vitality and longevity.\\n\\nBut what does the science actually say?", "Researchers surveyed 1,374 cancer patients who used reishi products.\\n\\nThey asked one simple question: did your symptoms improve?\\n\\nThe results were worth paying attention to.", "Over half of participants reported meaningful improvement in:\\n\\n— Nausea\\n— Fatigue\\n— Poor appetite\\n— Low mood\\n\\nEach in the range of 50–55% reporting quite a bit or very much improvement.\\n\\nThis was a patient-reported survey — early-stage evidence, not a clinical trial.", "So why might reishi support how you feel?\\n\\nIt contains around 400 bioactive compounds.\\n\\nTwo stand out:\\n\\nPolysaccharides (beta-glucans) — help activate your immune system''s natural defenses.\\n\\nTriterpenoids — compounds studied for their anti-inflammatory properties.\\n\\nThink of them as reishi''s two active ingredients working in the background.", "A few things to know before you start:\\n\\nAbout 9% of participants reported mild side effects — dry mouth, constipation, or occasional sleep changes.\\n\\nAnd longer use (1–5+ years) was linked to stronger reported benefits in the study.\\n\\nLike most wellness rituals, consistency seems to matter.", "Reishi won''t transform your night in one sip.\\n\\nBut as a steady part of your evening routine, it may support the calm, restful feeling you''re after.\\n\\nHere''s to your most grounded evening yet — reishi might be worth a look.\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease."], "caption": "Reishi has a 2,000-year track record — and researchers are starting to catch up. A survey of over 1,300 cancer patients found that more than half reported meaningful improvements in fatigue, nausea, and low mood after using reishi. Early research, but a compelling signal worth knowing about. Reishi may support your body''s natural calm and balance as part of a consistent daily ritual.\\\\n\\\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#reishi", "#functionalmushrooms", "#mushroomwellness", "#adaptogen", "#wellnessroutine", "#sciencebacked", "#calmyourmind"], "claims_flags": [{"reason": "These are patient-reported outcomes from a cross-sectional survey of cancer patients — not a randomized controlled trial. Must not be implied to mean reishi treats or cures any condition. Should be framed clearly as early/observational evidence, which the slide does, but reviewer should confirm framing is sufficient for a general wellness audience who may not have a cancer diagnosis context.", "excerpt": "Over half of participants reported meaningful improvement in: Nausea, Fatigue, Poor appetite, Low mood", "location": "Slide 4", "severity": "high"}, {"reason": "Good disclosure, but reviewer should confirm this caveat is visually prominent enough on the final designed slide and not buried in small type.", "excerpt": "This was a patient-reported survey — early-stage evidence, not a clinical trial.", "location": "Slide 4", "severity": "low"}, {"reason": "''Activate your immune system''s natural defenses'' edges toward an immune-function claim. Structure/function framing (''may support normal immune function'') is safer. Reviewer should assess whether ''help activate'' implies a treatment or enhancement beyond normal healthy function.", "excerpt": "Polysaccharides (beta-glucans) — help activate your immune system''s natural defenses.", "location": "Slide 5", "severity": "high"}, {"reason": "Anti-inflammatory language can imply disease treatment. The word ''studied for'' softens this appropriately, but reviewer should confirm this does not imply a therapeutic anti-inflammatory effect for the consumer.", "excerpt": "Triterpenoids — compounds studied for their anti-inflammatory properties.", "location": "Slide 5", "severity": "low"}, {"reason": "Accurately sourced from the multivariable analysis. However, framing ''stronger benefits'' could be read as implying a guaranteed outcome. Reviewer should confirm this is clearly attributed to the study finding, not a product promise.", "excerpt": "longer use (1–5+ years) was linked to stronger reported benefits in the study.", "location": "Slide 6", "severity": "low"}, {"reason": "Structure/function claim for calm and rest. Must remain clearly as ''may support'' language, not a definitive claim. FDA disclaimer is present in both locations. Reviewer should confirm the disclaimer is included in the final designed carousel, not just in the caption copy.", "excerpt": "it may support the calm, restful feeling you''re after / Reishi may support your body''s natural calm and balance", "location": "Slide 7 & Caption", "severity": "low"}], "claims_verdict": "review_claim"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 19:25:03.222958+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('10556ead-9aae-45cd-96f7-e9b929617ed6','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','e5f87f98-711a-40be-9b90-c28104526b48','carousel','instagram',E'{"hook": "Your brain is literally growing new connections right now — lion''s mane might help it do that better.", "pillar": "education", "slides": ["Your brain is literally growing new connections right now.\\n\\nLion''s mane might help it do that better.", "Inside lion''s mane are two rare compounds: hericenones and erinacines.\\n\\nThey do something almost no other natural compound can.", "They support your brain''s production of NGF — nerve growth factor.\\n\\nThink of NGF as your brain''s maintenance crew: it helps neurons grow, connect, and survive.", "One of those compounds, erinacine A, can actually cross the blood-brain barrier — the brain''s tough security wall — and get to work where it counts.", "Early research suggests this may support memory, focus, and mental clarity over time.\\n\\nOne double-blind study in adults with mild cognitive decline showed real improvements after 16 weeks of supplementation.*", "The science is still growing (just like those neurons).\\n\\nBut for a sharper, more connected day — lion''s mane is worth knowing about.", "Here''s to feeding your brain well.\\n\\nLion''s mane might just be the most interesting thing on your wellness shelf."], "caption": "Your brain never really clocks out — and lion''s mane is one of the most fascinating things researchers are studying to support it. Two compounds found in this mushroom, hericenones and erinacines, may support your brain''s natural production of nerve growth factor — the protein that helps neurons grow and stay healthy. Early clinical research is promising, and we''re just getting started. Worth a look if you''re curious about supporting long-term mental clarity and focus.*\\n\\n*These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#lionsmane", "#functionalmushrooms", "#brainhealth", "#focusandfuel", "#wellnessroutine", "#mushnoom", "#nervegrowthfactor"], "claims_flags": [{"reason": "Implies lion''s mane supports neurogenesis in humans. Source material supports NGF stimulation and neurogenesis in animal/cell studies and limited clinical research; ensure this reads as ''may support'' rather than a confirmed effect. Verify slide copy reads aspirational/educational, not as a definitive disease or treatment claim.", "excerpt": "Your brain is literally growing new connections right now — lion''s mane might help it do that better.", "location": "Slide 1 & Hook", "severity": "high"}, {"reason": "Structure/function claim linking lion''s mane compounds to NGF production in humans. Supported by source material (hericenones and erinacines stimulate NGF synthesis) but clinical evidence in humans is limited. Compliant as written (''support'') but should retain FDA disclaimer proximity.", "excerpt": "They support your brain''s production of NGF — nerve growth factor.", "location": "Slide 3", "severity": "low"}, {"reason": "BBB penetration is supported in source material for erinacines (lipophilic, demonstrated BBB penetration), but most evidence is preclinical. Phrasing ''get to work where it counts'' implies efficacy in humans — reviewer should confirm this reads as educational/mechanistic, not as a treatment claim.", "excerpt": "Erinacine A can actually cross the blood-brain barrier... and get to work where it counts.", "location": "Slide 4", "severity": "high"}, {"reason": "References the 16-week Japanese RCT from source material (50–80 year-olds with mild cognitive impairment). ''Mild cognitive decline/impairment'' edges toward a disease population — reviewer should confirm framing does not imply treatment of a medical condition. FDA disclaimer asterisk is present. ''Memory, focus, and mental clarity'' are structure/function — acceptable if FDA disclaimer is displayed.", "excerpt": "Early research suggests this may support memory, focus, and mental clarity over time. One double-blind study in adults with mild cognitive decline showed real improvements after 16 weeks of supplementation.*", "location": "Slide 5", "severity": "high"}, {"reason": "Structure/function claim with FDA disclaimer present. ''Long-term'' modifier should be reviewed — source material notes benefits declined after discontinuation, which may warrant nuance. NGF stimulation claim is supported by source but primarily preclinical.", "excerpt": "may support your brain''s natural production of nerve growth factor — the protein that helps neurons grow and stay healthy... supporting long-term mental clarity and focus.*", "location": "Caption", "severity": "low"}], "claims_verdict": "review_claim"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 21:46:23.498603+00');
insert into content_items (id,client_id,source_file_id,format,platform,copy,asset_url,status,scheduled_for,posted_at,external_post_id,claims_checked,approved_by,created_at) values ('fd4889d9-c0dc-41b8-a53b-1b11603cbb6c','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','7ae04db5-8b16-4426-9872-9348783c3288','carousel','instagram',E'{"hook": "Your brain makes new connections every day — lion''s mane may help it do that better.", "pillar": "education", "slides": ["Your brain makes new connections every day.\\n\\nLion''s mane may help it do that better.", "Lion''s mane is a real mushroom — white, shaggy, almost otherworldly looking.\\n\\nAnd it''s been used in traditional medicine for centuries.", "Inside it are compounds that appear to stimulate something called nerve growth factor (NGF).\\n\\nThink of NGF as your brain''s signal to grow and maintain healthy nerve cells.", "In a human study, adults with mild memory concerns took lion''s mane daily for 16 weeks.\\n\\nThey scored higher on cognitive tests than those who didn''t take it.", "That''s early but promising research — and it''s why lion''s mane earned its nickname:\\n\\n\\"the smart mushroom.\\"", "Supporting your focus and mental clarity doesn''t have to feel complicated.\\n\\nA daily lion''s mane ritual is a simple place to start.", "Here''s to your sharpest mornings yet —\\n\\nlion''s mane might be worth a look."], "caption": "Lion''s mane has been quietly studied for its effect on how our brains grow and stay sharp — and the early human research is genuinely exciting. It may support focus and mental clarity as part of a daily wellness routine. Simple, science-backed, and worth knowing about. *These statements have not been evaluated by the FDA. Not intended to diagnose, treat, cure, or prevent any disease.", "hashtags": ["#functionalmushrooms", "#lionsmane", "#brainhealth", "#focusandclarity", "#wellnessroutine", "#mushnoom", "#sciencebackedwellness"], "claims_flags": [{"reason": "Implied cognitive benefit — ensure this reads as structure/function support, not a disease or treatment claim. FDA disclaimer required in caption.", "excerpt": "lion''s mane may help it do that better", "location": "Slide 1 & Hook", "severity": "low"}, {"reason": "NGF claim is sourced from non-human/lab studies only. Verify the carousel does not imply this is proven in humans. Phrasing ''appear to stimulate'' appropriately hedges, but reviewer should confirm.", "excerpt": "stimulate something called nerve growth factor (NGF) … your brain''s signal to grow and maintain healthy nerve cells", "location": "Slide 3", "severity": "low"}, {"reason": "References a real human study. However, ''mild memory concerns'' is a simplification of ''mild cognitive impairment'' — which is a clinical designation. Reviewer should confirm this phrasing does not imply treatment of a diagnosed condition.", "excerpt": "adults with mild memory concerns took lion''s mane daily for 16 weeks. They scored higher on cognitive tests", "location": "Slide 4", "severity": "high"}, {"reason": "Good hedge language used. Reviewer should confirm overall slide does not overstate the body of human evidence, which is currently limited to one cited study.", "excerpt": "early but promising research", "location": "Slide 5", "severity": "low"}, {"reason": "Structure/function claim — focus and mental clarity. FDA disclaimer is present in caption. Confirm this language is within structure/function bounds and not implying treatment.", "excerpt": "Supporting your focus and mental clarity", "location": "Slide 6", "severity": "low"}], "claims_verdict": "review_claim"}'::jsonb,NULL,'draft',NULL,NULL,NULL,'false',NULL,'2026-06-04 22:14:10.56045+00');

insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('b8842b62-3b0a-4ea7-a59e-b229973a5316','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','repeat_rate','38.4','shopify','2026-06-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('c25e42e5-ccf4-4406-8dd1-8249737515ec','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','repeat_rate','35.2','shopify','2026-04-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('9bce2f64-a275-413e-84d3-1f3fb54dceda','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','subscription_rate','21.7','shopify','2026-06-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('7ab99e04-79e8-4b50-922e-cb558e7305d4','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','subscription_rate','20.3','shopify','2026-04-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('b02aa1c7-18d6-49f0-9ec5-70a7205d16b2','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','email_revenue','24910','klaviyo','2026-06-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('228248c9-b24d-49aa-95cb-02122b9d5c47','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','email_revenue','22221','klaviyo','2026-05-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('34b8d8b9-193f-4287-9a6f-aec9f23dbb45','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','blended_cac','31.20','blended','2026-06-01 00:00:00+00');
insert into metrics_log (id,client_id,metric,value,source,captured_at) values ('4a311602-bf2b-4d59-8a17-be10cbd038e9','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','blended_cac','34.14','blended','2026-05-01 00:00:00+00');

insert into decisions (id,client_id,date,lever,rationale,predicted,actual,status) values ('b7045fbb-36dc-40ff-9b46-0007ebe618d5','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','2026-05-28','Moved Lion''s Mane education carousel from Sunday to Tuesday 8am','Tue 8–10am drove 2.3x saves vs weekend slots over trailing 4 weeks','+15% saves on education pillar','+22% saves, +9% profile visits','win');
insert into decisions (id,client_id,date,lever,rationale,predicted,actual,status) values ('f57acbca-cd35-4787-8bfe-ddc936dffcc8','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','2026-05-21','Added FDA disclaimer overlay to all founder-voice reels','Compliance pass flagged 3 of 7 reels missing disclaimer at publish','No engagement impact, removes compliance risk','No measurable drop in completion rate','win');
insert into decisions (id,client_id,date,lever,rationale,predicted,actual,status) values ('963d25f9-1665-4472-a406-43f226348a86','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','2026-05-14','Shifted email-capture CTA from blog to subscription landing page','Subscription LP converts 4.1% vs blog 1.8% on cold IG traffic','+10% email-attributed revenue','+12.1% email-attributed revenue','win');
insert into decisions (id,client_id,date,lever,rationale,predicted,actual,status) values ('9452894d-505a-4405-99a6-aa8ffa4113cb','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','2026-05-07','Tested static product cards against carousels on cold audiences','Hypothesis: simpler creative lowers CAC on prospecting','-15% CAC on prospecting set','Still measuring — 9 days of data','pending');

insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('aa43a850-f7c8-4e98-b99d-19f064b24227','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','37292','3600','0.055292','2026-06-04 18:14:49.661066+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('50eb52c5-508e-4d82-a757-86191668c2f5','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','4660','2048','0.0447','2026-06-04 18:15:59.486507+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('5f4f2bc9-fe2c-4879-95ee-eff5be5c1ed1','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','161','95','0.000636','2026-06-04 19:12:20.814478+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('e542471a-a430-4674-880f-e39019910916','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','2069','660','0.016107','2026-06-04 19:13:23.255123+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('5972277a-37c3-48b0-bc2f-3670e61634d8','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','161','122','0.000771','2026-06-04 19:15:22.416721+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('a02b9136-5d10-413c-96b5-5eaabf4eb9fb','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','161','118','0.000751','2026-06-04 19:16:09.747953+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('fed5f6d0-f22b-48a5-9d98-d3ffaf0f7cc3','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','3228','987','0.008163','2026-06-04 19:24:30.67132+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('f3c9ab8a-dc17-44bf-b539-c306cb781ce2','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','2915','1324','0.028605','2026-06-04 19:25:03.145343+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('c91be396-5492-48de-94d4-9428af2df981','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','5943','1126','0.034719','2026-06-04 21:46:23.4454+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('ad5d17df-f60e-4800-a993-b42bb1594c0a','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','extractor','claude-haiku-4-5-20251001','2791','641','0.005996','2026-06-04 22:10:43.752836+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('c1d9f28d-aa60-4a67-b8ee-9f22d5a8177d','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','2984','985','0.023727','2026-06-04 22:14:10.500309+00');
insert into usage_log (id,client_id,agent,model,tokens_in,tokens_out,cost,created_at) values ('e1363d7b-9943-494f-83c7-b12c5e49695b','ae1aca52-9dae-4346-b9fe-a2bee7de78c1','amplifier','claude-sonnet-4-6','2984','866','0.021942','2026-06-04 22:16:03.562547+00');
