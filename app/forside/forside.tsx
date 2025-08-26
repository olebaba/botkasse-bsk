'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SpillerBøter from '@/app/forside/spiller-bøter.tsx'
import GjesteTilgangModal from '@/app/forside/components/GjesteTilgangModal.tsx'
import LagkasseDisplay from '@/app/forside/components/LagkasseDisplay.tsx'
import { useSpillere } from '@/hooks/useSpillere.ts'
import { useForseelser } from '@/hooks/useForseelser.ts'
import { useUtgifter } from '@/hooks/useUtgifter.ts'
import Header from '@/komponenter/ui/Header.tsx'
import { beregnSum } from '@/lib/botBeregning.ts'
import new_release from '@/ikoner/new-release.svg'
import type { User } from 'lucia'
import type { ActionResult } from '@/lib/auth/authConfig.ts'

interface ForsideProps {
    bruker?: User
    gjestebrukerAction: (formData: FormData) => Promise<ActionResult>
}

const Forside = ({ bruker, gjestebrukerAction }: ForsideProps) => {
    const { spillere, loading: lasterSpillere } = useSpillere(true)
    const { forseelser } = useForseelser()
    const { utgifter, laster: lasterUtgifter } = useUtgifter()

    const kasseBeregning = useMemo(() => {
        const alleBetalteBoter = spillere.flatMap((s) => s.boter).filter((b) => b.erBetalt)
        const sumBetalteBoter = beregnSum(alleBetalteBoter)
        const totalUtgifter = utgifter.reduce((sum, u) => sum + u.beløp, 0)
        return sumBetalteBoter - totalUtgifter
    }, [spillere, utgifter])

    const lasterKasseBeregning = lasterSpillere || lasterUtgifter

    if (!bruker) {
        return <GjesteTilgangModal gjestebrukerAction={gjestebrukerAction} />
    }

    return (
        <div className="container mx-auto p-4 mt-24">
            <Header className="!mb-0" size="small" text="Hvilke bøter kan man få?" />
            <Link href="/boter" className="text-blue-600 flex items-center">
                Sjekk oversikt her
                <div className="w-6 h-6 ml-1 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Image alt="Nye bøter" src={new_release} />
                </div>
            </Link>
            <LagkasseDisplay gjenstaendeKasse={kasseBeregning} laster={lasterKasseBeregning} />
            <Header className="text-3xl font-bold text-center mb-6 mt-2" size="large" text="Spilleres bøter i BSK" />
            <SpillerBøter spillere={spillere} forseelser={forseelser} bruker={bruker} />
        </div>
    )
}

export default Forside
