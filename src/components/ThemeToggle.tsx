'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // next-themes only knows the real theme after client hydration; this
  // mounted flag avoids a server/client mismatch on the icon shown.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-7 h-7" />

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-600 dark:text-gray-300 hover:text-luxury-gold transition-colors">
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}