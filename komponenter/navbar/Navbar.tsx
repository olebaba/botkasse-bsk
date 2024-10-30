import {validateRequest} from "@/lib/auth.ts";
import NavbarMeny from "@/komponenter/navbar/navbarMeny.tsx";

export interface SideLenke {
    href: string;
    label: string;
}

export default async function Navbar() {
    const {user} = await validateRequest();
    const sideLenker: SideLenke[] = [
        {href: "/", label: "Spilleres bøter"},
        {href: `/${encodeURIComponent('bøter')}`, label: "Oversikt typer bøter"},
        {href: `/minside`, label: "Min side"},
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