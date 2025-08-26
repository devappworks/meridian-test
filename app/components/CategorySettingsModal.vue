<template>
  <div v-if="isOpen" class="modal-overlay" @click="close">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>DODAJ U MOJE VESTI</h2>
      </div>

      <div class="modal-content">
        <div v-if="isLoading" class="loading-container">
          <p>Učitavanje kategorija...</p>
        </div>
        <div v-else class="category-grid">
          <div
            class="category-row"
            v-for="(row, rowIndex) in Math.ceil(categories.length / 4)"
            :key="rowIndex"
          >
            <div
              v-for="category in categories.slice(
                rowIndex * 4,
                (rowIndex + 1) * 4
              )"
              :key="category.id"
              class="category-item"
              :class="{ active: isCategorySelected(category.id) }"
              @click="toggleCategory(category.id)"
            >
              <div class="icon-container">
                <img
                  :src="`${category.icon}?crop=true`"
                  :alt="category.name"
                />
              </div>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close" @click="close">ZATVORI</button>
        <button class="btn-confirm" @click="confirm" :disabled="isLoading">
          POTVRDI
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCustomCategories } from "@/services/api";

export default {
  name: "CategorySettingsModal",
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    selectedCategories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      categories: [],
      localSelectedCategories: [],
      isLoading: false,
    };
  },
  watch: {
    selectedCategories: {
      immediate: true,
      handler(newVal) {
        this.localSelectedCategories = [...newVal];
      },
    },
    isOpen: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          await this.fetchCategoriesFromApi();
          this.loadSelectedCategoriesFromStorage();
        }
      },
    },
  },
  methods: {
    async fetchCategoriesFromApi() {
      this.isLoading = true;
      try {
        const response = await fetchCustomCategories();
        if (response.success && response.result.categories) {
          this.categories = response.result.categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.media && category.media["thumb-mini"] ? category.media["thumb-mini"] : '',
          }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to empty array or show error message
        this.categories = [];
      } finally {
        this.isLoading = false;
      }
    },
    loadSelectedCategoriesFromStorage() {
      try {
        const savedCategories = localStorage.getItem("selectedCategories");
        if (savedCategories) {
          this.localSelectedCategories = JSON.parse(savedCategories);
        }
      } catch (error) {
        console.error("Error loading categories from localStorage:", error);
        this.localSelectedCategories = [];
      }
    },
    saveSelectedCategoriesToStorage() {
      try {
        localStorage.setItem(
          "selectedCategories",
          JSON.stringify(this.localSelectedCategories)
        );
      } catch (error) {
        console.error("Error saving categories to localStorage:", error);
      }
    },
    toggleCategory(categoryId) {
      const index = this.localSelectedCategories.indexOf(categoryId);
      if (index === -1) {
        this.localSelectedCategories.push(categoryId);
      } else {
        this.localSelectedCategories.splice(index, 1);
      }
    },
    close() {
      this.$emit("close");
    },
    confirm() {
      this.saveSelectedCategoriesToStorage();
      this.$emit("confirm", this.localSelectedCategories);
    },
    isCategorySelected(categoryId) {
      return this.localSelectedCategories.includes(categoryId);
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  background: var(--bg-90);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  background: var(--bg-80);
  border-radius: 4px 4px 0px 0px;
}

.modal-header h2 {
  font-family: var(--sport-category-tags);
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  text-align: center;
  color: var(--text-white);
  margin: 0;
}

.modal-content {
  display: flex;
  flex-direction: column;
  padding: 32px 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: var(--text-white);
}

.category-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.category-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px 16px;
  gap: 16px;
  width: 100%;
}

.category-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 8px;
  width: 103.67px;
  height: 92px;
  border: 1px solid #223b46;
  border-radius: 8px;
  cursor: pointer;
}

.category-item.active {
  background: var(--yellow-primary);
}

.category-item.active img {
  filter: invert(1);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
}

.icon-container img {
  width: 32px;
  height: 32px;
}

.category-item span {
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  color: var(--text-25);
}

.category-item.active span {
  color: var(--text-90);
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
}

.btn-close,
.btn-confirm {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px;
  gap: 10px;
  width: 50%;
  height: 44px;
  font-family: var(--sport-category-tags);
  font-style: normal;
  font-weight: 700;
  font-size: 13px;
  line-height: 30px;
  color: var(--text-white);
  border: none;
  cursor: pointer;
}

.btn-close:hover,
.btn-confirm:hover,
.category-item:hover {
  opacity: var(--hover);
}

.btn-close {
  background: transparent;
  border: 1px solid var(--bg-20);
  border-radius: 4px;
}

.btn-confirm {
  background: var(--green-primary);
  border-radius: 4px;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .modal-container {
    width: calc(100% - 40px);
  }

  .category-row {
    padding: 0px;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
