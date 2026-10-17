import React from "react";
export default function FieldError({ id, error }) {
	return error ? (
		<p className="field-error" id={id} role="alert">
			{error.message}
		</p>
	) : null;
}
