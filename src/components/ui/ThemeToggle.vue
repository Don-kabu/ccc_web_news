<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle-btn"
    :class="{ 'dark': isDarkMode }"
    :title="isDarkMode ? 'Activer le mode jour' : 'Activer le mode nuit'"
    aria-label="Basculer le thème"
  >
    <div class="theme-toggle-container">
      <!-- Icône soleil -->
      <svg 
        v-show="!isDarkMode" 
        class="theme-icon sun-icon" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
      </svg>
      
      <!-- Icône lune -->
      <svg 
        v-show="isDarkMode" 
        class="theme-icon moon-icon" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
      </svg>
    </div>
  </button>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme.js'

const { isDarkMode, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle-btn {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.theme-toggle-btn:hover {
  background-color: var(--color-bg-tertiary);
  border-color: var(--color-border-secondary);
  transform: scale(1.05);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.theme-toggle-container {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-icon {
  position: absolute;
  top: 0;
  left: 0;
  transition: all 0.3s ease;
  color: var(--color-text-primary);
}

.sun-icon {
  animation: rotate 10s linear infinite;
}

.moon-icon {
  color: #fbbf24;
}

.theme-toggle-btn.dark {
  background-color: var(--color-bg-secondary);
}

/* Animation de rotation pour le soleil */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Animation d'entrée/sortie */
.theme-icon {
  opacity: 1;
  transform: scale(1);
}

.theme-toggle-btn:hover .theme-icon {
  transform: scale(1.1);
}

/* Responsive */
@media (max-width: 768px) {
  .theme-toggle-btn {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .theme-icon {
    width: 18px;
    height: 18px;
  }
}
</style>