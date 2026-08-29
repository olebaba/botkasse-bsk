import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth/validateRequest.ts'
import { BoterSide } from '@/app/boter/boter-side.tsx'

export default async function Page() {
    const { user } = await validateRequest()
    if (!user) {
        return redirect('/login')
    }

    return <BoterSide />
}
