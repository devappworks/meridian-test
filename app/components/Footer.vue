<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="@/assets/images/meridian-logo.svg" alt="Meridian Sport" width="171" height="24" />
          <div class="social-icons">
            <a
              href="https://www.instagram.com/meridiansportrs/"
              class="social-icon"
              aria-label="Instagram"
            >
              <img src="@/assets/images/article/instagram.png" alt="Instagram" width="32" height="32" />
            </a>
            <a href="https://x.com/meridiansportrs" class="social-icon" aria-label="X">
              <img src="@/assets/images/newsletter/twitter.svg" alt="X" width="32" height="32" />
            </a>
            <a
              href="https://www.facebook.com/SportMeridian/"
              class="social-icon"
              aria-label="Facebook"
            >
              <img src="@/assets/images/article/facebook.png" alt="Facebook" width="32" height="32" />
            </a>
            <a
              href="https://www.youtube.com/@meridiansport"
              class="social-icon"
              aria-label="YouTube"
            >
              <img src="@/assets/images/newsletter/youtube.svg" alt="YouTube" width="32" height="32" />
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
            <h3 class="column-title">{{ section.label.toUpperCase() }}</h3>
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
      // Return clean paths without query parameters
      const dedicatedRoutes = {
        NAJNOVIJE: "/najnovije-vesti/",
        FUDBAL: "/fudbal/",
        KOŠARKA: "/kosarka/",
        ODBOJKA: "/odbojka/",
        TENIS: "/tenis/",
        "OSTALI SPORTOVI": "/ostali-sportovi/",
      };

      // Use dedicated route if available
      if (dedicatedRoutes[child.label.toUpperCase()]) {
        return dedicatedRoutes[child.label.toUpperCase()];
      }

      // If child has web_categories, return clean path with slug
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

        // Return clean path without query parameters
        // The CategoryPage will resolve the category from the slug
        return `/${slug}/`;
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
  transition: opacity 0.2s;
}

.social-icon img {
  width: auto;
  height: 100%;
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


.social-icon:hover { opacity: 0.8; }


.social-icon:nth-child(2) i {
  color: var(--text-white);
  background: none;
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
