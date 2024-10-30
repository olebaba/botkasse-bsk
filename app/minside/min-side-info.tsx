"use client"
import Header from "@/komponenter/Header.tsx";
import { useEffect, useState } from "react";
import type { BrukerInfo } from "@/app/api/spillere/[brukernavn]/route.ts";

interface BrukerInfoProps {
    brukernavn: string;
}

export const MinSideInfo = ({ brukernavn }: BrukerInfoProps) => {
    const [brukerInfo, setBrukerInfo] = useState<BrukerInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hentInfo = async () => {
            setLoading(true); // Set loading state to true before fetch
            const res = await fetch(`/api/spillere/${brukernavn}`);
            setBrukerInfo(await res.json());
            setLoading(false); // Set loading state to false after data is fetched
        };
        hentInfo().then();
    }, [brukernavn]);

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
