import React from 'react'
import classNames from 'classnames'

interface SelectProps {
    id: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    className?: string
    children: React.ReactNode
}

export const Select: React.FC<SelectProps> = ({ id, value, onChange, className, children }) => {
    const defaultClassName = 'px-2 py-1 rounded border border-gray-300 text-sm'

    return (
        <select id={id} className={classNames(defaultClassName, className)} value={value} onChange={onChange}>
            {children}
        </select>
    )
}
