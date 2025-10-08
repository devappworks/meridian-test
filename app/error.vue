<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-content">
        <!-- Error Code -->
        <h1 class="error-code">{{ error.statusCode }}</h1>

        <!-- Error Message -->
        <h2 class="error-title">
          {{ errorTitle }}
        </h2>

        <p class="error-description">
          {{ errorMessage }}
        </p>

        <!-- Action Buttons -->
        <div class="error-actions">
          <NuxtLink to="/" class="btn btn-primary">
            <i class="fas fa-home"></i>
            Nazad na početnu
          </NuxtLink>

          <button @click="handleRetry" class="btn btn-secondary">
            <i class="fas fa-redo"></i>
            Pokušaj ponovo
          </button>
        </div>

        <!-- Helpful Links -->
        <div class="helpful-links" v-if="error.statusCode === 404">
          <h3>Možda vas interesuje:</h3>
          <ul>
            <li><NuxtLink to="/fudbal">Fudbal</NuxtLink></li>
            <li><NuxtLink to="/kosarka">Košarka</NuxtLink></li>
            <li><NuxtLink to="/tenis">Tenis</NuxtLink></li>
            <li><NuxtLink to="/odbojka">Odbojka</NuxtLink></li>
            <li><NuxtLink to="/najnovije-vesti">Najnovije vesti</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// Set the HTTP response status code on the server
if (import.meta.server) {
  const event = useRequestEvent()
  if (event) {
    setResponseStatus(event, props.error.statusCode || 500)
  }
}

// Error titles and messages based on status code
const errorTitle = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Stranica nije pronađena'
    case 500:
      return 'Greška na serveru'
    case 403:
      return 'Pristup odbijen'
    default:
      return 'Došlo je do greške'
  }
})

const errorMessage = computed(() => {
  switch (props.error.statusCode) {
    case 404:
      return 'Stranica koju tražite ne postoji ili je uklonjena. Proverite URL adresu ili se vratite na početnu stranicu.'
    case 500:
      return 'Došlo je do greške na serveru. Naš tim radi na rešavanju problema.'
    case 403:
      return 'Nemate dozvolu za pristup ovoj stranici.'
    default:
      return 'Nešto nije u redu. Molimo pokušajte ponovo kasnije.'
  }
})

const handleRetry = () => {
  if (import.meta.client) {
    window.location.reload()
  }
}

// SEO metadata for error page
useHead({
  title: `${errorTitle.value} - Meridian Sport`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-90, #0a1116);
  color: var(--text-white, #ffffff);
  padding: 20px;
}

.error-container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.error-content {
  padding: 40px;
  background: var(--bg-70, #16232a);
  border-radius: 12px;
  border: 1px solid var(--bg-50, #2d3e47);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 20px 0;
  color: var(--yellow-primary, #ffd000);
  text-shadow: 0 0 30px rgba(255, 208, 0, 0.3);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-white, #ffffff);
}

.error-description {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-25, rgba(255, 255, 255, 0.7));
  margin: 0 0 32px 0;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: var(--yellow-primary, #ffd000);
  color: var(--text-90, #0a1116);
}

.btn-primary:hover {
  background: var(--yellow-hover, #ffda33);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 208, 0, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--text-white, #ffffff);
  border: 2px solid var(--bg-40, #3d515c);
}

.btn-secondary:hover {
  border-color: var(--yellow-primary, #ffd000);
  color: var(--yellow-primary, #ffd000);
}

.helpful-links {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--bg-50, #2d3e47);
}

.helpful-links h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--text-white, #ffffff);
}

.helpful-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.helpful-links li {
  margin: 0;
}

.helpful-links a {
  display: inline-block;
  padding: 8px 16px;
  background: var(--bg-50, #2d3e47);
  color: var(--text-white, #ffffff);
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.helpful-links a:hover {
  background: var(--yellow-primary, #ffd000);
  color: var(--text-90, #0a1116);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-description {
    font-size: 16px;
  }

  .error-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
