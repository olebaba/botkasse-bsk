import React from 'react';
import classNames from "classnames";

type HeaderProps = {
    size: 'small' | 'medium' | 'large';
    text: string;
    className?: string;
};

const Header: React.FC<HeaderProps> = ({ size, text, className }) => {
    let headerClass = '';

    // Determine the Tailwind classes based on the size prop
    switch (size) {
        case 'small':
            headerClass = 'text-lg font-semibold';
            break;
        case 'medium':
            headerClass = 'text-2xl font-bold';
            break;
        case 'large':
            headerClass = 'text-4xl font-extrabold';
            break;
        default:
            headerClass = 'text-xl'; // Default in case none is matched
    }

    return <h1 className={classNames(className, `${headerClass} text-gray-800 mb-4`)}>{text}</h1>;
};

export default Header;
