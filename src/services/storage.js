/** Local demo storage adapter placeholder. No personal data is persisted in Phase 1. */
export const storageEnabled = () =>
	import.meta.env.VITE_ENABLE_FIREBASE === "true" &&
	Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
export async function saveProposal() {
	if (!storageEnabled()) return { saved: false, fallback: "in-memory-demo" };
	throw new Error(
		"Firebase/Firestore service will be implemented in a later phase.",
	);
}
