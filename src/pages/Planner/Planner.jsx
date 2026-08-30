import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { mealPlansApi } from '@/api'
import PlannerForm from '@/components/Planner/PlannerForm'
import MealPlanView from '@/components/Planner/MealPlanView'
import { getClosestMonday } from '@/components/Planner/plannerDates'
import '@/components/Planner/planner.css'

function Planner() {
    const [settings, setSettings] = useState({
        start_date: getClosestMonday(),
        days: 5,
    })
    const [mealPlan, setMealPlan] = useState(null)
    const generatePlan = useMutation(mealPlansApi.mutations.generate())

    const handleGenerate = (nextSettings = settings) => {
        setSettings(nextSettings)
        generatePlan.mutate(nextSettings, {
            onSuccess: (data) => {
                console.log('Meal plan generado:', data)
                setMealPlan(data)
            },
        })
    }

    if (mealPlan) {
        return (
            <MealPlanView
                plan={mealPlan}
                isRegenerating={generatePlan.isPending}
                error={generatePlan.error}
                onBack={() => {
                    generatePlan.reset()
                    setMealPlan(null)
                }}
                onRegenerate={() => handleGenerate(settings)}
            />
        )
    }

    return (
        <PlannerForm
            initialValues={settings}
            isGenerating={generatePlan.isPending}
            error={generatePlan.error}
            onGenerate={handleGenerate}
        />
    )
}

export default Planner
