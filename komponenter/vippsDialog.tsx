import * as React from 'react';
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {Spiller} from "@/lib/spillereService.ts";
import {generateVippsUrl} from "@/lib/vipps.ts";
import dayjs from "@/lib/dayjs.ts";
import SimpleModal from "@/komponenter/SimpleModal.tsx";
import {beregnSumMaaBetales} from "@/lib/botBeregning.ts";

interface DialogProps {
    tittel: string
    spiller?: Spiller
    setSpiller: (spiller: Spiller | undefined) => void
    innhold?: string
}

const VippsDialog = ({tittel, spiller, setSpiller, innhold}: DialogProps) => {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        setIsModalOpen(!!spiller)
    }, [spiller]);


    if (!spiller) return null

    const betalIVipps = (spiller: Spiller) => {
        const maaned = dayjs().add(-1, "month").format('MMMM');
        const belopOre = beregnSumMaaBetales(spiller.boter) * 100;
        const vippsUrl = generateVippsUrl('97513023', belopOre, `Bøter for måneden ${maaned}`)
        router.push(vippsUrl)
    }

    return (
        <SimpleModal
            open={isModalOpen}
            onClose={handleCloseModal}
            title={tittel}
            content={innhold || `Vipps botsjef ${beregnSumMaaBetales(spiller.boter)} kroner?`}
            onConfirm={() => {
                betalIVipps(spiller)
                setSpiller(spiller)
            }}
        />
    );
}

export default VippsDialog