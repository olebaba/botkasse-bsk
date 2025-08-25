export const hentKortAnimasjonsklasser = (erNy: boolean) => {
    return erNy
        ? 'bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-400 shadow-blue-200/50 shadow-lg'
        : 'bg-white border-gray-100'
}

export const hentEmojiAnimasjonsklasser = (erNy: boolean, bounceAnimation: boolean) => {
    return erNy && bounceAnimation ? 'animate-bounce' : ''
}

export const hentDotAnimasjonsklasser = (pingAnimation: boolean) => {
    return pingAnimation ? 'animate-ping' : ''
}

export const hentTekstKlasser = (erNy: boolean) => {
    return erNy ? 'text-blue-900 font-semibold' : 'text-gray-900'
}
