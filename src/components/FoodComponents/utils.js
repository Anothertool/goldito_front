import * as Yup from 'yup'

export const initialValues = {
  name: '',
  description: '',
  fridge_life_days: '',
  storage_life_days: '',
  is_active: true,
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
  storage_life_days: optionalPositiveInteger,
  is_active: Yup.boolean().required(),
})

export function getComponentInitialValues(component) {
  if (!component) return initialValues

  return {
    name: component.name ?? '',
    description: component.description ?? '',
    fridge_life_days: component.fridge_life_days ?? '',
    storage_life_days: component.storage_life_days ?? '',
    is_active: component.is_active ?? true,
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
    storage_life_days:
      values.storage_life_days === '' || values.storage_life_days === null
        ? null
        : Number(values.storage_life_days),
    is_active: values.is_active,
  }
}
