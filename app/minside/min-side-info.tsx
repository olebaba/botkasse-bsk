"use client"
import Header from "@/komponenter/Header.tsx";
import {useSpillerInfo} from "@/hooks/useSpillerInfo.ts";
import Loading from "@/app/loading.tsx";
import ios_share from "@/ikoner/ios-share.svg"
import add_to_home_chrome from "@/ikoner/add-to-home-screen-chrome.svg"
import Image from "next/image";

interface BrukerInfoProps {
    brukernavn: string;
}

export const MinSideInfo = ({brukernavn}: BrukerInfoProps) => {
    const {spillerInfo, loading} = useSpillerInfo(brukernavn)

    if (loading) {
        return <Loading/>
    }

    return (
        <div className="w-2/3 mx-auto flex flex-col justify-end text-left">
            {spillerInfo && (
                <div className="flex flex-col justify-between border-b mb-2">
                    <Header size="small" text={`Ditt mobilnummer: ${brukernavn}`}/>
                    <Header size="small" text={`Mitt draktnummer: ${spillerInfo.id}`}/>
                    <Header size="small" text={`Mitt navn: ${spillerInfo.navn}`}/>
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
                <Image alt={"Legg til på startsiden ikon"} src={add_to_home_chrome} />
            </div>
        </div>
    );
};
