import React, {type ReactElement} from "react";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";

interface BotListeProps {
    forseelser: Forseelse[];
}

export const BotListe= ({forseelser}: BotListeProps) => {

    const sorterOppdatert = () => {
        return forseelser.toSorted((a: Forseelse,b: Forseelse) => b.oppdatert.localeCompare(a.oppdatert))
    }

    return (
        <table className="w-full mt-4 bg-white border border-gray-200 shadow-lg">
            <thead className="bg-gray-50">
            <tr className="hover:bg-gray-50">
                <TableHeaderCell tekst="Forseelse" />
                <TableHeaderCell tekst="Standard Beløp" />
                <TableHeaderCell tekst="Beskrivelse" />
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
    return (
        <tr className={`${isEven ? 'bg-gray-50' : 'bg-white'}`}>
            <TableCell tekst={botType.navn} />
            <TableCell tekst={botType.beløp + ' kroner'} />
            <TableCell tekst={botType.beskrivelse} />
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