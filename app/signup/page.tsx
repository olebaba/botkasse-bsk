import Link from 'next/link'
import SignupForm from '@/app/signup/signup-form.tsx'
import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth/validateRequest.ts'
import { signup } from '@/lib/auth/signup.ts'

export default async function Page() {
    const { user } = await validateRequest()
    if (user && user.type !== 'gjest') {
        return redirect('/minside')
    }
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-6 text-center">Registrer ny bruker</h1>
                <SignupForm signupAction={signup} />
                <div className="text-blue-600 mt-8">
                    <Link href={'/login'}>Vil du logge inn? Trykk her</Link>
                </div>
            </div>
        </div>
    )
}
