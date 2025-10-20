<script setup>
const config = useRuntimeConfig();
const siteUrl = (config.public?.SITE_URL || '').replace(/\/$/, '');
const siteName = config.public?.SITE_NAME || 'Meridian Sport';

useHead({
  title: `Licenciranje slika - ${siteName}`,
  meta: [
    { name: 'description', content: `Informacije o licenciranju i korišćenju slika sa ${siteName} portala.` },
    { name: 'robots', content: 'index, follow' }
  ],
  link: [
    { rel: 'canonical', href: `${siteUrl}/image-license/` }
  ]
});
</script>

<template>
  <div class="content-wrapper">
    <div class="license-page">
      <h1>Licenciranje slika</h1>

      <section class="license-section">
        <h2>Prava i korišćenje</h2>
        <p>Sve slike objavljene na {{ siteName }} portalu zaštićene su autorskim pravima.</p>

        <h3>Vlasništvo slika</h3>
        <ul>
          <li>© {{ siteName }} - Sva prava zadržana</li>
          <li>Slike trećih strana koriste se uz dozvolu ili u skladu sa principom fer upotrebe</li>
          <li>Foto krediti se navode tamo gdje je to primenljivo</li>
        </ul>
      </section>

      <section class="license-section">
        <h2>Zahtevi za licenciranje</h2>
        <p>
          Za zahteve vezane za licenciranje, komercijalno korišćenje ili reprodukciju slika sa našeg portala,
          molimo vas da nas kontaktirate putem email adrese:
        </p>
        <p class="contact-email">
          <a href="mailto:redakcija@meridiansport.rs">redakcija@meridiansport.rs</a>
        </p>
      </section>

      <section class="license-section">
        <h2>Uslovi korišćenja</h2>
        <p>Slike sa {{ siteName }} portala ne smeju se koristiti bez prethodne dozvole za:</p>
        <ul>
          <li>Komercijalne svrhe</li>
          <li>Redistribuciju ili preprodaju</li>
          <li>Kreiranje derivativnih dela</li>
          <li>Bilo koju upotrebu koja krši autorska prava</li>
        </ul>
      </section>

      <section class="license-section">
        <h2>Prijava povrede autorskih prava</h2>
        <p>
          Ako verujete da je vaše autorsko delo korišćeno na način koji predstavlja kršenje autorskih prava,
          molimo vas da nas odmah kontaktirate sa detaljnim informacijama na:
        </p>
        <p class="contact-email">
          <a href="mailto:redakcija@meridiansport.rs">redakcija@meridiansport.rs</a>
        </p>
      </section>

      <div class="back-link">
        <NuxtLink to="/">← Nazad na početnu</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.license-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 32px;
  background-color: var(--bg-70);
  border: 1px solid var(--bg-40);
  border-radius: 8px;
  color: var(--text-white);
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--text-white);
  border-bottom: 2px solid var(--bg-40);
  padding-bottom: 16px;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-top: 32px;
  margin-bottom: 16px;
  color: var(--text-white);
}

h3 {
  font-size: 18px;
  font-weight: 500;
  margin-top: 24px;
  margin-bottom: 12px;
  color: var(--text-white);
}

.license-section {
  margin-bottom: 32px;
}

.license-section p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-90);
  margin-bottom: 16px;
}

.license-section ul {
  list-style: disc;
  margin-left: 24px;
  margin-bottom: 16px;
}

.license-section li {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-90);
  margin-bottom: 8px;
}

.contact-email {
  font-size: 18px;
  font-weight: 500;
  margin: 16px 0;
}

.contact-email a {
  color: var(--green-primary);
  text-decoration: none;
  transition: var(--transition);
}

.contact-email a:hover {
  color: var(--text-white);
  text-decoration: underline;
}

.back-link {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--bg-40);
}

.back-link a {
  color: var(--text-white);
  text-decoration: none;
  font-size: 16px;
  transition: var(--transition);
}

.back-link a:hover {
  color: var(--green-primary);
}

@media screen and (max-width: 768px) {
  .license-page {
    margin: 20px 16px;
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 16px;
  }

  .license-section p,
  .license-section li {
    font-size: 14px;
  }
}
</style>
