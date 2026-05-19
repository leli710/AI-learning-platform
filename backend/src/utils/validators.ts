export const isValidIsraeliID = (id: string | number): boolean => {
    let idString = String(id).trim();
    if (idString.length > 9 || isNaN(Number(idString)) || idString.length === 0) {
        return false;
    }
    idString = idString.padStart(9, '0');
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        let digit = Number(idString[i]);
        let step = digit * ((i % 2) + 1);
        if (step > 9) step -= 9;
        sum += step;
    }
    return sum % 10 === 0;
};
