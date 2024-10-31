import Laster from "@/ikoner/laster.tsx";
import React from "react";

export default function TabellData({verdi, erNok}: {
    verdi: number | string | undefined;
    erNok: boolean;
}) {
    return (
        <td className="py-2 px-4 border-b text-center">
            {verdi === undefined && (
                <div className="flex justify-center items-center h-full">
                    <div className="h-[50px] w-[50px]">
                        <Laster />
                    </div>
                </div>
            )}
            {typeof verdi === "number" && verdi <= 0 ? (
                <p className="text-green-600 font-semibold">Betalt</p>
            ) : (
                `${verdi} ${erNok ? 'kroner' : ''}`
            )}
        </td>
    );
}
