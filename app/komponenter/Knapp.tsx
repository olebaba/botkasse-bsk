import React from "react";

interface KnappProps {
    tekst: string;
    onClick?: () => void;
}

export const Knapp = ({ tekst, onClick }: KnappProps) => {
    return (
        <button
            type={onClick ? "button" : "submit"}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onClick}
        >
            {tekst}
        </button>
    );
};
