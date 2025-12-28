"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Award } from "lucide-react"
import type { WorkoutSession } from "@/app/page"

interface ProgressChartProps {
  workouts: WorkoutSession[]
}

export function ProgressChart({ workouts }: ProgressChartProps) {
  const exercises = useMemo(() => {
    const uniqueExercises = new Set<string>()
    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        uniqueExercises.add(exercise.exerciseName)
      })
    })
    return Array.from(uniqueExercises).sort()
  }, [workouts])

  const [selectedExercise, setSelectedExercise] = useState<string>(exercises[0] || "")

  const { chartData, personalRecord } = useMemo(() => {
    if (!selectedExercise) return { chartData: [], personalRecord: null }

    const dataPoints: Array<{
      date: string
      maxWeight: number
      avgWeight: number
      totalVolume: number
      isPR: boolean
    }> = []
    let currentPR = 0

    workouts
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((workout) => {
        const exerciseData = workout.exercises.find((ex) => ex.exerciseName === selectedExercise)

        if (exerciseData && exerciseData.sets.length > 0) {
          const weights = exerciseData.sets.map((s) => s.weight)
          const maxWeight = Math.max(...weights)
          const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length
          const totalVolume = exerciseData.sets.reduce((acc, set) => acc + set.reps * set.weight, 0)

          const isPR = maxWeight > currentPR
          if (isPR) {
            currentPR = maxWeight
          }

          dataPoints.push({
            date: new Date(workout.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            maxWeight: Number(maxWeight.toFixed(1)),
            avgWeight: Number(avgWeight.toFixed(1)),
            totalVolume: Number(totalVolume.toFixed(0)),
            isPR,
          })
        }
      })

    return {
      chartData: dataPoints,
      personalRecord: currentPR > 0 ? currentPR : null,
    }
  }, [workouts, selectedExercise])

  const stats = useMemo(() => {
    if (chartData.length === 0) return null

    const maxWeights = chartData.map((d) => d.maxWeight)
    const volumes = chartData.map((d) => d.totalVolume)

    const personalBest = Math.max(...maxWeights)
    const avgMaxWeight = maxWeights.reduce((a, b) => a + b, 0) / maxWeights.length
    const totalVolume = volumes.reduce((a, b) => a + b, 0)

    return { personalBest, avgMaxWeight, totalVolume, sessions: chartData.length }
  }, [chartData])

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Chart</CardTitle>
          <CardDescription>No workout data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Start logging workouts</p>
            <p className="text-sm">Your progress charts will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Progress Chart</CardTitle>
              <CardDescription>Track your strength gains over time</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {personalRecord && (
                <Badge variant="default" className="bg-yellow-500 text-yellow-950 gap-1">
                  <Award className="w-3 h-3" />
                  PR: {personalRecord} kg
                </Badge>
              )}
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-popover p-3 border border-border rounded-md shadow-lg">
                            <p className="font-semibold mb-1">{data.date}</p>
                            <p className="text-sm">Max Weight: {data.maxWeight} kg</p>
                            <p className="text-sm">Avg Weight: {data.avgWeight} kg</p>
                            <p className="text-sm">Volume: {data.totalVolume} kg</p>
                            {data.isPR && (
                              <Badge variant="default" className="mt-1 bg-yellow-500 text-yellow-950">
                                Personal Record!
                              </Badge>
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={payload.isPR ? 6 : 4}
                          fill={payload.isPR ? "#eab308" : "hsl(var(--chart-1))"}
                          stroke={payload.isPR ? "#fbbf24" : "hsl(var(--chart-1))"}
                          strokeWidth={payload.isPR ? 2 : 0}
                        />
                      )
                    }}
                    activeDot={{ r: 6 }}
                    name="Max Weight (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="avgWeight"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Avg Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data available for this exercise</p>
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Personal Best</CardDescription>
              <CardTitle className="text-3xl">{stats.personalBest} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg Max Weight</CardDescription>
              <CardTitle className="text-3xl">{stats.avgMaxWeight.toFixed(1)} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Volume</CardDescription>
              <CardTitle className="text-3xl">{stats.totalVolume.toLocaleString()} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sessions</CardDescription>
              <CardTitle className="text-3xl">{stats.sessions}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}
    </div>
  )
}
