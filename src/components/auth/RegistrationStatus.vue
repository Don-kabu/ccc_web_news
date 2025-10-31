<template>
  <div class="form-status">
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
defineProps({
  form: {
    type: Object,
    required: true
  }
})
</script>