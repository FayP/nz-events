"use client"

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
    <button
      onClick={handleShare}
      className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-black transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-800"
    >
      Share
    </button>
  )
}

