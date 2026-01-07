"use client"

import { Button } from "@/components/ui/button"

export default function ShareButton({ title, text }: { title: string; text?: string }) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || `Check out ${title}`,
          url,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
    >
      Share
    </Button>
  )
}

