
import React from "react";
import { useI18n } from "../context/I18nContext.jsx";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext.jsx";

import StepEligibility from "../components/StepEligibility.jsx";
import StepLocation from "../components/StepLocation.jsx";
import StepConsumption from "../components/StepConsumption.jsx";
import StepRoof from "../components/StepRoof.jsx";
import StepAssumptions from "../components/StepAssumptions.jsx";

const steps = [
  { title: "Eligibility", key: "eligibility", icon: "✓" },
  { title: "Location", key: "location", icon: "⌖" },
  { title: "Consumption", key: "consumption", icon: "⚡" },
  { title: "Roof", key: "roof", icon: "⌂" },
  { title: "Assumptions", key: "assumptions", icon: "☀" },
];

export default function Planner() {
  const { t } = useI18n();
  const { state, dispatch } = useWizard();
  const navigate = useNavigate();

  const currentStep = Math.min(
    Math.max(Number(state.step) || 0, 0),
    steps.length - 1
  );

  const next = () => {
    if (currentStep < steps.length - 1) {
      dispatch({ type: "STEP", step: currentStep + 1 });
    }
  };

  const back = () => {
    if (currentStep > 0) {
      dispatch({ type: "STEP", step: currentStep - 1 });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-0 top-0 -z-0 h-80 w-full bg-gradient-to-b from-emerald-50 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Page heading */}
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800 shadow-sm">
            <span aria-hidden="true">☀</span>
            {t("solarPlanner")}
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            {t("plannerTitle")}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Configure your rooftop solar requirements step by step
            to prepare an estimated installation plan.
          </p>
        </header>

        {/* Main planner card */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          {/* Progress header */}
          <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {t("step")} {currentStep + 1} {t("of")} {steps.length}
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {t(steps[currentStep].key)}
                </h2>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                {Math.round(progress)}% complete
              </span>
            </div>

            <div
              className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Planner progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stepper */}
          <nav
            className="border-b border-slate-100 bg-slate-50/70 px-3 py-6 sm:px-8 sm:py-8"
            aria-label="Planner progress"
          >
            <ol className="grid grid-cols-5 gap-1 sm:gap-3">
              {steps.map((step, index) => {
                const isCurrent = index === currentStep;
                const isDone = index < currentStep;

                return (
                  <li key={step.key} className="min-w-0">
                    <div className="flex flex-col items-center text-center">
                      <div
                        aria-current={isCurrent ? "step" : undefined}
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all sm:h-12 sm:w-12 sm:text-base",
                          isCurrent
                            ? "scale-105 border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                            : isDone
                              ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-400",
                        ].join(" ")}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>

                      <span
                        className={[
                          "mt-2 text-[10px] font-semibold leading-tight sm:text-sm",
                          isCurrent
                            ? "text-emerald-800"
                            : isDone
                              ? "text-slate-700"
                              : "text-slate-400",
                        ].join(" ")}
                      >
                        {t(step.key)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Active step form */}
          <div className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
            <div className="mx-auto max-w-3xl">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  STEP {currentStep + 1} OF {steps.length}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {t(steps[currentStep].key)}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete the information below to continue with your
                  solar installation plan.
                </p>
              </div>

              <div className="min-w-0">
                {currentStep === 0 && (
                  <StepEligibility onNext={next} />
                )}

                {currentStep === 1 && (
                  <StepLocation onNext={next} onBack={back} />
                )}

                {currentStep === 2 && (
                  <StepConsumption onNext={next} onBack={back} />
                )}

                {currentStep === 3 && (
                  <StepRoof onNext={next} onBack={back} />
                )}

                {currentStep === 4 && (
                  <StepAssumptions
                    onBack={back}
                    onFinish={() => navigate("/results")}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="max-w-xl text-xs leading-5 text-slate-500">
              Estimates are indicative only. Final system design,
              eligibility and subsidy depend on official rules and
              a site survey.
            </p>

            <span className="shrink-0 text-xs font-semibold text-slate-500">
              Step {currentStep + 1} / {steps.length}
            </span>
          </div>
        </section>

        {/* Trust information */}
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
          <span>✓ Step-by-step planning</span>
          <span>✓ Estimated calculations</span>
          <span>✓ Review before proceeding</span>
        </div>
      </div>
    </main>
  );
}
