"use client"
import Header from "@/komponenter/Header.tsx";
import {useSpillerInfo} from "@/hooks/useSpillerInfo.ts";
import Loading from "@/app/loading.tsx";
import ios_share from "@/ikoner/ios-share.svg"
import add_to_home_chrome from "@/ikoner/add-to-home-screen-chrome.svg"
import Image from "next/image";
import {Knapp} from "@/komponenter/Knapp.tsx";
import {Input} from "@/komponenter/Input.tsx";
import {type FormEvent, useState} from "react";
import {oppdaterSpillerInfo} from "@/lib/brukerService.ts";
import type {Bruker} from "@/lib/auth/authConfig.ts";

interface MinSideInfoProps {
    bruker: Bruker;
}

export const MinSideInfo = ({bruker}: MinSideInfoProps) => {
    const {spillerInfo, loading} = useSpillerInfo((bruker && bruker?.type != "gjest") ? bruker?.id ?? "" : "")
    const [rediger, setRediger] = useState(false);

    if (loading) {
        return <Loading/>
    }

    const oppdaterInfo = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget);

        const setOppdatertInfo = async () => {
            await oppdaterSpillerInfo(bruker.id, formData)
        }
        setOppdatertInfo().then(() => {
            setRediger(false)
        })
    }

    return (
        <div className="w-2/3 mx-auto flex flex-col justify-end text-left">
            {spillerInfo && (
                <div className="flex flex-col justify-between border-b mb-2 pb-16">
                    <form onSubmit={(event) => oppdaterInfo(event)} className="mb-4 w-full">
                        <Input tittel="Draktnummer" placeholder={spillerInfo.id} rediger={false}/>
                        <Input tittel="Navn" placeholder={spillerInfo.navn} rediger={rediger}/>
                        <Input tittel="Mobilnummer" placeholder={bruker.brukernavn} type="number" rediger={rediger}/>
                        {!rediger && <Knapp tekst="Endre info" onClick={() => setRediger(!rediger)}/>}
                        {rediger && <Knapp tekst="Lagre endringer"/>}
                        {rediger && <Knapp className="bg-red-500 ml-4" tekst="Avbryt" onClick={() => setRediger(false)}/>}
                    </form>
                </div>
            )}

            <Header size={"medium"} text={"Lagre siden som app!"}/>
            <Header size={"small"} text={"For ios:"}/>
            <div className="flex flex-row">
                <p>1. Trykk på del</p>
                <Image alt={"ios dele ikon"} src={ios_share}/>
            </div>
            <p>2. Velg Legg til på hjemskjerm</p>
            <Header className="mt-4" size={"small"} text={"For android:"}/>
            <p>1. Trykk ⋮ øverst til høyre</p>
            <div className="flex flex-row">
                <p>2. Velg Legg til på startsiden</p>
                <Image alt={"Legg til på startsiden ikon"} src={add_to_home_chrome}/>
            </div>
        </div>
    );
};
