const KEY = "solar-admin-session-v1";
const SESSION_MS = 30 * 60 * 1000;
const firebaseEnabled = () =>
	import.meta.env.VITE_ENABLE_FIREBASE === "true" &&
	Boolean(
		import.meta.env.VITE_FIREBASE_API_KEY &&
		import.meta.env.VITE_FIREBASE_PROJECT_ID &&
		import.meta.env.VITE_FIREBASE_APP_ID,
	);
export function getAdminSession(
	storage = globalThis.sessionStorage,
	now = Date.now(),
) {
	try {
		const value = JSON.parse(storage?.getItem(KEY) || "null");
		if (value?.expiresAt > now) return value;
		storage?.removeItem(KEY);
	} catch {}
	return null;
}
function saveSession(storage, email, now = Date.now()) {
	const session = { email, expiresAt: now + SESSION_MS };
	try {
		storage?.setItem(KEY, JSON.stringify(session));
	} catch {}
	return session;
}
export async function loginAdmin(
	{ email = "admin@demo.local", password },
	{ storage = globalThis.sessionStorage } = {},
) {
	if (firebaseEnabled()) {
		const { initializeApp, getApps } = await import("firebase/app");
		const { getAuth, signInWithEmailAndPassword } =
			await import("firebase/auth");
		const config = {
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
		};
		const app = getApps().length ? getApps()[0] : initializeApp(config);
		const credential = await signInWithEmailAndPassword(
			getAuth(app),
			email,
			password,
		);
		const token = await credential.user.getIdTokenResult(true);
		if (token.claims.admin !== true) {
			const { signOut } = await import("firebase/auth");
			await signOut(getAuth(app));
			throw new Error("This account is not authorized as an admin.");
		}
		return saveSession(storage, credential.user.email || email);
	}
	const expected = import.meta.env.VITE_ADMIN_DEMO_PASSWORD;
	if (!expected)
		throw new Error(
			"Demo login is not configured. Set VITE_ADMIN_DEMO_PASSWORD in your local .env file.",
		);
	if (String(password || "") !== expected)
		throw new Error("Incorrect password.");
	return saveSession(storage, email || "Demo admin");
}
export async function logoutAdmin({
	storage = globalThis.sessionStorage,
} = {}) {
	if (firebaseEnabled()) {
		try {
			const { initializeApp, getApps } = await import("firebase/app");
			const { getAuth, signOut } = await import("firebase/auth");
			const config = {
				apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
				authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
				appId: import.meta.env.VITE_FIREBASE_APP_ID,
			};
			const app = getApps().length ? getApps()[0] : initializeApp(config);
			await signOut(getAuth(app));
		} catch {}
	}
	try {
		storage?.removeItem(KEY);
	} catch {}
}
export function adminFirebaseEnabled() {
	return firebaseEnabled();
}
