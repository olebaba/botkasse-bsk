import {sql} from "@vercel/postgres";
import {verify} from "@node-rs/argon2";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {type Bruker, lucia, type VercelPostgresError} from "@/lib/auth/authConfig.ts";

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

        if (!typedBruker || !typedBruker.passord) {
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
    }
    redirect(`/minside`);
}