import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    PiBowlFood,
    PiCarrot,
    PiCookingPot,
    PiDotsThreeVertical,
    PiPlus,
    PiSnowflake,
} from 'react-icons/pi'
import { componentsApi, ingredientsApi, recipesApi, storageApi } from '@/api'
import './storage.css'

const getResults = (data) =>
    Array.isArray(data) ? data : (data?.results ?? [])
const getId = (value) => value?.id ?? value

const formatDate = (value) => {
    if (!value) return ''
    const [year, month, day] = value.split('-').map(Number)
    return new Intl.DateTimeFormat('es-ES').format(
        new Date(year, month - 1, day),
    )
}

function getEntity(item, componentsById, recipesById, ingredientsById) {
    const componentValue = item.component_detail ?? item.component
    const componentId = getId(item.component_id ?? componentValue)

    if (componentId) {
        return {
            type: 'component',
            name:
                item.component_name ??
                componentValue?.name ??
                componentsById.get(String(componentId))?.name ??
                `Componente ${componentId}`,
        }
    }

    const ingredientValue = item.ingredient_detail ?? item.ingredient
    const ingredientId = getId(item.ingredient_id ?? ingredientValue)
    if (ingredientId) {
        return {
            type: 'ingredient',
            name:
                item.ingredient_name ??
                ingredientValue?.name ??
                ingredientsById.get(String(ingredientId))?.name ??
                `Ingrediente ${ingredientId}`,
        }
    }

    const recipeValue = item.recipe_detail ?? item.recipe
    const recipeId = getId(item.recipe_id ?? recipeValue)
    return {
        type: 'recipe',
        name:
            item.recipe_name ??
            recipeValue?.name ??
            recipesById.get(String(recipeId))?.name ??
            `Receta ${recipeId}`,
    }
}

function StorageCard({ item, entity, onEdit, onDelete, deleting }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const bestBeforePassed =
        item.best_before &&
        item.best_before < new Date().toISOString().slice(0, 10)

    return (
        <article className="storage-card">
            <div
                className={`storage-card__image storage-card__image--${entity.type}`}
            >
                {entity.type === 'component' ? (
                    <PiCookingPot />
                ) : entity.type === 'ingredient' ? (
                    <PiCarrot />
                ) : (
                    <PiBowlFood />
                )}
                <PiSnowflake className="storage-card__flake" />
            </div>
            <div className="storage-card__content">
                <div className="storage-card__title-row">
                    <span>
                        {entity.type === 'component'
                            ? 'Componente'
                            : entity.type === 'ingredient'
                              ? 'Ingrediente'
                              : 'Receta'}
                    </span>
                    {bestBeforePassed && <em>Revisar</em>}
                </div>
                <h2>{entity.name}</h2>
                <strong>
                    {Number(item.portions)}{' '}
                    {entity.type === 'ingredient'
                        ? Number(item.portions) === 1
                            ? 'unidad'
                            : 'unidades'
                        : Number(item.portions) === 1
                          ? 'ración'
                          : 'raciones'}
                </strong>
                <p>
                    {entity.type === 'ingredient' ? 'Guardado' : 'Congelado'}:{' '}
                    {formatDate(item.frozen_at)}
                </p>
                {item.best_before && (
                    <p>Consumir antes de: {formatDate(item.best_before)}</p>
                )}
            </div>
            <div className="storage-card__actions">
                <button
                    type="button"
                    aria-label={`Acciones para ${entity.name}`}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <PiDotsThreeVertical />
                </button>
                {menuOpen && (
                    <div className="storage-menu">
                        <button type="button" onClick={onEdit}>
                            Editar
                        </button>
                        <button
                            type="button"
                            className="storage-menu__danger"
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Quitando…' : 'Quitar del storage'}
                        </button>
                    </div>
                )}
            </div>
        </article>
    )
}

function StorageList() {
    const navigate = useNavigate()
    const storageQuery = useQuery(
        storageApi.queries.list({ page_size: 100, ordering: '-frozen_at' }),
    )
    const componentsQuery = useQuery(
        componentsApi.queries.list({ page_size: 100 }),
    )
    const recipesQuery = useQuery(recipesApi.queries.list({ page_size: 100 }))
    const ingredientsQuery = useQuery(
        ingredientsApi.queries.list({ page_size: 100 }),
    )
    const removeItem = useMutation(storageApi.mutations.remove())

    const items = getResults(storageQuery.data)
    const components = getResults(componentsQuery.data)
    const recipes = getResults(recipesQuery.data)
    const ingredients = getResults(ingredientsQuery.data)
    const componentsById = new Map(
        components.map((item) => [String(item.id), item]),
    )
    const recipesById = new Map(recipes.map((item) => [String(item.id), item]))
    const ingredientsById = new Map(
        ingredients.map((item) => [String(item.id), item]),
    )
    const enrichedItems = items.map((item) => ({
        item,
        entity: getEntity(item, componentsById, recipesById, ingredientsById),
    }))
    const componentCount = enrichedItems.filter(
        ({ entity }) => entity.type === 'component',
    ).length
    const recipeCount = enrichedItems.filter(
        ({ entity }) => entity.type === 'recipe',
    ).length
    const ingredientCount = enrichedItems.filter(
        ({ entity }) => entity.type === 'ingredient',
    ).length

    const handleDelete = (item, name) => {
        if (window.confirm(`¿Quieres quitar “${name}” del congelador?`)) {
            removeItem.mutate(item.id)
        }
    }

    return (
        <section className="storage-screen">
            <header className="storage-header">
                <div className="storage-title">
                    <PiSnowflake />
                    <h1>Storage</h1>
                </div>
                <button
                    type="button"
                    className="storage-add-button"
                    onClick={() => navigate('/storage/nuevo')}
                    aria-label="Añadir al congelador"
                >
                    <PiPlus />
                </button>
            </header>

            <div className="storage-summary">
                <div className="storage-summary__item storage-summary__item--components">
                    <span>
                        <PiCookingPot /> Componentes
                    </span>
                    <strong>{componentCount}</strong>
                </div>
                <div className="storage-summary__item storage-summary__item--recipes">
                    <span>
                        <PiBowlFood /> Recetas
                    </span>
                    <strong>{recipeCount}</strong>
                </div>
                <div className="storage-summary__item storage-summary__item--ingredients">
                    <span>
                        <PiCarrot /> Ingredientes
                    </span>
                    <strong>{ingredientCount}</strong>
                </div>
            </div>

            {storageQuery.isPending && (
                <div className="storage-state" role="status">
                    <span className="storage-spinner" />
                    Cargando congelador…
                </div>
            )}

            {storageQuery.isError && (
                <div
                    className="storage-state storage-state--error"
                    role="alert"
                >
                    <p>No hemos podido cargar el congelador.</p>
                    <button
                        type="button"
                        onClick={() => storageQuery.refetch()}
                    >
                        Volver a intentar
                    </button>
                </div>
            )}

            {!storageQuery.isPending &&
                !storageQuery.isError &&
                items.length === 0 && (
                    <div className="storage-state storage-empty">
                        <PiSnowflake />
                        <h2>El congelador está vacío</h2>
                        <p>
                            Añade una receta, un componente o un ingrediente
                            para tenerlo siempre a mano.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/storage/nuevo')}
                        >
                            Añadir al storage
                        </button>
                    </div>
                )}

            <div className="storage-list">
                {enrichedItems.map(({ item, entity }) => (
                    <StorageCard
                        key={item.id}
                        item={item}
                        entity={entity}
                        onEdit={() => navigate(`/storage/${item.id}/editar`)}
                        onDelete={() => handleDelete(item, entity.name)}
                        deleting={
                            removeItem.isPending &&
                            removeItem.variables === item.id
                        }
                    />
                ))}
            </div>

            {removeItem.isError && (
                <p className="storage-delete-error" role="alert">
                    No se ha podido quitar el elemento.
                </p>
            )}
        </section>
    )
}

export default StorageList
