
import React from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { Link } from "react-router-dom";

const features = [
  {
    icon: "☀️",
    title: "Solar Capacity",
    description:
      "Estimate the rooftop solar capacity suitable for your electricity consumption.",
  },
  {
    icon: "💰",
    title: "Subsidy Estimate",
    description:
      "Explore indicative subsidy benefits and understand potential installation costs.",
  },
  {
    icon: "⚡",
    title: "Energy Savings",
    description:
      "Understand estimated solar generation and its potential impact on your electricity bill.",
  },
  {
    icon: "📊",
    title: "Smart Planning",
    description:
      "Create a solar proposal based on your requirements and planning assumptions.",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter Your Details",
    description:
      "Add your monthly electricity usage, location and rooftop information.",
  },
  {
    number: "02",
    title: "Generate Your Plan",
    description:
      "Explore estimated capacity, installation costs, energy production and subsidy.",
  },
  {
    number: "03",
    title: "Review Your Proposal",
    description:
      "Review, download or share your solar planning proposal.",
  },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="overflow-hidden bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-lime-50"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
          {/* Hero content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
              <span className="text-lg">☀️</span>
              AI-POWERED SOLAR PLANNING
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {t("homeTitle")}
              <span className="mt-2 block bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent">
                Smarter Solar. Brighter Future.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              {t("homeSubtitle")}
            </p>

            <p className="mt-5 max-w-xl rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <strong>Important:</strong> Eligibility, subsidy and
              installation costs are estimates. Final outcomes depend
              on current official scheme rules, vendor quotations
              and a site survey.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/planner"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 px-7 py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-1 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
              >
                {t("startPlanner")}
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span>✓ Easy to use</span>
              <span>✓ Cost estimation</span>
              <span>✓ Shareable proposal</span>
            </div>
          </div>

          {/* Solar preview card */}
          <div className="relative mx-auto w-full max-w-lg">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-200/60 to-lime-200/60 blur-2xl"
            />

            <div className="relative rounded-3xl border border-white bg-white p-6 shadow-2xl shadow-emerald-900/10 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                  ☀️
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  SAMPLE PLAN
                </span>
              </div>

              <p className="mt-7 text-sm font-semibold text-slate-500">
                Illustrative solar system capacity
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-6xl font-extrabold tracking-tight text-slate-950">
                  3.0
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  kW
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Rooftop solar planning example
              </p>

              <div className="my-7 h-px bg-slate-100" />

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      ⚡
                    </span>
                    <span className="text-sm text-slate-600">
                      Monthly consumption
                    </span>
                  </div>
                  <strong className="text-sm text-slate-900">
                    300 units
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                      🌤️
                    </span>
                    <span className="text-sm text-slate-600">
                      Peak sun hours
                    </span>
                  </div>
                  <strong className="text-sm text-slate-900">
                    4.5 hours
                  </strong>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      📈
                    </span>
                    <span className="text-sm text-slate-600">
                      Performance ratio
                    </span>
                  </div>
                  <strong className="text-sm text-slate-900">
                    0.78
                  </strong>
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Solar planning preview</span>
                  <span>Illustrative</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" />
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Sample values only. Actual energy generation depends
                  on location, weather, shading and system design.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-xl sm:block">
              <p className="text-xs font-medium text-slate-500">
                Plan your rooftop solar
              </p>
              <p className="mt-1 font-bold text-emerald-700">
                Make an informed decision
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              PLANNING TOOLS
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Everything You Need to Plan Solar
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Explore the key factors involved in rooftop solar
              planning with one simple application.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl transition group-hover:bg-emerald-100">
                  {feature.icon}
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
              SIMPLE PROCESS
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Three Steps to Your Solar Plan
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Start with your electricity details and finish with
              an informative solar planning proposal.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:border-emerald-400/50 hover:bg-white/10"
              >
                <span className="text-4xl font-extrabold text-emerald-400">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/planner"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-500 px-8 py-4 font-bold text-white transition hover:bg-emerald-400 hover:text-slate-950"
            >
              Create Your Solar Plan
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SUBSIDY INFORMATION */}
      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 p-7 sm:p-10 md:flex-row md:items-center lg:p-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">
              SOLAR SUBSIDY INFORMATION
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Explore Your Potential Solar Benefits
            </h2>

            <p className="mt-5 leading-8 text-slate-700">
              Estimate potential installation costs and subsidy
              benefits before moving ahead with your rooftop solar
              project.
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Subsidy figures are estimates, not an approval or
              guarantee of payment. Verify current scheme rules
              through the official portal.
            </p>
          </div>

          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white text-5xl font-extrabold text-emerald-700 shadow-lg shadow-emerald-900/5 sm:h-32 sm:w-32 sm:text-6xl">
            ₹
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-14 text-center text-white shadow-xl shadow-emerald-900/15 sm:px-12 sm:py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">
            YOUR SOLAR JOURNEY STARTS HERE
          </p>

          <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Ready to Explore Rooftop Solar?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-emerald-50">
            Enter your requirements, explore your estimated solar
            options and prepare for your next step toward clean energy.
          </p>

          <Link
            to="/planner"
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 font-bold text-emerald-800 shadow-lg transition hover:-translate-y-1 hover:bg-emerald-50"
          >
            {t("startPlanner")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
