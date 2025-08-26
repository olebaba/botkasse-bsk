interface AnimertTellerProps {
    målVerdi: number
    laster: boolean
}

const AnimertTeller = ({ målVerdi, laster }: AnimertTellerProps) => {
    if (laster) {
        // Vis animert telling fra 0 til 1500 umiddelbart
        return <div className="text-3xl font-bold text-green-600 animert-tall-1500" />
    }

    // Vis faktisk beløp med fade-in
    return <p className="text-3xl font-bold text-green-600 animert-tall-fade-in">{målVerdi} kr</p>
}

export default AnimertTeller
