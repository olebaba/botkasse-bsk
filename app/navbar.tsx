'use client'
import { useState } from "react";
import Link from "next/link";
import Logo from "@/app/ikoner/logo/logo";
import BurgerKnapp from "@/app/komponenter/burger-knapp";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-yellow-300 border-b border-gray-200 relative z-10">
            <div className="max-w-screen-xl flex justify-between items-center mx-auto p-4">
                <Link href="/" className="flex items-center space-x-3">
                    <Logo />
                </Link>
                {/* Burger-knapp for mobil */}
                <div className="sm:hidden">
                    <BurgerKnapp toggleMenu={toggleMenu} />
                </div>
                {/* Desktop-meny */}
                <div className="hidden sm:flex space-x-8">
                    <Link
                        href="/"
                        className="text-gray-800 bg-white rounded px-5 py-3 hover:bg-blue-600 hover:text-white"
                    >
                        Spilleres bøter
                    </Link>
                    <Link
                        href={'/' + encodeURIComponent('bøter')}
                        className="text-gray-800 bg-white rounded px-5 py-3 hover:bg-blue-600 hover:text-white"
                    >
                        Oversikt typer bøter
                    </Link>
                </div>
            </div>

            {/* Mobil-meny plassert under topplinjen */}
            <div
                className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden bg-yellow-300 w-full absolute p-8 z-20`}
                id="navbar-mobile"
            >
                <ul className="flex flex-col space-y-8 items-center">
                    <li>
                        <Link
                            href="/"
                            className="text-gray-800 bg-white rounded px-5 py-3 hover:bg-blue-600 hover:text-white"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Spilleres bøter
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={'/' + encodeURIComponent('bøter')}
                            className="text-gray-800 bg-white rounded px-5 py-3 hover:bg-blue-600 hover:text-white"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Oversikt typer bøter
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
