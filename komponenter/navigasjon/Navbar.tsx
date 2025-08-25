import NavbarMeny from '@/komponenter/navigasjon/navbarMeny.tsx'
import { validateRequest } from '@/lib/auth/validateRequest.ts'

export interface SideLenke {
    href: string
    label: string
}

export default async function Navbar() {
    const { user } = await validateRequest()
    const sideLenker: SideLenke[] = [
        { href: '/', label: 'Spilleres bøter' },
        { href: '/boter', label: 'Oversikt typer bøter' },
        { href: `/minside`, label: `${user ? 'Min side' : 'Lag bruker'}` },
    ]
    if (user?.type == 'admin') {
        sideLenker.push({
            href: '/boter/sjef',
            label: 'Botsjef 🔐',
        })
    }

    return <NavbarMeny sideLenker={sideLenker} />
}
