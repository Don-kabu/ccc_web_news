import { ref, watch, onMounted } from 'vue'

const isDarkMode = ref(false)

export function useTheme() {
  // Initialiser le thème depuis localStorage ou préférence système
  const initTheme = () => {
    const savedTheme = localStorage.getItem('ccc_theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      // Utiliser la préférence système
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // Appliquer le thème au document
  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark-theme')
      document.documentElement.classList.remove('light-theme')
    } else {
      document.documentElement.classList.add('light-theme')
      document.documentElement.classList.remove('dark-theme')
    }
  }

  // Basculer entre les thèmes
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('ccc_theme', isDarkMode.value ? 'dark' : 'light')
    applyTheme()
  }

  // Définir un thème spécifique
  const setTheme = (theme) => {
    isDarkMode.value = theme === 'dark'
    localStorage.setItem('ccc_theme', theme)
    applyTheme()
  }

  // Écouter les changements de préférence système
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Ne changer que si l'utilisateur n'a pas défini de préférence
      if (!localStorage.getItem('ccc_theme')) {
        isDarkMode.value = e.matches
        applyTheme()
      }
    })
  }

  // Watcher pour persister les changements
  watch(isDarkMode, (newValue) => {
    applyTheme()
  })

  onMounted(() => {
    initTheme()
    watchSystemTheme()
  })

  return {
    isDarkMode,
    toggleTheme,
    setTheme
  }
}