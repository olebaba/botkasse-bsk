import LeggTilBot from "@/app/b%C3%B8ter/sjef/legg-til-bot";
import {redirect} from "next/navigation";
import {validateRequest} from "@/app/lib/auth.ts";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }

    return (
        <LeggTilBot/>
    )
}