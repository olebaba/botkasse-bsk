import LeggTilBot from "@/app/b%C3%B8ter/sjef/legg-til-bot";
import {redirect} from "next/navigation";
import {validateRequest} from "@/app/lib/auth.ts";
import {hentSpillere} from "@/app/lib/spillereService.ts";
import {fetchForseelser} from "@/app/lib/forseelseService.ts";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }

    const spillere = await hentSpillere()
    const forseelser = await fetchForseelser();

    return (
        <LeggTilBot spillere={spillere} forseelser={forseelser}/>
    )
}