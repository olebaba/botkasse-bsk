import * as React from 'react';
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import type {Spiller} from "@/app/lib/spillereService.ts";
import {generateVippsUrl} from "@/app/lib/vipps.ts";
import dayjs from "@/app/lib/dayjs.ts";
import SimpleModal from "@/app/komponenter/SimpleModal.tsx";

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
        const belopOre = (spiller.totalSum ?? 0) * 100;
        const vippsUrl = generateVippsUrl('97513023', belopOre, `Bøter for måneden ${maaned}`)
        router.push(vippsUrl)
    }

    return (
        <SimpleModal
            open={isModalOpen}
            onClose={handleCloseModal}
            title={tittel}
            content={innhold}
            onConfirm={() => {
                betalIVipps(spiller)
                setSpiller(spiller)
            }}
        />
    );
}

export default VippsDialog