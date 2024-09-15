import React from "react";
import {BotType} from "@/app/b%C3%B8ter/page";

interface TableProps {
    botTyper: BotType[];
}

export const Table: React.FC<TableProps> = ({ botTyper }) => {
    return (
        <table className="w-full bg-white border border-gray-200 shadow-lg">
            <thead className="bg-gray-50">
            <tr>
                <TableHeaderCell>Forseelse</TableHeaderCell>
                <TableHeaderCell>Standard Beløp (NOK)</TableHeaderCell>
                <TableHeaderCell>Beskrivelse</TableHeaderCell>
            </tr>
            </thead>
            <tbody>
            {botTyper.map((botType, index) => (
                <TableRow key={botType.id} botType={botType} isEven={index % 2 === 0} />
            ))}
            </tbody>
        </table>
    );
};

interface TableRowProps {
    botType: BotType;
    isEven: boolean;
}

const TableRow: React.FC<TableRowProps> = ({ botType, isEven }) => {
    return (
        <tr className={`${isEven ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
            <TableCell>{botType.navn}</TableCell>
            <TableCell>{botType.beløp} NOK</TableCell>
            <TableCell>{botType.beskrivelse}</TableCell>
        </tr>
    );
};

const TableCell = ({children}: any) => {
    return <td className="py-3 px-4 border-b text-gray-700">{children}</td>;
};

const TableHeaderCell = ({ children }: any) => {
    return (
        <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">
            {children}
        </th>
    );
};