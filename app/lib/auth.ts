import {Lucia, type Session, type User} from "lucia";
import {NodePostgresAdapter} from "@lucia-auth/adapter-postgresql";
import {redirect} from "next/navigation";
import {cookies} from "next/headers";
import {sql} from "@vercel/postgres";
import {hash, verify} from "@node-rs/argon2";
import {cache} from "react";

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
            brukernavn: attributes.brukernavn,
            admin: attributes.admin
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }

    interface DatabaseUserAttributes {
        brukernavn: string;
        admin: boolean
    }
}

export interface ActionResult {
    error: string;
}

export async function signup(formData: FormData): Promise<ActionResult> {
    "use server";
    try {
        const feilmelding = {error: "Ugyldig brukernavn eller passord"}
        const username = formData.get("brukernavn");
        if (
            typeof username !== "string"
            || username.length < 5
            || username.length > 13
            || !/^\d+$/.test(username)
        ) {
            console.error("Feil brukernavn", typeof username);
            return feilmelding;
        }
        const password = formData.get("passord");
        if (typeof password !== "string" || password.length < 6 || password.length > 255) {
            console.error("feil passord")
            return feilmelding
        }

        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        const existingUser = await sql<Bruker>`SELECT *
                                               FROM brukere
                                               WHERE brukernavn = ${username}`;
        if (existingUser.rows.length) {
            return feilmelding
        }

        const registrertBruker = await sql<Bruker>`INSERT INTO brukere (brukernavn, passord)
                                                   VALUES (${username}, ${passwordHash})
                                                   RETURNING *`
        const typedBruker = registrertBruker.rows[0]

        const session = await lucia.createSession(typedBruker.id, {admin: typedBruker.admin});
        const sessionCookie = lucia.createSessionCookie(session.id);
        (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
        const maybeVercelPostgresError = (
            typeof e === "object" ? e : {}
        ) as Partial<VercelPostgresError>;

        console.error(maybeVercelPostgresError)
    } finally {
        redirect('/');
    }
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
        (await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
        const maybeVercelPostgresError = (
            typeof e === "object" ? e : {}
        ) as Partial<VercelPostgresError>;

        console.error(maybeVercelPostgresError)
    } finally {
        redirect(`/minside`);
    }
}

interface Bruker {
    id: string
    brukernavn: string
    passord: string
    admin: boolean
}

export const validateRequest = cache(
    async (): Promise<{ user: User | null; session: Session | null }> => {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

        if (!sessionId) {
            return {
                user: null,
                session: null
            };
        }

        const result = await lucia.validateSession(sessionId);
        try {
            if (result.session && result.session.fresh) {
                const sessionCookie = lucia.createSessionCookie(result.session.id);
                cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
            if (!result.session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            }
        } catch (e) {
            console.error(e);
        }

        return {
            user: result.user,
            session: result.session
        };
    }
);
