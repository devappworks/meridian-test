<template>
  <div class="account-page">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <div class="tab-container">
        <button
          ref="profileTab"
          class="tab-button"
          @click="switchTab('profile')"
          :class="{ active: activeTab === 'profile' }"
        >
          DETALJI PROFILA
        </button>
        <button
          ref="passwordTab"
          class="tab-button"
          @click="switchTab('password')"
          :class="{ active: activeTab === 'password' }"
        >
          PROMENI LOZINKU
        </button>
        <div class="tab-underline" :style="underlineStyle"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-container">
      <!-- Profile Details Tab -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <!-- Profile Picture Section -->
        <div class="profile-picture-section">
          <div class="profile-picture-container">
            <div class="profile-picture">
              <img v-if="profilePicture" :src="profilePicture" alt="Profile" />
              <i v-else class="fa-solid fa-user profile-icon"></i>
            </div>
            <button class="upload-button" @click="handleImageUpload">
              <svg
                width="20"
                height="19"
                viewBox="0 0 20 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.9875 14.825C11.1959 14.825 12.2083 14.4167 13.025 13.6C13.8417 12.7833 14.25 11.7709 14.25 10.5625C14.25 9.35415 13.8417 8.34585 13.025 7.5375C12.2083 6.72915 11.1959 6.325 9.9875 6.325C8.77915 6.325 7.77085 6.72915 6.9625 7.5375C6.15415 8.34585 5.75 9.35415 5.75 10.5625C5.75 11.7709 6.15415 12.7833 6.9625 13.6C7.77085 14.4167 8.77915 14.825 9.9875 14.825ZM9.9875 13.325C9.19585 13.325 8.54165 13.0625 8.025 12.5375C7.50835 12.0125 7.25 11.3541 7.25 10.5625C7.25 9.77085 7.50835 9.11665 8.025 8.6C8.54165 8.08335 9.19585 7.825 9.9875 7.825C10.7792 7.825 11.4375 8.08335 11.9625 8.6C12.4875 9.11665 12.75 9.77085 12.75 10.5625C12.75 11.3541 12.4875 12.0125 11.9625 12.5375C11.4375 13.0625 10.7792 13.325 9.9875 13.325ZM1.5 18.5C1.1 18.5 0.75 18.35 0.45 18.05C0.15 17.75 0 17.4 0 17V4.175C0 3.79165 0.15 3.44585 0.45 3.1375C0.75 2.82915 1.1 2.675 1.5 2.675H5.175L6.55 1.025C6.68335 0.841665 6.85 0.708335 7.05 0.625C7.25 0.541665 7.46665 0.5 7.7 0.5H12.3C12.5333 0.5 12.75 0.541665 12.95 0.625C13.15 0.708335 13.3166 0.841665 13.45 1.025L14.825 2.675H18.5C18.8834 2.675 19.2292 2.82915 19.5375 3.1375C19.8458 3.44585 20 3.79165 20 4.175V17C20 17.4 19.8458 17.75 19.5375 18.05C19.2292 18.35 18.8834 18.5 18.5 18.5H1.5ZM1.5 17H18.5V4.175H14.125L12.3 2H7.7L5.875 4.175H1.5V17Z"
                  fill="black"
                />
              </svg>
            </button>
            <input
              type="file"
              ref="fileInput"
              @change="onFileSelected"
              accept="image/*"
              style="display: none"
            />
          </div>
          <p class="max-size-text">Maksimalna veličina: 123 MB</p>
          <p class="gravatar-text">
            Možete promeniti svoju profilnu sliku na
            <a href="#" class="gravatar-link">Gravatar</a>.
          </p>
        </div>

        <!-- Form Fields -->
        <div class="form-section">
          <div class="form-row">
            <FormField
              label="Ime"
              v-model="formData.firstName"
              type="text"
              :placeholder="DBFormData.firstName"
            />
            <FormField
              label="Prezime"
              v-model="formData.lastName"
              type="text"
              :placeholder="DBFormData.lastName"
            />
          </div>

          <div class="form-row">
            <FormField
              label="Broj telefona"
              v-model="formData.phoneNumber"
              type="tel"
              :placeholder="DBFormData.phoneNumber"
            />
            <FormField
              label="Grad"
              v-model="formData.city"
              type="text"
              :placeholder="DBFormData.city"
            />
          </div>
        </div>

        <!-- Save Button -->
        <button
          class="save-button"
          @click="saveChanges"
          :disabled="isLoading"
          :class="{ loading: isLoading }"
        >
          {{ isLoading ? "ČUVANJE..." : "SAČUVAJ IZMENE" }}
        </button>
      </div>

      <!-- Change Password Tab -->
      <div v-if="activeTab === 'password'" class="password-section">
        <div class="password-form-section">
          <div class="form-row">
            <FormField
              label="Trenutna lozinka"
              v-model="passwordData.currentPassword"
              type="password"
              placeholder=""
              full-width
            />
          </div>

          <div class="form-row">
            <FormField
              label="Nova lozinka"
              v-model="passwordData.newPassword"
              type="password"
              placeholder=""
            />
            <FormField
              label="Potvrdi novu lozinku"
              v-model="passwordData.confirmPassword"
              type="password"
              placeholder=""
            />
          </div>
        </div>

        <button
          class="save-button"
          @click="changePassword"
          :disabled="isPasswordLoading"
          :class="{ loading: isPasswordLoading }"
        >
          {{ isPasswordLoading ? "ČUVANJE..." : "SAČUVAJ IZMENE" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import FormField from "@/components/FormField.vue";
import { updateUserProfile, updateUserPassword, fetchUserData } from "@/services/api.js";

export default {
  name: "AccountPage",
  components: {
    FormField,
  },
  data() {
    return {
      activeTab: "profile",
      profilePicture: null,
      formData: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        city: "",
      },
      DBFormData: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        city: "",
      },
      passwordData: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      underlineStyle: {
        left: "0px",
        width: "0px",
      },
      isLoading: false,
      isPasswordLoading: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.updateUnderlinePosition();
    });
    window.addEventListener("resize", this.updateUnderlinePosition);
    this.fetchUserData();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateUnderlinePosition);
  },
  watch: {
    activeTab() {
      this.$nextTick(() => {
        this.updateUnderlinePosition();
      });
    },
  },
  methods: {
    async fetchUserData() {
      const jwtToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetchUserData(jwtToken);
      console.log("response", response);
      const userResponse = response.result.user;
      
      // Update the component's DBFormData property
      this.DBFormData = {
        firstName: userResponse.first_name,
        lastName: userResponse.last_name,
        email: userResponse.email,
        phoneNumber: userResponse.phone_number,
        city: userResponse.city,
      };
      
      // Also update the profile picture
      this.profilePicture = response.profile_picture;
      
      console.log("DBFormData", this.DBFormData);
    },
    switchTab(tab) {
      this.activeTab = tab;
      this.$nextTick(() => {
        this.updateUnderlinePosition();
      });
    },
    updateUnderlinePosition() {
      const activeTabRef =
        this.activeTab === "profile" ? "profileTab" : "passwordTab";
      const activeTabElement = this.$refs[activeTabRef];

      if (activeTabElement) {
        const tabRect = activeTabElement.getBoundingClientRect();

        this.underlineStyle = {
          left: `${activeTabElement.offsetLeft}px`,
          width: `${tabRect.width}px`,
        };
      }
    },
    handleImageUpload() {
      this.$refs.fileInput.click();
    },
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profilePicture = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async saveChanges() {
      this.isLoading = true;

      try {
        const jwtToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const profileData = {};
        if (this.formData.firstName.trim())
          profileData.firstName = this.formData.firstName.trim();
        if (this.formData.lastName.trim())
          profileData.lastName = this.formData.lastName.trim();
        if (this.formData.city.trim())
          profileData.city = this.formData.city.trim();
        if (this.formData.phoneNumber.trim())
          profileData.phoneNumber = this.formData.phoneNumber.trim();

        if (Object.keys(profileData).length === 0) {
          alert("Molimo unesite barem jedno polje za ažuriranje");
          return;
        }

        const response = await updateUserProfile(profileData, jwtToken);

        if (response.success || response.status === "success") {
          alert("Profil je uspešno ažuriran!");
        } else {
          alert("Neuspešno ažuriranje profila. Molimo pokušajte ponovo.");
        }
      } catch (error) {
        console.error("Error updating profile:", error);

        if (error.response && error.response.status === 401) {
          alert("Vaša sesija je istekla. Molimo prijavite se ponovo.");
        } else {
          alert(
            "Došlo je do greške prilikom ažuriranja profila. Molimo pokušajte ponovo."
          );
        }
      } finally {
        this.isLoading = false;
      }
    },
    async changePassword() {
      this.isPasswordLoading = true;

      try {
        const jwtToken =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!jwtToken) {
          alert("Molimo prijavite se da biste promenili lozinku");
          return;
        }

        const response = await updateUserPassword(this.passwordData, jwtToken);

        if (response.success || response.status === "success") {
          alert("Lozinka je uspešno promenjena!");

          this.passwordData = {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          };

          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          this.$router.push("/login");
        } else {
          alert("Failed to change password. Please try again.");
        }
      } catch (error) {
        console.error("Error changing password:", error);

        if (error.response && error.response.status === 401) {
          alert(
            "Invalid current password or session expired. Please try again."
          );
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(error.response.data.message);
        } else {
          alert(
            "An error occurred while changing your password. Please try again."
          );
        }
      } finally {
        this.isPasswordLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.account-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 0;
  min-height: 100vh;
  max-width: 1440px;
  margin: 0 auto;
}

.tab-navigation {
  width: 100%;
  max-width: 1002px;
  margin-bottom: 0;
}

.tab-container {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  border-bottom: 2px solid var(--bg-70);
}

.tab-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background: none;
  border: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-family: var(--sport-category-tags);
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: var(--text-white);
  transition: color 0.3s ease;
  position: relative;
}

.tab-button.active {
  color: var(--yellow-primary);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-underline {
  position: absolute;
  bottom: -2px;
  height: 2px;
  background: var(--yellow-primary);
  transition: all 0.3s ease;
  border-radius: 1px;
}

.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 44px 30px;
  gap: 30px;
  width: 100%;
  max-width: 1002px;
  background: linear-gradient(
    180.14deg,
    var(--bg-90) 0.12%,
    var(--bg-70) 100.47%
  );
  border-radius: 8px;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 942px;
}

.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  position: relative;
}

.profile-picture-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.profile-picture {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-icon {
  font-size: 60px;
  color: #cacaca;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.upload-button {
  position: absolute;
  right: -10px;
  bottom: 10px;
  width: 44px;
  height: 44px;
  background: var(--yellow-primary);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.upload-button:hover {
  background: #e6b800;
  transform: scale(1.05);
}

.upload-button svg {
  width: 24px;
  height: 24px;
  color: #000000;
}

.max-size-text {
  font-size: 12px;
  line-height: 14px;
  color: #cacaca;
  margin: 0;
}

.gravatar-text {
  font-size: 13px;
  line-height: 15px;
  color: #cacaca;
  margin: 0;
  text-align: center;
}

.gravatar-link {
  color: var(--yellow-primary);
  text-decoration: none;
}

.gravatar-link:hover {
  text-decoration: underline;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.form-row {
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 100%;
}

.form-row:last-child {
  justify-content: flex-start;
}

.save-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  background: var(--green-primary);
  border: none;
  border-radius: 4px;
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  text-transform: uppercase;
  color: var(--text-white);
  transition: all 0.3s ease;
  min-width: 300px;
}

.save-button:hover {
  background: #15a300;
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-button.loading {
  background: #15a300;
}

.password-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  width: 100%;
  max-width: 942px;
}

.password-form-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 942px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .account-page {
    padding: 20px 15px 0;
  }

  .content-container {
    padding: 30px 20px;
  }

  .tab-navigation {
    max-width: 100%;
  }

  .form-section,
  .password-form-section {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }

  .tab-button {
    font-size: 12px;
    padding: 8px 15px;
  }

  .tab-navigation {
    max-width: 100%;
  }

  .save-button {
    min-width: 100%;
    font-size: 16px;
  }

  .profile-picture {
    width: 120px;
    height: 120px;
  }

  .profile-icon {
    font-size: 50px;
  }

  .upload-button {
    width: 40px;
    height: 40px;
    right: -5px;
  }

  .password-section {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 20px 15px;
  }

  .profile-picture {
    width: 100px;
    height: 100px;
  }

  .profile-icon {
    font-size: 40px;
  }

  .upload-button {
    width: 36px;
    height: 36px;
  }

  .upload-button svg {
    width: 20px;
    height: 20px;
  }
}
</style>
