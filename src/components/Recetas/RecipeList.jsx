import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  PiBowlFood,
  PiCaretLeft,
  PiCaretRight,
  PiClock,
  PiDotsThreeVertical,
  PiFunnel,
  PiMagnifyingGlass,
  PiPlus,
  PiUsers,
} from 'react-icons/pi'
import { recipesApi } from '@/api'
import './recetas.css'

const mealTypeLabels = {
  lunch: 'Comida',
  dinner: 'Cena',
}

function useDebouncedValue(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}

const getResults = (data) => (Array.isArray(data) ? data : data?.results ?? [])

function RecipeCard({ recipe, onEdit, onDelete, deleting }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const tags = recipe.tags ?? []
  const image = recipe.image ?? recipe.photo ?? recipe.image_url

  return (
    <article className="recipe-card">
      <div className="recipe-card__image">
        {image ? <img src={image} alt="" /> : <PiBowlFood aria-hidden="true" />}
      </div>

      <div className="recipe-card__content">
        <h2>{recipe.name}</h2>
        {recipe.description && <p className="recipe-card__description">{recipe.description}</p>}

        <div className="recipe-card__tags">
          {recipe.meal_type && <span>{mealTypeLabels[recipe.meal_type]}</span>}
          {tags.slice(0, 3).map((tag) => (
            <span key={tag.id ?? tag}>{tag.name ?? tag}</span>
          ))}
        </div>

        <div className="recipe-card__meta">
          <span><PiUsers /> {recipe.servings ?? 2} raciones</span>
          {recipe.active_time_minutes !== null && recipe.active_time_minutes !== undefined && (
            <span><PiClock /> {recipe.active_time_minutes} min</span>
          )}
        </div>
      </div>

      <div className="recipe-card__actions">
        <button
          type="button"
          className="icon-button icon-button--plain"
          aria-label={`Acciones para ${recipe.name}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <PiDotsThreeVertical />
        </button>
        {menuOpen && (
          <div className="recipe-menu">
            <button type="button" onClick={onEdit}>Editar</button>
            <button type="button" className="recipe-menu__danger" onClick={onDelete} disabled={deleting}>
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function RecipeList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [mealType, setMealType] = useState('')
  const [active, setActive] = useState('true')
  const [ordering, setOrdering] = useState('-updated_at')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const params = {
    page,
    page_size: 20,
    ordering,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(mealType && { meal_type: mealType }),
    ...(active && { is_active: active }),
  }

  const recipesQuery = useQuery(recipesApi.queries.list(params))
  const deleteRecipe = useMutation(recipesApi.mutations.remove())
  const recipes = getResults(recipesQuery.data)
  const count = recipesQuery.data?.count ?? recipes.length
  const totalPages = Math.max(1, Math.ceil(count / 20))
  const handleDelete = (recipe) => {
    if (window.confirm(`¿Quieres eliminar “${recipe.name}”?`)) {
      deleteRecipe.mutate(recipe.id)
    }
  }

  return (
    <section className="recipes-screen">
      <header className="recipes-header">
        <div className="recipes-title">
          <span className="recipes-title__icon"><PiBowlFood /></span>
          <h1>Recetas</h1>
        </div>
        <button type="button" className="add-recipe-button" onClick={() => navigate('/recetas/nueva')} aria-label="Crear receta">
          <PiPlus />
        </button>
      </header>

      <div className="recipe-search-row">
        <label className="recipe-search">
          <PiMagnifyingGlass aria-hidden="true" />
            <input
                value={search}
                onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
                }}
                placeholder="Buscar recetas…"
                aria-label="Buscar recetas"
            />
        </label>
        <button
          type="button"
          className={`filter-button ${filtersOpen ? 'filter-button--active' : ''}`}
          onClick={() => setFiltersOpen((open) => !open)}
          aria-label="Mostrar filtros"
          aria-expanded={filtersOpen}
        >
          <PiFunnel />
        </button>
      </div>

      {filtersOpen && (
         <div className="recipe-filters">
          <label>
            Tipo de comida
            <select value={mealType} onChange={(event) => {
              setMealType(event.target.value)
              setPage(1)
            }}>
              <option value="">Todos</option>
              <option value="lunch">Comida</option>
              <option value="dinner">Cena</option>
            </select>
          </label>
          <label>
            Estado
            <select value={active} onChange={(event) => {
              setActive(event.target.value)
              setPage(1)
            }}>
              <option value="">Todos</option>
              <option value="true">Activas</option>
              <option value="false">Inactivas</option>
            </select>
          </label>
          <label>
            Ordenar
            <select value={ordering} onChange={(event) => {
              setOrdering(event.target.value)
              setPage(1)
            }}>
              <option value="-updated_at">Última actualización</option>
              <option value="name">Nombre A–Z</option>
              <option value="-name">Nombre Z–A</option>
            </select>
          </label>
        </div>
      )}

      {recipesQuery.isPending && (
        <div className="recipe-state" role="status"><span className="recipe-spinner" />Cargando recetas…</div>
      )}

      {recipesQuery.isError && (
        <div className="recipe-state recipe-state--error" role="alert">
          <p>No hemos podido cargar las recetas.</p>
          <button type="button" onClick={() => recipesQuery.refetch()}>Volver a intentar</button>
        </div>
      )}

      {!recipesQuery.isPending && !recipesQuery.isError && recipes.length === 0 && (
        <div className="recipe-state recipe-empty">
          <PiBowlFood />
          <h2>{search ? 'No hay resultados' : 'Tu recetario está vacío'}</h2>
          <p>{search ? 'Prueba con otra búsqueda o cambia los filtros.' : 'Crea tu primera receta para verla aquí.'}</p>
          {!search && <button type="button" onClick={() => navigate('/recetas/nueva')}>Crear receta</button>}
        </div>
      )}

      <div className="recipe-list">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={() => navigate(`/recetas/${recipe.id}/editar`)}
            onDelete={() => handleDelete(recipe)}
            deleting={deleteRecipe.isPending && deleteRecipe.variables === recipe.id}
          />
        ))}
      </div>

      {deleteRecipe.isError && (
        <p className="recipe-delete-error" role="alert">No se ha podido eliminar la receta.</p>
      )}

      {totalPages > 1 && (
        <nav className="recipe-pagination" aria-label="Paginación de recetas">
          <button type="button" disabled={!recipesQuery.data?.previous} onClick={() => setPage((value) => value - 1)}>
            <PiCaretLeft /> Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={!recipesQuery.data?.next} onClick={() => setPage((value) => value + 1)}>
            Siguiente <PiCaretRight />
          </button>
        </nav>
      )}
    </section>
  )
}

export default RecipeList
