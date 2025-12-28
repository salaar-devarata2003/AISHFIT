"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Dumbbell } from "lucide-react"
import type { WorkoutSession } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface WorkoutHistoryProps {
  workouts: WorkoutSession[]
  onDelete: (id: string) => void
}

export function WorkoutHistory({ workouts, onDelete }: WorkoutHistoryProps) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No workouts logged yet</p>
        <p className="text-sm">Start tracking your workouts to see your history here</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const totalExercises = workout.exercises.length
        const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)

        return (
          <Card key={workout.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{formatDate(workout.date)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {totalExercises} exercise{totalExercises > 1 ? "s" : ""} · {totalSets} total sets
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(workout.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {workout.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="p-3 border border-border rounded-lg bg-muted/30">
                  <div className="mb-2">
                    <h4 className="font-semibold">{exercise.exerciseName}</h4>
                  </div>
                  <div className="space-y-1.5">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="w-14 justify-center">
                          Set {set.setNumber}
                        </Badge>
                        <span className="text-muted-foreground">
                          {set.reps} reps × {set.weight} kg
                        </span>
                        <span className="text-muted-foreground ml-auto">
                          = {(set.reps * set.weight).toFixed(1)} kg volume
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
