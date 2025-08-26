import { redirect } from 'next/navigation'
import { validateRequest } from '@/lib/auth/validateRequest.ts'
import { logout } from '@/lib/auth/logout.ts'
import { MinSideClient } from './min-side-client.tsx'

const MinSide = async () => {
    const { user } = await validateRequest()
    if (!user) {
        return redirect('/login')
    }

    return <MinSideClient user={user} logoutAction={logout} />
}

export default MinSide
