<template>
  <div class="registration-page">
    <div class="registration-container">
      <div class="registration-form">
        <div class="form-header">
          <h2>REGISTRACIJA</h2>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- First and Last Name Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Ime</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="lastName">Prezime</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- Email and Password Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label for="password">Lozinka</label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <i
                    :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  ></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Repeat Password and City Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="repeatPassword">Potvrdi lozinku</label>
              <div class="password-input-wrapper">
                <input
                  id="repeatPassword"
                  v-model="formData.repeatPassword"
                  :type="showRepeatPassword ? 'text' : 'password'"
                  class="form-input password-input"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="toggleRepeatPasswordVisibility"
                >
                  <i
                    :class="
                      showRepeatPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                    "
                  ></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="city">Grad</label>
              <input
                id="city"
                v-model="formData.city"
                type="text"
                class="form-input"
                required
              />
            </div>
          </div>

          <!-- Phone Number Row -->
          <div class="form-row">
            <div class="form-group full-width">
              <label for="phoneNumber">Broj telefona (opciono)</label>
              <input
                id="phoneNumber"
                v-model="formData.phoneNumber"
                type="tel"
                class="form-input phone-input"
              />
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? "REGISTRACIJA U TOKU..." : "REGISTRUJ SE" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { registerUser } from "@/services/api";

export default {
  name: "RegistrationPage",
  data() {
    return {
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        repeatPassword: "",
        city: "",
        phoneNumber: "",
      },
      isSubmitting: false,
      errorMessage: "",
      successMessage: "",
      showPassword: false,
      showRepeatPassword: false,
    };
  },
  methods: {
    async handleSubmit() {
      // Clear previous messages
      this.errorMessage = "";
      this.successMessage = "";

      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await registerUser(this.formData);

        if (response.success) {
          this.successMessage = "Registracija je uspešna! Možete se prijaviti.";
        } else {
          this.errorMessage = response.result.message || "Greška pri registraciji.";
          return;
        }

        this.resetForm();

        setTimeout(() => {
          this.$router.push("/prijava");
        }, 3000);
      } catch (error) {
        if (error.response && error.response.data) {
          this.errorMessage =
            error.response.data.message || "Greška pri registraciji.";
        } else {
          this.errorMessage =
            "Greška pri registraciji. Molimo pokušajte ponovo.";
        }
        console.error("Registration error:", error);
      } finally {
        this.isSubmitting = false;
      }
    },

    validateForm() {
      if (this.formData.password !== this.formData.repeatPassword) {
        this.errorMessage = "Lozinke se ne poklapaju.";
        return false;
      }

      if (this.formData.password.length < 6) {
        this.errorMessage = "Lozinka mora imati najmanje 6 karaktera.";
        return false;
      }

      if (
        !this.formData.firstName ||
        !this.formData.lastName ||
        !this.formData.email ||
        !this.formData.password ||
        !this.formData.repeatPassword ||
        !this.formData.city
      ) {
        this.errorMessage = "Molimo popunite sva obavezna polja.";
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errorMessage = "Molimo unesite validnu email adresu.";
        return false;
      }

      return true;
    },

    resetForm() {
      this.formData = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        repeatPassword: "",
        city: "",
        phoneNumber: "",
      };
      // Reset password visibility states
      this.showPassword = false;
      this.showRepeatPassword = false;
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },

    toggleRepeatPasswordVisibility() {
      this.showRepeatPassword = !this.showRepeatPassword;
    },
  },
};
</script>

<style scoped>
.registration-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: var(--bg-90);
}

.registration-container {
  width: 100%;
  max-width: 1002px;
  margin: 0 auto;
}

.registration-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  gap: 30px;
  width: 100%;
  max-width: 1002px;
  background: var(--vertical-dark-gradient);
  border-radius: 8px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 100%;
}

.form-header {
  width: 100%;
  max-width: 942px;
}

.form-header h2 {
  font-family: var(--actions);
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #f2f2f2;
  margin: 0;
}

.form-row {
  display: flex;
  gap: 30px;
  width: 100%;
  max-width: 942px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 456px;
  flex: 1;
}

.form-group.full-width {
  width: 100%;
  max-width: 456px;
}

.form-group label {
  font-family: var(--actions);
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  color: var(--text-25);
  padding: 0 5px;
  margin-bottom: 3px;
}

.form-input {
  padding: 10px;
  width: 100%;
  height: 44px;
  background: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  font-family: var(--actions);
  font-size: 14px;
  color: var(--text-10);
  outline: none;
  transition: var(--transition);
}

.form-input:focus {
  border-color: var(--green-primary);
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input {
  padding-right: 45px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-25);
  font-size: 16px;
  transition: var(--transition);
  width: 20px;
  height: 20px;
}

.password-toggle:hover {
  color: var(--green-primary);
}

.password-toggle:focus {
  outline: none;
  color: var(--green-primary);
}

.phone-input {
  max-width: 456px;
}

.error-message {
  color: var(--red-primary);
  font-family: var(--actions);
  font-size: 14px;
  text-align: center;
  background: rgba(209, 17, 1, 0.1);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--red-primary);
  max-width: 942px;
  width: 100%;
}

.success-message {
  color: var(--green-primary);
  font-family: var(--actions);
  font-size: 14px;
  text-align: center;
  background: rgba(23, 187, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--green-primary);
  max-width: 942px;
  width: 100%;
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 20px;
  width: 300px;
  height: 44px;
  background: var(--green-primary);
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  text-transform: uppercase;
  color: var(--text-white);
  transition: var(--transition);
}

.submit-btn:hover:not(:disabled) {
  background: var(--green-primary);
  opacity: var(--hover);
  transform: translateY(var(--translate-y-hover));
  box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: -1px 1px 2px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .registration-form {
    padding: 20px;
    gap: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    width: 100%;
  }

  .form-group.full-width {
    max-width: 100%;
  }

  .form-input,
  .phone-input {
    max-width: 100%;
  }

  .submit-btn {
    width: 100%;
    max-width: 300px;
  }
}

@media screen and (max-width: 480px) {
  .registration-page {
    padding: 10px;
  }

  .registration-form {
    padding: 15px;
    gap: 15px;
  }

  .form-header h2 {
    font-size: 18px;
  }
}
</style>
