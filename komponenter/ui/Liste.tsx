import React from 'react'
import classNames from 'classnames'

interface ListeProps {
    children: React.ReactNode
    className?: string
    type?: 'ordered' | 'unordered'
    variant?: 'bullets' | 'none' | 'disc'
}

export const Liste: React.FC<ListeProps> = ({ children, className, type = 'unordered', variant = 'disc' }) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'bullets':
                return 'list-disc list-inside'
            case 'none':
                return 'list-none'
            case 'disc':
            default:
                return 'list-disc list-inside'
        }
    }

    const defaultClassName = `space-y-1 ${getVariantClasses()}`

    if (type === 'ordered') {
        return (
            <ol className={classNames(defaultClassName.replace('list-disc', 'list-decimal'), className)}>{children}</ol>
        )
    }

    return <ul className={classNames(defaultClassName, className)}>{children}</ul>
}

interface ListeElementProps {
    children: React.ReactNode
    className?: string
}

export const ListeElement: React.FC<ListeElementProps> = ({ children, className }) => {
    return <li className={className}>{children}</li>
}
