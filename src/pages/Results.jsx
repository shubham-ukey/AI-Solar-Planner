
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  ArrowLeft,
  ArrowRight,
  Pencil,
  ChartNoAxesCombined,
  Wallet,
  Zap,
  BatteryCharging,
  Sparkles,
  FileText,
  ShieldCheck,
  Info,
} from "lucide-react";

import { useI18n } from "../context/I18nContext.jsx";
import { useWizard } from "../context/WizardContext.jsx";
import useSolarPlan from "../hooks/useSolarPlan.js";

import SummaryCards from "../components/SummaryCards.jsx";
import SubsidyBreakdown from "../components/SubsidyBreakdown.jsx";
import {
  FinancialChart,
  GenerationChart,
} from "../components/AccessibleCharts.jsx";
import FinancialTable from "../components/FinancialTable.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";
import BatteryCalculator from "../components/BatteryCalculator.jsx";
import AIAdvisor from "../components/AIAdvisor.jsx";
import ProposalShare from "../components/ProposalShare.jsx";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ReportSection({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export default function Results() {
  const { t } = useI18n();
  const { state } = useWizard();
  const navigate = useNavigate();

  const hasPlannerData =
    state.step === 4 ||
    Boolean(
      state.eligibility.residential &&
        state.consumption &&
        (state.consumption.monthlyUnits ||
          state.consumption.billAmount)
    );

  useEffect(() => {
    if (!hasPlannerData) {
      navigate("/planner", {
        replace: true,
        state: {
          notice: "Complete the solar planner to view your results.",
        },
      });
    }
  }, [hasPlannerData, navigate]);

  const plan = useSolarPlan(state);

  if (!hasPlannerData) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-5 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Sun size={28} />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Your solar report is not ready
          </h1>

          <p role="status" className="mt-3 text-sm leading-6 text-slate-500">
            Complete the solar planner first to see your estimated costs,
            generation, subsidy and savings.
          </p>

          <Link
            to="/planner"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue planner
            <ArrowRight size={17} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Report header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <Link
            to="/planner"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-emerald-300"
          >
            <ArrowLeft size={16} />
            Back to planner
          </Link>

          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <Sun size={15} />
                Your solar report
              </div>

              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {t("resultsTitle")}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {t("resultsSubtitle")}
              </p>
            </div>

            <Link
              to="/planner"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <Pencil size={16} />
              {t("editAssumptions")}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              Personalised planning estimate
            </span>

            <span className="hidden text-slate-600 sm:inline">•</span>

            <span className="inline-flex items-center gap-2">
              <ChartNoAxesCombined size={16} className="text-emerald-300" />
              Financial and generation analysis
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* Summary */}
        <section aria-label="Solar plan summary">
          <SectionHeading
            icon={Zap}
            title="Your solar overview"
            description="A quick overview of your estimated solar installation plan."
          />

          <SummaryCards plan={plan} />
        </section>

        {/* Subsidy and financial analysis */}
        <section>
          <SectionHeading
            icon={Wallet}
            title="Subsidy and financial breakdown"
            description="Review the estimated subsidy and understand your projected installation costs."
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
            <ReportSection>
              <SubsidyBreakdown plan={plan} />
            </ReportSection>

            <ReportSection>
              <FinancialChart
                rows={plan.rows}
                netCost={plan.netCost}
              />
            </ReportSection>
          </div>
        </section>

        {/* Generation analysis */}
        <ReportSection>
          <SectionHeading
            icon={ChartNoAxesCombined}
            title="Solar generation and savings"
            description="Explore the estimated generation and financial outcomes over time."
          />

          <GenerationChart
            rows={plan.rows}
            monthlyUnits={plan.monthlyUnits}
          />
        </ReportSection>

        {/* Financial table */}
        <ReportSection>
          <SectionHeading
            icon={FileText}
            title="Year-wise financial projection"
            description="Review the financial figures used in your solar investment estimate."
          />

          <div className="min-w-0 overflow-x-auto">
            <FinancialTable rows={plan.rows} />
          </div>
        </ReportSection>

        {/* Calculators */}
        <section>
          <SectionHeading
            icon={BatteryCharging}
            title="Explore your options"
            description="Estimate possible financing payments and evaluate your backup battery requirements."
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
            <ReportSection>
              <EmiCalculator
                netCost={plan.netCost}
                assumptions={plan.assumptions}
              />
            </ReportSection>

            <ReportSection>
              <BatteryCalculator assumptions={plan.assumptions} />
            </ReportSection>
          </div>
        </section>

        {/* AI advisor */}
        <ReportSection>
          <SectionHeading
            icon={Sparkles}
            title="AI solar advisor"
            description="Get additional guidance based on the solar plan generated for your inputs."
          />

          <AIAdvisor plan={plan} />
        </ReportSection>

        {/* Proposal */}
        <ReportSection>
          <SectionHeading
            icon={FileText}
            title="Your solar proposal"
            description="Prepare and share your proposal using the available sharing options."
          />

          <ProposalShare plan={plan} state={state} />
        </ReportSection>

        {/* Disclaimer */}
        <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Info size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-amber-950">
                Important information
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                This report contains planning estimates, not a confirmed
                installation quotation or subsidy approval. Verify current
                eligibility and subsidy amounts against official scheme
                rules. Final system sizing, roof measurements, installation
                costs and suitability require a professional site survey.
              </p>
            </div>
          </div>
        </aside>

        <footer className="border-t border-slate-200 py-6 text-center">
          <p className="text-xs leading-5 text-slate-500">
            SolarPlan · AI Solar Installation Planner
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Estimates depend on your inputs, assumptions and applicable
            scheme rules.
          </p>
        </footer>
      </div>
    </main>
  );
}
