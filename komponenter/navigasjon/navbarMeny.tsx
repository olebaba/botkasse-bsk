'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Logo from '@/ikoner/logo/logo.tsx'
import BurgerKnapp from '@/komponenter/ui/burger-knapp.tsx'
import type { SideLenke } from '@/komponenter/navigasjon/Navbar.tsx'

interface NavbarProps {
    href: string
    children?: React.ReactNode
    onClick?: () => void
}

const NavItem = ({ href, children, onClick }: NavbarProps) => (
    <Link
        href={href}
        className="text-gray-800 bg-white rounded px-5 py-3 hover:bg-blue-600 hover:text-white"
        onClick={onClick}
    >
        {children}
    </Link>
)

const DesktopMeny = ({ lenker }: { lenker: { href: string; label: string }[] }) => (
    <div className="hidden sm:flex space-x-8">
        {lenker.map((link) => (
            <NavItem key={link.href} href={link.href}>
                {link.label}
            </NavItem>
        ))}
    </div>
)

interface MobilMenyProps {
    lenker: SideLenke[]
    erAapen: boolean
    lukkMeny: () => void
}

const MobilMeny = ({ lenker, erAapen, lukkMeny }: MobilMenyProps) => (
    <div
        className={`${erAapen ? 'block' : 'hidden'} sm:hidden bg-yellow-300 w-full absolute p-8 z-20`}
        id="navbar-mobile"
    >
        <ul className="flex flex-col space-y-8 items-center">
            {lenker.map((lenke) => (
                <li key={lenke.href}>
                    <NavItem href={lenke.href} onClick={lukkMeny}>
                        {lenke.label}
                    </NavItem>
                </li>
            ))}
        </ul>
    </div>
)

export default function NavbarMeny({ sideLenker }: { sideLenker: SideLenke[] }) {
    const [erMenyAapen, setErMenyAapen] = useState(false)

    const toggleMeny = () => {
        setErMenyAapen((prev) => !prev)
    }

    const lukkMeny = () => {
        setErMenyAapen(false)
    }

    return (
        <nav className="bg-yellow-300 border-b border-gray-200 fixed top-0 w-full z-10">
            <div className="max-w-screen-xl flex justify-between items-center mx-auto p-4">
                <Link href="/" className="flex items-center space-x-3">
                    <Logo />
                </Link>
                <div className="sm:hidden">
                    <BurgerKnapp toggleMenu={toggleMeny} />
                </div>
                <DesktopMeny lenker={sideLenker} />
            </div>
            <MobilMeny lenker={sideLenker} erAapen={erMenyAapen} lukkMeny={lukkMeny} />
        </nav>
    )
}
