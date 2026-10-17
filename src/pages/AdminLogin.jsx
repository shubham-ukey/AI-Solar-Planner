
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sun,
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { z } from "zod";
import {
  loginAdmin,
  adminFirebaseEnabled,
} from "../services/adminAuth.js";

const schema = z.object({
  email: z
    .string()
    .email("Enter a valid admin email.")
    .or(z.literal("")),
  password: z.string().min(1, "Password is required."),
});

export default function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const firebaseEnabled = adminFirebaseEnabled();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function submit(values) {
    setBusy(true);
    setError("");

    try {
      await loginAdmin(values);

      navigate(location.state?.from || "/admin/leads", {
        replace: true,
      });
    } catch (e) {
      setError(
        e.message ||
          "Login failed. Check your credentials and configuration."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left: Branding section */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

          <Link
            to="/"
            className="relative z-10 inline-flex w-fit items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/40">
              <Sun size={27} />
            </span>

            <span>
              <span className="block text-xl font-bold tracking-tight">
                SolarPlan
              </span>
              <span className="text-xs text-slate-400">
                AI Solar Installation Planner
              </span>
            </span>
          </Link>

          <div className="relative z-10 max-w-xl py-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              <ShieldCheck size={16} />
              Administration Portal
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-6xl">
              Manage your solar journey
              <span className="mt-2 block text-emerald-400">
                with confidence.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
              Access customer enquiries, review solar proposals, track lead
              progress and manage your installation pipeline from one place.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <ShieldCheck className="mb-3 text-emerald-400" size={24} />
                <p className="font-semibold">Admin access</p>
                <p className="mt-1 text-sm text-slate-400">
                  Manage your dashboard
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <Sun className="mb-3 text-amber-400" size={24} />
                <p className="font-semibold">Solar planning</p>
                <p className="mt-1 text-sm text-slate-400">
                  Keep projects organised
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-slate-500">
            Clean energy starts with better planning.
          </p>
        </section>

        {/* Right: Login form */}
        <section className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 sm:px-8 lg:bg-slate-900/60">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-10 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400 lg:hidden"
            >
              <ArrowLeft size={17} />
              Back to planner
            </Link>

            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                <Sun size={25} />
              </span>
              <div>
                <p className="text-lg font-bold">SolarPlan</p>
                <p className="text-xs text-slate-400">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                <LockKeyhole size={27} />
              </div>

              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                SolarPlan Admin
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Sign in to access your administration dashboard.
              </p>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-700/80 bg-slate-800/50 p-4">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-emerald-400"
              />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {firebaseEnabled
                    ? "Firebase authentication"
                    : "Demo authentication"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {firebaseEnabled
                    ? "Sign in with your configured Firebase admin account."
                    : "Use the demo password configured in your local environment."}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(submit)}
              noValidate
              className="space-y-5"
            >
              {firebaseEnabled && (
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Admin email
                  </label>

                  <div
                    className={`flex items-center gap-3 rounded-xl border bg-slate-950 px-4 transition focus-within:ring-2 ${
                      errors.email
                        ? "border-red-400/70 focus-within:ring-red-400/20"
                        : "border-slate-700 focus-within:border-emerald-400 focus-within:ring-emerald-400/20"
                    }`}
                  >
                    <Mail size={18} className="shrink-0 text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      placeholder="admin@example.com"
                      {...register("email")}
                      className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {errors.email && (
                    <p
                      role="alert"
                      className="mt-2 flex items-center gap-2 text-xs text-red-400"
                    >
                      <AlertCircle size={14} />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  {firebaseEnabled ? "Password" : "Demo password"}
                </label>

                <div
                  className={`flex items-center gap-3 rounded-xl border bg-slate-950 px-4 transition focus-within:ring-2 ${
                    errors.password
                      ? "border-red-400/70 focus-within:ring-red-400/20"
                      : "border-slate-700 focus-within:border-emerald-400 focus-within:ring-emerald-400/20"
                  }`}
                >
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="shrink-0 text-slate-500 transition hover:text-emerald-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <p
                    role="alert"
                    className="mt-2 flex items-center gap-2 text-xs text-red-400"
                  >
                    <AlertCircle size={14} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" size={19} />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight
                      size={18}
                      className="transition group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {!firebaseEnabled && (
              <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-xs leading-5 text-amber-200/80">
                  <strong className="text-amber-300">Demo mode:</strong>{" "}
                  the demo password check runs in the browser and is not
                  secure authentication. Do not use it to protect production
                  data.
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-slate-800 pt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-emerald-400"
              >
                <ArrowLeft size={15} />
                Return to solar planner
              </Link>

              <p className="mt-5 text-xs text-slate-600">
                SolarPlan · AI Solar Installation Planner
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
