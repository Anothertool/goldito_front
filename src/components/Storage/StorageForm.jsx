import { useEffect, useMemo, useState } from 'react'
import { getIn, useFormik } from 'formik'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
    PiArrowLeft,
    PiBowlFood,
    PiCalendarBlank,
    PiCookingPot,
    PiCarrot,
    PiMagnifyingGlass,
    PiMinus,
    PiPlus,
    PiSnowflake,
} from 'react-icons/pi'
import { componentsApi, ingredientsApi, recipesApi, storageApi } from '@/api'
import IngredientSearchSelect from '@/components/Ingredients/IngredientSearchSelect'
import {
    getStorageInitialValues,
    toStoragePayload,
    validationSchema,
} from './utils'
import './storage.css'

const getResults = (data) =>
    Array.isArray(data) ? data : (data?.results ?? [])

function useDebouncedValue(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
        return () => window.clearTimeout(timeout)
    }, [delay, value])

    return debouncedValue
}

function FieldError({ formik, name }) {
    const error = getIn(formik.errors, name)
    const touched = getIn(formik.touched, name)
    if (!touched || !error || typeof error !== 'string') return null
    return <span className="storage-field-error">{error}</span>
}

function StorageForm() {
    const navigate = useNavigate()
    const { storageItemId } = useParams()
    const isEditing = Boolean(storageItemId)
    const [search, setSearch] = useState('')
    const [selectedIngredientOption, setSelectedIngredientOption] =
        useState(null)
    const debouncedSearch = useDebouncedValue(search)

    const itemQuery = useQuery(storageApi.queries.detail(storageItemId))
    const createItem = useMutation(storageApi.mutations.create())
    const updateItem = useMutation(storageApi.mutations.partialUpdate())
    const formInitialValues = useMemo(
        () => getStorageInitialValues(itemQuery.data),
        [itemQuery.data],
    )

    const formik = useFormik({
        initialValues: formInitialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            helpers.setStatus(null)
            const payload = toStoragePayload(values)

            try {
                if (isEditing) {
                    await updateItem.mutateAsync({
                        id: storageItemId,
                        data: payload,
                    })
                } else {
                    await createItem.mutateAsync(payload)
                }
                navigate('/storage')
            } catch (error) {
                const apiErrors = error.response?.data
                helpers.setStatus(
                    apiErrors?.detail ??
                        'No se ha podido guardar. Comprueba los datos e inténtalo de nuevo.',
                )
            }
        },
    })

    const itemType = formik.values.item_type
    const isComponent = itemType === 'component'
    const isIngredient = itemType === 'ingredient'
    const selectedId = formik.values[itemType]
    const typeLabel = {
        component: 'componente',
        recipe: 'receta',
        ingredient: 'ingrediente',
    }[itemType]
    const lookupParams = {
        page_size: 100,
        ordering: 'name',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(itemType === 'recipe' && { is_active: true }),
    }
    const componentsQuery = useQuery({
        ...componentsApi.queries.list(lookupParams),
        enabled: isComponent,
    })
    const recipesQuery = useQuery({
        ...recipesApi.queries.list(lookupParams),
        enabled: itemType === 'recipe',
    })
    const selectedIngredientQuery = useQuery({
        ...ingredientsApi.queries.detail(selectedId),
        enabled: isIngredient && Boolean(selectedId),
    })
    const optionsQuery = isComponent ? componentsQuery : recipesQuery
    const options = getResults(optionsQuery.data)
    const selectedOption = isIngredient
        ? selectedId
            ? Number(selectedIngredientOption?.value) === Number(selectedId)
                ? { name: selectedIngredientOption.label }
                : (selectedIngredientQuery.data ??
                  (itemQuery.data?.ingredient_name
                      ? { name: itemQuery.data.ingredient_name }
                      : itemQuery.data?.ingredient_detail))
            : null
        : options.find((option) => Number(option.id) === Number(selectedId))
    const isSaving = createItem.isPending || updateItem.isPending

    const changeType = (type) => {
        formik.setFieldValue('item_type', type)
        formik.setFieldValue('component', '')
        formik.setFieldValue('recipe', '')
        formik.setFieldValue('ingredient', '')
        setSearch('')
        setSelectedIngredientOption(null)
    }

    if (isEditing && itemQuery.isPending) {
        return (
            <div className="storage-form-state">
                <span className="storage-spinner" />
                Cargando elemento…
            </div>
        )
    }

    if (isEditing && itemQuery.isError) {
        return (
            <div className="storage-form-state storage-state--error">
                <p>No hemos podido abrir este elemento.</p>
                <button type="button" onClick={() => navigate('/storage')}>
                    Volver al congelador
                </button>
            </div>
        )
    }

    return (
        <section className="storage-form-screen">
            <header className="storage-form-header">
                <button
                    type="button"
                    className="storage-back-button"
                    onClick={() => navigate('/storage')}
                    aria-label="Volver"
                >
                    <PiArrowLeft />
                </button>
                <h1>{isEditing ? 'Editar alimento' : 'Añadir al storage'}</h1>
                <button
                    type="submit"
                    form="storage-form"
                    className="storage-save-button"
                    disabled={isSaving}
                >
                    {isSaving ? 'Guardando…' : 'Guardar'}
                </button>
            </header>

            <form
                id="storage-form"
                className="storage-form"
                onSubmit={formik.handleSubmit}
                noValidate
            >
                <div className="storage-form-hero">
                    <span>
                        <PiSnowflake />
                    </span>
                    <div>
                        <strong>¿Qué quieres guardar?</strong>
                        <p>
                            Registra las raciones o unidades que tienes
                            disponibles.
                        </p>
                    </div>
                </div>

                <fieldset className="storage-form-field storage-kind-field">
                    <legend>Tipo de alimento</legend>
                    <div className="storage-segmented">
                        <button
                            type="button"
                            className={isComponent ? 'is-selected' : ''}
                            onClick={() => changeType('component')}
                        >
                            <PiCookingPot /> Componente
                        </button>
                        <button
                            type="button"
                            className={
                                itemType === 'recipe' ? 'is-selected' : ''
                            }
                            onClick={() => changeType('recipe')}
                        >
                            <PiBowlFood /> Receta
                        </button>
                        <button
                            type="button"
                            className={isIngredient ? 'is-selected' : ''}
                            onClick={() => changeType('ingredient')}
                        >
                            <PiCarrot /> Ingrediente
                        </button>
                    </div>
                </fieldset>

                {isIngredient ? (
                    <div className="storage-form-field">
                        <label htmlFor="storage-ingredient">
                            Buscar ingrediente
                        </label>
                        <IngredientSearchSelect
                            inputId="storage-ingredient"
                            instanceId="storage-ingredient"
                            aria-label="Ingrediente"
                            value={
                                selectedId
                                    ? {
                                          value: Number(selectedId),
                                          label:
                                              selectedOption?.name ??
                                              `Ingrediente ${selectedId}`,
                                      }
                                    : null
                            }
                            onChange={(option) => {
                                setSelectedIngredientOption(option)
                                formik.setFieldValue(
                                    'ingredient',
                                    option?.value ?? '',
                                )
                            }}
                            onBlur={() =>
                                formik.setFieldTouched('ingredient', true)
                            }
                            invalid={Boolean(
                                getIn(formik.touched, 'ingredient') &&
                                getIn(formik.errors, 'ingredient'),
                            )}
                        />
                        <FieldError formik={formik} name="ingredient" />
                    </div>
                ) : (
                    <div className="storage-form-field">
                        <label htmlFor="storage-search">
                            Buscar {typeLabel}
                        </label>
                        <div className="storage-search-input">
                            <PiMagnifyingGlass />
                            <input
                                id="storage-search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder={`Buscar ${typeLabel}…`}
                            />
                        </div>
                        <select
                            id="storage-entity"
                            name={itemType}
                            value={selectedId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={optionsQuery.isPending}
                            className="storage-entity-select"
                        >
                            <option value="">
                                {optionsQuery.isPending
                                    ? 'Buscando…'
                                    : `Seleccionar ${typeLabel}…`}
                            </option>
                            {options.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                        {optionsQuery.isError && (
                            <span className="storage-field-error">
                                No se han podido cargar las opciones.
                            </span>
                        )}
                        <FieldError formik={formik} name={itemType} />
                    </div>
                )}

                {selectedOption && (
                    <div
                        className={`storage-selection storage-selection--${itemType}`}
                    >
                        {isComponent ? (
                            <PiCookingPot />
                        ) : isIngredient ? (
                            <PiCarrot />
                        ) : (
                            <PiBowlFood />
                        )}
                        <div>
                            <span>
                                {isComponent
                                    ? 'Componente seleccionado'
                                    : isIngredient
                                      ? 'Ingrediente seleccionado'
                                      : 'Receta seleccionada'}
                            </span>
                            <strong>{selectedOption.name}</strong>
                        </div>
                    </div>
                )}

                <div className="storage-form-field">
                    <label htmlFor="portions">
                        {isIngredient ? 'Unidades' : 'Raciones'}
                    </label>
                    <div className="storage-portions-stepper">
                        <button
                            type="button"
                            onClick={() =>
                                formik.setFieldValue(
                                    'portions',
                                    Math.max(
                                        isIngredient ? 1 : 0.25,
                                        Number(formik.values.portions) -
                                            (isIngredient ? 1 : 0.25),
                                    ),
                                )
                            }
                            aria-label={
                                isIngredient
                                    ? 'Restar una unidad'
                                    : 'Restar una porción'
                            }
                        >
                            <PiMinus />
                        </button>
                        <input
                            id="portions"
                            name="portions"
                            type="number"
                            min="0.01"
                            step={isIngredient ? '1' : '0.25'}
                            value={formik.values.portions}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <span>{isIngredient ? 'unidades' : 'raciones'}</span>
                        <button
                            type="button"
                            onClick={() =>
                                formik.setFieldValue(
                                    'portions',
                                    Number(formik.values.portions || 0) +
                                        (isIngredient ? 1 : 0.25),
                                )
                            }
                            aria-label={
                                isIngredient
                                    ? 'Añadir una unidad'
                                    : 'Añadir una porción'
                            }
                        >
                            <PiPlus />
                        </button>
                    </div>
                    <FieldError formik={formik} name="portions" />
                </div>

                <div className="storage-date-grid">
                    <div className="storage-form-field">
                        <label htmlFor="frozen_at">
                            {isIngredient
                                ? 'Fecha de almacenamiento'
                                : 'Fecha de congelación'}
                        </label>
                        <div className="storage-date-input">
                            <PiCalendarBlank />
                            <input
                                id="frozen_at"
                                name="frozen_at"
                                type="date"
                                value={formik.values.frozen_at}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <FieldError formik={formik} name="frozen_at" />
                    </div>
                    <div className="storage-form-field">
                        <label htmlFor="best_before">
                            Consumir antes de <span>(opcional)</span>
                        </label>
                        <div className="storage-date-input">
                            <PiCalendarBlank />
                            <input
                                id="best_before"
                                name="best_before"
                                type="date"
                                value={formik.values.best_before}
                                min={formik.values.frozen_at}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <FieldError formik={formik} name="best_before" />
                    </div>
                </div>

                <div className="storage-form-field">
                    <label htmlFor="notes">
                        Notas <span>(opcional)</span>
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formik.values.notes}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows="4"
                        maxLength="255"
                        placeholder="Ej: Guardado en el cajón superior…"
                    />
                    <div className="storage-character-count">
                        {formik.values.notes.length}/255
                    </div>
                    <FieldError formik={formik} name="notes" />
                </div>

                {formik.status && (
                    <div className="storage-submit-error" role="alert">
                        {formik.status}
                    </div>
                )}

                <button
                    type="submit"
                    className="storage-primary-button"
                    disabled={isSaving}
                >
                    <PiSnowflake />
                    {isSaving
                        ? 'Guardando…'
                        : isEditing
                          ? 'Guardar cambios'
                          : 'Añadir al storage'}
                </button>
            </form>
        </section>
    )
}

export default StorageForm
