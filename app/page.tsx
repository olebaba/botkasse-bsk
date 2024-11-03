import Forside from "@/app/forside/forside.tsx";
import {validateRequest} from "@/lib/auth.ts";

export default async function Page() {
    const {user} = await validateRequest();

    return (
        <Forside bruker={user ?? undefined} />
    )
}