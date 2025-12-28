"use client"

import { useMemo } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkoutSession } from "@/app/page"
import { Flame, Trophy, TrendingUp, Calendar, Dumbbell } from "lucide-react"

interface StatsOverviewProps {
  workouts: WorkoutSession[]
}

export function StatsOverview({ workouts }: StatsOverviewProps) {
  const stats = useMemo(() => {
    if (workouts.length === 0) return null

    // Calculate training streak
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)

      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0 || daysDiff === 1) {
        streak++
        currentDate = workoutDate
      } else {
        break
      }
    }

    // Calculate Personal Records (PRs)
    const exercisePRs = new Map<string, { weight: number; date: string; reps: number }>()

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          const current = exercisePRs.get(exercise.exerciseName)
          if (!current || set.weight > current.weight) {
            exercisePRs.set(exercise.exerciseName, {
              weight: set.weight,
              date: workout.date,
              reps: set.reps,
            })
          }
        })
      })
    })

    const topPRs = Array.from(exercisePRs.entries())
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 3)

    // Calculate total volume by muscle group
    const volumeByMuscleGroup = new Map<string, number>()

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        const muscleGroup = exercise.muscleGroup || "Other"
        const volume = exercise.sets.reduce((acc, set) => acc + set.reps * set.weight, 0)
        volumeByMuscleGroup.set(muscleGroup, (volumeByMuscleGroup.get(muscleGroup) || 0) + volume)
      })
    })

    const topMuscleGroups = Array.from(volumeByMuscleGroup.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    // Calculate average workout duration
    const workoutsWithDuration = workouts.filter((w) => w.duration && w.duration > 0)
    const avgDuration =
      workoutsWithDuration.length > 0
        ? workoutsWithDuration.reduce((acc, w) => acc + (w.duration || 0), 0) / workoutsWithDuration.length
        : 0

    return {
      streak,
      topPRs,
      topMuscleGroups,
      totalVolume: Array.from(volumeByMuscleGroup.values()).reduce((acc, v) => acc + v, 0),
      avgDuration: Math.round(avgDuration),
      totalWorkouts: workouts.length,
    }
  }, [workouts])

  if (!stats || workouts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      <Card className="border-2 border-orange-500/20 bg-orange-500/5">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <CardDescription className="text-xs">Streak</CardDescription>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-orange-500">
            {stats.streak}
            <span className="text-sm ml-1 text-muted-foreground">{stats.streak === 1 ? "day" : "days"}</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <CardDescription className="text-xs">Top PRs</CardDescription>
          </div>
          <div className="space-y-1">
            {stats.topPRs.length > 0 ? (
              stats.topPRs.slice(0, 2).map(([exercise, pr]) => (
                <div key={exercise} className="text-xs truncate">
                  <span className="font-semibold">{exercise}:</span> {pr.weight}kg
                </div>
              ))
            ) : (
              <CardTitle className="text-2xl">0 PRs</CardTitle>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-2 border-blue-500/20 bg-blue-500/5">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <CardDescription className="text-xs">Volume</CardDescription>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-blue-500">{(stats.totalVolume / 1000).toFixed(1)}t</CardTitle>
          <p className="text-xs text-muted-foreground truncate">Top: {stats.topMuscleGroups[0]?.[0] || "N/A"}</p>
        </CardHeader>
      </Card>

      <Card className="border-2 border-purple-500/20 bg-purple-500/5">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <CardDescription className="text-xs">Avg Duration</CardDescription>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-purple-500">
            {stats.avgDuration}
            <span className="text-sm ml-1 text-muted-foreground">min</span>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-green-500" />
            <CardDescription className="text-xs">Workouts</CardDescription>
          </div>
          <CardTitle className="text-2xl sm:text-3xl text-green-500">{stats.totalWorkouts}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
