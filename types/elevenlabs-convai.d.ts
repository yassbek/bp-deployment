// types/elevenlabs-convai.d.ts
import type * as React from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "agent-id": string
        "dynamic-variables"?: string
        variant?: "compact" | "expanded"
      }
    }
  }
}

export {}
