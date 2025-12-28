"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { WorkoutTemplate } from "@/app/page"
import { Plus, Trash2, Bookmark, X } from "lucide-react"

interface WorkoutTemplatesProps {
  templates: WorkoutTemplate[]
  onAdd: (template: Omit<WorkoutTemplate, "id">) => void
  onDelete: (id: string) => void
}

export function WorkoutTemplates({ templates, onAdd, onDelete }: WorkoutTemplatesProps) {
  const { toast } = useToast()
  const [templateName, setTemplateName] = useState("")
  const [exercises, setExercises] = useState<Array<{ exerciseName: string; muscleGroup: string; targetSets: number }>>(
    [],
  )
  const [currentExercise, setCurrentExercise] = useState("")
  const [currentMuscleGroup, setCurrentMuscleGroup] = useState("")
  const [currentTargetSets, setCurrentTargetSets] = useState("")

  const handleAddExercise = () => {
    if (!currentExercise.trim()) {
      toast({
        title: "Error",
        description: "Please enter an exercise name",
        variant: "destructive",
      })
      return
    }

    const targetSets = Number.parseInt(currentTargetSets) || 3

    setExercises([
      ...exercises,
      {
        exerciseName: currentExercise.trim(),
        muscleGroup: currentMuscleGroup || "Other",
        targetSets,
      },
    ])

    setCurrentExercise("")
    setCurrentMuscleGroup("")
    setCurrentTargetSets("")
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      })
      return
    }

    if (exercises.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one exercise",
        variant: "destructive",
      })
      return
    }

    onAdd({
      name: templateName,
      exercises,
    })

    setTemplateName("")
    setExercises([])

    toast({
      title: "Success",
      description: "Workout template saved!",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Workout Template</CardTitle>
          <CardDescription>Save your favorite workout routines for quick logging</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Push Day, Leg Day, Full Body"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            {exercises.length > 0 && (
              <div className="space-y-2">
                <Label>Exercises in Template ({exercises.length})</Label>
                <div className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{exercise.exerciseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.muscleGroup} • {exercise.targetSets} sets
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercise(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 p-4 border border-dashed border-border rounded-lg">
              <Label>Add Exercise to Template</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Exercise name"
                  value={currentExercise}
                  onChange={(e) => setCurrentExercise(e.target.value)}
                />
                <Input
                  placeholder="Muscle group"
                  value={currentMuscleGroup}
                  onChange={(e) => setCurrentMuscleGroup(e.target.value)}
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Target sets"
                  value={currentTargetSets}
                  onChange={(e) => setCurrentTargetSets(e.target.value)}
                />
              </div>
              <Button type="button" onClick={handleAddExercise} variant="outline" className="w-full bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={exercises.length === 0}>
              Save Template
            </Button>
          </form>
        </CardContent>
      </Card>

      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
            <CardDescription>
              {templates.length} workout template{templates.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.exercises.length} exercises</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.exercises.map((exercise, idx) => (
                      <Badge key={idx} variant="secondary">
                        {exercise.exerciseName} ({exercise.targetSets} sets)
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No templates yet</p>
              <p className="text-sm">Create workout templates to save time when logging workouts</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
