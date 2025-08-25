import React from 'react'
import classNames from 'classnames'

type HeaderProps = {
    size: 'small' | 'medium' | 'large'
    text: string
    className?: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Header: React.FC<HeaderProps> = ({ size, text, className, as }) => {
    let headerClass: string
    let defaultTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

    switch (size) {
        case 'small':
            headerClass = 'text-lg font-semibold'
            defaultTag = 'h3'
            break
        case 'medium':
            headerClass = 'text-2xl font-bold'
            defaultTag = 'h2'
            break
        case 'large':
            headerClass = 'text-3xl font-extrabold'
            defaultTag = 'h1'
            break
        default:
            headerClass = 'text-xl'
            defaultTag = 'h1'
    }

    const Tag = as || defaultTag

    // Check if className contains a text color, if so don't apply default color
    const hasCustomTextColor = className?.includes('text-')
    const defaultTextColor = hasCustomTextColor ? '' : 'text-gray-800'

    return <Tag className={classNames(headerClass, defaultTextColor, className)}>{text}</Tag>
}

export default Header
