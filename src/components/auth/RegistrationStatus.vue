<template>
  <div class="form-status" :class="{ 'dark': isDark }">
    <div class="status-indicator">
      <span class="status-dot" :class="{ active: form.username && form.email }"></span>
      <span>Informations personnelles</span>
    </div>
    <div class="status-indicator">
      <span class="status-dot" :class="{ active: form.university_name }"></span>
      <span>Université</span>
    </div>
    <div class="status-indicator">
      <span class="status-dot" :class="{ active: form.faculty_name && form.department_name }"></span>
      <span>Structure académique</span>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme.js'

// Composables
const { isDark } = useTheme()

defineProps({
  form: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.form-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Couleurs des indicateurs de statut */
  --status-inactive-bg: #e5e7eb;
  --status-inactive-color: #9ca3af;
  --status-active-bg: #10b981;
  --status-active-color: #ffffff;
  --status-active-glow: rgba(16, 185, 129, 0.3);
  --indicator-bg: #f9fafb;
  --indicator-border: #e5e7eb;
  --indicator-hover-bg: #f3f4f6;
  --indicator-hover-border: #d1d5db;
  
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.form-status.dark {
  /* Variables CSS pour le mode sombre */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --background-primary: #0f172a;
  --background-secondary: #1e293b;
  --background-tertiary: #334155;
  --border-color: #334155;
  --border-light: #475569;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  
  /* Couleurs des indicateurs de statut pour le mode sombre */
  --status-inactive-bg: #475569;
  --status-inactive-color: #64748b;
  --status-active-bg: #22c55e;
  --status-active-color: #ffffff;
  --status-active-glow: rgba(34, 197, 94, 0.4);
  --indicator-bg: #1e293b;
  --indicator-border: #334155;
  --indicator-hover-bg: #334155;
  --indicator-hover-border: #475569;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--indicator-bg);
  border: 1px solid var(--indicator-border);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  cursor: default;
  position: relative;
  overflow: hidden;
  animation: slideInLeft 0.4s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.status-indicator:nth-child(1) {
  animation-delay: 0.1s;
}

.status-indicator:nth-child(2) {
  animation-delay: 0.2s;
}

.status-indicator:nth-child(3) {
  animation-delay: 0.3s;
}

.status-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(16, 185, 129, 0.1);
  transition: left 0.3s ease;
}

.status-indicator:hover::before {
  left: 100%;
}

.status-indicator:hover {
  background: var(--indicator-hover-bg);
  border-color: var(--indicator-hover-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-indicator span:not(.status-dot) {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.status-indicator:hover span:not(.status-dot) {
  color: var(--text-primary);
}

.status-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--status-inactive-bg);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
}

.status-dot::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.25rem;
  height: 0.25rem;
  background: var(--status-inactive-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.status-dot.active {
  background: var(--status-active-bg);
  box-shadow: 0 0 0 3px var(--status-active-glow);
  animation: statusActivate 0.5s ease;
  border-color: var(--status-active-bg);
}

.status-dot.active::before {
  content: '✓';
  width: auto;
  height: auto;
  background: none;
  color: var(--status-active-color);
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1;
}

@keyframes statusActivate {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Animation de pulsation pour les éléments actifs */
.status-dot.active {
  animation: statusActivate 0.5s ease, pulse 2s infinite 1s;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 3px var(--status-active-glow);
  }
  50% {
    box-shadow: 0 0 0 6px var(--status-active-glow);
  }
}

/* Ligne de connexion entre les indicateurs */
.status-indicator:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 1.5rem;
  width: 2px;
  height: 1rem;
  background: var(--border-color);
  transition: background 0.3s ease;
}

.status-indicator:has(.status-dot.active):not(:last-child)::after {
  background: var(--status-active-bg);
  box-shadow: 0 0 4px var(--status-active-glow);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-status {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .status-indicator {
    padding: 0.75rem;
    flex-direction: row;
    align-items: center;
  }
  
  .status-indicator span:not(.status-dot) {
    font-size: 0.8rem;
  }
  
  .status-dot {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  .status-dot.active::before {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .form-status {
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .status-indicator {
    padding: 0.5rem 0.75rem;
    min-height: 3rem;
  }
  
  .status-indicator span:not(.status-dot) {
    font-size: 0.75rem;
    line-height: 1.2;
  }
  
  .status-dot {
    width: 0.75rem;
    height: 0.75rem;
  }
  
  .status-dot.active::before {
    font-size: 0.5rem;
  }
  
  .status-indicator:not(:last-child)::after {
    left: 1.25rem;
    height: 0.5rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .form-status *,
  .form-status *::before,
  .form-status *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.status-indicator:focus-visible {
  outline: 2px solid var(--status-active-bg);
  outline-offset: 2px;
}

/* États spéciaux pour les indicateurs */
.status-indicator:has(.status-dot.active) {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.form-status.dark .status-indicator:has(.status-dot.active) {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

/* Animation pour l'ensemble du composant */
.form-status {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Effet de progression visuelle */
.status-indicator:has(.status-dot.active) span:not(.status-dot) {
  color: var(--text-primary);
  font-weight: 600;
}

/* Barre de progression globale */
.form-status::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: var(--progress-width, 0%);
  height: 3px;
  background: var(--status-active-bg);
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
}

/* Calcul dynamique du pourcentage de progression */
.form-status:has(.status-indicator:nth-child(1) .status-dot.active):not(:has(.status-indicator:nth-child(2) .status-dot.active))::before {
  --progress-width: 33%;
}

.form-status:has(.status-indicator:nth-child(2) .status-dot.active):not(:has(.status-indicator:nth-child(3) .status-dot.active))::before {
  --progress-width: 66%;
}

.form-status:has(.status-indicator:nth-child(3) .status-dot.active)::before {
  --progress-width: 100%;
}
</style>