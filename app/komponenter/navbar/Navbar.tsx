import {validateRequest} from "@/app/lib/auth.ts";
import NavbarMeny from "@/app/komponenter/navbar/navbarMeny.tsx";

export interface SideLenke {
    href: string;
    label: string;
}

export default async function Navbar() {
    const {user} = await validateRequest();
    const sideLenker: SideLenke[] = [
        {href: "/", label: "Spilleres bøter"},
        {href: `/${encodeURIComponent('bøter')}`, label: "Oversikt typer bøter"},
    ];
    if (user?.admin) {
        sideLenker.push(
            {href: `/${encodeURIComponent('bøter')}/sjef`, label: "Botsjef 🔐"},
        )
    }

    return (
        <NavbarMeny sideLenker={sideLenker} />
    )
}