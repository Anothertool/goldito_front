import * as Yup from 'yup'

const emptyIngredient = {
    ingredient_id: '',
    name: '',
    quantity: '',
    unit: '',
}

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
    ingredients: Yup.array().of(
        Yup.object({
            ingredient_id: nullableNumber(
                Yup.number().nullable().integer().positive(),
            ),
            name: Yup.string().trim(),
            quantity: nullableNumber(
                Yup.number()
                    .nullable()
                    .typeError('Introduce una cantidad válida')
                    .positive('Debe ser mayor que 0'),
            ),
            unit: Yup.string().trim(),
        }).test(
            'ingredient-reference',
            'Selecciona o escribe un ingrediente',
            (ingredient) =>
                Boolean(ingredient?.ingredient_id || ingredient?.name?.trim()),
        ),
    ),
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
        ingredients: (recipe.ingredients ?? []).map((item) => ({
            ingredient_id: getOptionalId(
                item.ingredient_id ?? item.ingredient?.id,
            ),
            name: item.name ?? item.ingredient?.name ?? '',
            quantity: item.quantity ?? '',
            unit: item.unit ?? '',
        })),
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
        ingredients: values.ingredients.map((ingredient) => {
            const base = {}
            const unit = ingredient.unit?.trim()

            if (ingredient.quantity !== '' && ingredient.quantity !== null) {
                base.quantity = Number(ingredient.quantity)
            }
            if (unit) base.unit = unit

            if (ingredient.ingredient_id) {
                return {
                    ...base,
                    ingredient_id: Number(ingredient.ingredient_id),
                }
            }

            return { ...base, name: ingredient.name.trim() }
        }),
        components: values.components.map((component) => ({
            component_id: Number(component.component_id),
            portions: Number(component.portions),
        })),
        is_active: values.is_active,
    }
}

export const createEmptyIngredient = () => ({ ...emptyIngredient })
export const createEmptyComponent = () => ({ ...emptyComponent })
