import {Lucia, type Session, type User} from "lucia";
import {NodePostgresAdapter} from "@lucia-auth/adapter-postgresql";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {sql} from "@vercel/postgres";
import {verify} from "@node-rs/argon2";
import { cache } from "react";

type VercelPostgresError = {
    code: string;
    detail: string;
    schema?: string;
    table?: string;
    column?: string;
    dataType?: string;
    constraint?: "auth_user_username_key";
};

const adapter = new NodePostgresAdapter(sql, {
    user: "brukere",
    session: "user_session"
})

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    },
    getUserAttributes: (attributes) => {
        return {
            // attributes has the type of DatabaseUserAttributes
            username: attributes.username
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
}

export async function login(formData: FormData): Promise<void> {
    "use server";
    try {
        const brukernavn = formData.get("brukernavn");
        if (
            typeof brukernavn !== "string" ||
            brukernavn.length < 3 ||
            brukernavn.length > 31 ||
            !/^[a-z0-9_-]+$/.test(brukernavn)
        ) {
            throw {
                error: "Invalid username"
            };
        }
        const passord = formData.get("passord");
        if (typeof passord !== "string" || passord.length < 6 || passord.length > 255) {
            throw {
                error: "Invalid password"
            };
        }

        const existingUser = await sql<Bruker>`SELECT *
                                           FROM brukere
                                           WHERE brukernavn = ${brukernavn}`;

        if (!existingUser.rows.length) {
            throw {
                error: "Incorrect username or password"
            };
        }

        const typedBruker: Bruker = existingUser.rows[0]

        if (!typedBruker) {
            throw {
                error: "Incorrect username or password"
            };
        }
        const validPassword = await verify(typedBruker.passord, passord);
        if (!validPassword) {
            throw {
                error: "Incorrect username or password"
            };
        }

        const session = await lucia.createSession(typedBruker.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
        const maybeVercelPostgresError = (
            typeof e === "object" ? e : {}
        ) as Partial<VercelPostgresError>;

        console.error(maybeVercelPostgresError)
    } finally {
        redirect(encodeURIComponent('bøter') + '/sjef');
    }
}

interface Bruker {
    id: string
    brukernavn: string
    passord: string
}

export const validateRequest = cache(
    async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
        const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
        if (!sessionId) {
            return {
                user: null,
                session: null
            };
        }

        const result = await lucia.validateSession(sessionId);
        // next.js throws when you attempt to set cookie when rendering page
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
            if (!result.session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
        } catch(e) {
            console.error(e)
        }
        return result;
    }
);