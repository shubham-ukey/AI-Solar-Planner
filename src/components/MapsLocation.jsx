import React, { useEffect, useRef, useState } from "react";
let mapsPromise;
function loadPlaces() {
	if (window.google?.maps?.places) return Promise.resolve(window.google);
	if (mapsPromise) return mapsPromise;
	mapsPromise = new Promise((resolve, reject) => {
		const existing = document.getElementById("solar-google-maps-script");
		const finish = () =>
			window.google?.maps?.places
				? resolve(window.google)
				: reject(new Error("Places library unavailable"));
		if (existing) {
			existing.addEventListener("load", finish, { once: true });
			existing.addEventListener(
				"error",
				() => reject(new Error("Maps failed to load")),
				{ once: true },
			);
			return;
		}
		const script = document.createElement("script");
		script.id = "solar-google-maps-script";
		script.async = true;
		script.defer = true;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)}&libraries=places&loading=async`;
		script.onload = finish;
		script.onerror = () => reject(new Error("Maps failed to load"));
		document.head.appendChild(script);
	});
	return mapsPromise;
}
function component(components, types) {
	return (
		components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ||
		""
	);
}
export default function MapsLocation({ setValue }) {
	const inputRef = useRef(null);
	const [status, setStatus] = useState("Loading address suggestions…");
	useEffect(() => {
		let active = true;
		let autocomplete;
		loadPlaces()
			.then((google) => {
				if (!active || !inputRef.current) return;
				autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
					fields: ["address_components", "geometry", "formatted_address"],
				});
				autocomplete.addListener("place_changed", () => {
					const place = autocomplete.getPlace();
					if (!place.geometry?.location) {
						setStatus(
							"Select a suggested address with a location, or enter the city and state manually.",
						);
						return;
					}
					const parts = place.address_components || [];
					const city = component(parts, [
						"locality",
						"postal_town",
						"administrative_area_level_2",
					]);
					const state = component(parts, ["administrative_area_level_1"]);
					const pincode = component(parts, ["postal_code"]);
					setValue("address", place.formatted_address || "", {
						shouldValidate: true,
					});
					if (city) setValue("city", city, { shouldValidate: true });
					if (state) setValue("state", state, { shouldValidate: true });
					if (pincode) setValue("pincode", pincode, { shouldValidate: true });
					setValue("latitude", place.geometry.location.lat(), {
						shouldValidate: true,
					});
					setValue("longitude", place.geometry.location.lng(), {
						shouldValidate: true,
					});
					setStatus(
						"Address selected. Review the city and state fields before continuing.",
					);
				});
				setStatus("Start typing an address and select a suggestion.");
			})
			.catch(() => {
				if (active)
					setStatus(
						"Address suggestions are unavailable. Continue using manual location entry.",
					);
			});
		return () => {
			active = false;
			if (autocomplete && window.google?.maps?.event)
				window.google.maps.event.clearInstanceListeners(autocomplete);
		};
	}, [setValue]);
	return (
		<div className="field maps-address-field">
			<label htmlFor="maps-address">Search address (optional)</label>
			<input
				ref={inputRef}
				id="maps-address"
				type="text"
				autoComplete="off"
				placeholder="Start typing an address"
				aria-describedby="maps-address-status"
			/>
			<small id="maps-address-status" role="status" aria-live="polite">
				{status}
			</small>
		</div>
	);
}
