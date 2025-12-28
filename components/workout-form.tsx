"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { WorkoutSession, ExerciseInSession, WorkoutSet, WorkoutTemplate } from "@/app/page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, X, Search, Clock, Play, Pause } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkoutFormProps {
  onSubmit: (workout: Omit<WorkoutSession, "id">) => void
  templates: WorkoutTemplate[]
}

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Core", "Cardio", "Other"] as const

const EXERCISE_LIST = [
  // Chest
  { name: "Bench Press", group: "Chest" },
  { name: "Incline Bench Press", group: "Chest" },
  { name: "Decline Bench Press", group: "Chest" },
  { name: "Dumbbell Press", group: "Chest" },
  { name: "Chest Fly", group: "Chest" },
  { name: "Cable Crossover", group: "Chest" },
  { name: "Push-ups", group: "Chest" },
  // Back
  { name: "Deadlift", group: "Back" },
  { name: "Pull-ups", group: "Back" },
  { name: "Chin-ups", group: "Back" },
  { name: "Barbell Row", group: "Back" },
  { name: "Dumbbell Row", group: "Back" },
  { name: "Lat Pulldown", group: "Back" },
  { name: "Cable Row", group: "Back" },
  { name: "T-Bar Row", group: "Back" },
  // Shoulders
  { name: "Overhead Press", group: "Shoulders" },
  { name: "Military Press", group: "Shoulders" },
  { name: "Arnold Press", group: "Shoulders" },
  { name: "Lateral Raise", group: "Shoulders" },
  { name: "Front Raise", group: "Shoulders" },
  { name: "Rear Delt Fly", group: "Shoulders" },
  { name: "Face Pull", group: "Shoulders" },
  // Arms
  { name: "Barbell Curl", group: "Biceps" },
  { name: "Dumbbell Curl", group: "Biceps" },
  { name: "Hammer Curl", group: "Biceps" },
  { name: "Preacher Curl", group: "Biceps" },
  { name: "Tricep Dip", group: "Triceps" },
  { name: "Tricep Pushdown", group: "Triceps" },
  { name: "Skull Crusher", group: "Triceps" },
  { name: "Close Grip Bench Press", group: "Triceps" },
  // Legs
  { name: "Squat", group: "Legs" },
  { name: "Front Squat", group: "Legs" },
  { name: "Leg Press", group: "Legs" },
  { name: "Romanian Deadlift", group: "Legs" },
  { name: "Leg Curl", group: "Legs" },
  { name: "Leg Extension", group: "Legs" },
  { name: "Calf Raise", group: "Legs" },
  { name: "Lunges", group: "Legs" },
  // Core
  { name: "Plank", group: "Core" },
  { name: "Crunches", group: "Core" },
  { name: "Leg Raises", group: "Core" },
  { name: "Russian Twist", group: "Core" },
  { name: "Cable Crunch", group: "Core" },
].sort((a, b) => a.name.localeCompare(b.name))

export function WorkoutForm({ onSubmit, templates }: WorkoutFormProps) {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [exercises, setExercises] = useState<ExerciseInSession[]>([])

  const [searchQuery, setSearchQuery] = useState<string>("")
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("")
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([{ setNumber: 1, reps: 0, weight: 0 }])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [workoutDuration, setWorkoutDuration] = useState<number>(0)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isWorkoutActive && !isPaused && workoutStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000 / 60)
        setWorkoutDuration(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isWorkoutActive, isPaused, workoutStartTime])

  const filteredExercises = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return EXERCISE_LIST.filter((exercise) => exercise.name.toLowerCase().includes(query))
  }, [searchQuery])

  const handleSelectExercise = (exercise: (typeof EXERCISE_LIST)[0]) => {
    setSelectedExercise(exercise.name)
    setSelectedMuscleGroup(exercise.group)
    setSearchQuery(exercise.name)
  }

  const handleAddSet = () => {
    setCurrentSets([...currentSets, { setNumber: currentSets.length + 1, reps: 0, weight: 0 }])
  }

  const handleRemoveSet = (index: number) => {
    if (currentSets.length > 1) {
      setCurrentSets(currentSets.filter((_, i) => i !== index))
    }
  }

  const handleSetChange = (index: number, field: "reps" | "weight", value: string) => {
    const newSets = [...currentSets]
    newSets[index] = { ...newSets[index], [field]: Number.parseFloat(value) || 0 }
    setCurrentSets(newSets)
  }

  const handleAddExercise = () => {
    const exerciseName = selectedExercise || searchQuery.trim()

    if (!exerciseName) {
      toast({
        title: "Error",
        description: "Please enter or select an exercise",
        variant: "destructive",
      })
      return
    }

    const validSets = currentSets.filter((s) => s.reps > 0 && s.weight > 0)
    if (validSets.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one set with valid reps and weight",
        variant: "destructive",
      })
      return
    }

    const newExercise: ExerciseInSession = {
      exerciseName,
      sets: validSets,
      muscleGroup: selectedMuscleGroup || "Other",
    }

    setExercises([...exercises, newExercise])

    // Start workout timer on first exercise
    if (!isWorkoutActive) {
      setWorkoutStartTime(new Date())
      setIsWorkoutActive(true)
    }

    setSelectedExercise("")
    setSearchQuery("")
    setSelectedMuscleGroup("")
    setCurrentSets([{ setNumber: 1, reps: 0, weight: 0 }])

    toast({
      title: "Exercise Added",
      description: `${exerciseName} added with ${validSets.length} set${validSets.length > 1 ? "s" : ""}`,
    })
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (!template) return

    toast({
      title: "Template Loaded",
      description: `${template.name} is ready. Add your sets for each exercise.`,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one exercise to the workout session",
        variant: "destructive",
      })
      return
    }

    const workout: Omit<WorkoutSession, "id"> = {
      date,
      exercises,
      duration: workoutDuration,
      startTime: workoutStartTime?.toISOString(),
    }

    onSubmit(workout)

    // Reset form
    setDate(new Date().toISOString().split("T")[0])
    setExercises([])
    setSelectedExercise("")
    setSearchQuery("")
    setSelectedMuscleGroup("")
    setCurrentSets([{ setNumber: 1, reps: 0, weight: 0 }])
    setSelectedTemplate("")
    setWorkoutStartTime(null)
    setWorkoutDuration(0)
    setIsWorkoutActive(false)
    setIsPaused(false)

    toast({
      title: "Success",
      description: `Workout session logged successfully! Duration: ${workoutDuration} minutes`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Workout Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        {isWorkoutActive && (
          <div className="space-y-2">
            <Label>Workout Duration</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-md bg-muted flex-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-lg font-semibold">{workoutDuration} min</span>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setIsPaused(!isPaused)}>
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {templates.length > 0 && exercises.length === 0 && (
        <div className="space-y-2">
          <Label htmlFor="template">Start from Template (Optional)</Label>
          <Select
            value={selectedTemplate}
            onValueChange={(value) => {
              setSelectedTemplate(value)
              handleLoadTemplate(value)
            }}
          >
            <SelectTrigger id="template">
              <SelectValue placeholder="Choose a workout template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.exercises.length} exercises)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {exercises.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Exercises in This Session ({exercises.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-base">{exercise.exerciseName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets.length} sets • {exercise.muscleGroup}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExercise(exerciseIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="w-16">
                        Set {set.setNumber}
                      </Badge>
                      <span className="text-muted-foreground">
                        {set.reps} reps × {set.weight} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-search">Search or Enter Exercise</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="exercise-search"
                type="text"
                placeholder="Type to search exercises..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedExercise("")
                }}
                className="pl-9"
              />
            </div>

            {searchQuery && (
              <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                {filteredExercises.length > 0 ? (
                  <div className="p-1">
                    {filteredExercises.map((exercise) => (
                      <button
                        key={exercise.name}
                        type="button"
                        onClick={() => handleSelectExercise(exercise)}
                        className="w-full text-left px-3 py-2 rounded-sm hover:bg-accent transition-colors text-sm flex items-center justify-between"
                      >
                        <span>{exercise.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {exercise.group}
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">No matches found</p>
                    <p className="text-xs text-muted-foreground">
                      Press &quot;Add Exercise to Session&quot; to use &quot;{searchQuery}&quot; as custom exercise
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {searchQuery && !selectedExercise && (
            <div className="space-y-2">
              <Label htmlFor="muscle-group">Muscle Group (Optional)</Label>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger id="muscle-group">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sets</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSet}>
                <Plus className="w-4 h-4 mr-1" />
                Add Set
              </Button>
            </div>

            {currentSets.map((set, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex items-center justify-center w-16 h-10 border border-border rounded-md bg-muted text-sm font-medium">
                  Set {set.setNumber}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Reps"
                      value={set.reps || ""}
                      onChange={(e) => handleSetChange(index, "reps", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Weight (kg)"
                      value={set.weight || ""}
                      onChange={(e) => handleSetChange(index, "weight", e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSet(index)}
                  disabled={currentSets.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" onClick={handleAddExercise} variant="secondary" className="w-full">
            Add Exercise to Session
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={exercises.length === 0}>
        Complete Workout Session
      </Button>
    </form>
  )
}
