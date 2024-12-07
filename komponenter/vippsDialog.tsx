import * as React from 'react';
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {Spiller} from "@/lib/spillereService.ts";
import {generateVippsUrl} from "@/lib/vipps.ts";
import dayjs from "@/lib/dayjs.ts";
import EnkelModal from "@/komponenter/EnkelModal.tsx";
import {beregnSumMaaBetales} from "@/lib/botBeregning.ts";
import {Knapp} from "@/komponenter/Knapp.tsx";

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
        <EnkelModal
            apen={isModalOpen}
            onClose={handleCloseModal}
            tittel={tittel}
            innhold={innhold || `Vipps botsjef ${beregnSumMaaBetales(spiller.boter)} kroner?`}
        >
            <div className="flex justify-end space-x-3">
                <Knapp tekst="Avbryt" onClick={handleCloseModal}
                       className="px-4 py-2 bg-vipps-light-gray text-vipps-dark-blue rounded-md"/>
                <Knapp tekst="Åpne vipps" className="px-4 py-2 bg-vipps-orange text-white rounded-md"
                       onClick={() => {
                           betalIVipps(spiller)
                           setSpiller(spiller)
                       }}/>
            </div>
        </EnkelModal>
    );
}

export default VippsDialog