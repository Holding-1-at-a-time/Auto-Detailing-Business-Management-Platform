import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface ParsedBooking {
  service: string
  date: string
  time: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  notes?: string
  confidence: number
}

export async function parseBookingRequest(text: string): Promise<ParsedBooking> {
  const prompt = `
    Parse the following booking request for an auto-detailing service.
    Extract the following information:
    - Service type (Basic Wash, Interior Detailing, Exterior Detailing, Full Detailing, Ceramic Coating, Paint Correction)
    - Date (in YYYY-MM-DD format)
    - Time (in HH:MM 24-hour format)
    - Client name (if provided)
    - Client email (if provided)
    - Client phone (if provided)
    - Additional notes (if any)
    - Confidence level (0-100) of your parsing

    If any information is missing or ambiguous, leave the field empty and reduce the confidence level.
    If the date is relative (e.g., "tomorrow", "next Tuesday"), convert it to an absolute date.
    
    Request: "${text}"
    
    Respond in JSON format:
    {
      "service": "...",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "clientName": "...",
      "clientEmail": "...",
      "clientPhone": "...",
      "notes": "...",
      "confidence": 85
    }
  `

  try {
    const { text: responseText } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from response")
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as ParsedBooking
    return parsedResult
  } catch (error) {
    console.error("Error parsing booking request:", error)
    throw new Error("Failed to parse booking request")
  }
}
