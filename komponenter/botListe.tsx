import React, {type ReactElement} from "react";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";
import dayjs from "@/lib/dayjs.ts";
import Image from "next/image";
import new_release from "@/ikoner/new-release.svg"

interface BotListeProps {
    forseelser: Forseelse[];
}

export const BotListe = ({forseelser}: BotListeProps) => {

    const sorterOppdatert = () => {
        return forseelser.toSorted((a: Forseelse, b: Forseelse) => b.oppdatert.localeCompare(a.oppdatert))
    }

    return (
        <table className="w-full mt-4 bg-white border border-gray-200 shadow-lg">
            <thead className="bg-gray-50">
            <tr className="hover:bg-gray-50">
                <TableHeaderCell tekst="Forseelse"/>
                <TableHeaderCell tekst="Standard Beløp"/>
                <TableHeaderCell tekst="Beskrivelse"/>
            </tr>
            </thead>
            <tbody>
            {sorterOppdatert().map((botType, index) => (
                <TableRow key={botType.id} botType={botType} isEven={index % 2 === 0}/>
            ))}
            </tbody>
        </table>
    );
};

interface TableRowProps {
    botType: Forseelse;
    isEven: boolean;
}

const TableRow = ({botType, isEven}: TableRowProps) => {
    const erNy = dayjs(botType.oppdatert) > dayjs().subtract(2, "weeks")
    return (
        <tr className={`${isEven ? 'bg-gray-50' : 'bg-white'}`}>
            <TableCell tekst={botType.navn}/>
            <TableCell tekst={botType.beløp + ' kroner'}/>
            <TableCell tekst={botType.beskrivelse}/>
            {erNy && (
                <td className="relative">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Image alt={"Er ny"} src={new_release}/>
                    </div>
                </td>
            )}
        </tr>
    );
};

const TableCell = ({tekst}: { tekst: string }): ReactElement => {
    return <td className="py-3 px-4 border-b text-gray-700">{tekst}</td>;
};

const TableHeaderCell = ({tekst}: { tekst: string }) => {
    return (
        <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">
            {tekst}
        </th>
    );
};