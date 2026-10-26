import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { WizardProvider } from "./context/WizardContext.jsx";
import { I18nProvider, useI18n } from "./context/I18nContext.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminShell from "./components/AdminShell.jsx";
import "./styles.css";
const Home = lazy(() => import("./pages/Home.jsx"));
const Planner = lazy(() => import("./pages/Planner.jsx"));
const Results = lazy(() => import("./pages/Results.jsx"));
const SharedPlan = lazy(() =>
	import("./pages/SharedPlan.jsx").then((m) => ({
		default: m.SharedPlanRoute,
	})),
);
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminLeads = lazy(() => import("./pages/AdminLeads.jsx"));
const AdminLeadDetail = lazy(() => import("./pages/AdminLeadDetail.jsx"));
function AppShell() {
	const { language, setLanguage, t } = useI18n();
	return (
		<WizardProvider>
			<BrowserRouter>
				<a className="skip-link" href="#main-content">
					Skip to main content
				</a>
				<header className="site-header">
					<div className="wrap header-inner">
						<Link className="brand" to="/" aria-label="SolarPlan home">
							<span aria-hidden="true">☀</span> SolarPlan
						</Link>
						<nav aria-label="Main navigation">
							<Link to="/">{t("home")}</Link>
							<Link to="/planner">{t("planner")}</Link>
							<Link to="/results">{t("results")}</Link>
						</nav>
						<button
							className="language-toggle"
							type="button"
							aria-label={
								language === "en"
									? "Switch language to Hindi"
									: "Switch language to English"
							}
							onClick={() => setLanguage(language === "en" ? "hi" : "en")}
						>
							{t("language")}
						</button>
					</div>
				</header>
				<div id="main-content" tabIndex="-1">
					<Suspense
						fallback={
							<main className="wrap page" role="status" aria-live="polite">
								Loading page…
							</main>
						}
					>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/planner" element={<Planner />} />
							<Route path="/results" element={<Results />} />
							<Route path="/shared" element={<SharedPlan />} />
							<Route path="/admin" element={<AdminLogin />} />
							<Route element={<AdminRoute />}>
								<Route element={<AdminShell />}>
									<Route path="/admin/leads" element={<AdminLeads />} />
									<Route
										path="/admin/leads/:id"
										element={<AdminLeadDetail />}
									/>
								</Route>
							</Route>
							<Route
								path="*"
								element={
									<main className="wrap page">
										<h1>{t("notFound")}</h1>
										<Link to="/">{t("returnHome")}</Link>
									</main>
								}
							/>
						</Routes>
					</Suspense>
				</div>
				<footer className="site-footer">
					<div className="wrap">SolarPlan · {t("footerDisclaimer")}</div>
				</footer>
			</BrowserRouter>
		</WizardProvider>
	);
}
createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<I18nProvider>
			<AppShell />
		</I18nProvider>
	</React.StrictMode>,
);
