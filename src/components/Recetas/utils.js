import * as Yup from 'yup'
import {
    getIngredientInitialValues,
    ingredientsSchema,
    toIngredientsPayload,
} from '@/components/Ingredients/utils'

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024

const emptyComponent = {
    component_id: '',
    portions: 1,
}

export const initialValues = {
    image: null,
    name: '',
    description: '',
    meal_type: '',
    servings: 2,
    active_time_minutes: '',
    instructions: '',
    tags: [],
    ingredients: [],
    components: [],
    is_active: true,
}

const nullableNumber = (schema) =>
    schema.transform((value, originalValue) =>
        originalValue === '' || originalValue === null ? null : value,
    )

export const validationSchema = Yup.object({
    image: Yup.mixed()
        .nullable()
        .test(
            'image-file',
            'Selecciona un archivo de imagen válido',
            (value) => !value || value.type?.startsWith('image/'),
        )
        .test(
            'image-size',
            'La imagen no puede superar los 10 MB',
            (value) => !value || value.size <= MAX_IMAGE_SIZE,
        ),
    name: Yup.string()
        .trim()
        .max(150, 'El nombre no puede superar los 150 caracteres')
        .required('Escribe un nombre para la receta'),
    description: Yup.string(),
    meal_type: Yup.string().oneOf(['', 'lunch', 'dinner']),
    servings: Yup.number()
        .integer('Debe ser un número entero')
        .min(1, 'Debe haber al menos una ración')
        .required('Indica las raciones'),
    active_time_minutes: nullableNumber(
        Yup.number()
            .nullable()
            .integer('Usa minutos enteros')
            .min(0, 'El tiempo no puede ser negativo'),
    ),
    instructions: Yup.string(),
    tags: Yup.array().of(Yup.number().integer().positive()),
    ingredients: ingredientsSchema,
    components: Yup.array().of(
        Yup.object({
            component_id: Yup.number()
                .typeError('Selecciona un componente')
                .integer()
                .positive()
                .required('Selecciona un componente'),
            portions: Yup.number()
                .typeError('Indica las porciones')
                .positive('Debe ser mayor que 0')
                .required('Indica las porciones'),
        }),
    ),
    is_active: Yup.boolean().required(),
})

const getId = (value) => value?.id ?? value
const getOptionalId = (value) =>
    value === undefined || value === null || value === '' ? '' : Number(value)

export function getRecipeInitialValues(recipe) {
    if (!recipe) return initialValues

    return {
        image: null,
        name: recipe.name ?? '',
        description: recipe.description ?? '',
        meal_type: recipe.meal_type ?? '',
        servings: recipe.servings ?? 2,
        active_time_minutes: recipe.active_time_minutes ?? '',
        instructions: recipe.instructions ?? '',
        tags: (recipe.tags ?? []).map(getId).map(Number),
        ingredients: getIngredientInitialValues(recipe.ingredients),
        components: (recipe.components ?? []).map((item) => ({
            component_id: getOptionalId(
                item.component_id ?? item.component?.id ?? item.id,
            ),
            portions: item.portions ?? 1,
        })),
        is_active: recipe.is_active ?? true,
    }
}

export function toRecipePayload(values) {
    return {
        name: values.name.trim(),
        description: values.description.trim(),
        meal_type: values.meal_type,
        servings: Number(values.servings),
        active_time_minutes:
            values.active_time_minutes === '' ||
            values.active_time_minutes === null
                ? null
                : Number(values.active_time_minutes),
        instructions: values.instructions.trim(),
        tags: values.tags.map(Number),
        ingredients: toIngredientsPayload(values.ingredients),
        components: values.components.map((component) => ({
            component_id: Number(component.component_id),
            portions: Number(component.portions),
        })),
        is_active: values.is_active,
    }
}

export const createEmptyComponent = () => ({ ...emptyComponent })
