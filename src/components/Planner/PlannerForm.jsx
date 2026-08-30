import { useState } from 'react'
import {
    PiBowlFood,
    PiCalendarBlank,
    PiCheckCircle,
    PiCookingPot,
    PiFish,
    PiForkKnife,
    PiLeaf,
    PiMagicWand,
    PiSnowflake,
} from 'react-icons/pi'

const RULES = [
    [PiLeaf, 'Menú semanal variado y equilibrado'],
    [PiFish, 'Alternancia de legumbres, pescado y carne'],
    [PiCookingPot, 'Comidas y cenas diferentes cada día'],
    [PiSnowflake, 'Prioriza los ingredientes de tu storage'],
    [PiCheckCircle, 'Propuesta lista para revisar y ajustar'],
]

const errorText = (error) =>
    error?.response?.data?.detail ??
    error?.response?.data?.message ??
    'No hemos podido generar el menú. Vuelve a intentarlo.'

function PlannerForm({ initialValues, isGenerating, error, onGenerate }) {
    const [startDate, setStartDate] = useState(initialValues.start_date)
    const [days, setDays] = useState(initialValues.days)

    const submit = (event) => {
        event.preventDefault()
        onGenerate({ start_date: startDate, days: Number(days) })
    }

    return (
        <section className="planner-screen">
            <header className="planner-intro">
                <div>
                    <span className="planner-eyebrow">
                        Tu semana, organizada
                    </span>
                    <h1>Planificador</h1>
                    <p>Crea un menú personalizado en segundos.</p>
                </div>
                <div className="planner-hero" aria-hidden="true">
                    <PiBowlFood />
                    <i />
                    <i />
                    <i />
                </div>
            </header>

            <form className="planner-form" onSubmit={submit}>
                <div className="planner-field">
                    <label htmlFor="planner-start-date">
                        <PiCalendarBlank /> Fecha de inicio
                    </label>
                    <input
                        id="planner-start-date"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        required
                    />
                    <small>
                        Por defecto seleccionamos el lunes más cercano.
                    </small>
                </div>

                <div className="planner-field planner-days-field">
                    <div className="planner-field-heading">
                        <label htmlFor="planner-days">
                            <PiForkKnife /> Días a planificar
                        </label>
                        <output htmlFor="planner-days">{days} días</output>
                    </div>
                    <input
                        id="planner-days"
                        type="range"
                        min="1"
                        max="7"
                        value={days}
                        onChange={(event) =>
                            setDays(Number(event.target.value))
                        }
                        style={{
                            '--range-progress': `${((days - 1) / 6) * 100}%`,
                        }}
                    />
                    <div className="planner-range-labels" aria-hidden="true">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                    </div>
                </div>

                <section className="planner-rules">
                    <h2>Cómo crearemos tu menú</h2>
                    <ul>
                        {RULES.map(([Icon, text]) => (
                            <li key={text}>
                                <Icon />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {error && (
                    <p className="planner-error" role="alert">
                        {errorText(error)}
                    </p>
                )}
                <button
                    className="planner-primary-button"
                    type="submit"
                    disabled={isGenerating || !startDate}
                >
                    <PiMagicWand />{' '}
                    {isGenerating ? 'Creando tu menú…' : 'Generar menú semanal'}
                </button>
            </form>
        </section>
    )
}

export default PlannerForm
