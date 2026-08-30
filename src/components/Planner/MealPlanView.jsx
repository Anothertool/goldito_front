import {
    PiArrowLeft,
    PiBowlFood,
    PiCalendarBlank,
    PiDrop,
    PiFish,
    PiLeaf,
    PiPawPrint,
    PiRepeat,
    PiSnowflake,
} from 'react-icons/pi'

const MEALS = {
    breakfast: 'Desayuno',
    lunch: 'Comida',
    dinner: 'Cena',
    snack: 'Merienda',
}
const SUMMARY = [
    ['legume', 'Legumbres', PiLeaf],
    ['fish', 'Pescado', PiFish],
    ['red_meat', 'Carne roja', PiPawPrint],
    ['white_meat', 'Carne blanca', PiDrop],
]
const localDate = (value) => {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}
const formatDate = (value, options) => {
    const date = localDate(value)
    return date ? new Intl.DateTimeFormat('es-ES', options).format(date) : value
}

function RecipeItem({ item }) {
    const recipe = item.recipe ?? {}
    const image = recipe.image ?? recipe.photo ?? recipe.image_url
    return (
        <article className="planner-recipe">
            <div className="planner-recipe-image">
                {image ? (
                    <img src={image} alt="" />
                ) : (
                    <PiBowlFood aria-hidden="true" />
                )}
            </div>
            <div>
                <span>{MEALS[item.meal_type] ?? item.meal_type}</span>
                <h3>{recipe.name ?? 'Receta por confirmar'}</h3>
            </div>
        </article>
    )
}

function StorageUsage({ items }) {
    if (!Array.isArray(items) || items.length === 0) return null
    return (
        <section className="planner-storage-usage">
            <h2>
                <PiSnowflake /> Aprovechamos tu storage
            </h2>
            <ul>
                {items.map((item, index) => (
                    <li key={item.id ?? index}>
                        <span>
                            {item.name ??
                                item.recipe?.name ??
                                item.component?.name ??
                                `Elemento ${index + 1}`}
                        </span>
                        {item.portions ? (
                            <strong>{item.portions} raciones</strong>
                        ) : null}
                    </li>
                ))}
            </ul>
        </section>
    )
}

function MealPlanView({ plan, isRegenerating, error, onBack, onRegenerate }) {
    const groupedDays = (Array.isArray(plan.items) ? plan.items : []).reduce(
        (map, item) => {
            const date = item.date ?? 'Sin fecha'
            if (!map.has(date)) map.set(date, [])
            map.get(date).push(item)
            return map
        },
        new Map(),
    )

    return (
        <section className="planner-screen planner-results">
            <header className="planner-results-header">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Volver a configurar"
                >
                    <PiArrowLeft />
                </button>
                <div>
                    <span>Tu propuesta semanal</span>
                    <h1>Sugerencia de menú</h1>
                </div>
            </header>
            <div className="planner-date-pill">
                <PiCalendarBlank />
                {formatDate(plan.start_date, {
                    day: 'numeric',
                    month: 'short',
                })}
                <span>—</span>
                {formatDate(plan.end_date, { day: 'numeric', month: 'short' })}
            </div>

            <section className="planner-summary" aria-label="Resumen del menú">
                {SUMMARY.map(([key, label, Icon]) => (
                    <div key={key}>
                        <Icon />
                        <strong>{plan.summary?.[key] ?? 0}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </section>

            {groupedDays.size ? (
                <div className="planner-menu-list">
                    {[...groupedDays].map(([date, items]) => (
                        <section className="planner-day-card" key={date}>
                            <header>
                                <strong>
                                    {formatDate(date, { weekday: 'long' })}
                                </strong>
                                <span>
                                    {formatDate(date, {
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </span>
                            </header>
                            <div className="planner-day-meals">
                                {items.map((item, index) => (
                                    <RecipeItem
                                        key={`${item.meal_type}-${item.recipe?.id ?? index}`}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="planner-empty-plan">
                    <PiBowlFood />
                    <h2>El menú no contiene platos</h2>
                    <p>Prueba a regenerarlo.</p>
                </div>
            )}

            <StorageUsage items={plan.storage_usage} />
            {error && (
                <p className="planner-error" role="alert">
                    No hemos podido regenerar el menú. El menú anterior sigue
                    disponible.
                </p>
            )}
            <div className="planner-results-actions">
                <button
                    type="button"
                    className="planner-secondary-button"
                    onClick={onBack}
                >
                    Ajustar fechas
                </button>
                <button
                    type="button"
                    className="planner-primary-button"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                >
                    <PiRepeat />{' '}
                    {isRegenerating ? 'Regenerando…' : 'Regenerar menú'}
                </button>
            </div>
        </section>
    )
}

export default MealPlanView
