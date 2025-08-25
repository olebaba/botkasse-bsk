import React from 'react'
import classNames from 'classnames'

type HeaderProps = {
    size: 'small' | 'medium' | 'large'
    text: string
    className?: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Header: React.FC<HeaderProps> = ({ size, text, className, as: Tag = 'h1' }) => {
    let headerClass = ''

    switch (size) {
        case 'small':
            headerClass = 'text-lg font-semibold'
            break
        case 'medium':
            headerClass = 'text-2xl font-bold'
            break
        case 'large':
            headerClass = 'text-3xl font-extrabold'
            break
        default:
            headerClass = 'text-xl'
    }

    return <Tag className={classNames(className, `${headerClass} text-gray-800`)}>{text}</Tag>
}

export default Header
