
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  listLeads,
  updateLead,
} from "../services/leads.js";
import {
  LEAD_STATUSES,
  allowedStatusTransitions,
  transitionLeadStatus,
} from "../utils/leadStatus.js";
import { filterAndSortLeads } from "../utils/adminFilters.js";
import { calculateRevenueEstimate } from "../engine/revenue.js";
import { formatLeadsCsv } from "../utils/leadsCsv.js";

const money = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const statusStyles = {
  New: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Installed: "bg-green-100 text-green-800 ring-green-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  Lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
        statusStyles[status] || "bg-slate-100 text-slate-700 ring-slate-500/20"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MetricCard({ icon, label, value, description, color }) {
  const iconColors = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
            iconColors[color] || iconColors.emerald
          }`}
          aria-hidden="true"
        >
          {icon}
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

function FilterField({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const fieldClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export default function AdminLeads() {
  const [params, setParams] = useSearchParams();
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 8;

  const filters = {
    search: params.get("search") || "",
    state: params.get("state") || "",
    status: params.get("status") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
    sort: params.get("sort") || "updatedAt",
    dir: params.get("dir") || "desc",
  };

  useEffect(() => {
    let active = true;

    listLeads()
      .then((data) => {
        if (active) {
          setLeads(data);
          setError("");
        }
      })
      .catch(() => {
        if (active) {
          setError("Could not load leads. Please check the data source.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const states = useMemo(
    () =>
      [...new Set(leads.map((lead) => lead.state).filter(Boolean))].sort(),
    [leads]
  );

  const filtered = useMemo(
    () => filterAndSortLeads(leads, filters),
    [leads, params]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  const visible = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [params]);

  function setFilter(key, value) {
    const next = new URLSearchParams(params);

    if (value) next.set(key, value);
    else next.delete(key);

    setParams(next, { replace: true });
  }

  async function changeStatus(lead, to) {
    if (to === lead.status) return;

    try {
      const next = transitionLeadStatus(lead, to);
      const saved = await updateLead(lead.id, next);

      setLeads((rows) =>
        rows.map((item) => (item.id === lead.id ? saved : item))
      );

      setStatusMsg(
        `${lead.name || lead.clientId} status changed to ${to}.`
      );
      setError("");
    } catch (e) {
      setError(e.message || "Could not update status.");
      setStatusMsg("");
    }
  }

  function exportCsv() {
    const csv = formatLeadsCsv(filtered);
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "solar-leads-filtered.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setStatusMsg(`Exported ${filtered.length} filtered leads to CSV.`);
    setError("");
  }

  const approvedCount = leads.filter(
    (lead) => ["Approved", "Installed"].includes(lead.status)
  ).length;

  return (
    <section className="min-w-0 space-y-8 text-slate-900">
      {/* Header */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span aria-hidden="true">◈</span>
            ADMINISTRATION / LEAD MANAGEMENT
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Solar Leads
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Track potential customers, manage your sales pipeline and
            export filtered lead records.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={loading || filtered.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">↓</span>
          Export CSV
        </button>
      </header>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          icon="♙"
          label="Filtered leads"
          value={filtered.length}
          description="Records matching your current filters"
          color="blue"
        />

        <MetricCard
          icon="₹"
          label="Approved / Installed"
          value={approvedCount}
          description="Leads currently approved or installed"
          color="emerald"
        />

        <MetricCard
          icon="↗"
          label="Estimated net cost"
          value={money(calculateRevenueEstimate(leads))}
          description="Estimate for approved and installed leads"
          color="violet"
        />
      </div>

      {/* Pipeline */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              Lead Pipeline
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Distribution of all available leads by status
            </p>
          </div>

          <span className="text-sm font-semibold text-slate-500">
            {leads.length} total records
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {LEAD_STATUSES.map((status) => {
            const count = leads.filter(
              (lead) => lead.status === status
            ).length;

            return (
              <button
                type="button"
                key={status}
                onClick={() =>
                  setFilter(
                    "status",
                    filters.status === status ? "" : status
                  )
                }
                aria-pressed={filters.status === status}
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  filters.status === status
                    ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 bg-white"
                }`}
              >
                <StatusBadge status={status} />
                <p className="mt-4 text-2xl font-extrabold text-slate-950">
                  {count}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {count === 1 ? "lead" : "leads"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-extrabold text-slate-950">
            Search & Filters
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Narrow the list by customer, location, status or date.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:p-6">
          <FilterField label="Search">
            <input
              aria-label="Search name or city"
              className={fieldClass}
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Name, city or client ID"
            />
          </FilterField>

          <FilterField label="State">
            <select
              aria-label="Filter state"
              className={fieldClass}
              value={filters.state}
              onChange={(e) => setFilter("state", e.target.value)}
            >
              <option value="">All states</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status">
            <select
              aria-label="Filter status"
              className={fieldClass}
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Sort by">
            <select
              aria-label="Sort by"
              className={fieldClass}
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
            >
              <option value="updatedAt">Recently updated</option>
              <option value="name">Name</option>
              <option value="state">State</option>
              <option value="status">Status</option>
              <option value="createdAt">Created date</option>
            </select>
          </FilterField>

          <FilterField label="Created from">
            <input
              aria-label="Created from"
              type="date"
              className={fieldClass}
              value={filters.from}
              onChange={(e) => setFilter("from", e.target.value)}
            />
          </FilterField>

          <FilterField label="Created to">
            <input
              aria-label="Created to"
              type="date"
              className={fieldClass}
              value={filters.to}
              onChange={(e) => setFilter("to", e.target.value)}
            />
          </FilterField>

          <FilterField label="Order">
            <select
              aria-label="Sort order"
              className={fieldClass}
              value={filters.dir}
              onChange={(e) => setFilter("dir", e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </FilterField>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </section>

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

      {/* Desktop table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              All Leads
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} matching records
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            Page {page} of {pageCount}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">
              Loading solar leads...
            </p>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              ♙
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No leads found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or clearing the filters.
            </p>
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Wide screens */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Customer</th>
                    <th className="px-4 py-4 font-bold">Location</th>
                    <th className="px-4 py-4 font-bold">System</th>
                    <th className="px-4 py-4 font-bold">Net cost</th>
                    <th className="px-4 py-4 font-bold">Status</th>
                    <th className="px-4 py-4 font-bold">Updated</th>
                    <th className="px-6 py-4 text-right font-bold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visible.map((lead) => (
                    <tr
                      key={lead.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/leads/${encodeURIComponent(lead.id)}`}
                          className="font-bold text-slate-900 hover:text-emerald-700"
                        >
                          {lead.name || lead.clientId}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.clientId}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">
                          {lead.city || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.state || "State not supplied"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">
                        {lead.results?.systemKW ?? lead.systemKW ?? "—"} kW
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900">
                        {money(lead.results?.netCost ?? lead.netCost)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {lead.updatedAt
                          ? new Date(lead.updatedAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/leads/${encodeURIComponent(lead.id)}`}
                          aria-label={`View ${lead.name || lead.clientId}`}
                          className="inline-flex rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          View →
                        </Link>

                        <label className="mt-2 block">
                          <span className="sr-only">
                            Change status for {lead.name || lead.clientId}
                          </span>
                          <select
                            aria-label={`Change status for ${lead.name || lead.clientId}`}
                            className="max-w-40 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-emerald-500"
                            value={lead.status}
                            onChange={(e) =>
                              changeStatus(lead, e.target.value)
                            }
                          >
                            <option value={lead.status}>{lead.status}</option>
                            {allowedStatusTransitions(lead.status).map(
                              (status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              )
                            )}
                          </select>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden sm:p-6">
              {visible.map((lead) => (
                <article
                  key={`card-${lead.id}`}
                  className="min-w-0 rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/admin/leads/${encodeURIComponent(lead.id)}`}
                        className="break-words font-bold text-slate-950 hover:text-emerald-700"
                      >
                        {lead.name || lead.clientId}
                      </Link>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {lead.clientId}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {[lead.city, lead.state].filter(Boolean).join(", ") ||
                          "Not supplied"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">System size</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {lead.results?.systemKW ?? lead.systemKW ?? "—"} kW
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">
                        Estimated net cost
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-slate-950">
                        {money(lead.results?.netCost ?? lead.netCost)}
                      </p>
                    </div>
                  </div>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-bold text-slate-500">
                      Update lead status
                    </span>
                    <select
                      aria-label={`Mobile status for ${lead.name || lead.clientId}`}
                      className={fieldClass}
                      value={lead.status}
                      onChange={(e) => changeStatus(lead, e.target.value)}
                    >
                      <option value={lead.status}>{lead.status}</option>
                      {allowedStatusTransitions(lead.status).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Link
                    to={`/admin/leads/${encodeURIComponent(lead.id)}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    View lead details →
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <p className="text-sm text-slate-500">
            {filtered.length === 0
              ? "No records to display"
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  filtered.length
                )} of ${filtered.length}`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
        <span className="text-xl" aria-hidden="true">🔒</span>
        <div>
          <h3 className="text-sm font-bold text-blue-950">
            Lead data & privacy
          </h3>
          <p className="mt-1 text-xs leading-6 text-blue-900/80">
            Contact details should only be retained for appropriate,
            consented follow-up. Use the lead detail page's delete
            action to remove records when required. Ensure production
            access controls protect this dashboard and its data.
          </p>
        </div>
      </div>
    </section>
  );
}
