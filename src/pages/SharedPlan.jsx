
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sun,
  ArrowLeft,
  ArrowRight,
  PanelsTopLeft,
  Zap,
  ChartNoAxesCombined,
  Wallet,
  PiggyBank,
  ShieldCheck,
  AlertTriangle,
  LockKeyhole,
  Info,
} from "lucide-react";

import useSolarPlan from "../hooks/useSolarPlan.js";
import { decodePlanInputs } from "../utils/shareLink.js";
import {
  formatINR,
  formatKWh,
  formatKW,
} from "../utils/formatters.js";

function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
          <Icon size={22} />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </article>
  );
}

export default function SharedPlan() {
  const location = useLocation();

  const decodedResult = useMemo(() => {
    const raw = new URLSearchParams(location.hash.slice(1)).get("plan");

    if (!raw) {
      return {
        error:
          "This shared plan link is missing its plan data. Ask the sender to create a new link.",
      };
    }

    try {
      return { state: decodePlanInputs(raw) };
    } catch (error) {
      return {
        error:
          error?.message ||
          "The shared plan data could not be decoded. Ask the sender for a new link.",
      };
    }
  }, [location.hash]);

  if (decodedResult.error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={30} />
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Shared link error
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Unable to open shared plan
          </h1>

          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800"
          >
            {decodedResult.error}
          </p>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            The link may be incomplete or the plan data may be invalid.
            You can start a new plan below.
          </p>

          <Link
            to="/planner"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            Open solar planner
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    );
  }

  return <SharedPlanDetails state={decodedResult.state} />;
}

function SharedPlanDetails({ state }) {
  const plan = useSolarPlan(state);

  return (
    <main className="min-h-screen bg-slate-50 pb-14">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-emerald-300"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                <LockKeyhole size={14} />
                Read-only shared plan
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Shared solar plan
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Explore the estimated system size, solar generation,
                installation cost and potential savings from this shared plan.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                <Sun size={26} />
              </div>
              <div>
                <p className="font-semibold">SolarPlan</p>
                <p className="text-xs text-slate-400">
                  AI Solar Installation Planner
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-300" />
              No customer contact details in the link
            </span>

            <span className="hidden text-slate-600 sm:inline">•</span>

            <span className="inline-flex items-center gap-2">
              <Info size={16} className="text-emerald-300" />
              Estimates are not a final quotation
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* Summary heading */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Plan overview
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your solar at a glance
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            These values are recalculated from the inputs contained in the
            shared link.
          </p>
        </div>

        {/* Summary cards */}
        <section
          aria-label="Shared solar plan summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <SummaryCard
            icon={Zap}
            label="Recommended system size"
            value={formatKW(plan.systemKW)}
            description="Estimated solar capacity"
          />

          <SummaryCard
            icon={PanelsTopLeft}
            label="Solar panels"
            value={plan.panelCount}
            description="Estimated panel quantity"
          />

          <SummaryCard
            icon={ChartNoAxesCombined}
            label="Annual generation"
            value={formatKWh(plan.annualGenerationKWh)}
            description="Estimated electricity generated per year"
          />

          <SummaryCard
            icon={Wallet}
            label="Estimated net cost"
            value={formatINR(plan.netCost)}
            description="Estimated cost after applicable assumed subsidy"
          />

          <SummaryCard
            icon={PiggyBank}
            label="Monthly savings"
            value={formatINR(plan.monthlySavings)}
            description="Potential monthly electricity bill savings"
          />
        </section>

        {/* Disclaimer */}
        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Info size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-amber-950">
                Please verify before making a decision
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-900/80">
                This shared plan is a planning estimate, not a confirmed
                quotation or subsidy approval. Verify current subsidy
                eligibility, tariffs and installation costs with the relevant
                DISCOM and installer. Final system sizing requires a
                professional site survey.
              </p>
            </div>
          </div>
        </aside>

        {/* CTA */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-bold sm:text-2xl">
                Ready to plan your own solar system?
              </h2>

              <p className="mt-2 text-sm leading-6 text-emerald-50">
                Enter your own details to generate a personalised solar
                installation estimate.
              </p>
            </div>

            <Link
              to="/planner"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Create your plan
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-500">
            SolarPlan · AI Solar Installation Planner
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Shared estimates are informational and should be independently
            verified.
          </p>
        </footer>
      </div>
    </main>
  );
}

export function SharedPlanRoute() {
  return <SharedPlan />;
}
