import { validateRequest } from '@/lib/auth/validateRequest.ts'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { lucia } from '@/lib/auth/authConfig.ts'

export async function logout(): Promise<void> {
    'use server'
    const { session } = await validateRequest()
    if (!session) {
        throw {
            error: 'Unauthorized',
        }
    }

    await lucia.invalidateSession(session.id)

    const sessionCookie = lucia.createBlankSessionCookie()
    ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return redirect('/')
}
