import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { mealPlansApi } from '@/api'
import PlannerForm from '@/components/Planner/PlannerForm'
import MealPlanView from '@/components/Planner/MealPlanView'
import { getClosestMonday } from '@/components/Planner/plannerDates'

function Planner() {
    const location = useLocation()
    const restoredState = location.state
    const [settings, setSettings] = useState(
        restoredState?.settings ?? {
            start_date: getClosestMonday(),
            days: 5,
        },
    )
    const [mealPlan, setMealPlan] = useState(restoredState?.mealPlan ?? null)
    const [confirmed, setConfirmed] = useState(false)
    const [hasEditedRecipes, setHasEditedRecipes] = useState(false)
    const generatePlan = useMutation(mealPlansApi.mutations.generate())
    const confirmPlan = useMutation(mealPlansApi.mutations.create())

    const handleGenerate = (nextSettings = settings) => {
        setSettings(nextSettings)
        confirmPlan.reset()
        generatePlan.mutate(
            {
                start_date: nextSettings.start_date,
                days: nextSettings.days,
                priority_recipes: nextSettings.priority_recipes ?? [],
                priority_components: nextSettings.priority_components ?? [],
                priority_ingredients: nextSettings.priority_ingredients ?? [],
            },
            {
                onSuccess: (data) => {
                    setMealPlan(data)
                    setConfirmed(false)
                    setHasEditedRecipes(false)
                },
            },
        )
    }

    const handleRecipeChange = (itemIndex, recipe) => {
        confirmPlan.reset()
        setHasEditedRecipes(true)
        setMealPlan((current) => ({
            ...current,
            items: current.items.map((item, index) =>
                index === itemIndex
                    ? { ...item, recipe_id: recipe.id, recipe }
                    : item,
            ),
        }))
    }

    const handleConfirm = () => {
        if (!mealPlan || confirmPlan.isPending) return
        confirmPlan.mutate(
            {
                start_date: mealPlan.start_date,
                end_date: mealPlan.end_date,
                items: mealPlan.items.map(({ date, meal_type, recipe_id }) => ({
                    date,
                    meal_type,
                    recipe_id,
                })),
            },
            {
                onSuccess: (data) => {
                    setMealPlan(data)
                    setConfirmed(true)
                },
            },
        )
    }

    if (mealPlan) {
        return (
            <MealPlanView
                plan={mealPlan}
                isRegenerating={generatePlan.isPending}
                error={generatePlan.error}
                confirmError={confirmPlan.error}
                isConfirming={confirmPlan.isPending}
                confirmed={confirmed}
                hasEditedRecipes={hasEditedRecipes}
                onConfirm={handleConfirm}
                onRecipeChange={handleRecipeChange}
                onBack={() => {
                    generatePlan.reset()
                    confirmPlan.reset()
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
