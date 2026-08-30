import * as Yup from 'yup'

const nullableNumber = (schema) =>
    schema.transform((value, originalValue) =>
        originalValue === '' || originalValue === null ? null : value,
    )

export const createEmptyIngredient = () => ({
    ingredient_id: '',
    name: '',
    quantity: '',
    unit: '',
})

export const ingredientsSchema = Yup.array().of(
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
)

export const getIngredientInitialValues = (ingredients = []) =>
    ingredients.map((item) => ({
        ingredient_id: item.ingredient_id ?? item.ingredient?.id ?? '',
        name: item.name ?? item.ingredient?.name ?? '',
        quantity: item.quantity ?? '',
        unit: item.unit ?? '',
    }))

export const toIngredientsPayload = (ingredients = []) =>
    ingredients.map((ingredient) => {
        const payload = {}
        const unit = ingredient.unit?.trim()

        if (ingredient.quantity !== '' && ingredient.quantity !== null) {
            payload.quantity = Number(ingredient.quantity)
        }
        if (unit) payload.unit = unit

        return ingredient.ingredient_id
            ? { ...payload, ingredient_id: Number(ingredient.ingredient_id) }
            : { ...payload, name: ingredient.name.trim() }
    })
