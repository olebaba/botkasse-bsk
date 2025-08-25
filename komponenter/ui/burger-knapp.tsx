interface BurgerKnappProps {
    toggleMenu: () => void
}

export default function BurgerKnapp({ toggleMenu }: BurgerKnappProps) {
    return (
        <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center sm:hidden p-2 w-10 h-10 justify-center text-gray-800 bg-white
                rounded px-3 py-2 hover:bg-blue-600 hover:text-white"
            aria-controls="navbar-default"
            aria-expanded="false"
        >
            <span className="sr-only">Åpne meny</span>
            <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1h15M1 7h15M1 13h15"
                />
            </svg>
        </button>
    )
}
