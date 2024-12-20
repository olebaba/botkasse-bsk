'use client'
import SpillerBøter from "@/app/forside/spiller-bøter.tsx";
import Link from "next/link";
import {useSpillere} from "@/hooks/useSpillere.ts";
import {useForseelser} from "@/hooks/useForseelser.ts";
import Header from "@/komponenter/Header.tsx";
import type {User} from "lucia";
import {beregnSum} from "@/lib/botBeregning.ts";
import Image from "next/image";
import new_release from "@/ikoner/new-release.svg";
import React, {type FormEvent, useState} from "react";
import EnkelModal from "@/komponenter/EnkelModal.tsx";
import {Input} from "@/komponenter/Input.tsx";
import {Knapp} from "@/komponenter/Knapp.tsx";
import type {ActionResult} from "@/lib/auth/authConfig.ts";

interface ForsideProps {
    bruker?: User
    gjestebrukerAction: (formData: FormData) => Promise<ActionResult>;
}

export default function Forside({bruker, gjestebrukerAction}: ForsideProps) {
    const {spillere} = useSpillere(true)
    const {forseelser} = useForseelser()
    const [error, setError] = useState<string | null>(null);

    const alleBetalteBoter = spillere.flatMap(s => s.boter).filter(b => b.erBetalt)
    const sumBetalteBoter: number = beregnSum(alleBetalteBoter)

    const lagGjestebruker = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget);

        try {
            const result = await gjestebrukerAction(formData);
            if (result.error) {
                setError(result.error)
            }
        } catch (error) {
            setError("Noe feilet, ta kontakt med admin.");
            console.error("Signup failed:", error);
        }
    }

    if (!bruker) {
        return (
            <EnkelModal
                tittel="Siden er ikke åpen for alle"
                innhold="Fyll inn koden du har fått for å kunne se innholdet på denne siden."
                onClose={() => {}}
                apen={true}
            >
                <form onSubmit={lagGjestebruker}>
                    {error && (
                        <div className="text-red-500 text-center mb-4">
                            {error}
                        </div>
                    )}
                    <Input placeholder="Kode" rediger={true} tittel="Skriv inn kode"/>
                    <div className="flex justify-end space-x-3">
                        <Knapp className="text-white ml-auto" tekst="Send inn"/>
                    </div>
                </form>
            </EnkelModal>
        )
    }

    return (
        <div className="container mx-auto p-4 mt-24">
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
