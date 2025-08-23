import React from 'react'
import Image from 'next/image'
import bskBilde from '../public/android-chrome-512x512.png'

const Laster = () => {
    return (
        <Image
            loading="eager"
            className="animate-spin-cool h-full w-full object-cover"
            src={bskBilde}
            alt="Loading spinner"
        />
    )
}

export default Laster
