import * as Yup from 'yup'
import {
    getIngredientInitialValues,
    ingredientsSchema,
    toIngredientsPayload,
} from '@/components/Ingredients/utils'

export const initialValues = {
    name: '',
    description: '',
    fridge_life_days: '',
    freezer_life_days: '',
    ingredients: [],
}

const optionalPositiveInteger = Yup.number()
    .transform((value, originalValue) =>
        originalValue === '' || originalValue === null ? null : value,
    )
    .nullable()
    .integer('Introduce un número entero de días')
    .min(0, 'Los días no pueden ser negativos')
    .max(32767, 'La cantidad de días es demasiado grande')

export const validationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .max(150, 'El nombre no puede superar los 150 caracteres')
        .required('Escribe un nombre para el componente'),
    description: Yup.string(),
    fridge_life_days: optionalPositiveInteger,
    freezer_life_days: optionalPositiveInteger,
    ingredients: ingredientsSchema,
})

export function getComponentInitialValues(component) {
    if (!component) return initialValues

    return {
        name: component.name ?? '',
        description: component.description ?? '',
        fridge_life_days: component.fridge_life_days ?? '',
        freezer_life_days: component.freezer_life_days ?? '',
        ingredients: getIngredientInitialValues(component.ingredients),
    }
}

export function toComponentPayload(values) {
    return {
        name: values.name.trim(),
        description: values.description.trim(),
        fridge_life_days:
            values.fridge_life_days === '' || values.fridge_life_days === null
                ? null
                : Number(values.fridge_life_days),
        freezer_life_days:
            values.freezer_life_days === '' || values.freezer_life_days === null
                ? null
                : Number(values.freezer_life_days),
        ingredients: toIngredientsPayload(values.ingredients),
    }
}
