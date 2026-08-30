const toInputDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const getClosestMonday = (from = new Date()) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate())
    date.setDate(date.getDate() + ((8 - date.getDay()) % 7))
    return toInputDate(date)
}
