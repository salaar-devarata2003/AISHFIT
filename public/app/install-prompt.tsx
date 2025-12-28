"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("installPromptDismissed", "true")
  }

  useEffect(() => {
    const dismissed = localStorage.getItem("installPromptDismissed")
    if (dismissed) {
      setShowPrompt(false)
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install AISHFIT</h3>
            <p className="text-sm text-white/90 mb-3">Install our app for quick access and offline use</p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="bg-white text-orange-600 hover:bg-white/90">
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="ghost" className="text-white hover:bg-white/20">
                Later
              </Button>
            </div>
          </div>
          <Button onClick={handleDismiss} size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
