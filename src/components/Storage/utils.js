import * as Yup from 'yup'

const toLocalDate = (date) => {
    const offset = date.getTimezoneOffset() * 60_000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export const initialValues = {
    item_type: 'component',
    component: '',
    recipe: '',
    portions: 1,
    frozen_at: toLocalDate(new Date()),
    best_before: '',
    notes: '',
}

const optionalDate = Yup.date()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()

export const validationSchema = Yup.object({
    item_type: Yup.string()
        .oneOf(['component', 'recipe'])
        .required('Selecciona qué quieres congelar'),
    component: Yup.number()
        .transform((value, originalValue) =>
            originalValue === '' ? null : value,
        )
        .nullable()
        .when('item_type', {
            is: 'component',
            then: (schema) =>
                schema.required('Selecciona un componente').positive(),
        }),
    recipe: Yup.number()
        .transform((value, originalValue) =>
            originalValue === '' ? null : value,
        )
        .nullable()
        .when('item_type', {
            is: 'recipe',
            then: (schema) =>
                schema.required('Selecciona una receta').positive(),
        }),
    portions: Yup.number()
        .typeError('Indica las porciones')
        .positive('Las porciones deben ser mayores que 0')
        .max(9999.99, 'La cantidad es demasiado grande')
        .required('Indica las porciones'),
    frozen_at: Yup.date()
        .typeError('Indica una fecha válida')
        .required('Indica cuándo se congeló'),
    best_before: optionalDate.min(
        Yup.ref('frozen_at'),
        'La fecha de consumo debe ser posterior a la de congelación',
    ),
    notes: Yup.string().max(255, 'Las notas no pueden superar 255 caracteres'),
})

const getId = (value) => value?.id ?? value ?? ''

export function getStorageInitialValues(item) {
    if (!item) return initialValues

    const component = getId(item.component_id ?? item.component)
    const recipe = getId(item.recipe_id ?? item.recipe)

    return {
        item_type: component ? 'component' : 'recipe',
        component: component ? Number(component) : '',
        recipe: recipe ? Number(recipe) : '',
        portions: item.portions ?? 1,
        frozen_at: item.frozen_at ?? initialValues.frozen_at,
        best_before: item.best_before ?? '',
        notes: item.notes ?? '',
    }
}

export function toStoragePayload(values) {
    const isComponent = values.item_type === 'component'

    return {
        component: isComponent ? Number(values.component) : null,
        recipe: isComponent ? null : Number(values.recipe),
        portions: Number(values.portions),
        frozen_at: values.frozen_at,
        best_before: values.best_before || null,
        notes: values.notes.trim(),
    }
}
