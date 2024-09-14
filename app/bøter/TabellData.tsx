import Laster from "@/app/ikoner/spinner";

export default function TabellData({verdi, erNok}: { verdi: number | string | undefined; erNok: boolean }) {
    if (verdi === undefined) {
        return <td><Laster/></td>
    }
    return (
        <td className="py-2 px-4 border-b">{verdi} {erNok ? 'NOK' : ''}</td>
    )
}