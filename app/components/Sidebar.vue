<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <NuxtLink
        v-for="(item, index) in latestNews"
        :key="index"
        :to="getArticleUrl(item)"
        :class="['news-item', index % 2 === 0 ? 'highlight' : '']"
      >
        <div class="news-category" :class="sportClass(item.sport)">
          <span>{{ item.sport }}</span>
        </div>
        <div class="news-headline">
          <p>{{ item.title }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
export default {
  name: "NewsSidebar",
  props: {
    latestNews: {
      type: Array,
      default: () => [],
    },
    category: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
  },
  methods: {
    sportClass(sport) {
      const sportMap = {
        // Main sports
        FUDBAL: "football",
        "DOMAĆI FUDBAL": "football",
        REPREZENTACIJE: "football",
        "EVROPSKA TAKMIČENJA": "football",
        KOŠARKA: "basketball",
        EVROBASKET: "basketball",
        TENIS: "tennis",
        ODBOJKA: "volleyball",

        // Extended sports
        RUKOMET: "handball",
        ATLETIKA: "athletics",
        PLIVANJE: "swimming",
        GIMNASTIKA: "gymnastics",
        "BORILAČKE VEŠTINE": "fighting",
        AUTOMOTO: "automotive",
        BICIKLIZAM: "cycling",
        "ZIMSKI SPORTOVI": "winter",
        ESPORTS: "esports",
        INTERVJUI: "interview",
        "SPORT FOKUS": "focus",
        "SPORTSKA GEOGRAFIJA": "geography",
        "OSTALI SPORTOVI": "other",
        "OSTALE VESTI": "other",
      };
      return sportMap[sport] || "other";
    },
    getArticleUrl(item) {
      if (!item || !item.id) return '/';
      return `/${item.category}/${item.slug}/`;
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 100%;
}

.sidebar-content {
  border: 1px solid var(--bg-50);
  border-radius: 8px 0 0 8px;
}

.sidebar-content .news-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 8px 12px;
  gap: 8px;
  height: 116.29px;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  color: inherit;
}

.sidebar-content .news-item:first-child {
  border-radius: 8px 0 0 0px;
}

.sidebar-content .news-item:last-child {
  border-radius: 0 0 0 8px;
}

.sidebar-content .news-item:hover {
  transform: translateX(4px);
}

.sidebar-content .news-item.highlight {
  background: var(--dark-gradient);
}

.sidebar-content .news-category {
  font-family: var(--actions);
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
  text-transform: uppercase;
}

.sidebar-content .news-category.football {
  color: var(--green-primary);
}

.sidebar-content .news-category.basketball {
  color: var(--orange-primary);
}

.sidebar-content .news-category.tennis {
  color: var(--blue-primary);
}

.sidebar-content .news-category.volleyball {
  color: var(--red-primary);
}

.sidebar-content .news-category.handball {
  color: var(--cyan-primary, #00bcd4);
}

.sidebar-content .news-category.athletics {
  color: var(--amber-primary, #ffc107);
}

.sidebar-content .news-category.swimming {
  color: var(--light-blue-primary, #03a9f4);
}

.sidebar-content .news-category.gymnastics {
  color: var(--pink-primary, #e91e63);
}

.sidebar-content .news-category.fighting {
  color: var(--red-primary, #f44336);
}

.sidebar-content .news-category.automotive {
  color: var(--grey-primary, #607d8b);
}

.sidebar-content .news-category.cycling {
  color: var(--lime-primary, #8bc34a);
}

.sidebar-content .news-category.winter {
  color: var(--light-grey-primary, #9e9e9e);
}

.sidebar-content .news-category.esports {
  color: var(--deep-purple-primary, #673ab7);
}

.sidebar-content .news-category.interview {
  color: var(--yellow-primary);
}

.sidebar-content .news-category.focus {
  color: var(--yellow-primary);
}

.sidebar-content .news-category.geography {
  color: var(--teal-primary, #009688);
}

.sidebar-content .news-category.other {
  color: var(--text-25);
}

.sidebar-content .news-headline p {
  font-family: var(--title);
  font-weight: 500;
  font-size: 15px;
  line-height: 19px;
  color: var(--text-white);
}
</style>
