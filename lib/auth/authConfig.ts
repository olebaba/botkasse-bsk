import { Lucia } from 'lucia'
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql'
import { sql } from '@vercel/postgres'

export type VercelPostgresError = {
    code: string
    detail: string
    schema?: string
    table?: string
    column?: string
    dataType?: string
    constraint?: 'auth_user_username_key'
}

const adapter = new NodePostgresAdapter(sql, {
    user: 'brukere',
    session: 'user_session',
})

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production',
        },
    },
    getUserAttributes: (attributes) => {
        return {
            brukernavn: attributes.brukernavn,
            type: attributes.type,
        }
    },
})

declare module 'lucia' {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: DatabaseUserAttributes
    }

    interface DatabaseUserAttributes {
        brukernavn: string
        type: 'admin' | 'bruker' | 'gjest'
    }
}

export interface ActionResult {
    error: string
}

export interface Bruker {
    id: string
    brukernavn: string
    passord?: string
    type: 'admin' | 'bruker' | 'gjest'
}
