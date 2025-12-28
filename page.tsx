"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutForm } from "@/components/workout-form"
import { WorkoutHistory } from "@/components/workout-history"
import { ProgressChart } from "@/components/progress-chart"
import { BodyWeightTracker } from "@/components/body-weight-tracker"
import { ShareStats } from "@/components/share-stats"
import { WorkoutTemplates } from "@/components/workout-templates"
import { StatsOverview } from "@/components/stats-overview"
import { Logo } from "@/components/logo"
import { InstallPrompt } from "./install-prompt"

export interface WorkoutSet {
  setNumber: number
  reps: number
  weight: number
}

export interface ExerciseInSession {
  exerciseName: string
  sets: WorkoutSet[]
  muscleGroup?: string
}

export interface WorkoutSession {
  id: string
  date: string
  exercises: ExerciseInSession[]
  duration?: number // in minutes
  startTime?: string
}

export interface BodyWeightEntry {
  id: string
  date: string
  weight: number
}

export interface WorkoutTemplate {
  id: string
  name: string
  exercises: Array<{
    exerciseName: string
    muscleGroup?: string
    targetSets: number
  }>
}

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])
  const [bodyWeights, setBodyWeights] = useState<BodyWeightEntry[]>([])
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("Service Worker registered:", registration))
        .catch((error) => console.log("Service Worker registration failed:", error))
    }
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("workout-sessions")
    if (stored) {
      try {
        setWorkouts(JSON.parse(stored))
      } catch (error) {
        console.error("Error loading workouts:", error)
      }
    }
    const storedWeights = localStorage.getItem("body-weights")
    if (storedWeights) {
      try {
        setBodyWeights(JSON.parse(storedWeights))
      } catch (error) {
        console.error("Error loading body weights:", error)
      }
    }
    const storedTemplates = localStorage.getItem("workout-templates")
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates))
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("workout-sessions", JSON.stringify(workouts))
    }
  }, [workouts, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("body-weights", JSON.stringify(bodyWeights))
    }
  }, [bodyWeights, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("workout-templates", JSON.stringify(templates))
    }
  }, [templates, isLoaded])

  const addWorkout = (workout: Omit<WorkoutSession, "id">) => {
    const newWorkout: WorkoutSession = {
      ...workout,
      id: Date.now().toString(),
    }
    setWorkouts([newWorkout, ...workouts])
  }

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id))
  }

  const addBodyWeight = (entry: Omit<BodyWeightEntry, "id">) => {
    const newEntry: BodyWeightEntry = {
      ...entry,
      id: Date.now().toString(),
    }
    setBodyWeights([newEntry, ...bodyWeights])
  }

  const deleteBodyWeight = (id: string) => {
    setBodyWeights(bodyWeights.filter((w) => w.id !== id))
  }

  const addTemplate = (template: Omit<WorkoutTemplate, "id">) => {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: Date.now().toString(),
    }
    setTemplates([newTemplate, ...templates])
  }

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  if (!isLoaded) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b">
          <Logo />
          <ShareStats workouts={workouts} bodyWeights={bodyWeights} />
        </div>

        <StatsOverview workouts={workouts} />

        <Tabs defaultValue="log" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 h-auto">
            <TabsTrigger value="log" className="text-xs sm:text-sm py-2">
              Log Workout
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm py-2">
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2">
              History
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm py-2">
              Progress
            </TabsTrigger>
            <TabsTrigger value="body-weight" className="text-xs sm:text-sm py-2">
              Body Weight
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Start Workout Session</CardTitle>
                <CardDescription>Add multiple exercises with varying sets, reps, and weights</CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutForm onSubmit={addWorkout} templates={templates} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <WorkoutTemplates templates={templates} onAdd={addTemplate} onDelete={deleteTemplate} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout History</CardTitle>
                <CardDescription>
                  {workouts.length === 0
                    ? "No workouts logged yet"
                    : `${workouts.length} workout session${workouts.length === 1 ? "" : "s"} logged`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkoutHistory workouts={workouts} onDelete={deleteWorkout} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <ProgressChart workouts={workouts} />
          </TabsContent>

          <TabsContent value="body-weight" className="space-y-4">
            <BodyWeightTracker bodyWeights={bodyWeights} onAdd={addBodyWeight} onDelete={deleteBodyWeight} />
          </TabsContent>
        </Tabs>
      </div>

      <InstallPrompt />
    </div>
  )
}
