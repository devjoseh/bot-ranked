function nonnullish(v:any) {
    return v !== null && v !== void 0;
}

export function spaceBuilder(...text: (string | null | undefined | (string | null | undefined)[])[]): string {
    return text.flat().filter(nonnullish).join(" ");
}

export function linesBuilder(...text: (string | null | undefined | (string | null | undefined)[])[]): string {
    return text.flat().filter(nonnullish).join("\n");
}

export function replaceText(text: string, replaces: Record<string, string>): string {
    let result = String(text);
    for (const prop in replaces) {
        result = result.replaceAll(prop, replaces[prop]);
    }

    return result;
}

export function limitText(text:string, maxLength:number, endText = ""): string {
    return text.length >= maxLength ? text.slice(0, maxLength) + endText : text;
}

export function timeToMs(hours:number, minutes:number, seconds:number): number {
    return ((hours * 60 + minutes) * 60 + seconds) * 1000
}

export function parseMs(timeInMs: number): string {
    const units = [
        { label: 'd', value: 24 * 60 * 60 * 1000 },
        { label: 'h', value: 60 * 60 * 1000 },
        { label: 'm', value: 60 * 1000 },
        { label: 's', value: 1000 }
    ];

    const result = units.reduce((acc, { label, value }) => {
        const unitValue = Math.floor(timeInMs / value);
        timeInMs %= value;
        return unitValue > 0 ? acc + `${unitValue}${label} ` : acc;
    }, '').trim();

    return result || '0s';
}

export function removeAccentuation(text: string): string {
    text = text.toLowerCase();

    let palavraSemAcento = "";
    const caracterComAcento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
    const caracterSemAcento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";

    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const indexAcento = caracterComAcento.indexOf(char);
        if (indexAcento !== -1) {
            palavraSemAcento += caracterSemAcento.charAt(indexAcento);
        } else {
            palavraSemAcento += char;
        }
    }

    return palavraSemAcento;
}

export function removeSymbols(text: string): string {
    const regex = /[`´]/g;
    return text.replace(regex, "");
}

export function formatTimestampTz(timestamptz:string) {
    const date = new Date(timestamptz)
    return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour12: false })
}