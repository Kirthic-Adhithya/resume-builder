import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getStoredTheme, toggleTheme } from '@/lib/theme'

export function ThemeToggle() {
  // Reads localStorage directly during the initial render (not an effect) — this is
  // synchronous, has no side effects of its own, and matches whatever the inline
  // script in index.html already applied to <html> before React ever mounted.
  const [theme, setTheme] = useState(getStoredTheme)

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
