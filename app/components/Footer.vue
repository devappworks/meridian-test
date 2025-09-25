<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="@/assets/images/meridian-logo.svg" alt="Meridian Sport" />
          <div class="social-icons">
            <a
              href="https://www.instagram.com/meridiansportrs/"
              class="social-icon"
              aria-label="Instagram"
            >
              <i class="fab fa-instagram"></i>
            </a>
            <a href="https://x.com/meridiansportrs" class="social-icon" aria-label="X">
              <i class="fab fa-x-twitter"></i>
            </a>
            <a
              href="https://www.facebook.com/SportMeridian/"
              class="social-icon"
              aria-label="Facebook"
            >
              <i class="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.youtube.com/@meridiansport"
              class="social-icon"
              aria-label="YouTube"
            >
              <i class="fab fa-youtube"></i>
            </a>
          </div>
          <p class="contact-info">
            Kontaktirajte nas: redakcija@meridiansport.rs
          </p>
        </div>

        <div class="footer-links">
          <div
            v-for="section in footerMenu"
            :key="section.label"
            class="links-column"
          >
            <h4 class="column-title">{{ section.label.toUpperCase() }}</h4>
            <router-link
              v-for="child in section.children"
              :key="child.label.toUpperCase()"
              :to="getRouteForChild(child)"
              class="footer-link"
              @click="handleLinkClick(child, $event)"
            >
              {{ child.label }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { fetchFooterMenu } from "@/services/api";

export default {
  name: "FooterComponent",
  data() {
    return {
      footerMenu: [],
    };
  },
  async mounted() {
    await this.loadFooterMenu();
  },
  methods: {
    async loadFooterMenu() {
      try {
        const response = await fetchFooterMenu();
        if (response.success && response.footer_menu) {
          this.footerMenu = response.footer_menu;
        }
      } catch (error) {
        console.error("Failed to load footer menu:", error);
        // Fallback to empty array - component will render empty
        this.footerMenu = [];
      }
    },
    getRouteForChild(child) {
      // If child has a direct href, use it
      if (child.href && child.href !== "#" && child.href !== null) {
        return child.href;
      }

      // Check if this category has a dedicated page route
      const dedicatedRoutes = {
        NAJNOVIJE: { name: "najnovije-vesti" },
        FUDBAL: { name: "fudbal" },
        KOŠARKA: { name: "kosarka" },
        ODBOJKA: { name: "odbojka" },
        TENIS: { name: "tenis" },
        "OSTALI SPORTOVI": { name: "ostali-sportovi" },
      };

      // Use dedicated route if available
      if (dedicatedRoutes[child.label.toUpperCase()]) {
        return dedicatedRoutes[child.label.toUpperCase()];
      }

      // If child has web_categories, create dynamic route with category data
      if (child.web_categories && child.web_categories.length > 0) {
        // Convert label to slug format (lowercase, replace spaces with hyphens)
        const slug = child.label
          .toLowerCase()
          .replace(/š/g, "s")
          .replace(/č/g, "c")
          .replace(/ć/g, "c")
          .replace(/ž/g, "z")
          .replace(/đ/g, "d")
          .replace(/\s+/g, "-");

        // Return route object with query parameters for category data
        return {
          path: `/sport/${slug}`,
          query: {
            categoryId: child.web_categories[0].toString(), // Use first category ID as string
            title: child.label.toUpperCase(),
          },
        };
      }

      // Default fallback
      return "#";
    },
    handleLinkClick(child, event) {
      // If it's a placeholder link (#) or null, prevent navigation
      if (!child.href || child.href === "#" || child.href === null) {
        if (!child.web_categories || child.web_categories.length === 0) {
          event.preventDefault();
        }
      }

      // If newTab is true, open in new tab
      if (
        child.newTab &&
        child.href &&
        child.href !== "#" &&
        child.href !== null
      ) {
        event.preventDefault();
        window.open(child.href, "_blank");
      }
    },
  },
};
</script>

<style scoped>
.footer {
  background-color: var(--bg-80);
  padding: 24px 32px;
}

.footer-content {
  display: flex;
  align-items: flex-start;
  gap: 90px;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  width: 246px;
}

.footer-logo > img {
  width: 171.25px;
  height: auto;
}

.social-icons {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12px;
}

.social-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
  transition: var(--transition);
}

.social-icon i {
  font-size: 20px;
  transition: var(--transition);
  border-radius: 40px;
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Instagram - Pink brand color */
.social-icon:nth-child(1) i {
  color: #E4405F;
  background-color: rgba(228, 64, 95, 0.1);
}

.social-icon:nth-child(1):hover i {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: white;
  transform: scale(1.1);
}

/* X (formerly Twitter) - Black brand color */
.social-icon:nth-child(2) i {
  color: #000000;
  background-color: rgba(255, 255, 255, 0.1);
}

.social-icon:nth-child(2):hover i {
  background-color: #000000;
  color: white;
  transform: scale(1.1);
}

/* Facebook - Blue brand color */
.social-icon:nth-child(3) i {
  color: #1877F2;
  background-color: rgba(24, 119, 242, 0.1);
}

.social-icon:nth-child(3):hover i {
  background-color: #1877F2;
  color: white;
  transform: scale(1.1);
}

/* YouTube - Red brand color */
.social-icon:nth-child(4) i {
  color: #FF0000;
  background-color: rgba(255, 0, 0, 0.1);
}

.social-icon:nth-child(4):hover i {
  background-color: #FF0000;
  color: white;
  transform: scale(1.1);
}

.contact-info {
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: var(--text-25);
  border-top: 1px solid var(--bg-70);
  padding-top: 20px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 90px;
  flex-grow: 1;
}

.links-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
}

.column-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  text-transform: uppercase;
  color: var(--text-white);
  margin-bottom: 8px;
}

.footer-link {
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  text-transform: uppercase;
  color: var(--text-25);
  margin-bottom: 1px;
  transition: var(--transition);
  text-decoration: none;
  display: block;
}

.footer-link:hover {
  color: var(--text-white);
}

@media screen and (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 40px;
  }

  .footer-links {
    flex-direction: column;
    gap: 32px;
  }
}
</style>
