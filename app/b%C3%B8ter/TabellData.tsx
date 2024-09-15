import Laster from "@/app/ikoner/spinner";

export default function TabellData({verdi, erNok, skalVises}: {
    verdi: number | string | undefined,
    erNok: boolean,
    skalVises?: boolean
}) {
    if (!skalVises) return null;
    if (verdi === undefined) {
        return <td><Laster/></td>
    }
    return (
        <td className="py-2 px-4 border-b text-center">{verdi} {erNok ? 'kroner' : ''}</td>
    )
}