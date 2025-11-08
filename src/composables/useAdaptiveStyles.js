import { computed } from 'vue'
import { useTheme } from './useTheme.js'

export function useAdaptiveStyles() {
  const { isDarkMode } = useTheme()
  
  // Classes CSS conditionnelles
  const containerClasses = computed(() => ({
    'dark-theme': isDarkMode.value,
    'light-theme': !isDarkMode.value
  }))
  
  // Styles inline adaptatifs
  const adaptiveStyles = computed(() => ({
    backgroundColor: isDarkMode.value 
      ? 'var(--color-bg-primary)' 
      : 'var(--color-bg-primary)',
    color: isDarkMode.value 
      ? 'var(--color-text-primary)' 
      : 'var(--color-text-primary)'
  }))
  
  // Classes pour les cartes
  const cardClasses = computed(() => ({
    'bg-primary': true,
    'text-primary': true,
    'border-primary': true,
    'shadow-md': true
  }))
  
  // Classes pour les boutons
  const primaryButtonClasses = computed(() => ({
    'btn-primary': true
  }))
  
  const secondaryButtonClasses = computed(() => ({
    'btn-secondary': true
  }))
  
  // Classes pour les inputs
  const inputClasses = computed(() => ({
    'bg-primary': true,
    'text-primary': true,
    'border-primary': true
  }))
  
  return {
    isDarkMode,
    containerClasses,
    adaptiveStyles,
    cardClasses,
    primaryButtonClasses,
    secondaryButtonClasses,
    inputClasses
  }
}