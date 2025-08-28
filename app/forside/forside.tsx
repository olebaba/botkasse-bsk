'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SpillerBøter from '@/app/forside/spiller-bøter.tsx'
import GjesteTilgangModal from '@/app/forside/components/GjesteTilgangModal.tsx'
import AnimertTeller from '@/app/forside/components/AnimertTeller.tsx'
import SpillerKort from '@/app/forside/SpillerKort'
import { useSpillere } from '@/hooks/useSpillere.ts'
import { useForseelser } from '@/hooks/useForseelser.ts'
import { useUtgifter } from '@/hooks/useUtgifter.ts'
import { useFavorittSpiller } from '@/hooks/useFavorittSpiller'
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
    const { favorittSpillerId, settFavorittSpiller, erFavoritt } = useFavorittSpiller()
    const [prioritertSpillerMerInfo, setPrioritertSpillerMerInfo] = useState(false)

    const favorittSpiller = useMemo(() => {
        if (!favorittSpillerId || spillere.length === 0) return null
        return spillere.find((spiller) => spiller.id === favorittSpillerId) || null
    }, [spillere, favorittSpillerId])

    const egenSpiller = useMemo(() => {
        if (!bruker?.spiller_id || spillere.length === 0) return null
        return spillere.find((spiller) => spiller.id === String(bruker.spiller_id)) || null
    }, [spillere, bruker?.spiller_id])

    const prioritertSpiller = useMemo(() => {
        if (bruker && bruker.type !== 'gjest') {
            return egenSpiller
        }
        return favorittSpiller
    }, [bruker, egenSpiller, favorittSpiller])

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
        <div className="container mx-auto p-4 mt-28">
            <Header size="large" text="BSK Botkasse" className="mb-6" />

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={`text-2xl ${lasterKasseBeregning ? 'animate-spin-cool' : ''}`}>💰</span>
                        <p className="font-medium text-gray-900">Lagkassen</p>
                    </div>
                    <div>
                        <AnimertTeller målVerdi={kasseBeregning} laster={lasterKasseBeregning} />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <Link
                    href="/boter"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                    <span>Se alle typer bøter</span>
                    <div className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center animate-bounce">
                        <Image alt="Nye bøter" src={new_release} className="w-2 h-2" />
                    </div>
                </Link>
            </div>

            {prioritertSpiller && (
                <div className="mb-6">
                    <SpillerKort
                        spiller={prioritertSpiller}
                        cardRef={() => {}}
                        merInfoOpen={prioritertSpillerMerInfo}
                        setMerInfoSpiller={() => setPrioritertSpillerMerInfo((prev) => !prev)}
                        setSpillerVipps={() => {}}
                        forseelser={forseelser}
                        visAlleSesonger={false}
                        erFavoritt={erFavoritt(prioritertSpiller.id)}
                        settFavorittSpiller={settFavorittSpiller}
                        erEgenSpiller={prioritertSpiller.id === String(bruker?.spiller_id)}
                        bruker={bruker}
                        favorittSpillerId={favorittSpillerId}
                    />
                </div>
            )}

            <Header className="mb-4" size="medium" text="Alle spilleres bøter" />

            <SpillerBøter
                spillere={spillere}
                forseelser={forseelser}
                bruker={bruker}
                favorittSpillerId={favorittSpillerId}
                settFavorittSpiller={settFavorittSpiller}
                erFavoritt={erFavoritt}
            />
        </div>
    )
}

export default Forside
