import { Link, Outlet, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/adminAuth.js";
export default function AdminShell() {
	const navigate = useNavigate();
	async function logout() {
		await logoutAdmin();
		navigate("/admin", { replace: true });
	}
	return (
		<main className="wrap page admin-page">
			<div className="admin-top">
				<div>
					<p className="eyebrow">SOLARPLAN · ADMIN</p>
					<h1>Lead management</h1>
				</div>
				<div className="admin-actions">
					<Link className="button button-secondary" to="/admin/leads">
						All leads
					</Link>
					<button className="button button-secondary" onClick={logout}>
						Log out
					</button>
				</div>
			</div>
			<Outlet />
		</main>
	);
}
