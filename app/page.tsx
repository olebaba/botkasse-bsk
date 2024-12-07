import Forside from "@/app/forside/forside.tsx";

import {validateRequest} from "@/lib/auth/validateRequest.ts";
import {guest} from "@/lib/auth/guest.ts";

export default async function Page() {
    const {user} = await validateRequest();

    return (
        <Forside bruker={user ?? undefined} gjestebrukerAction={guest} />
    )
}