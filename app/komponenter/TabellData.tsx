import Laster from "@/app/ikoner/laster.tsx";

export default function TabellData({verdi, erNok, skalVises}: {
    verdi: number | string | undefined,
    erNok: boolean,
    skalVises?: boolean
}) {
    if (!skalVises) return null;
    if (verdi === undefined) {
        return <td className="py-2">
            <div className="flex justify-center items-center h-full">
                <div className="h-[50px] w-[50px]">
                    <Laster/>
                </div>
            </div>
        </td>
    }
    return (
        <td className="py-2 px-4 border-b text-center">{verdi} {erNok ? 'kroner' : ''}</td>
    )
}