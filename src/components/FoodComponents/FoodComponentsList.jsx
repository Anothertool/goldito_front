import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  PiCaretLeft,
  PiCaretRight,
  PiCookingPot,
  PiDotsThreeVertical,
  PiFunnel,
  PiMagnifyingGlass,
  PiPlus,
  PiSnowflake,
} from 'react-icons/pi'
import { componentsApi } from '@/api'
import './food-components.css'

function useDebouncedValue(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}

const getResults = (data) => (Array.isArray(data) ? data : data?.results ?? [])

function ComponentCard({ component, onEdit, onDelete, deleting }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article className={`food-component-card ${!component.is_active ? 'food-component-card--inactive' : ''}`}>
      <div className="food-component-card__image">
        <PiCookingPot />
      </div>
      <div className="food-component-card__content">
        <div className="food-component-card__heading">
          <h2>{component.name}</h2>
          <span className={component.is_active ? 'is-active' : 'is-inactive'}>
            {component.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        {component.description && <p>{component.description}</p>}
        <div className="food-component-card__life">
          <span>
            <i>F</i>
            {component.fridge_life_days === null || component.fridge_life_days === undefined
              ? 'Nevera sin definir'
              : `${component.fridge_life_days} días en nevera`}
          </span>
          <span>
            <PiSnowflake />
            {component.storage_life_days === null || component.storage_life_days === undefined
              ? 'Storage sin definir'
              : `${component.storage_life_days} días congelado`}
          </span>
        </div>
      </div>
      <div className="food-component-card__actions">
        <button
          type="button"
          aria-label={`Acciones para ${component.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PiDotsThreeVertical />
        </button>
        {menuOpen && (
          <div className="food-component-menu">
            <button type="button" onClick={onEdit}>Editar</button>
            <button type="button" className="food-component-menu__danger" onClick={onDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function FoodComponentsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [active, setActive] = useState('true')
  const [ordering, setOrdering] = useState('name')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const params = {
    page,
    page_size: 20,
    ordering,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(active && { is_active: active }),
  }
  const componentsQuery = useQuery(componentsApi.queries.list(params))
  const deleteComponent = useMutation(componentsApi.mutations.remove())
  const components = getResults(componentsQuery.data)
  const count = componentsQuery.data?.count ?? components.length
  const totalPages = Math.max(1, Math.ceil(count / 20))

  const handleDelete = (component) => {
    if (window.confirm(`¿Quieres eliminar “${component.name}”?`)) {
      deleteComponent.mutate(component.id)
    }
  }

  return (
    <section className="food-components-screen">
      <header className="food-components-header">
        <div className="food-components-title">
          <span><PiCookingPot /></span>
          <div>
            <h1>Componentes</h1>
            <p>Bases y preparaciones reutilizables</p>
          </div>
        </div>
        <button type="button" className="food-components-add" onClick={() => navigate('/componentes/nuevo')} aria-label="Crear componente">
          <PiPlus />
        </button>
      </header>

      <div className="food-components-search-row">
        <label className="food-components-search">
          <PiMagnifyingGlass />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar componentes…"
            aria-label="Buscar componentes"
          />
        </label>
        <button
          type="button"
          className={`food-components-filter-button ${filtersOpen ? 'is-open' : ''}`}
          onClick={() => setFiltersOpen((open) => !open)}
          aria-label="Mostrar filtros"
          aria-expanded={filtersOpen}
        >
          <PiFunnel />
        </button>
      </div>

      {filtersOpen && (
        <div className="food-components-filters">
          <label>
            Estado
            <select value={active} onChange={(event) => {
              setActive(event.target.value)
              setPage(1)
            }}>
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <label>
            Ordenar
            <select value={ordering} onChange={(event) => {
              setOrdering(event.target.value)
              setPage(1)
            }}>
              <option value="name">Nombre A–Z</option>
              <option value="-name">Nombre Z–A</option>
              <option value="-updated_at">Última actualización</option>
            </select>
          </label>
        </div>
      )}

      {componentsQuery.isPending && (
        <div className="food-components-state" role="status"><span className="food-components-spinner" />Cargando componentes…</div>
      )}

      {componentsQuery.isError && (
        <div className="food-components-state food-components-state--error" role="alert">
          <p>No hemos podido cargar los componentes.</p>
          <button type="button" onClick={() => componentsQuery.refetch()}>Volver a intentar</button>
        </div>
      )}

      {!componentsQuery.isPending && !componentsQuery.isError && components.length === 0 && (
        <div className="food-components-state food-components-empty">
          <PiCookingPot />
          <h2>{search ? 'No hay resultados' : 'No hay componentes todavía'}</h2>
          <p>{search ? 'Prueba otra búsqueda o cambia los filtros.' : 'Crea una base o preparación para reutilizarla en tus recetas.'}</p>
          {!search && <button type="button" onClick={() => navigate('/componentes/nuevo')}>Crear componente</button>}
        </div>
      )}

      <div className="food-components-list">
        {components.map((component) => (
          <ComponentCard
            key={component.id}
            component={component}
            onEdit={() => navigate(`/componentes/${component.id}/editar`)}
            onDelete={() => handleDelete(component)}
            deleting={deleteComponent.isPending && deleteComponent.variables === component.id}
          />
        ))}
      </div>

      {deleteComponent.isError && (
        <p className="food-components-delete-error" role="alert">
          No se ha podido eliminar. Puede estar utilizado en una receta o en storage.
        </p>
      )}

      {totalPages > 1 && (
        <nav className="food-components-pagination" aria-label="Paginación de componentes">
          <button type="button" disabled={!componentsQuery.data?.previous} onClick={() => setPage((value) => value - 1)}><PiCaretLeft /> Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={!componentsQuery.data?.next} onClick={() => setPage((value) => value + 1)}>Siguiente <PiCaretRight /></button>
        </nav>
      )}
    </section>
  )
}

export default FoodComponentsList
