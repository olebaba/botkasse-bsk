import Link from "next/link";
import Logo from "@/app/ikoner/logo/logo";

export default function Navbar() {
    return (
        <nav className="bg-yellow-300 border-b border-gray-200">
            <div className="max-w-screen-xl flex justify-between items-center mx-auto p-4">
                <Link href="/" className="flex items-center space-x-3">
                    <Logo/>
                </Link>
                <div className="hidden w-full md:flex md:w-auto">
                    <ul className="flex space-x-8">
                        <li>
                            <Link
                                href="/"
                                className="text-gray-800 bg-white rounded px-3 py-2 hover:bg-blue-600 hover:text-white"
                                aria-current="page"
                            >
                                Spilleres bøter
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={'/' + encodeURIComponent('bøter')}
                                className="text-gray-800 bg-white rounded px-3 py-2 hover:bg-blue-600 hover:text-white"
                            >
                                Oversikt typer bøter
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={'/' + encodeURIComponent('bøter') + '/sjef'}
                                className="text-gray-800 bg-white rounded px-3 py-2 hover:bg-blue-600 hover:text-white"
                            >
                                Botsjef 🔒
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
