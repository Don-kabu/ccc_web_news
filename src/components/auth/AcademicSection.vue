<template>
  <div class="form-section" :class="{ 'dark': isDark }">
    <h3 class="section-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
        <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
      </svg>
      Structure académique
    </h3>
    
    <!-- Ligne: Faculté et Département -->
    <div class="form-row">
      <div class="form-group">
        <label for="faculty_name" class="form-label">Faculté *</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
            <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            id="faculty_name"
            v-model="modelValue.faculty_name"
            type="text"
            placeholder="Faculté des Sciences Appliquées"
            class="form-input"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="department_name" class="form-label">Département *</label>
        <div class="input-wrapper">
          <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" stroke="currentColor" stroke-width="2"/>
            <path d="M21 7L12 12L3 7L12 2L21 7Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input
            id="department_name"
            v-model="modelValue.department_name"
            type="text"
            placeholder="Informatique et Technologies"
            class="form-input"
            required
          />
        </div>
      </div>
    </div>

    <!-- Auditoire (optionnel) -->
    <div class="form-group">
      <label for="auditoire_name" class="form-label">Auditoire principal (optionnel)</label>
      <div class="input-wrapper">
        <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 12L12 3L21 12V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V12Z" stroke="currentColor" stroke-width="2"/>
          <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2"/>
        </svg>
        <input
          id="auditoire_name"
          v-model="modelValue.auditoire_name"
          type="text"
          placeholder="Amphi Principal"
          class="form-input"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* =========================== */
/* CSS Variables for Theming  */
/* =========================== */
.form-section {
  /* Spacing */
  --section-padding: 1.5rem;
  --section-margin: 1rem 0;
  --row-gap: 1rem;
  --group-margin: 1rem 0;
  
  /* Colors - Light Mode */
  --bg-color: #ffffff;
  --border-color: #e5e7eb;
  --text-color: #1f2937;
  --text-muted: #6b7280;
  --accent-color: #3b82f6;
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --input-border-focus: #3b82f6;
  --input-text: #1f2937;
  --input-placeholder: #9ca3af;
  --label-color: #374151;
  --shadow: rgba(0, 0, 0, 0.1);
  --hover-shadow: rgba(0, 0, 0, 0.15);
  --icon-color: #6b7280;
  --icon-accent: #3b82f6;
  
  /* Animation Colors */
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --shine-color: rgba(255, 255, 255, 0.4);
  
  /* Transitions */
  --transition-base: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 0.15s ease;
  --transition-bounce: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.form-section.dark {
  /* Colors - Dark Mode */
  --bg-color: #1f2937;
  --border-color: #374151;
  --text-color: #f9fafb;
  --text-muted: #d1d5db;
  --accent-color: #60a5fa;
  --input-bg: #374151;
  --input-border: #4b5563;
  --input-border-focus: #60a5fa;
  --input-text: #f9fafb;
  --input-placeholder: #9ca3af;
  --label-color: #e5e7eb;
  --shadow: rgba(0, 0, 0, 0.3);
  --hover-shadow: rgba(0, 0, 0, 0.4);
  --icon-color: #9ca3af;
  --icon-accent: #60a5fa;
  
  /* Dark Mode Specific */
  --shine-color: rgba(96, 165, 250, 0.2);
}

/* =========================== */
/* Component Structure         */
/* =========================== */
.form-section {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: var(--section-padding);
  margin: var(--section-margin);
  color: var(--text-color);
  transition: var(--transition-base);
  animation: slideInUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-color), var(--success-color));
  animation: progressShine 2s infinite;
}

/* =========================== */
/* Section Title               */
/* =========================== */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
  transition: var(--transition-base);
}

.section-title svg {
  color: var(--accent-color);
  transition: var(--transition-base);
  animation: pulse 2s infinite;
}

.section-title:hover svg {
  color: var(--icon-accent);
  transform: scale(1.1);
  animation: none;
}

/* =========================== */
/* Form Layout                 */
/* =========================== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--row-gap);
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.form-group {
  margin: var(--group-margin);
  animation: fadeInUp 0.6s ease-out backwards;
}

.form-group:nth-child(2) {
  animation-delay: 0.1s;
}

.form-group:nth-child(3) {
  animation-delay: 0.2s;
}

/* =========================== */
/* Labels                      */
/* =========================== */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--label-color);
  margin-bottom: 0.5rem;
  transition: var(--transition-base);
}

/* =========================== */
/* Input Wrapper & Icons       */
/* =========================== */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--icon-color);
  transition: var(--transition-base);
  z-index: 1;
  pointer-events: none;
}

.input-wrapper:focus-within .input-icon {
  color: var(--icon-accent);
  transform: scale(1.1);
  animation: bounce 0.6s ease;
}

/* =========================== */
/* Form Inputs                 */
/* =========================== */
.form-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: 0.875rem;
  transition: var(--transition-bounce);
  outline: none;
  position: relative;
}

.form-input::placeholder {
  color: var(--input-placeholder);
  transition: var(--transition-base);
}

.form-input:focus {
  border-color: var(--input-border-focus);
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 4px 12px var(--shadow);
  transform: translateY(-1px);
  animation: inputFocus 0.3s ease;
}

.form-input:focus::placeholder {
  color: var(--text-muted);
  transform: translateX(4px);
}

.form-input:valid {
  border-color: var(--success-color);
  animation: validInput 0.5s ease;
}

.form-input:invalid:not(:focus):not(:placeholder-shown) {
  border-color: var(--error-color);
  animation: shake 0.5s ease;
}

/* =========================== */
/* Hover Effects               */
/* =========================== */
.form-group:hover .form-label {
  color: var(--accent-color);
  transform: translateX(2px);
}

.form-group:hover .input-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  background: linear-gradient(45deg, transparent, var(--shine-color), transparent);
  animation: shine 1.5s ease;
  pointer-events: none;
  z-index: 0;
}

/* =========================== */
/* Animations                  */
/* =========================== */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: scale(1);
  }
  40%, 43% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1.05);
  }
  90% {
    transform: scale(1.02);
  }
}

@keyframes inputFocus {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

@keyframes validInput {
  0% {
    border-color: var(--input-border);
  }
  50% {
    border-color: var(--success-color);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  }
  100% {
    border-color: var(--success-color);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-4px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(4px);
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes progressShine {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* =========================== */
/* Accessibility               */
/* =========================== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.form-input:focus {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .form-section {
    border-width: 2px;
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .form-input:focus {
    border-width: 3px;
  }
}

/* =========================== */
/* Print Styles                */
/* =========================== */
@media print {
  .form-section {
    border: 1px solid #000;
    box-shadow: none;
    animation: none;
  }
  
  .form-input {
    border: 1px solid #000;
    background: white !important;
    color: black !important;
  }
}
</style>