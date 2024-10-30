import React from "react";
import classNames from "classnames";

interface KnappProps {
    tekst: string;
    onClick?: () => void;
    className?: string;
}

export const Knapp = ({ tekst, onClick, className }: KnappProps) => {
    const defaultClassName = "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";

    return (
        <button
            type={onClick ? "button" : "submit"}
            className={classNames(className, defaultClassName)}
            onClick={onClick}
        >
            {tekst}
        </button>
    );
};
