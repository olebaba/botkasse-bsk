import {logout, validateRequest} from "@/app/lib/auth.ts";
import {redirect} from "next/navigation";
import Header from "@/app/komponenter/Header.tsx";
import {MinSideInfo} from "@/app/minside/min-side-info.tsx";
import {Knapp} from "@/app/komponenter/Knapp.tsx";

export default async function MinSide(){
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }
    return (
        <div className="text-center">
            <Header className="mt-24" size="large" text="Min side" />
            <MinSideInfo brukernavn={user.brukernavn}/>
            <form action={logout}>
                <Knapp tekst={"Logg ut"} />
            </form>
        </div>
    )
}