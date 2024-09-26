import LeggTilBot from "@/app/b%C3%B8ter/sjef/legg-til-bot";
import {redirect} from "next/navigation";
import {validateRequest} from "@/app/lib/auth.ts";
import {hentSpillere} from "@/app/lib/spillereService.ts";

export default async function Page() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }

    const spillere = await hentSpillere()
    const fetchForseelser = async () => {
        const response = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/boter/typer');
        if (!response.ok) {
            throw new Error('Feil ved henting av forseelser');
        }
        return await response.json();
    };
    const forseelser = await fetchForseelser();

    return (
        <LeggTilBot spillere={spillere} forseelser={forseelser}/>
    )
}