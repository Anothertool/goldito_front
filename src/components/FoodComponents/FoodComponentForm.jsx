import { useMemo } from 'react'
import { FormikProvider, getIn, useFormik } from 'formik'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { PiArrowLeft, PiCookingPot, PiSnowflake } from 'react-icons/pi'
import { componentsApi } from '@/api'
import IngredientsField from '@/components/Ingredients/IngredientsField'
import {
    getComponentInitialValues,
    toComponentPayload,
    validationSchema,
} from './utils'
import './food-components.css'

function FieldError({ formik, name }) {
    const error = getIn(formik.errors, name)
    const touched = getIn(formik.touched, name)
    if (!touched || !error || typeof error !== 'string') return null
    return <span className="food-component-field-error">{error}</span>
}

function getApiError(apiErrors) {
    if (!apiErrors) return 'No se ha podido guardar el componente.'
    if (typeof apiErrors === 'string') return apiErrors
    if (apiErrors.detail) return apiErrors.detail

    const firstError = Object.values(apiErrors).flat()[0]
    return firstError ?? 'No se ha podido guardar el componente.'
}

function FoodComponentForm() {
    const navigate = useNavigate()
    const { componentId } = useParams()
    const isEditing = Boolean(componentId)
    const componentQuery = useQuery(componentsApi.queries.detail(componentId))
    const createComponent = useMutation(componentsApi.mutations.create())
    const updateComponent = useMutation(componentsApi.mutations.partialUpdate())
    const formInitialValues = useMemo(
        () => getComponentInitialValues(componentQuery.data),
        [componentQuery.data],
    )

    const formik = useFormik({
        initialValues: formInitialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, helpers) => {
            helpers.setStatus(null)

            try {
                const payload = toComponentPayload(values)
                if (isEditing) {
                    await updateComponent.mutateAsync({
                        id: componentId,
                        data: payload,
                    })
                } else {
                    await createComponent.mutateAsync(payload)
                }
                navigate('/componentes')
            } catch (error) {
                const apiErrors = error.response?.data
                if (apiErrors?.name) {
                    helpers.setFieldError(
                        'name',
                        Array.isArray(apiErrors.name)
                            ? apiErrors.name.join(' ')
                            : apiErrors.name,
                    )
                }
                helpers.setStatus(getApiError(apiErrors))
            }
        },
    })

    const isSaving = createComponent.isPending || updateComponent.isPending

    if (isEditing && componentQuery.isPending) {
        return (
            <div className="food-component-form-state">
                <span className="food-components-spinner" />
                Cargando componente…
            </div>
        )
    }

    if (isEditing && componentQuery.isError) {
        return (
            <div className="food-component-form-state food-components-state--error">
                <p>No hemos podido abrir este componente.</p>
                <button type="button" onClick={() => navigate('/componentes')}>
                    Volver al listado
                </button>
            </div>
        )
    }

    return (
        <FormikProvider value={formik}>
            <section className="food-component-form-screen">
                <header className="food-component-form-header">
                    <button
                        type="button"
                        className="food-component-back"
                        onClick={() => navigate('/componentes')}
                        aria-label="Volver"
                    >
                        <PiArrowLeft />
                    </button>
                    <h1>
                        {isEditing ? 'Editar componente' : 'Crear componente'}
                    </h1>
                    <button
                        type="submit"
                        form="food-component-form"
                        className="food-component-save"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Guardando…' : 'Guardar'}
                    </button>
                </header>

                <form
                    id="food-component-form"
                    className="food-component-form"
                    onSubmit={formik.handleSubmit}
                    noValidate
                >
                    <div className="food-component-form-hero">
                        <span>
                            <PiCookingPot />
                        </span>
                        <div>
                            <strong>Preparación reutilizable</strong>
                            <p>
                                Crea bases, salsas o guarniciones para usarlas
                                en varias recetas.
                            </p>
                        </div>
                    </div>

                    <div className="food-component-form-field">
                        <label htmlFor="name">Nombre del componente</label>
                        <input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            maxLength="150"
                            placeholder="Ej: Salsa de curry"
                            className={
                                formik.touched.name && formik.errors.name
                                    ? 'has-error'
                                    : ''
                            }
                        />
                        <FieldError formik={formik} name="name" />
                    </div>

                    <IngredientsField formik={formik} />

                    <div className="food-component-form-field">
                        <label htmlFor="description">
                            Descripción <span>(opcional)</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            rows="4"
                            placeholder="Describe brevemente esta preparación…"
                        />
                    </div>

                    <section className="food-component-life-section">
                        <div className="food-component-life-heading">
                            <h2>Conservación</h2>
                            <p>Déjalo vacío si todavía no lo sabes.</p>
                        </div>
                        <div className="food-component-life-grid">
                            <div className="food-component-life-card food-component-life-card--fridge">
                                <span className="food-component-life-icon">
                                    F
                                </span>
                                <label htmlFor="fridge_life_days">
                                    Días en nevera
                                </label>
                                <div>
                                    <input
                                        id="fridge_life_days"
                                        name="fridge_life_days"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formik.values.fridge_life_days}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="3"
                                    />
                                    <span>días</span>
                                </div>
                                <FieldError
                                    formik={formik}
                                    name="fridge_life_days"
                                />
                            </div>
                            <div className="food-component-life-card food-component-life-card--storage">
                                <span className="food-component-life-icon">
                                    <PiSnowflake />
                                </span>
                                <label htmlFor="freezer_life_days">
                                    Días en congelador
                                </label>
                                <div>
                                    <input
                                        id="freezer_life_days"
                                        name="freezer_life_days"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formik.values.freezer_life_days}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="30"
                                    />
                                    <span>días</span>
                                </div>
                                <FieldError
                                    formik={formik}
                                    name="freezer_life_days"
                                />
                            </div>
                        </div>
                    </section>

                    {formik.status && (
                        <div
                            className="food-component-submit-error"
                            role="alert"
                        >
                            {formik.status}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="food-component-primary-button"
                        disabled={isSaving}
                    >
                        <PiCookingPot />
                        {isSaving
                            ? 'Guardando…'
                            : isEditing
                              ? 'Guardar cambios'
                              : 'Crear componente'}
                    </button>
                </form>
            </section>
        </FormikProvider>
    )
}

export default FoodComponentForm
