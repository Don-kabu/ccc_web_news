<template>
  <div class="form-section">
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
defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})
</script>