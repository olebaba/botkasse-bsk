'use client'
import SpillerBøter from "@/app/forside/spiller-bøter.tsx";
import Link from "next/link";
import AlertBanner, {AlertTypes} from "@/komponenter/AlertBanner.tsx";
import {useSpillere} from "@/hooks/useSpillere.ts";
import {useForseelser} from "@/hooks/useForseelser.ts";
import Header from "@/komponenter/Header.tsx";
import type {User} from "lucia";
import {beregnSum} from "@/lib/botBeregning.ts";
import Image from "next/image";
import new_release from "@/ikoner/new-release.svg";
import React from "react";

interface ForsideProps {
    bruker?: User
}

export default function Forside({bruker}: ForsideProps) {
    const {spillere} = useSpillere(true)
    const {forseelser} = useForseelser()

    const alleBetalteBoter = spillere.flatMap(s => s.boter).filter(b => b.erBetalt)
    const sumBetalteBoter: number = beregnSum(alleBetalteBoter)

    return (
        <div className="container mx-auto p-4 mt-24">
            <AlertBanner
                message="Vil du se navn istedenfor draktnummer? Trykk på menyen for å opprette bruker!"
                type={AlertTypes.INFO}
            />
            <Header className="!mb-0" size="small" text="Hvilke bøter kan man få?"/>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600 flex">
                Sjekk oversikt her
                <div
                    className="w-6 h-6 ml-1 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Image alt="Nye bøter" src={new_release}/>
                </div>
            </Link>
            <div className="flex flex-row">
                <Header className="mt-2 mr-2" size="small" text={`Totalt innbetalt:`}/>
                {!sumBetalteBoter && (<p className="mt-2 animate-spin-cool h-[20px] text-center object-cover">💰</p>)}
                {sumBetalteBoter > 0 && (<Header className="mt-2" size="small" text={`${sumBetalteBoter} kr 💰`}/>)}
            </div>
            <Header className="text-3xl font-bold text-center mb-6 mt-2" size="large" text="Spilleres bøter i BSK"/>
            <SpillerBøter spillere={spillere} forseelser={forseelser} bruker={bruker}/>
        </div>
    );
}
