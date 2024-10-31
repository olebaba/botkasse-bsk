"use client"
import Header from "@/komponenter/Header.tsx";
import {useSpillerInfo} from "@/hooks/useSpillerInfo.ts";
import Loading from "@/app/loading.tsx";

interface BrukerInfoProps {
    brukernavn: string;
}

export const MinSideInfo = ({brukernavn}: BrukerInfoProps) => {
    const {spillerInfo, loading} = useSpillerInfo(brukernavn)

    if (loading) {
        return <Loading/>
    }

    return (
        <>
            {spillerInfo && (
                <div className="flex flex-col justify-start">
                    <Header size="small" text={`Ditt mobilnummer: ${brukernavn}`}/>
                    <Header size="small" text={`Mitt draktnummer: ${spillerInfo.id}`}/>
                    <Header size="small" text={`Mitt navn: ${spillerInfo.navn}`}/>
                </div>
            )}
        </>
    );
};
