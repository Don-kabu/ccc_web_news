<template>
  <div class="form-section" :class="{ 'dark': isDark }">
    <h3 class="section-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      Nouvelle université
    </h3>
    
    <!-- Nom de l'université -->
    <div class="form-group">
      <label for="university_name" class="form-label">Nom de l'université *</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M3 17L12 22L21 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>
        <input
          id="university_name"
          v-model="modelValue.university_name"
          type="text"
          placeholder="Université de Kinshasa"
          class="form-input"
          required
        />
      </div>
    </div>

    <!-- Ligne: Domaine et Ville -->
    <div class="form-row">
      <div class="form-group">
        <label for="university_domain" class="form-label">Domaine web</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12H16M12 8V16" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            id="university_domain"
            v-model="modelValue.university_domain"
            type="text"
            placeholder="unikin.ac.cd"
            class="form-input"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="university_city" class="form-label">Ville</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            id="university_city"
            v-model="modelValue.university_city"
            type="text"
            placeholder="Kinshasa"
            class="form-input"
          />
        </div>
      </div>
    </div>

    <!-- Adresse -->
    <div class="form-group">
      <label for="university_address" class="form-label">Adresse complète</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z" stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          id="university_address"
          v-model="modelValue.university_address"
          type="text"
          placeholder="Avenue de l'Université, Lemba, Kinshasa"
          class="form-input"
        />
      </div>
    </div>

    <!-- Pays -->
    <div class="form-group">
      <label for="university_country" class="form-label">Pays</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 2C17.52 2 22 6.48 22 12S17.52 22 12 22S2 17.52 2 12S6.48 2 12 2Z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <select
          id="university_country"
          v-model="modelValue.university_country"
          class="form-input"
          style="padding-left: 3rem;"
        >
          <option value="République Démocratique du Congo">République Démocratique du Congo</option>
          <option value="Rwanda">Rwanda</option>
          <option value="Burundi">Burundi</option>
          <option value="Congo-Brazzaville">Congo-Brazzaville</option>
          <option value="Cameroun">Cameroun</option>
          <option value="Centrafrique">Centrafrique</option>
          <option value="Tchad">Tchad</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme.js'

// Composables
const { isDark } = useTheme()

defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.form-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  /* Variables CSS pour le mode clair */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;
  --border-focus: #6366f1;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Couleurs spécifiques */
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-focus-border: #6366f1;
  --input-focus-shadow: rgba(99, 102, 241, 0.1);
  --icon-color: #6b7280;
  --icon-focus-color: #6366f1;
  --title-color: #1f2937;
  --title-accent: #6366f1;
}

.form-section.dark {
  /* Variables CSS pour le mode sombre */
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --border-color: #334155;
  --border-light: #475569;
  --border-focus: #6366f1;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  
  /* Couleurs spécifiques pour le mode sombre */
  --input-bg: #1e293b;
  --input-border: #475569;
  --input-focus-border: #6366f1;
  --input-focus-shadow: rgba(99, 102, 241, 0.2);
  --icon-color: #94a3b8;
  --icon-focus-color: #6366f1;
  --title-color: #f1f5f9;
  --title-accent: #818cf8;
}

.form-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--border-light);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--title-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--title-accent);
  transition: all 0.3s ease;
  position: relative;
  animation: slideInDown 0.5s ease;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--title-accent);
  transition: width 0.3s ease;
}

.form-section:hover .section-title::after {
  width: 100%;
}

.section-title svg {
  color: var(--title-accent);
  transition: all 0.3s ease;
}

.section-title:hover svg {
  transform: rotate(5deg) scale(1.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  animation: fadeInUp 0.4s ease;
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

.form-group:nth-child(2) { animation-delay: 0.1s; }
.form-group:nth-child(3) { animation-delay: 0.2s; }
.form-group:nth-child(4) { animation-delay: 0.3s; }
.form-group:nth-child(5) { animation-delay: 0.4s; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.form-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
  position: relative;
}

.form-label::after {
  content: ' *';
  color: #ef4444;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.form-label[for="university_name"]::after {
  opacity: 1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.input-wrapper:hover {
  transform: translateY(-1px);
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--icon-color);
  z-index: 1;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input-wrapper:focus-within .input-icon {
  color: var(--icon-focus-color);
  transform: scale(1.1);
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--input-border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.3s ease;
  position: relative;
}

.form-input::placeholder {
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.form-input:hover {
  border-color: var(--text-muted);
}

.form-input:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: 0 0 0 3px var(--input-focus-shadow);
  transform: translateY(-2px);
}

.form-input:focus::placeholder {
  opacity: 0.7;
  transform: translateX(5px);
}

/* Sélecteur personnalisé */
select.form-input {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 3rem;
  appearance: none;
}

select.form-input:hover {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

select.form-input option {
  background: var(--input-bg);
  color: var(--text-primary);
  padding: 0.5rem;
}

/* Animations d'état */
.form-input:valid:not(:placeholder-shown) {
  border-color: #10b981;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3e%3cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'%3e%3c/path%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1rem 1rem;
  animation: validInput 0.3s ease;
}

@keyframes validInput {
  0% {
    border-color: var(--input-border);
  }
  50% {
    border-color: #10b981;
    transform: scale(1.02);
  }
  100% {
    border-color: #10b981;
    transform: scale(1);
  }
}

/* États de focus améliorés */
.form-input:focus + .validation-icon {
  opacity: 1;
  transform: scale(1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-section {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .section-title {
    font-size: 1.125rem;
    margin-bottom: 1rem;
  }
  
  .form-input {
    padding: 0.875rem 0.875rem 0.875rem 2.75rem;
    font-size: 0.9rem;
  }
  
  .input-icon {
    left: 0.875rem;
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .form-section {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1rem;
    gap: 0.5rem;
  }
  
  .form-input {
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    font-size: 0.875rem;
  }
  
  .input-icon {
    left: 0.75rem;
    width: 16px;
    height: 16px;
  }
  
  .form-label {
    font-size: 0.8rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .form-section *,
  .form-section *::before,
  .form-section *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible pour l'accessibilité */
.form-input:focus-visible {
  outline: 2px solid var(--input-focus-border);
  outline-offset: 2px;
}

/* États de hover améliorés */
.form-group:hover .form-label {
  color: var(--title-accent);
}

.form-group:hover .input-icon {
  color: var(--icon-focus-color);
  transform: scale(1.05);
}

/* Animation pour les champs requis */
.form-label[for="university_name"] {
  position: relative;
}

.form-label[for="university_name"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: -5px;
  width: 3px;
  height: 100%;
  background: #ef4444;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.form-group:hover .form-label[for="university_name"]::before {
  opacity: 1;
}

/* Effet de brillance lors du focus */
.form-input:focus::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
  animation: shine 1.5s ease-in-out infinite;
  pointer-events: none;
  border-radius: var(--radius-lg);
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Style pour les champs invalides */
.form-input:invalid:not(:placeholder-shown):not(:focus) {
  border-color: #ef4444;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>