<template>
  <div class="article-page">
    <div class="content-wrapper">
      <!-- Main content column -->
      <div class="main-column">
        <div class="article-header">
          <h1>KRAJ - LIGA ŠAMPIONA: Arsenal - Real Madrid 3:0, Bajern Minhen - Inter 1:2</h1>
          <h2>
            Liga Šampiona - Četvrtfinale (Prvi mečevi) <br>
            Arsenal - Real Madrid 3:0 (0:0) <span class="highlight">Rajs (58' / 70'), Merino (75')</span>
          </h2>
          <div class="article-meta">
            <div class="author-date">
              <p>Od <span class="author">Marko Brnjašević</span> - 27.2.2025. 10:50</p>
            </div>
            <div class="comments-count">
              <img src="@/assets/images/vector.svg" alt="Comment Icon" class="icon">
              <span class="count">21</span>
            </div>
            <div class="share-buttons">
              <button class="share-btn">
                <img src="@/assets/images/viber.svg" alt="Share on Viber">
              </button>
              <button class="share-btn">
                <img src="@/assets/images/facebook.svg" alt="Share on Facebook">
              </button>
              <button class="share-btn">
                <img src="@/assets/images/twitter.svg" alt="Share on Twitter">
              </button>
              <button class="share-btn">
                <img src="@/assets/images/whatsapp.svg" alt="Share on WhatsApp">
              </button>
              <button class="share-btn">
                <img src="@/assets/images/instagram.svg" alt="Share on Instagram">
              </button>
            </div>
          </div>
        </div>

        <!-- Match images -->
        <div class="featured-image">
          <img src="@/assets/images/image.jpg" alt="Match moment" />
          <div class="image-caption"><span>FOTO:</span> Starsport</div>
        </div>

        <!-- Match details -->
        <div class="match-details">
          <ul>
            <li>Stadion: Emirati<br></li>
            <li>Gledalaca: 60.704<br></li>
            <li>Sudija: Irfan Peljto (BiH)<br></li>
            <li>Žuti kartoni: Parti (Arsenal), Kamavinga (Real)<br></li>
            <li>Crveni karton: Kamavinga (Real) u 90+4. minutu</li>
          </ul>
        </div>

        <!-- Live updates -->
        <div class="live-updates">
          <div class="updates-header">
            <div class="header-line">
              <h3>PREGLED UTAKMICE</h3>
            </div>
          </div>
          
          <!-- Error state -->
          <div v-if="error" class="error-state">
            <p>Greška pri učitavanju: {{ error }}</p>
            <button @click="fetchLiveBlogData" class="retry-button">Pokušaj ponovo</button>
          </div>
          
          <!-- Loading skeleton or actual content -->
          <div v-else class="live-updates-list">
            <!-- Skeleton loading state -->
            <template v-if="loading">
              <LiveUpdate
                v-for="n in 5"
                :key="'skeleton-' + n"
                :skeleton="true"
                :is-highlight="n <= 2"
              />
            </template>
            
            <!-- Actual content -->
            <template v-else>
              <LiveUpdate
                v-for="update in updates"
                :key="update.time + update.title"
                :time="update.time"
                :title="update.title"
                :content="update.content"
                :is-highlight="update.isHighlight"
              />
            </template>
          </div>
          
          <button v-if="!loading && !error" class="load-more" @click="loadMore">Učitaj još</button>
        </div>

        <!-- Bottom tags -->
        <div class="tags-section">
          <button class="tag">FUDBAL</button>
          <button class="tag">NAJBOLJE KVOTE</button>
          <button class="tag">KOŠARKA</button>
          <button class="tag">GOLOVI</button>
          <button class="tag">LIGA ŠAMPIONA</button>
          <button class="tag">KK PARTIZAN</button>
        </div>

        <!-- Other news section -->
        <div class="other-news-section">
          <div class="section-header">
            <h2 class="section-title">OSTALE VESTI</h2>
          </div>
          <NewsGrid 
            :news="otherNews"
            sport="OSTALE VESTI"
            :columns="3"
            background="true"
          />
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar-column">
        <div class="sidebar-news">
          <div class="sidebar-header">
            <h3>NAJNOVIJE VESTI</h3>
          </div>
          <div class="related-news-list">
            <div v-for="(news, index) in relatedNews" :key="index" class="related-news-item">
              <div class="number">{{ index + 1 }}</div>
              <div class="content">
                <div class="category">FUDBAL</div>
                <h3>{{ news.title }}</h3>
                <div class="timestamp">
                  <span>{{ news.date }}</span>
                  <div class="divider"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Comments section -->
        <div class="comments-section">
          <div class="comments-header">
            <div class="comments-count">
              <img src="@/assets/images/vector.svg" alt="Comment Icon" class="icon">
              <span class="count">21</span>
            </div>
            <button class="comment-button" @click="toggleComments">
              {{ showComments ? 'NAZAD NA VEST' : 'OSTAVI KOMENTAR' }}
            </button>
          </div>
        </div>
        <NewsletterForm />
        <AdBanners />
      </div>
    </div>
  </div>
</template>

<script>
import LiveUpdate from '@/components/skeletons/SkeletonLiveUpdate.vue'
import NewsletterForm from '@/components/Newsletter.vue'
import AdBanners from '@/components/AdBanners.vue'
import NewsGrid from '@/components/NewsGrid.vue'
import { fetchFromApi } from '@/services/api.js'

export default {
  name: 'LiveBlog',
  components: {
    LiveUpdate,
    NewsletterForm,
    AdBanners,
    NewsGrid
  },
  data() {
    return {
      showComments: false,
      liveBlogData: null,
      updates: [],
      loading: true,
      error: null,
      otherNews: [
        {
          title: 'Novo lice u ABA ligi i stari poznanik prvotimca Zvezde – Džejk Stivens: Čim je stigla ponuda pozvao sam Majka Dauma',
          image: '../assets/images/news1.jpg',
          sport: 'KOŠARKA'
        },
        {
          title: 'Ugroženi rekordi Kristijana Ronalda i Lionela Mesija u Ligi šampiona',
          image: '../assets/images/news2.jpg',
          sport: 'FUDBAL'
        },
        {
          title: 'Srbija prestigla Hrvatsku, sledi napad na Austriju',
          image: '../assets/images/news3.jpg',
          sport: 'FUDBAL'
        },
        {
          title: 'Partizan se pojačao pred derbi: Stigao novi centar iz NBA lige',
          image: '../assets/images/news1.jpg',
          sport: 'KOŠARKA'
        },
        {
          title: 'Đoković potvrdio učešće na turniru u Monte Karlu',
          image: '../assets/images/news2.jpg',
          sport: 'TENIS'
        },
        {
          title: 'Liga šampiona: Real Madrid izborio plasman u četvrtfinale',
          image: '../assets/images/news3.jpg',
          sport: 'FUDBAL'
        }
      ],
      relatedNews: [
        {
          title: 'NAVIJAČU GA TERAJU, ON SE OGLASIO NA INSTAGRAMU: Poruka Nemanje Nedovića!',
          date: '10 feb 17:34'
        },
        {
          title: 'Ugroženi rekordi Kristijana Ronalda i Lionela Mesija u Ligi šampiona',
          date: '10 feb 17:34'
        },
        {
          title: 'Srbija prestigla Hrvatsku, sledi napad na Austriju',
          date: '10 feb 17:34'
        }
      ]
    }
  },
  async mounted() {
    await this.fetchLiveBlogData()
  },
  methods: {
    toggleComments() {
      this.showComments = !this.showComments
    },
    loadMore() {
      // TODO: Implement load more functionality when backend API is ready
    },
    async fetchLiveBlogData() {
      try {
        this.loading = true
        this.error = null
        
        // Use the proper API function to fetch live blog data
        const data = await fetchFromApi('/liveblog/87')
        
        if (data.success && data.result) {
          this.liveBlogData = data.result
          this.transformLiveBlogData(data.result)
        } else {
          throw new Error('Invalid API response format')
        }
      } catch (error) {
        console.error('Error fetching live blog data:', error)
        this.error = error.message
        // Fallback to sample data for development
        this.loadSampleData()
      } finally {
        this.loading = false
      }
    },
    transformLiveBlogData(liveBlogData) {
      if (!liveBlogData.live_blog_items || !Array.isArray(liveBlogData.live_blog_items)) {
        return
      }

      // Sort by position (descending order for most recent first)
      const sortedItems = [...liveBlogData.live_blog_items].sort((a, b) => b.position - a.position)
      
      this.updates = sortedItems.map(item => {
        // Extract time from created_at timestamp
        const createdDate = new Date(item.created_at)
        const time = createdDate.toLocaleTimeString('sr-RS', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        
        // Clean HTML content and extract plain text for title if name is empty
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = item.content
        const textContent = tempDiv.textContent || tempDiv.innerText || ''
        
        // Use name as title, or first part of content if name is empty
        let title = item.name || ''
        if (!title && textContent) {
          // Take first sentence or first 50 characters as title
          const firstSentence = textContent.split('.')[0]
          title = firstSentence.length > 50 ? textContent.substring(0, 50) + '...' : firstSentence
        }
        
        return {
          time: time,
          title: title,
          content: item.content.replace(/<p>|<\/p>/g, '').replace(/^- /, ''), // Remove paragraph tags and leading dash
          isHighlight: item.position <= 3 // Highlight first 3 items as important
        }
      })
    },
    loadSampleData() {
      // Fallback sample data based on your example
      this.updates = [
        {
          time: '10:08',
          title: 'Organizacija Lekari bez granica',
          content: 'Organizacija Lekari bez granica saopštila je da se njena bolnica u gradu Gaza našla na udaru vatre.'
        },
        {
          time: '10:08',
          title: 'Izraelska ministarka obaveštajnih službi',
          content: 'Izraelska ministarka obaveštajnih službi iz vladajućeg Likuda Gila Gamlijel izjavila je da bi međunarodna zajednica trebalo da promoviše, kako je navela, "dobrovoljno preseljenje" Palestinaca iz Pojasa Gaze na lokacije širom sveta.'
        },
        {
          time: '10:08',
          title: 'Protektorat UN u Gazi',
          content: 'Protektorat UN u Gazi posle rata ne bi bio rešenje, ocenio je generalni sekretar te svetske organizacije Antonio Gutereš.',
          isHighlight: true
        },
        {
          time: '10:08',
          title: 'Libanski Hezbolah',
          content: 'Libanski Hezbolah je saopštio da je izveo niz napada na izraelsku vojsku, koristeći dronove, rakete i artiljerijske granate, na severu Izraela.',
          isHighlight: true
        },
        {
          time: '10:08',
          title: 'Benjamin Netanijahu',
          content: 'Nakon sastanka sa porodicama Izraelaca koje militantna grupa Hamas drži kao taoce u Gazi, izraelski premijer Benjamin Netanijahu naglasio je svoju posvećenost obezbeđivanju njihovog oslobađanja, nazivajući to "svetom i vrhovnom misijom".',
          isHighlight: true
        },
        {
          time: '10:08',
          title: 'Rođaci talaca',
          content: 'Rođaci oko 240 ljudi koje palestinska grupa Hamas drži kao taoce u Gazi pozvali su krajnje desničarske izraelske zvaničnike da ne sprovode predloženu smrtnu kaznu za zarobljene palestinske militante, rekavši da bi čak i razgovor o tome mogao da ugrozi taoce.'
        },
        {
          time: '10:08',
          title: 'Palestinsko Ministarstvo zdravlja',
          content: 'Palestinsko Ministarstvo zdravlja saopštilo je da je broj ubijenih Palestinaca porastao na 12.916.'
        }
      ]
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  display: flex;
  gap: 20px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
  margin-top: 24px;
}

.main-column {
  flex: 1;
  max-width: 800px;
}

.article-header {
  text-wrap: balance;
  color: var(--text-white);
}

.article-header h1 {
  font-size: 36px;
  line-height: 48px;
  font-weight: 700;
  margin-bottom: 24px;
}

.article-header h2 {
  font-size: 20px;
  line-height: 30px;
  margin: 24px 0 30px 0;
  font-weight: 700;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 32px;
}

.author-date {
  font-weight: 400;
  font-size: 16px;
  line-height: 130%;
  display: flex;
  color: var(--text-25);
  flex-grow: 1;
}

.author {
  color: var(--text-white);
  font-weight: 600;
}

.share-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0;
  gap: 21.33px;
  width: 245.33px;
  height: 32px;
}

.share-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-image img {
  width: 100%;
  border-radius: 8px;
}

.image-caption {
  margin-top: 12px;
  color: var(--text-25);
  font-size: 16px;
  text-align: center;
}

.image-caption span {
  font-weight: 600;
}

.match-details {
  color: var(--text-white);
  font-size: 20px;
  line-height: 35px;
  margin: 24px 0;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 32px 0;
  justify-content: center;
}

.tags-section .tag {
  padding: 10px 12px;
  border: 1px solid var(--bg-05);
  border-radius: 100px;
  color: var(--bg-05);
  font-size: 14px;
  background: none;
  cursor: pointer;
  transition: var(--transition);
}

.tags-section .tag:hover {
  background: var(--bg-05);
  color: var(--text-white);
  opacity: var(--hover);
}

.live-updates {
  margin-top: 32px;
}

.updates-header {
  margin-bottom: 24px;
}

.header-line {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 0px 0px 12px;
  border-left: 4px solid var(--text-white);
}

.header-line h3 {
  font-weight: 600;
  font-size: 20px;
  line-height: 20px;
  letter-spacing: -0.25px;
  text-transform: uppercase;
  color: var(--text-white);
  margin: 0;
}

.load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  width: 220px;
  height: 44px;
  background: var(--yellow-primary);
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin: 24px auto;
  font-weight: 600;
  font-size: 14px;
  line-height: 26px;
  letter-spacing: -0.25px;
  color: var(--text-90);
}

.load-more:hover {
  opacity: var(--hover);
  transition: var(--transition);
}

.comments-section {
  margin: 32px 0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-count {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.comments-count .count {
  width: 32px;
  height: 14px;
  font-weight: 600;
  font-size: 28px;
  line-height: 14px;
  color: var(--yellow-primary);
}

.comment-button {
  background-color: var(--yellow-primary);
  color: var(--text-90);
  border-radius: 4px;
  padding: 10px 40px;
  font-size: 18px;
  line-height: 32px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition);
}

.comment-button:hover {
  opacity: var(--hover);
}

.highlight {
  color: var(--bg-05);
}

ul {
  margin-left: 28px;
}

.live-updates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-white);
}

.error-state p {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--text-25);
}

.retry-button {
  background-color: var(--yellow-primary);
  color: var(--text-90);
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.retry-button:hover {
  opacity: var(--hover);
}

.sidebar-header h3 {
    font-size: 24px;
    line-height: 26px;
}

.section-title {
  color: var(--text-white);
  border-left: 4px solid var(--text-white);
}

.other-news-section .news-grid {
  background: var(--bg-90);
  border-radius: 8px;
}

.related-news-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--dark-gradient);
  border-radius: 8px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  padding: 12px 24px 12px 8px;
  margin-bottom: 20px;
  border: 1px solid var(--bg-50);
  border-right: none;
}

.related-news-item {
  display: flex;
  gap: 10px;
}

.number {
  font-family: var(--urbanist);
  font-size: 50px;
  line-height: 96px;
  color: var(--text-white);
  min-width: 45px;
  text-align: center;
}

.related-news-item .category {
  font-weight: 700;
  font-size: 15px;
  line-height: 19px;
  margin-bottom: 8px;
}

.related-news-item .category.fudbal {
  color: var(--green-primary);
}

.related-news-item .category.košarka {
  color: var(--orange-primary);
}

.related-news-item .category.tenis {
  color: var(--blue-primary);
}

.related-news-item h3 {
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--text-white);
  margin: 0 0 10px 0;
}

.timestamp {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  color: var(--text-25);
  font-size: 15px;
}

.divider {
  flex-grow: 1;
  height: 1px;
  background: var(--bg-40);
}

@media screen and (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
  }

  .main-column {
    max-width: 100%;
  }

  .sidebar-column {
    justify-content: center;
  }

  .sidebar-column > * {
    width: 100%;
  }

  .comments-header {
    justify-content: center;
    flex-direction: row;
  }

  .other-news-section .news-grid {
    display: grid;
    gap: 20px;
  }
}

@media screen and (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .share-buttons {
    width: 100%;
  }

  .comments-header {
    align-items: stretch;
  }

  .comment-button {
    width: 100%;
  }
}
</style> 