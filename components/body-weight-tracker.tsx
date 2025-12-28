"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trash2, Scale, TrendingDown, TrendingUp } from "lucide-react"
import type { BodyWeightEntry } from "@/app/page"
import { useToast } from "@/hooks/use-toast"

interface BodyWeightTrackerProps {
  bodyWeights: BodyWeightEntry[]
  onAdd: (entry: Omit<BodyWeightEntry, "id">) => void
  onDelete: (id: string) => void
}

export function BodyWeightTracker({ bodyWeights, onAdd, onDelete }: BodyWeightTrackerProps) {
  const { toast } = useToast()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [weight, setWeight] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!weight || Number.parseFloat(weight) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      })
      return
    }

    onAdd({
      date,
      weight: Number.parseFloat(weight),
    })

    setWeight("")
    setDate(new Date().toISOString().split("T")[0])

    toast({
      title: "Success",
      description: "Body weight logged successfully!",
    })
  }

  const chartData = bodyWeights
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: entry.weight,
    }))

  const stats =
    bodyWeights.length > 0
      ? {
          current: bodyWeights[0].weight,
          highest: Math.max(...bodyWeights.map((e) => e.weight)),
          lowest: Math.min(...bodyWeights.map((e) => e.weight)),
          average: bodyWeights.reduce((acc, e) => acc + e.weight, 0) / bodyWeights.length,
          change: bodyWeights.length > 1 ? bodyWeights[0].weight - bodyWeights[bodyWeights.length - 1].weight : 0,
        }
      : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Body Weight</CardTitle>
          <CardDescription>Track your weekly body weight progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight-date">Date</Label>
                <Input id="weight-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body-weight">Weight (kg)</Label>
                <Input
                  id="body-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Enter your weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Log Weight
            </Button>
          </form>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current</CardDescription>
              <CardTitle className="text-2xl">{stats.current.toFixed(1)} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Highest</CardDescription>
              <CardTitle className="text-2xl">{stats.highest.toFixed(1)} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Lowest</CardDescription>
              <CardTitle className="text-2xl">{stats.lowest.toFixed(1)} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average</CardDescription>
              <CardTitle className="text-2xl">{stats.average.toFixed(1)} kg</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Change</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-1">
                {stats.change > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : stats.change < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : null}
                {stats.change > 0 ? "+" : ""}
                {stats.change.toFixed(1)} kg
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
            <CardDescription>Your body weight over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    label={{ value: "Weight (kg)", angle: -90, position: "insideLeft" }}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {bodyWeights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
            <CardDescription>{bodyWeights.length} entries logged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bodyWeights.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{entry.weight} kg</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(entry.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {bodyWeights.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No weight entries yet</p>
              <p className="text-sm">Start tracking your body weight to see your progress</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
