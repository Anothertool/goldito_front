import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  PiBowlFood,
  PiCookingPot,
  PiDotsThreeVertical,
  PiPlus,
  PiSnowflake,
} from 'react-icons/pi'
import { componentsApi, freezerApi, recipesApi } from '@/api'
import './freezer.css'

const getResults = (data) => (Array.isArray(data) ? data : data?.results ?? [])
const getId = (value) => value?.id ?? value

const formatDate = (value) => {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES').format(new Date(year, month - 1, day))
}

function getEntity(item, componentsById, recipesById) {
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

function FreezerCard({ item, entity, onEdit, onDelete, deleting }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const bestBeforePassed = item.best_before && item.best_before < new Date().toISOString().slice(0, 10)

  return (
    <article className="freezer-card">
      <div className={`freezer-card__image freezer-card__image--${entity.type}`}>
        {entity.type === 'component' ? <PiCookingPot /> : <PiBowlFood />}
        <PiSnowflake className="freezer-card__flake" />
      </div>
      <div className="freezer-card__content">
        <div className="freezer-card__title-row">
          <span>{entity.type === 'component' ? 'Componente' : 'Receta'}</span>
          {bestBeforePassed && <em>Revisar</em>}
        </div>
        <h2>{entity.name}</h2>
        <strong>{Number(item.portions)} {Number(item.portions) === 1 ? 'ración' : 'raciones'}</strong>
        <p>Congelado: {formatDate(item.frozen_at)}</p>
        {item.best_before && <p>Consumir antes de: {formatDate(item.best_before)}</p>}
      </div>
      <div className="freezer-card__actions">
        <button
          type="button"
          aria-label={`Acciones para ${entity.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PiDotsThreeVertical />
        </button>
        {menuOpen && (
          <div className="freezer-menu">
            <button type="button" onClick={onEdit}>Editar</button>
            <button type="button" className="freezer-menu__danger" onClick={onDelete} disabled={deleting}>
              {deleting ? 'Quitando…' : 'Quitar del freezer'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function FreezerList() {
  const navigate = useNavigate()
  const freezerQuery = useQuery(freezerApi.queries.list({ page_size: 100, ordering: '-frozen_at' }))
  const componentsQuery = useQuery(componentsApi.queries.list({ page_size: 100 }))
  const recipesQuery = useQuery(recipesApi.queries.list({ page_size: 100 }))
  const removeItem = useMutation(freezerApi.mutations.remove())

  const items = getResults(freezerQuery.data)
  const components = getResults(componentsQuery.data)
  const recipes = getResults(recipesQuery.data)
  const componentsById = new Map(components.map((item) => [String(item.id), item]))
  const recipesById = new Map(recipes.map((item) => [String(item.id), item]))
  const enrichedItems = items.map((item) => ({
    item,
    entity: getEntity(item, componentsById, recipesById),
  }))
  const componentCount = enrichedItems.filter(({ entity }) => entity.type === 'component').length
  const recipeCount = enrichedItems.filter(({ entity }) => entity.type === 'recipe').length

  const handleDelete = (item, name) => {
    if (window.confirm(`¿Quieres quitar “${name}” del congelador?`)) {
      removeItem.mutate(item.id)
    }
  }

  return (
    <section className="freezer-screen">
      <header className="freezer-header">
        <div className="freezer-title">
          <PiSnowflake />
          <h1>Freezer</h1>
        </div>
        <button type="button" className="freezer-add-button" onClick={() => navigate('/freezer/nuevo')} aria-label="Añadir al congelador">
          <PiPlus />
        </button>
      </header>

      <div className="freezer-summary">
        <div className="freezer-summary__item freezer-summary__item--components">
          <span><PiCookingPot /> Componentes</span>
          <strong>{componentCount}</strong>
        </div>
        <div className="freezer-summary__item freezer-summary__item--recipes">
          <span><PiBowlFood /> Recetas</span>
          <strong>{recipeCount}</strong>
        </div>
      </div>

      {freezerQuery.isPending && (
        <div className="freezer-state" role="status"><span className="freezer-spinner" />Cargando congelador…</div>
      )}

      {freezerQuery.isError && (
        <div className="freezer-state freezer-state--error" role="alert">
          <p>No hemos podido cargar el congelador.</p>
          <button type="button" onClick={() => freezerQuery.refetch()}>Volver a intentar</button>
        </div>
      )}

      {!freezerQuery.isPending && !freezerQuery.isError && items.length === 0 && (
        <div className="freezer-state freezer-empty">
          <PiSnowflake />
          <h2>El congelador está vacío</h2>
          <p>Añade una receta o un componente para tenerlo siempre a mano.</p>
          <button type="button" onClick={() => navigate('/freezer/nuevo')}>Añadir al freezer</button>
        </div>
      )}

      <div className="freezer-list">
        {enrichedItems.map(({ item, entity }) => (
          <FreezerCard
            key={item.id}
            item={item}
            entity={entity}
            onEdit={() => navigate(`/freezer/${item.id}/editar`)}
            onDelete={() => handleDelete(item, entity.name)}
            deleting={removeItem.isPending && removeItem.variables === item.id}
          />
        ))}
      </div>

      {removeItem.isError && <p className="freezer-delete-error" role="alert">No se ha podido quitar el elemento.</p>}
    </section>
  )
}

export default FreezerList
