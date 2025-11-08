// Hook pour initialiser le thème dans ModerationPage
import { useTheme } from '@/composables/useTheme.js'
import '@/assets/css/moderation-theme.css'

export function useModerationTheme() {
  const { isDarkMode, toggleTheme, setTheme } = useTheme()
  
  return {
    isDarkMode,
    toggleTheme,
    setTheme
  }
}