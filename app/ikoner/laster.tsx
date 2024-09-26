import React from 'react';
import Image from "next/image";
import bskBilde from '../android-chrome-512x512.png'

const Laster = () => {
    return (
        <Image className="animate-spin" src={bskBilde} alt="Loading spinner"/>
    );
};

export default Laster;
