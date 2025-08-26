'use client'
import Header from '@/komponenter/ui/Header.tsx'
import ios_share from '@/ikoner/ios-share.svg'
import add_to_home_chrome from '@/ikoner/add-to-home-screen-chrome.svg'
import Image from 'next/image'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import { Input } from '@/komponenter/ui/Input.tsx'
import { type FormEvent, useState } from 'react'
import { oppdaterSpillerInfo } from '@/lib/brukerService.ts'
import type { Bruker } from '@/lib/auth/authConfig.ts'

interface MinSideInfoProps {
    bruker: Bruker
    spillerInfo?: { id: string; navn: string } | null
}

export const MinSideInfo = ({ bruker, spillerInfo }: MinSideInfoProps) => {
    const [rediger, setRediger] = useState(false)

    const oppdaterInfo = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        const setOppdatertInfo = async () => {
            await oppdaterSpillerInfo(bruker.id, formData)
        }
        setOppdatertInfo().then(() => {
            setRediger(false)
        })
    }

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
                <Header size="medium" className="mb-4" text="Din info" />
                {spillerInfo && (
                    <form onSubmit={oppdaterInfo} className="space-y-4">
                        <Input tittel="Draktnummer" placeholder={spillerInfo.id} rediger={false} />
                        <Input tittel="Navn" placeholder={spillerInfo.navn} rediger={rediger} />
                        <Input tittel="Mobilnummer" placeholder={bruker.brukernavn} type="number" rediger={rediger} />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {!rediger && <Knapp tekst="Endre info" onClick={() => setRediger(true)} />}
                            {rediger && <Knapp tekst="Lagre endringer" />}
                            {rediger && (
                                <Knapp className="bg-red-500" tekst="Avbryt" onClick={() => setRediger(false)} />
                            )}
                        </div>
                    </form>
                )}
            </div>
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
        </div>
    )
}
