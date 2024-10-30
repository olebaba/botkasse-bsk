"use client"
import Header from "@/komponenter/Header.tsx";
import {useBrukerInfo} from "@/hooks/useBrukerInfo.ts";

interface BrukerInfoProps {
    brukernavn: string;
}

export const MinSideInfo = ({ brukernavn }: BrukerInfoProps) => {
    const {brukerInfo, loading} = useBrukerInfo(brukernavn)

    return (
        <>
            <Header size={"medium"} text={`Ditt mobilnummer: ${brukernavn}`} />
            {loading ? (
                <Header size={"small"} text={"Laster..."} />
            ) : (
                brukerInfo?.spiller_id && (
                    <Header size={"small"} text={`Ditt draktnummer: ${brukerInfo.spiller_id}`} />
                )
            )}
        </>
    );
};
