import React from 'react'
import Image from 'next/image'
import bskBilde from '../public/android-chrome-512x512.png'

const Laster = () => {
    return (
        <div className="flex items-center justify-center h-64 w-64 mx-auto" style={{ contain: 'layout style paint' }}>
            <Image
                loading="eager"
                className="animate-spin-cool h-48 w-48 object-cover"
                src={bskBilde}
                alt="Loading spinner"
                width={192}
                height={192}
            />
        </div>
    )
}

export default Laster
