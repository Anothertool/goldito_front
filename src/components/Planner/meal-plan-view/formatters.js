export const localDate = (value) => {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export const formatDate = (value, options) => {
    const date = localDate(value)
    return date ? new Intl.DateTimeFormat('es-ES', options).format(date) : value
}

export const itemName = (item, fallback = '') =>
    item?.name ??
    item?.recipe_name ??
    item?.component_name ??
    item?.ingredient_name ??
    item?.recipe?.name ??
    item?.component?.name ??
    item?.ingredient?.name ??
    item?.storage_item?.name ??
    fallback

export const itemAmount = (item) => {
    const quantity =
        item?.quantity ??
        item?.quantity_needed ??
        item?.amount ??
        item?.portions ??
        item?.portions_used
    const unit =
        item?.unit ??
        (item?.portions != null || item?.portions_used != null
            ? 'raciones'
            : '')

    return [quantity, unit]
        .filter(
            (value) => value !== null && value !== undefined && value !== '',
        )
        .join(' ')
}

export const itemMinutes = (item) =>
    item?.minutes ??
    item?.time_minutes ??
    item?.active_time_minutes ??
    item?.preparation_minutes
