import { useMemo, useState } from 'react'
import { FieldArray, FormikProvider, getIn, useFormik } from 'formik'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PiArrowLeft,
  PiCamera,
  PiCheck,
  PiMinus,
  PiPlus,
  PiTag,
  PiX,
} from 'react-icons/pi'
import {
  componentsApi,
  ingredientsApi,
  recipeTagsApi,
  recipesApi,
} from '@/api'
import {
  createEmptyComponent,
  createEmptyIngredient,
  getRecipeInitialValues,
  toRecipePayload,
  validationSchema,
} from './utils'
import './recetas.css'

const UNITS = ['g', 'kg', 'ml', 'l', 'ud', 'cda', 'cdta']

const getResults = (data) => (Array.isArray(data) ? data : data?.results ?? [])

function FieldError({ formik, name }) {
  const error = getIn(formik.errors, name)
  const touched = getIn(formik.touched, name)
  if (!touched || !error || typeof error !== 'string') return null
  return <span className="field-error">{error}</span>
}

function RecipeForm() {
  const navigate = useNavigate()
  const { recipeId } = useParams()
  const isEditing = Boolean(recipeId)
  const [selectedTag, setSelectedTag] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [tagCreatorOpen, setTagCreatorOpen] = useState(false)

  const recipeQuery = useQuery(recipesApi.queries.detail(recipeId))
  const tagsQuery = useQuery(recipeTagsApi.queries.list({ page_size: 100, ordering: 'name' }))
  const ingredientsQuery = useQuery(ingredientsApi.queries.list({ page_size: 100, ordering: 'name' }))
  const componentsQuery = useQuery(componentsApi.queries.list({ page_size: 100, ordering: 'name', is_active: true }))
  const createRecipe = useMutation(recipesApi.mutations.create())
  const updateRecipe = useMutation(recipesApi.mutations.partialUpdate())
  const createTag = useMutation(recipeTagsApi.mutations.create())

  const tags = getResults(tagsQuery.data)
  const ingredients = getResults(ingredientsQuery.data)
  const components = getResults(componentsQuery.data)
  const formInitialValues = useMemo(
    () => getRecipeInitialValues(recipeQuery.data),
    [recipeQuery.data],
  )

  const formik = useFormik({
    initialValues: formInitialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null)
      const payload = toRecipePayload(values)

      try {
        if (isEditing) {
          await updateRecipe.mutateAsync({ id: recipeId, data: payload })
        } else {
          await createRecipe.mutateAsync(payload)
        }
        navigate('/recetas')
      } catch (error) {
        const apiErrors = error.response?.data
        helpers.setStatus(
          typeof apiErrors === 'string'
            ? apiErrors
            : apiErrors?.detail ?? 'No se ha podido guardar la receta. Revisa los datos.',
        )
      }
    },
  })

  const addSelectedTag = () => {
    const id = Number(selectedTag)
    if (id && !formik.values.tags.includes(id)) {
      formik.setFieldValue('tags', [...formik.values.tags, id])
    }
    setSelectedTag('')
  }

  const handleCreateTag = async () => {
    const name = newTagName.trim()
    if (!name) return

    try {
      const tag = await createTag.mutateAsync({ name })
      formik.setFieldValue('tags', [...formik.values.tags, tag.id])
      setNewTagName('')
      setTagCreatorOpen(false)
    } catch {
      // The inline mutation message below gives the user a retry path.
    }
  }

  const selectedTags = formik.values.tags.map((id) =>
    tags.find((tag) => Number(tag.id) === Number(id)) ?? { id, name: `Etiqueta ${id}` },
  )
  const isSaving = createRecipe.isPending || updateRecipe.isPending

  if (isEditing && recipeQuery.isPending) {
    return <div className="recipe-form-state"><span className="recipe-spinner" />Cargando receta…</div>
  }

  if (isEditing && recipeQuery.isError) {
    return (
      <div className="recipe-form-state recipe-state--error">
        <p>No hemos podido abrir esta receta.</p>
        <button type="button" onClick={() => navigate('/recetas')}>Volver al listado</button>
      </div>
    )
  }

  return (
    <FormikProvider value={formik}>
      <section className="recipe-form-screen">
        <header className="recipe-form-header">
          <button type="button" className="icon-button icon-button--plain" onClick={() => navigate('/recetas')} aria-label="Volver">
            <PiArrowLeft />
          </button>
          <h1>{isEditing ? 'Editar receta' : 'Crear receta'}</h1>
          <button type="submit" form="recipe-form" className="save-recipe-button" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </header>

        <form id="recipe-form" className="recipe-form" onSubmit={formik.handleSubmit} noValidate>
          <div className="recipe-photo-placeholder" aria-label="La API todavía no admite fotografías de recetas">
            <PiCamera />
            <strong>Foto de la receta</strong>
            <span>Disponible próximamente</span>
          </div>

          <div className="form-field">
            <label htmlFor="name">Nombre de la receta</label>
            <input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ej: Curry de pollo con arroz"
              maxLength={150}
              className={formik.touched.name && formik.errors.name ? 'input-error' : ''}
            />
            <FieldError formik={formik} name="name" />
          </div>

          <div className="form-field">
            <label htmlFor="description">Descripción <span>(opcional)</span></label>
            <textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Una breve descripción de la receta"
              rows="3"
            />
          </div>

          <fieldset className="form-field meal-type-field">
            <legend>Tipo de comida</legend>
            <div className="segmented-control">
              {[
                ['lunch', 'Comida'],
                ['dinner', 'Cena'],
                ['', 'Ambas'],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  className={formik.values.meal_type === value ? 'is-selected' : ''}
                  onClick={() => formik.setFieldValue('meal_type', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="servings">Raciones</label>
              <div className="number-stepper">
                <button type="button" onClick={() => formik.setFieldValue('servings', Math.max(1, Number(formik.values.servings) - 1))} aria-label="Restar una ración">
                  <PiMinus />
                </button>
                <input id="servings" name="servings" type="number" min="1" value={formik.values.servings} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                <button type="button" onClick={() => formik.setFieldValue('servings', Number(formik.values.servings || 0) + 1)} aria-label="Añadir una ración">
                  <PiPlus />
                </button>
              </div>
              <FieldError formik={formik} name="servings" />
            </div>

            <div className="form-field">
              <label htmlFor="active_time_minutes">Tiempo activo (min)</label>
              <input
                id="active_time_minutes"
                name="active_time_minutes"
                type="number"
                min="0"
                value={formik.values.active_time_minutes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="30"
              />
              <FieldError formik={formik} name="active_time_minutes" />
            </div>
          </div>

          <div className="form-field">
            <label>Etiquetas</label>
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map((tag) => (
                  <span key={tag.id}>
                    {tag.name}
                    <button type="button" onClick={() => formik.setFieldValue('tags', formik.values.tags.filter((id) => Number(id) !== Number(tag.id)))} aria-label={`Quitar ${tag.name}`}>
                      <PiX />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="inline-add-row">
              <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
                <option value="">Seleccionar etiqueta…</option>
                {tags.filter((tag) => !formik.values.tags.some((id) => Number(id) === Number(tag.id))).map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              <button type="button" onClick={addSelectedTag} disabled={!selectedTag} aria-label="Añadir etiqueta"><PiPlus /></button>
            </div>
            {!tagCreatorOpen ? (
              <button type="button" className="text-add-button" onClick={() => setTagCreatorOpen(true)}><PiTag /> Crear etiqueta nueva</button>
            ) : (
              <div className="inline-create-row">
                <input value={newTagName} onChange={(event) => setNewTagName(event.target.value)} placeholder="Nombre de la etiqueta" maxLength="100" />
                <button type="button" onClick={handleCreateTag} disabled={!newTagName.trim() || createTag.isPending}><PiCheck /></button>
                <button type="button" onClick={() => setTagCreatorOpen(false)}><PiX /></button>
              </div>
            )}
            {createTag.isError && <span className="field-error">No se ha podido crear la etiqueta.</span>}
          </div>

          <FieldArray name="ingredients">
            {({ push, remove }) => (
              <section className="nested-section">
                <div className="nested-section__heading">
                  <h2>Ingredientes</h2>
                  <span>{formik.values.ingredients.length}</span>
                </div>
                <datalist id="ingredient-options">
                  {ingredients.map((ingredient) => <option key={ingredient.id} value={ingredient.name} />)}
                </datalist>
                <div className="nested-list">
                  {formik.values.ingredients.map((ingredient, index) => (
                    <div className="ingredient-row" key={index}>
                      <div>
                        <input
                          name={`ingredients.${index}.name`}
                          value={ingredient.name}
                          list="ingredient-options"
                          placeholder="Ingrediente"
                          aria-label={`Ingrediente ${index + 1}`}
                          onBlur={formik.handleBlur}
                          onChange={(event) => {
                            const name = event.target.value
                            const match = ingredients.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase())
                            formik.setFieldValue(`ingredients.${index}.name`, name)
                            formik.setFieldValue(`ingredients.${index}.ingredient_id`, match?.id ?? '')
                          }}
                        />
                        <FieldError formik={formik} name={`ingredients.${index}`} />
                      </div>
                      <div>
                        <input
                          name={`ingredients.${index}.quantity`}
                          type="number"
                          min="0"
                          step="any"
                          value={ingredient.quantity}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Cant."
                          aria-label={`Cantidad del ingrediente ${index + 1}`}
                        />
                        <FieldError formik={formik} name={`ingredients.${index}.quantity`} />
                      </div>
                      <select name={`ingredients.${index}.unit`} value={ingredient.unit} onChange={formik.handleChange} aria-label={`Unidad del ingrediente ${index + 1}`}>
                        {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                      </select>
                      <button type="button" className="remove-row-button" onClick={() => remove(index)} aria-label={`Quitar ingrediente ${index + 1}`}><PiMinus /></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="text-add-button" onClick={() => push(createEmptyIngredient())}><PiPlus /> Añadir ingrediente</button>
              </section>
            )}
          </FieldArray>

          <FieldArray name="components">
            {({ push, remove }) => (
              <section className="nested-section">
                <div className="nested-section__heading">
                  <h2>Componentes utilizados</h2>
                  <span>{formik.values.components.length}</span>
                </div>
                <div className="nested-list">
                  {formik.values.components.map((component, index) => (
                    <div className="component-row" key={index}>
                      <div>
                        <select
                          name={`components.${index}.component_id`}
                          value={component.component_id}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          aria-label={`Componente ${index + 1}`}
                        >
                          <option value="">Seleccionar componente…</option>
                          {components.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                        <FieldError formik={formik} name={`components.${index}.component_id`} />
                      </div>
                      <div className="portion-field">
                        <input
                          name={`components.${index}.portions`}
                          type="number"
                          min="0"
                          step="0.25"
                          value={component.portions}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          aria-label={`Porciones del componente ${index + 1}`}
                        />
                        <span className="portion-suffix">porciones</span>
                        <FieldError formik={formik} name={`components.${index}.portions`} />
                      </div>
                      <button type="button" className="remove-row-button" onClick={() => remove(index)} aria-label={`Quitar componente ${index + 1}`}><PiMinus /></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="text-add-button" onClick={() => push(createEmptyComponent())}><PiPlus /> Añadir componente</button>
                <p className="nested-hint">Los componentes nuevos deben crearse antes desde la sección Componentes.</p>
              </section>
            )}
          </FieldArray>

          <div className="form-field">
            <label htmlFor="instructions">Instrucciones</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formik.values.instructions}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Describe los pasos para preparar la receta…"
              rows="6"
            />
          </div>

          <label className="active-toggle">
            <span>
              <strong>Receta activa</strong>
              <small>Estará disponible para planificar comidas.</small>
            </span>
            <input type="checkbox" name="is_active" checked={formik.values.is_active} onChange={formik.handleChange} />
            <i aria-hidden="true" />
          </label>

          {formik.status && <div className="form-submit-error" role="alert">{formik.status}</div>}

          <button type="submit" className="primary-submit-button" disabled={isSaving}>
            {isSaving ? 'Guardando receta…' : isEditing ? 'Guardar cambios' : 'Crear receta'}
          </button>
        </form>
      </section>
    </FormikProvider>
  )
}

export default RecipeForm
