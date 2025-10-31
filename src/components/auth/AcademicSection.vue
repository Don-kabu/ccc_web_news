<template>
  <div class="form-section">
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
defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
</script>