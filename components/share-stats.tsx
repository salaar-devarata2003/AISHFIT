"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import type { WorkoutSession, BodyWeightEntry } from "@/app/page"
import { useToast } from "@/hooks/use-toast"

interface ShareStatsProps {
  workouts: WorkoutSession[]
  bodyWeights: BodyWeightEntry[]
}

export function ShareStats({ workouts, bodyWeights }: ShareStatsProps) {
  const { toast } = useToast()

  const generateStatsMessage = () => {
    const totalWorkouts = workouts.length
    const totalExercises = workouts.reduce((acc, w) => acc + w.exercises.length, 0)
    const totalSets = workouts.reduce((acc, w) => acc + w.exercises.reduce((eAcc, e) => eAcc + e.sets.length, 0), 0)

    const allExercises = new Map<string, { maxWeight: number; totalVolume: number; sessions: number }>()

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const current = allExercises.get(exercise.exerciseName) || { maxWeight: 0, totalVolume: 0, sessions: 0 }
        const maxWeight = Math.max(...exercise.sets.map((s) => s.weight))
        const volume = exercise.sets.reduce((acc, set) => acc + set.reps * set.weight, 0)

        allExercises.set(exercise.exerciseName, {
          maxWeight: Math.max(current.maxWeight, maxWeight),
          totalVolume: current.totalVolume + volume,
          sessions: current.sessions + 1,
        })
      })
    })

    const topExercises = Array.from(allExercises.entries())
      .sort((a, b) => b[1].totalVolume - a[1].totalVolume)
      .slice(0, 3)

    let message = `*💪 My Workout Progress Stats*\n\n`
    message += `📊 *Overall Stats:*\n`
    message += `• Total Workouts: ${totalWorkouts}\n`
    message += `• Total Exercises: ${totalExercises}\n`
    message += `• Total Sets: ${totalSets}\n\n`

    if (topExercises.length > 0) {
      message += `🏋️ *Top 3 Exercises by Volume:*\n`
      topExercises.forEach(([name, stats], index) => {
        message += `${index + 1}. ${name}\n`
        message += `   • Max Weight: ${stats.maxWeight.toFixed(1)} kg\n`
        message += `   • Total Volume: ${stats.totalVolume.toFixed(0)} kg\n`
        message += `   • Sessions: ${stats.sessions}\n`
      })
      message += `\n`
    }

    if (bodyWeights.length > 0) {
      const currentWeight = bodyWeights[0].weight
      const oldestWeight = bodyWeights[bodyWeights.length - 1].weight
      const change = currentWeight - oldestWeight

      message += `⚖️ *Body Weight:*\n`
      message += `• Current: ${currentWeight.toFixed(1)} kg\n`
      message += `• Change: ${change > 0 ? "+" : ""}${change.toFixed(1)} kg\n`
    }

    message += `\n_Tracked with Workout Tracker App_`

    return message
  }

  const handleShare = () => {
    if (workouts.length === 0) {
      toast({
        title: "No Data",
        description: "Log some workouts first to share your stats!",
        variant: "destructive",
      })
      return
    }

    const message = generateStatsMessage()
    const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(message)

    window.open(whatsappUrl, "_blank")

    toast({
      title: "Opening WhatsApp",
      description: "Your stats are ready to share!",
    })
  }

  return (
    <Button onClick={handleShare} variant="outline" className="gap-2 bg-transparent">
      <Share2 className="w-4 h-4" />
      Share Stats
    </Button>
  )
}
