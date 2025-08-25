import React from 'react'
import classNames from 'classnames'

interface KnappProps {
    tekst?: string
    children?: React.ReactNode
    onClick?: (e?: React.MouseEvent) => void
    className?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'vipps' | 'secondary'
}

export const Knapp = ({ tekst, children, onClick, className, type = 'button', variant = 'primary' }: KnappProps) => {
    const getVariantClassName = () => {
        switch (variant) {
            case 'vipps':
                return 'bg-vipps-orange hover:bg-vipps-orange-dark text-white'
            case 'secondary':
                return 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            default:
                return 'bg-blue-500 hover:bg-blue-700 text-white'
        }
    }

    const defaultClassName = `px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getVariantClassName()}`

    return (
        <button type={type} className={classNames(defaultClassName, className)} onClick={onClick}>
            {children || tekst}
        </button>
    )
}
