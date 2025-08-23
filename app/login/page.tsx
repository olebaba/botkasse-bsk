import Link from 'next/link'
import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth/validateRequest.ts'
import { login } from '@/lib/auth/login.ts'

export default async function Page() {
    const { user } = await validateRequest()
    if (user) {
        return redirect('/minside')
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Logg inn</h1>
                <form action={login}>
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
                        Logg inn
                    </button>
                </form>
                <div className="text-blue-600 mt-8">
                    <Link className="text-blue-600 mt-8" href="/signup">
                        Registrere deg? Trykk her
                    </Link>
                </div>
            </div>
        </div>
    )
}
