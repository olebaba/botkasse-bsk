import Telefonnummer from '@/komponenter/spillere/Telefonnummer.tsx'
import Header from '@/komponenter/ui/Header.tsx'

export const Kontakter = () => {
    const personer = [
        { rolle: 'Trener', navn: 'Bjørn Aasmund Fredsted', nummer: '48356855' },
        { rolle: 'Botsjef', navn: 'Ole Bastian Løchen', nummer: '97513023' },
    ]

    return (
        <div className="mx-auto mt-4">
            <Header size="medium" text="Kontaktinfo" />
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <tbody>
                        {personer.map((person, index) => (
                            <tr key={index} className="border-b">
                                <td className="font-bold text-gray-800">{person.rolle}</td>
                                <td className="p-2">{person.navn}</td>
                                <td className="p-2">
                                    <Telefonnummer nummer={person.nummer} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Kontakter
