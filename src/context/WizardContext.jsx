import React, { createContext, useContext, useReducer } from "react";
import assumptionsDefaults from "../config/assumptions.json";
const initialState = {
	step: 0,
	eligibility: {
		residential: "",
		ownerConsent: "",
		validConnection: "",
		alreadySubsidised: "",
		aadhaarBankLinked: "",
	},
	location: {
		state: "",
		city: "",
		discom: "",
		consumerNo: "",
		sanctionedLoadKW: "",
		address: "",
		pincode: "",
		latitude: undefined,
		longitude: undefined,
	},
	consumption: {
		inputMode: "units",
		monthlyUnits: 300,
		billAmount: "",
		tariff: assumptionsDefaults.tariff,
		growthRate: 5,
	},
	roof: {
		roofAreaSqFt: 400,
		direction: "south",
		shadowLevel: "none",
		roofType: "flat concrete",
		tiltDeg: 20,
	},
	assumptions: { ...assumptionsDefaults },
};
function reducer(state, action) {
	switch (action.type) {
		case "PATCH":
			return {
				...state,
				[action.section]: { ...state[action.section], ...action.value },
			};
		case "STEP":
			return { ...state, step: Math.max(0, Math.min(4, action.step)) };
		case "RESET_ASSUMPTIONS":
			return { ...state, assumptions: { ...assumptionsDefaults } };
		default:
			return state;
	}
}
const WizardContext = createContext(null);
export function WizardProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, initialState);
	return (
		<WizardContext.Provider value={{ state, dispatch }}>
			{children}
		</WizardContext.Provider>
	);
}
export function useWizard() {
	const value = useContext(WizardContext);
	if (!value) throw new Error("useWizard must be used inside WizardProvider");
	return value;
}
export { initialState };
