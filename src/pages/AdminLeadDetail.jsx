
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  addLeadNote,
  deleteLead,
  getLead,
  updateLead,
} from "../services/leads.js";

import {
  allowedStatusTransitions,
  transitionLeadStatus,
} from "../utils/leadStatus.js";

import DeleteLeadDialog from "../components/DeleteLeadDialog.jsx";
import { downloadProposalPdf } from "../services/proposalPdf.js";
import { buildProposalData } from "../utils/proposalData.js";
import {
  sendProposalEmail,
  emailEnabled,
} from "../services/email.js";

const money = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const statusColors = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Installed: "bg-green-100 text-green-800 ring-green-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Lost: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ring-1 ring-inset ${
        statusColors[status] ||
        "bg-slate-100 text-slate-700 ring-slate-500/20"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function DetailItem({ label, value, highlight = false }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`break-words text-sm ${
          highlight
            ? "font-extrabold text-emerald-700"
            : "font-semibold text-slate-800"
        }`}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function getPlan(lead) {
  const r = lead.results || {};

  return {
    ...r,
    systemKW: r.systemKW ?? lead.systemKW ?? 0,
    panelCount: r.panelCount ?? 0,
    annualGenerationKWh: r.annualGenerationKWh ?? 0,
    monthlyGenerationKWh: r.monthlyGenerationKWh ?? 0,
    centralSubsidy: r.centralSubsidy ?? 0,
    stateSubsidy: r.stateSubsidy ?? 0,
    totalSubsidy:
      r.totalSubsidy ??
      Number(r.centralSubsidy || 0) + Number(r.stateSubsidy || 0),
    totalCost: r.totalCost ?? r.netCost ?? lead.netCost ?? 0,
    netCost: r.netCost ?? lead.netCost ?? 0,
    monthlySavings: r.monthlySavings ?? 0,
    paybackYears: r.paybackYears ?? null,
    assumptions: r.assumptions || {
      psh: 4,
      performanceRatio: 0.78,
      panelWatt: 500,
      costPerKW: 60000,
      tariff: 7,
      exportRate: 3,
      degradationRate: 0.005,
      tariffEscalationRate: 0.03,
      roofAreaSqFtPerKW: 100,
      annualLoanRate: 9,
      loanTenureMonths: 120,
    },
    rows: Array.isArray(r.rows) ? r.rows : [],
    roofAreaSqFt: lead.inputs?.roofAreaSqFt ?? 0,
    subsidyScheme: r.subsidyScheme || "Central subsidy",
    subsidySource: r.subsidySource || "Not supplied",
    lastVerified: r.lastVerified || null,
    stateSubsidyScheme: r.stateSubsidyScheme || "State subsidy",
    stateSubsidySource: r.stateSubsidySource || "Not supplied",
    stateLastVerified: r.stateLastVerified || null,
  };
}

function JsonDetails({ title, data }) {
  return (
    <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:text-emerald-700">
        <span>{title}</span>
        <span
          aria-hidden="true"
          className="transition group-open:rotate-180"
        >
          ↓
        </span>
      </summary>

      <pre className="max-h-96 overflow-auto border-t border-slate-200 p-4 text-xs leading-6 text-slate-700">
        {JSON.stringify(data || {}, null, 2)}
      </pre>
    </details>
  );
}

export default function AdminLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setLead(null);

    getLead(decodeURIComponent(id))
      .then((value) => {
        if (!active) return;

        if (!value) {
          setError("This lead could not be found.");
          return;
        }

        setLead(value);
        setAssignedTo(value.assignedTo || "");
      })
      .catch(() => {
        if (active) setError("Could not load this lead.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const plan = useMemo(() => (lead ? getPlan(lead) : null), [lead]);

  async function changeStatus(to) {
    if (!lead || to === lead.status) return;

    try {
      const next = transitionLeadStatus(lead, to);
      const saved = await updateLead(lead.id, next);

      setLead(saved);
      setStatusMsg(`Status updated to ${to}.`);
      setError("");
    } catch (e) {
      setError(e.message || "Could not update status.");
      setStatusMsg("");
    }
  }

  async function saveAssignee(e) {
    e.preventDefault();

    try {
      const saved = await updateLead(lead.id, {
        assignedTo: assignedTo.trim() || "Unassigned",
      });

      setLead(saved);
      setStatusMsg("Assignment saved successfully.");
      setError("");
    } catch (e) {
      setError(e.message || "Could not save assignment.");
      setStatusMsg("");
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      const saved = await addLeadNote(lead.id, note.trim(), "Admin");

      setLead(saved);
      setNote("");
      setStatusMsg("Note added successfully.");
      setError("");
    } catch (e) {
      setError(e.message || "Could not add note.");
      setStatusMsg("");
    }
  }

  async function confirmDelete() {
    setBusy(true);

    try {
      await deleteLead(lead.id);
      navigate("/admin/leads", { replace: true });
    } catch (e) {
      setError(e.message || "Could not delete lead.");
      setDialog(false);
    } finally {
      setBusy(false);
    }
  }

  function downloadPdf() {
    try {
      downloadProposalPdf({
        proposalId: lead.proposalId || lead.id,
        date: new Date(),
        customer: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          city: lead.city,
          state: lead.state,
        },
        plan,
      });

      setStatusMsg("Proposal PDF generated successfully.");
      setError("");
    } catch (e) {
      setError(`Could not generate proposal: ${e.message}`);
      setStatusMsg("");
    }
  }

  async function resendProposal() {
    setEmailBusy(true);
    setError("");
    setStatusMsg("");

    try {
      const proposal = buildProposalData({
        proposalId: lead.proposalId || lead.id,
        customer: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          city: lead.city,
          state: lead.state,
        },
        plan,
      });

      const result = await sendProposalEmail({
        customer: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          consent: lead.consentGiven === true,
        },
        proposal,
        shareUrl: `${window.location.origin}/results`,
      });

      if (result.sent) {
        setStatusMsg(`Proposal summary sent to ${lead.email}.`);
      } else if (result.mailto) {
        setStatusMsg(
          "Email service unavailable or rate limited. Opening a prefilled email draft."
        );
        window.location.href = result.mailto;
      } else {
        setError(
          result.rateLimited
            ? "Email cooldown active. Please wait before sending again."
            : "Email could not be sent. Check consent and contact details."
        );
      }
    } catch (e) {
      setError(e.message || "Could not resend proposal.");
    } finally {
      setEmailBusy(false);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-72 flex-col items-center justify-center text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading lead details...
        </p>
      </section>
    );
  }

  if (!lead) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
          ?
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
          Lead not available
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {error || "The requested lead could not be found."}
        </p>

        <Link
          to="/admin/leads"
          className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          ← Back to leads
        </Link>
      </section>
    );
  }

  return (
    <section className="min-w-0 space-y-6 text-slate-900">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/admin/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
        >
          <span aria-hidden="true">←</span>
          Back to all leads
        </Link>
      </nav>

      {/* Customer header */}
      <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400" />

        <div className="flex flex-col justify-between gap-6 p-5 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-extrabold text-emerald-700 sm:h-16 sm:w-16">
              {(lead.name || lead.clientId || "L")
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="break-all text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">
                LEAD / {lead.clientId || lead.id}
              </p>

              <h1 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                {lead.name || "Unnamed lead"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                <span aria-hidden="true">⌖ </span>
                {[lead.city, lead.state].filter(Boolean).join(", ") ||
                  "Location not supplied"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={lead.status} />
            <button
              type="button"
              onClick={downloadPdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <span aria-hidden="true">↓</span>
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
          <div className="bg-white px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              System capacity
            </p>
            <p className="mt-2 text-xl font-extrabold text-slate-950">
              {plan.systemKW} kW
            </p>
          </div>

          <div className="bg-white px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Estimated net cost
            </p>
            <p className="mt-2 text-xl font-extrabold text-emerald-700">
              {money(plan.netCost)}
            </p>
          </div>

          <div className="bg-white px-5 py-4 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Monthly savings
            </p>
            <p className="mt-2 text-xl font-extrabold text-slate-950">
              {money(plan.monthlySavings)}
            </p>
          </div>
        </div>
      </header>

      {/* Feedback */}
      {(statusMsg || error) && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || statusMsg}
        </div>
      )}

      {/* Main columns */}
      <div className="grid items-start gap-6 xl:grid-cols-2">
        {/* Contact & assignment */}
        <Panel
          title="Contact & Assignment"
          subtitle="Customer information and lead ownership"
        >
          <dl className="grid gap-x-6 sm:grid-cols-2">
            <DetailItem label="Email" value={lead.email || "Not supplied"} />
            <DetailItem label="Phone" value={lead.phone || "Not supplied"} />
            <DetailItem
              label="Consent recorded"
              value={lead.consentGiven ? "Yes" : "No"}
            />
            <DetailItem
              label="Assigned to"
              value={lead.assignedTo || "Unassigned"}
            />
            <DetailItem
              label="Created"
              value={
                lead.createdAt
                  ? new Date(lead.createdAt).toLocaleString()
                  : "—"
              }
            />
            <DetailItem
              label="Last updated"
              value={
                lead.updatedAt
                  ? new Date(lead.updatedAt).toLocaleString()
                  : "—"
              }
            />
          </dl>

          <form
            onSubmit={saveAssignee}
            className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5"
          >
            <h3 className="font-bold text-slate-900">
              Assign lead owner
            </h3>

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Team member or owner
              <input
                className={inputClass}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                maxLength={100}
                placeholder="Enter assignee name"
              />
            </label>

            <button
              type="submit"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto"
            >
              Save assignment
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="font-bold text-slate-900">Update lead status</h3>

            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Current status
              <select
                aria-label="Lead status"
                className={inputClass}
                value={lead.status}
                onChange={(e) => changeStatus(e.target.value)}
              >
                <option value={lead.status}>{lead.status}</option>
                {allowedStatusTransitions(lead.status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Only the next statuses allowed by your lead pipeline can
              be selected.
            </p>
          </div>

          {emailEnabled() && (
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">✉</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-blue-950">
                    Proposal email
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-blue-900/80">
                    Send a proposal summary to the customer, subject to
                    the recorded consent and configured email service.
                  </p>

                  <button
                    type="button"
                    onClick={resendProposal}
                    disabled={emailBusy || !lead.consentGiven || !lead.email}
                    className="mt-4 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailBusy ? "Sending..." : "Re-send proposal summary"}
                  </button>

                  {!lead.consentGiven && (
                    <p className="mt-2 text-xs text-blue-900">
                      Sending is disabled because consent is not recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Panel>

        {/* Plan summary */}
        <Panel
          title="Solar Plan Summary"
          subtitle="Stored estimates associated with this lead"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-semibold text-emerald-800">
                System size
              </p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-950">
                {plan.systemKW} kW
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-800">
                Solar panels
              </p>
              <p className="mt-2 text-2xl font-extrabold text-blue-950">
                {plan.panelCount}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Annual generation
              </p>
              <p className="mt-2 text-xl font-extrabold text-slate-950">
                {Number(plan.annualGenerationKWh || 0).toLocaleString("en-IN")}{" "}
                <span className="text-sm font-semibold">kWh</span>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Monthly generation
              </p>
              <p className="mt-2 text-xl font-extrabold text-slate-950">
                {Number(plan.monthlyGenerationKWh || 0).toLocaleString("en-IN")}{" "}
                <span className="text-sm font-semibold">kWh</span>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 font-bold text-slate-900">
              Cost & subsidy breakdown
            </h3>

            <dl>
              <DetailItem
                label="Gross cost"
                value={money(plan.totalCost)}
              />
              <DetailItem
                label="Central subsidy"
                value={money(plan.centralSubsidy)}
              />
              <DetailItem
                label="State subsidy"
                value={money(plan.stateSubsidy)}
              />
              <DetailItem
                label="Total subsidy"
                value={money(plan.totalSubsidy)}
              />
              <DetailItem
                label="Estimated net cost"
                value={money(plan.netCost)}
                highlight
              />
              <DetailItem
                label="Monthly savings"
                value={money(plan.monthlySavings)}
              />
              <DetailItem
                label="Payback period"
                value={
                  plan.paybackYears == null
                    ? "Not available"
                    : `${plan.paybackYears} years`
                }
              />
              <DetailItem
                label="Available roof area"
                value={`${plan.roofAreaSqFt} sq. ft.`}
              />
            </dl>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs leading-6 text-amber-900">
              These are stored planning estimates, not a final vendor
              quotation or guaranteed subsidy approval. Verify the
              applicable scheme and site conditions before making
              financial decisions.
            </p>
          </div>

          <JsonDetails title="View stored inputs" data={lead.inputs} />
          <JsonDetails title="View stored results" data={lead.results} />
        </Panel>
      </div>

      {/* Notes */}
      <Panel
        title="Internal Notes"
        subtitle="Record follow-up updates for the team"
        action={
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {(lead.notes || []).length} notes
          </span>
        }
      >
        {(lead.notes || []).length > 0 ? (
          <ol className="space-y-4">
            {lead.notes.map((item, index) => (
              <li
                key={`${item?.at || index}-${index}`}
                className="relative rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-800">
                    ✎
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">
                      {typeof item === "string" ? item : item.text}
                    </p>

                    {typeof item !== "string" && (
                      <p className="mt-3 text-xs text-slate-500">
                        {item.by || "Admin"}
                        {item.at
                          ? ` · ${new Date(item.at).toLocaleString()}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
            <p className="font-semibold text-slate-700">No notes yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Add an internal note to record a follow-up.
            </p>
          </div>
        )}

        <form onSubmit={addNote} className="mt-6">
          <label
            htmlFor="lead-note"
            className="block text-sm font-bold text-slate-800"
          >
            Add a follow-up note
          </label>

          <textarea
            id="lead-note"
            rows={4}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write an internal note about the customer's request or next action..."
            className={`${inputClass} resize-y`}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {note.length}/2000 characters
            </p>

            <button
              type="submit"
              disabled={!note.trim()}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add note
            </button>
          </div>
        </form>
      </Panel>

      {/* Status history */}
      <Panel
        title="Status History"
        subtitle="Recorded transitions in the lead pipeline"
      >
        {(lead.statusHistory || []).length ? (
          <ol className="space-y-5">
            {lead.statusHistory.map((item, index) => (
              <li
                key={`${item.at || index}-${index}`}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                    ✓
                  </span>
                  {index < lead.statusHistory.length - 1 && (
                    <span className="mt-2 min-h-5 w-px flex-1 bg-slate-200" />
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-2">
                  <p className="break-words font-bold text-slate-900">
                    {item.from || "Initial"}{" "}
                    <span className="text-emerald-600">→</span>{" "}
                    {item.to}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.at ? new Date(item.at).toLocaleString() : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No status changes have been recorded yet.
          </p>
        )}
      </Panel>

      {/* Danger zone */}
      <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <div className="border-b border-rose-100 bg-rose-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-xl text-rose-700"
              aria-hidden="true"
            >
              !
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-rose-950">
                Privacy & Deletion
              </h2>
              <p className="mt-1 text-sm text-rose-800/80">
                Destructive action — review before proceeding
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="max-w-4xl text-sm leading-7 text-slate-600">
            This record may contain the customer's contact details,
            consent record, proposal information, plan inputs and results,
            and internal notes. Retain personal information only as
            appropriate for consented follow-up and applicable privacy
            requirements. Deletion removes the record from the current
            data store; confirm how backups and any external copies are
            handled separately.
          </p>

          <button
            type="button"
            onClick={() => setDialog(true)}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-rose-200"
          >
            <span aria-hidden="true">⌫</span>
            Delete this lead
          </button>
        </div>
      </section>

      <DeleteLeadDialog
        open={dialog}
        onCancel={() => setDialog(false)}
        onConfirm={confirmDelete}
        busy={busy}
      />
    </section>
  );
}
