'use client'
import Header from '@/komponenter/ui/Header.tsx'
import { MinSideInfo } from '@/app/minside/min-side-info.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import { useSpillerInfo } from '@/hooks/useSpillerInfo.ts'
import Loading from '@/app/loading.tsx'
import type { User } from 'lucia'
import ios_share from '@/ikoner/ios-share.svg'
import add_to_home_chrome from '@/ikoner/add-to-home-screen-chrome.svg'
import Image from 'next/image'
import Link from 'next/link'

const hentInitialer = (spillerNavn?: string) => {
    if (spillerNavn && spillerNavn.trim().length > 0) {
        return spillerNavn
            .split(' ')
            .map((navn) => navn[0])
            .join('')
            .toUpperCase()
    }
    return 'B'
}

interface MinSideClientProps {
    user: User
    logoutAction: () => Promise<void>
}

const LagreSomAppSeksjon = () => (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
        <Header size="medium" className="mb-2" text="Lagre siden som app!" />
        <Header size="small" className="mb-1" text="For iOS:" />
        <div className="flex items-center gap-2 mb-2">
            <span>1. Trykk på del</span>
            <Image alt="ios dele ikon" src={ios_share} />
        </div>
        <span>2. Velg Legg til på hjemskjerm</span>
        <Header className="mt-4 mb-1" size="small" text="For Android:" />
        <span>1. Trykk ⋮ øverst til høyre</span>
        <div className="flex items-center gap-2 mt-1">
            <span>2. Velg Legg til på startsiden</span>
            <Image alt="Legg til på startsiden ikon" src={add_to_home_chrome} />
        </div>
    </div>
)

const OpprettBrukerSeksjon = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow p-6 border border-blue-200 dark:border-blue-700">
        <Header size="medium" className="mb-3" text="Opprett bruker" />
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
            Som registrert bruker får du lettere tilgang til dine egne bøter og kan oppdatere informasjon din.
        </p>
        <Link href="/signup">
            <Knapp
                tekst="Registrer deg her"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
            />
        </Link>
    </div>
)

export const MinSideClient = ({ user, logoutAction }: MinSideClientProps) => {
    const erGjest = user?.type === 'gjest'
    const { spillerInfo, loading } = useSpillerInfo(!erGjest ? (user?.id ?? '') : '')

    if (loading && !erGjest) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <Loading />
            </div>
        )
    }

    const initialer = hentInitialer(spillerInfo?.navn)

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 flex items-start justify-center">
            <div className="container mx-auto p-4 mt-24 max-w-lg">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center">
                    {!erGjest && (
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
                            {initialer}
                        </div>
                    )}
                    <Header className="mb-4 text-center" size="large" text={erGjest ? 'Gjestebruker' : 'Min side'} />
                    <div className="w-full mb-6 space-y-6">
                        {erGjest ? (
                            <>
                                <OpprettBrukerSeksjon />
                                <LagreSomAppSeksjon />
                            </>
                        ) : (
                            <MinSideInfo bruker={user} spillerInfo={spillerInfo} />
                        )}
                    </div>
                    {!erGjest && <div className="w-full border-t border-gray-200 dark:border-gray-700 my-6" />}
                    {!erGjest && (
                        <form action={logoutAction} className="w-full">
                            <Knapp
                                tekst={'Logg ut'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
                            />
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
