# Data Accuracy Checklist — Verify Before Final Demo

**Do not replace `NOT_VERIFIED` with a date until you actually check and record the cited source.** The sources below are places to verify values, not proof that the current defaults are correct.

| Config file / key | Current value or state | Why unverified / action before demo | Official source to check |
|---|---|---|---|
| `central_subsidy.json` — slabs and cap | ₹30,000/kW through 2 kW; fixed ₹78,000 above 2 kW; max ₹78,000 | SRS-derived acceptance logic, not independently verified current scheme policy; verify capacity slabs, applicant eligibility, state/UT category, CFA cap and current amendments | MNRE rooftop programme guidelines and official National Portal: https://mnre.gov.in/en/grid-connected-solar-rooftop-programme/ and https://pmsuryaghar.gov.in/ |
| `central_subsidy.json` — `lastVerified` | `NOT_VERIFIED` | Set only after reading current applicable official guideline/portal | Same MNRE/portal sources above |
| `state_subsidy.json` | `states: []` | No verified state subsidy entries; research relevant state schemes; empty list does not mean none exist | State energy department, state nodal agency and local DISCOM official site; for Maharashtra start with https://www.mahaurja.com/ and regulator https://new.merc.gov.in/ |
| `discoms.json` — `defaultTariff` | Maharashtra generic placeholder ₹7/unit | Not a verified bill tariff; tariffs vary by consumer category, slab, fixed charges and current tariff order | MERC tariff orders and consumer-specific DISCOM tariff schedule: https://new.merc.gov.in/ |
| `assumptions.json` — `psh` | 4.5 h/day | Generic India-average assumption; replace with location-specific monthly/annual solar resource where available | NIWE Solar Radiation Resource Assessment / Indian Solar Radiation Atlas: https://niwe.res.in/department/department_wra/ |
| `assumptions.json` — `performanceRatio` | 0.78 | Engineering estimate, affected by temperature, inverter, wiring, dust, shading and design; use an installer/design basis and state it | Project-specific EPC/design calculation and module/inverter datasheets; NIWE resource context: https://niwe.res.in/department/department_wra/ |
| `assumptions.json` — `panelWatt` | 540 W | Product-specific placeholder; use the selected module datasheet and verify model/eligibility if scheme applies | Manufacturer datasheet and MNRE ALMM lists: https://mnre.gov.in/en/approved-list-of-models-and-manufacturers-almm/ |
| `assumptions.json` — `costPerKW` | ₹60,000/kW | SRS midpoint placeholder, not a quote or current official benchmark; use local installed-price quotations with taxes, structure, wiring and protections clearly scoped | At least two/three dated local EPC quotes; MNRE benchmark-cost archive for context only: https://mnre.gov.in/en/solar-standard-specification-benchmark-cost/ |
| `assumptions.json` — `costPerKWSource`, `costPerKWLastVerified` | Placeholder source; `NOT_VERIFIED` | Replace with actual quote source and date | The selected EPC quote(s); record quote date and scope |
| `assumptions.json` — `tariff` | ₹7/unit | Generic tariff placeholder; customer tariff may be slab/category-dependent | Current tariff order and the customer's bill from their DISCOM; Maharashtra: https://new.merc.gov.in/ |
| `assumptions.json` — `exportRate` | ₹7/unit | Assumes export credit equals retail tariff; net-metering settlement/export compensation can differ by policy and consumer category | Applicable state net-metering regulations, tariff order and DISCOM rules; Maharashtra: https://new.merc.gov.in/ |
| `assumptions.json` — `degradationRate` | 0.5%/year | Generic model assumption; use module warranty/data sheet and a clearly stated modelling assumption | Selected PV module manufacturer's warranty/datasheet; verify against project design assumptions |
| `assumptions.json` — `tariffEscalationRate` | 4%/year | Forecast assumption, not a guaranteed tariff trend | Historical/approved tariff orders from the relevant regulator; disclose as scenario input, not fact |
| `assumptions.json` — `annualLoanRate` | 9% | Loan placeholder; actual interest depends on lender, borrower and product | Written loan offer/term sheet from the chosen bank or lender; do not present 9% as available financing |
| `assumptions.json` — `loanTenureMonths` (if set elsewhere) | Defaults to 120 months in proposal builder | Default tenure is illustrative; verify current config and label it clearly | Actual lender term sheet |
| `assumptions.json` — `emissionFactorKgPerKWh` | 0.82 kg CO₂/kWh | SRS-derived factor may be outdated or method-dependent; check latest CEA database and select appropriate factor/units | CEA CDM CO₂ Baseline Database, latest published version: https://cea.nic.in/cdm-co2-baseline-database/?lang=en |
| `assumptions.json` — `standardInverterSizesKW` | 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 50, 100 kW | Generic size choices, not a market/product guarantee; validate installed AC/DC design and selected inverter model | Selected inverter manufacturer's datasheet, relevant BIS standards and MNRE/CEA requirements. BIS standards portal: https://standards.bis.gov.in/ |
| `assumptions.json` — `depthOfDischarge.lithium` / `leadAcid` | 0.8 / 0.5 | Battery-chemistry defaults; actual usable DoD varies by product and warranty | Selected battery manufacturer datasheet/warranty and installer design |
| `assumptions.json` — `shadowLossFactors` | none 0, low .05, medium .10, high .20 | Qualitative buckets; no site-specific shading study. Must be labelled rough | Site survey/shading analysis, ideally solar path/shading study; update from measured design |
| `assumptions.json` — `directionFactors` | south 1, SW/SE .96, east/west .92, north .85 | Generic multipliers; output varies with latitude, tilt, azimuth and weather | Location-specific yield modelling or a documented engineering model using NIWE resource data: https://niwe.res.in/department/department_wra/ |
| `assumptions.json` — `roofAreaSqFtPerKW` | 100 sq ft/kW | Rule of thumb; usable roof depends on panel dimensions, setbacks, obstructions and access | Selected module dimensions/layout, local building/fire rules and installer site survey |
| `assumptions.json` — `panelDegradationSource` | SRS Section 6.9 | SRS is not an independent technical source | Manufacturer's product warranty/datasheet and published technical basis |
| Battery/inverter system recommendations | Generic formula and size defaults | No site engineering or equipment selection; do not call an output a certified design | Licensed installer/engineer design, manufacturer data sheets and applicable BIS/CEA rules |

## Verification log template

For every updated value, record:

- JSON file and key
- Old and new value (including unit)
- Official URL/document title and version/order date
- Date checked (`YYYY-MM-DD`)
- State/DISCOM/category/eligibility assumptions
- Person who checked it
- Tests updated and run
