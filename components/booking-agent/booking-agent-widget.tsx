"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, X, Maximize2, Minimize2 } from "lucide-react"
import { BookingChat } from "./booking-chat"

export function BookingAgentWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={`fixed ${isExpanded ? "inset-4" : "bottom-4 right-4"} z-50 transition-all duration-300`}>
      {!isOpen ? (
        <Button onClick={toggleOpen} className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <Card
          className={`${
            isExpanded ? "w-full h-full" : "w-[400px] h-[600px]"
          } flex flex-col shadow-xl transition-all duration-300`}
        >
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Booking Assistant</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleExpand}>
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleOpen}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-grow overflow-hidden">
            <BookingChat />
          </div>
        </Card>
      )}
    </div>
  )
}
