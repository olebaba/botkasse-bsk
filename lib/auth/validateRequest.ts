import {cache} from "react";
import type {Session, User} from "lucia";
import {cookies} from "next/headers";
import {lucia} from "@/lib/auth/authConfig.ts";

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