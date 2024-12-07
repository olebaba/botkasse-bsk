import {redirect} from "next/navigation";
import Header from "@/komponenter/Header.tsx";
import {MinSideInfo} from "@/app/minside/min-side-info.tsx";
import {Knapp} from "@/komponenter/Knapp.tsx";
import {validateRequest} from "@/lib/auth/validateRequest.ts";
import {logout} from "@/lib/auth/logout.ts";

export default async function MinSide() {
    const {user} = await validateRequest();
    if (!user) {
        return redirect("/login");
    }
    return (
        <div className="text-center">
            <Header className="mt-24" size="large" text="Min side"/>
            <MinSideInfo bruker={user}/>
            {user.type != "gjest" && (<form className="mt-8" action={logout}>
                <Knapp tekst={"Logg ut"}/>
            </form>)}
        </div>
    )
}