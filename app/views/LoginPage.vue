<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form">
        <div class="form-header">
          <h2>PRIJAVA</h2>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Email and Password Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-input"
                :disabled="isLoading"
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
                  :disabled="isLoading"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                  :disabled="isLoading"
                >
                  <i
                    :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                  ></i>
                </button>
              </div>
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

          <!-- Remember Me and Forgot Password Row -->
          <div class="form-options">
            <div class="remember-me">
              <input
                id="rememberMe"
                v-model="formData.rememberMe"
                type="checkbox"
                class="checkbox"
                :disabled="isLoading"
              />
              <label for="rememberMe" class="checkbox-label">Zapamti me</label>
            </div>
            <div class="forgot-password-wrapper">
              <button type="button" class="forgot-password" @click="handleForgotPassword" @mouseenter="showTooltip" @mouseleave="hideTooltip" :disabled="isLoading || !formData.email">Zaboravio/la si lozinku</button>
              <!-- Tooltip -->
              <div
                v-if="!formData.email"
                class="tooltip"
                :class="{ show: isTooltipVisible }"
              >
                Unesite Vašu email adresu u polje za email kako bi dobili link za resetovanje šifre.
              </div>
            </div>
          </div>

          <!-- Submit Button and Registration Link -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="isLoading">PRIJAVLJIVANJE...</span>
              <span v-else>PRIJAVI SE</span>
            </button>
            <p class="register-link">
              Nemate nalog?
              <router-link to="/registracija" class="register-link-text"
                >Registruj se</router-link
              >
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { loginUser, fetchUserData, resetPasswordViaEmail } from "@/services/api";

export default {
  name: "LoginPage",
  data() {
    return {
      formData: {
        email: "",
        password: "",
        rememberMe: false,
      },
      isLoading: false,
      errorMessage: "",
      successMessage: "",
      showPassword: false,
      isResettingPassword: false,
      isTooltipVisible: false,
    };
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await loginUser(this.formData);

        if (response.success) {
          this.successMessage = "Uspešno ste se prijavili!";

          // Save token first
          const storage = this.formData.rememberMe
            ? localStorage
            : sessionStorage;
          storage.setItem("token", response.token);

          // Fetch user data with Authorization and Jwt-token headers
          try {
            const userDataResponse = await fetchUserData(
              response.token,
              this.formData.email,
              this.formData.password
            );
            const userPayload =
              userDataResponse?.result?.user ||
              userDataResponse?.user ||
              response.user;
            if (userPayload) {
              storage.setItem("user", JSON.stringify(userPayload));
            }
          } catch (e) {
            console.error("Failed to fetch user data after login:", e);
            if (response.user) {
              storage.setItem("user", JSON.stringify(response.user));
            }
          }

          // Redirect to home page after successful login
          setTimeout(() => {
            this.$router.push("/");
          }, 1500);
        } else {
          this.errorMessage =
            response.message || "Neuspešna prijava. Molimo pokušajte ponovo.";
        }
      } catch (error) {
        console.error("Login error:", error);

        // Handle different error types
        if (error.response?.status === 401) {
          this.errorMessage =
            "Poslat Vam je email sa linkom za resetovanje lozinke.";
        } else if (error.response?.status === 422) {
          this.errorMessage =
            "Nevažeći format podataka. Molimo proverite unos.";
        } else if (error.response?.status >= 500) {
          this.errorMessage = "Greška na serveru. Molimo pokušajte kasnije.";
        } else {
          this.errorMessage = "Došlo je do greške. Molimo pokušajte ponovo.";
        }
      } finally {
        this.isLoading = false;
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    showTooltip() {
      this.isTooltipVisible = true;
    },
    hideTooltip() {
      this.isTooltipVisible = false;
    },
    async handleForgotPassword() {
      // Validate email before proceeding
      if (!this.formData.email) {
        this.errorMessage = "Molimo unesite email adresu pre nego što zatražite resetovanje lozinke.";
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.errorMessage = "Molimo unesite važeću email adresu.";
        return;
      }

      this.isResettingPassword = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await resetPasswordViaEmail(this.formData.email);
        
        if (response.success) {
          this.successMessage = "Poslat Vam je email sa linkom za resetovanje lozinke. Molimo proverite vašu email poštu.";
        } else {
          this.errorMessage = response.message || "Došlo je do greške prilikom slanja email-a. Molimo pokušajte ponovo.";
        }
      } catch (error) {
        console.error("Reset password error:", error);
        
        // Handle different error types
        if (error.response?.status === 404) {
          this.errorMessage = "Email adresa nije pronađena u našoj bazi podataka.";
        } else if (error.response?.status === 422) {
          this.errorMessage = "Nevažeći format email adrese.";
        } else if (error.response?.status >= 500) {
          this.errorMessage = "Greška na serveru. Molimo pokušajte kasnije.";
        } else {
          this.errorMessage = "Došlo je do greške. Molimo pokušajte ponovo.";
        }
      } finally {
        this.isResettingPassword = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: var(--bg-90);
}

.login-container {
  width: 100%;
  max-width: 1002px;
  margin: 0 auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  gap: 30px;
  width: 100%;
  max-width: 1002px;
  min-height: 332px;
  background: var(--vertical-dark-gradient);
  border-radius: 8px;
}

form {
  width: 100%;
}

.form-header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 942px;
}

.form-header h2 {
  font-family: var(--actions);
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: var(--text-white);
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
  flex: 1;
}

.form-group label {
  font-family: var(--actions);
  font-weight: 400;
  font-size: 13px;
  line-height: 15px;
  color: var(--text-25);
  padding: 0 5px;
}

.form-input {
  display: flex;
  padding: 10px;
  height: 44px;
  width: 100%;
  background: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  font-family: var(--actions);
  font-size: 14px;
  color: var(--text-white);
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
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: var(--text-25);
  font-size: 18px;
  z-index: 1;
}

.password-toggle:hover {
  color: var(--green-primary);
}

.password-toggle:disabled {
  color: #666;
  cursor: not-allowed;
}

.error-message {
  width: 100%;
  max-width: 942px;
  padding: 10px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid #dc3545;
  border-radius: 4px;
  color: #dc3545;
  font-family: var(--actions);
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.success-message {
  width: 100%;
  max-width: 942px;
  padding: 10px;
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid #28a745;
  border-radius: 4px;
  color: #28a745;
  font-family: var(--actions);
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
  margin-top: 10px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 942px;
  margin: 30px 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox {
  width: 19px;
  height: 18px;
  background: transparent;
  border: 1.9px solid var(--green-primary);
  border-radius: 2px;
  cursor: pointer;
  appearance: none;
  position: relative;
}

.checkbox:checked::after {
  content: "✓";
  position: absolute;
  top: -2px;
  left: 4px;
  color: var(--green-primary);
  font-size: 14px;
  font-weight: bold;
}

.checkbox-label {
  font-family: var(--actions);
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: var(--text-25);
  cursor: pointer;
}

.forgot-password {
  font-family: var(--actions);
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  text-decoration: underline;
  color: var(--yellow-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: var(--transition);
}

.forgot-password:hover:not(:disabled) {
  color: #e6b800;
  text-decoration: none;
}

.forgot-password:disabled {
  color: #666;
  cursor: not-allowed;
  text-decoration: none;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 300px;
  margin: 0 auto;
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 20px;
  width: 100%;
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

.submit-btn:hover {
  background: #14a000;
  transform: translateY(-2px);
  box-shadow: -2px 4px 6px rgba(0, 0, 0, 0.35);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: -1px 1px 2px rgba(0, 0, 0, 0.2);
}

.submit-btn:disabled {
  background: #666;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn:disabled:hover {
  background: #666;
  transform: none;
  box-shadow: none;
}

.register-link {
  font-family: var(--actions);
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  color: var(--text-25);
  text-align: center;
  margin: 0;
}

.register-link-text {
  color: var(--green-primary);
  text-decoration: underline;
  transition: var(--transition);
}

.register-link-text:hover {
  color: #14a000;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .login-form {
    padding: 20px;
    gap: 20px;
    min-height: 300px;
  }

  .form-row {
    flex-direction: column;
    gap: 20px;
  }

  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .forgot-password {
    text-align: left;
  }

  .form-actions {
    width: 100%;
  }

  .submit-btn {
    max-width: 300px;
  }
}

@media screen and (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .login-form {
    padding: 15px;
    gap: 15px;
  }

  .form-header h2 {
    font-size: 18px;
  }
}

/* Tooltip styles for forgot password button */
.forgot-password-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-50);
  color: var(--text-white);
  padding: 10px;
  border-radius: 8px;
  font-family: var(--actions);
  font-size: 14px;
  line-height: 1.4;
  white-space: normal;
  border: 1px solid var(--bg-20);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition);
  z-index: 1000;
  max-width: 250px;
  text-align: center;
  width: max-content;
}

.tooltip::after {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: var(--bg-20);
}

.tooltip.show {
  opacity: 1;
  visibility: visible;
}
</style>
