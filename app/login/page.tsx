import {login} from "@/app/lib/auth.ts";

export default async function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Logg inn</h1>
                <form action={login}>
                    <div className="mb-4">
                        <label htmlFor="brukernavn" className="block text-sm font-medium text-gray-700 mb-2">
                            Brukernavn
                        </label>
                        <input
                            name="brukernavn"
                            id="brukernavn"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Skriv inn brukernavn"
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
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}

