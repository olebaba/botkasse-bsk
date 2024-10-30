"use client";

import React, {useState} from "react";
import type {ActionResult} from "@/lib/auth.ts";

type SignupFormProps = {
    signupAction: (formData: FormData) => Promise<ActionResult>;
};

export default function SignupForm({signupAction}: SignupFormProps) {
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null); // Clear previous errors

        const formData = new FormData(event.currentTarget);

        try {
            const result = await signupAction(formData);
            if (result.error) {
                setError(result.error)
            } else {
                console.log("Signup successful:", result);
            }
        } catch (error) {
            setError("Registrering feilet, vennligst prøv igjen senere.");
            console.error("Signup failed:", error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="text-red-500 text-center mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="draktnummer" className="block text-sm font-medium text-gray-700 mb-2">
                    Draktnummer
                </label>
                <input
                    name="draktnummer"
                    id="draktnummer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Skriv inn draktnummer"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="brukernavn" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobilnummer
                </label>
                <input
                    name="brukernavn"
                    id="brukernavn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Skriv inn mobilnummer"
                />
            </div>
            <div className="mb-6">
                <label htmlFor="passord" className="block text-sm font-medium text-gray-700 mb-2">
                    Passord
                </label>
                <input
                    type="password"
                    name="passord"
                    id="passord"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Skriv inn passord"
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
                Registrer
            </button>
        </form>
    );
}
