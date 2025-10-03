<template>
  <div class="newsletter">
    <div class="newsletter-content">
      <div class="social-icons">
        <a
          href="https://www.instagram.com/meridiansportrs/"
          class="social-icon"
        >
          <img src="@/assets/images/article/instagram.png" alt="Instagram" />
        </a>
        <a href="https://x.com/meridiansportrs" class="social-icon">
          <img src="@/assets/images/newsletter/twitter.svg" alt="X" />
        </a>
        <a href="https://www.facebook.com/SportMeridian/" class="social-icon">
          <img src="@/assets/images/article/facebook.png" alt="Facebook" />
        </a>
        <a href="https://www.youtube.com/@meridiansport" class="social-icon">
          <img src="@/assets/images/newsletter/youtube.svg" alt="YouTube" />
        </a>
      </div>

      <div class="newsletter-form">
        <h3 class="newsletter-title">Želite da budete u toku sa novostima?</h3>

        <div class="form-wrap">
          <input
            type="email"
            placeholder="E-mail adresa"
            class="newsletter-input"
            v-model="email"
          />
          <p v-if="!errorMessage" class="newsletter-info">
            Prijavite se na naš bilten!
          </p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button
            class="btn btn-yellow newsletter-submit"
            @click="handleSubmit"
          >
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addNewsletterEmail } from "@/services/api";

export default {
  name: "NewsletterForm",
  data() {
    return {
      email: "",
      errorMessage: "",
    };
  },

  methods: {
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    async handleSubmit() {
      this.errorMessage = "";

      if (!this.email) {
        this.errorMessage = "Molimo unesite e-mail adresu.";
        return;
      }

      if (!this.isValidEmail(this.email)) {
        this.errorMessage = "Molimo unesite validnu e-mail adresu.";
        return;
      }

      try {
        console.log("Adding newsletter email:", this.email);
        await addNewsletterEmail(this.email);
        this.email = "";
        this.errorMessage = "";
      } catch (error) {
        console.error("Error adding newsletter email:", error);
        this.errorMessage = "Već ste se prijavili na naš bilten.";
      }
    },
  },
};
</script>

<style scoped>
.newsletter {
  padding: 24px 12px 10px;
  background: var(--vertical-dark-gradient);
  border-radius: 8px;
  margin-top: 20px;
}

.newsletter-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.social-icons {
  display: flex;
  align-items: flex-start;
  gap: 16.5px;
  margin-bottom: 24px;
}

.social-icon {
  width: 44px;
  height: 44px;
  transition: opacity 0.2s;
}

.social-icon img {
  width: auto;
  height: 100%;
}

.social-icon i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 22px;
  color: var(--text-white);
}
.social-icon:hover {
  opacity: 0.8;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.newsletter-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 26px;
  letter-spacing: -0.25px;
  color: var(--text-white);
  margin-bottom: 4px;
}

.form-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 16px;
}

.newsletter-input {
  width: 100%;
  height: 44px;
  padding: 10px;
  background-color: var(--bg-50);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  color: var(--text-white);
  font-size: 12px;
}

.newsletter-input::placeholder {
  color: var(--text-25);
}

.newsletter-info {
  font-weight: 400;
  font-size: 12px;
  line-height: 26px;
  letter-spacing: -0.25px;
  color: var(--text-25);
  margin-top: -16px;
}

.error-message {
  font-weight: 400;
  font-size: 12px;
  line-height: 26px;
  letter-spacing: -0.25px;
  color: #ff6b6b;
  margin-top: -16px;
}

.newsletter-submit {
  width: 100%;
  font-weight: 600;
  font-size: 14px;
  line-height: 26px;
  letter-spacing: -0.25px;
}
</style>
