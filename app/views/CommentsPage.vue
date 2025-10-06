<template>
  <div class="comments-page">
    <div class="content-wrapper">
      <!-- Main content column -->
      <div class="main-column">
        <!-- Comments section -->
        <div class="comments-section">
          <!-- Leave comment form -->
          <div class="comment-form-container">
            <h2 class="section-title">OSTAVI SVOJ KOMENTAR</h2>
            <div class="comment-form">
              <div class="form-row"></div>
              <div class="form-group">
                <label>Poruka</label>
                <textarea
                  class="form-input message"
                  v-model="newComment.message"
                  @input="hideCommentMessage"
                  placeholder="Unesite vaš komentar..."
                ></textarea>
              </div>
              <button
                class="send-message-btn"
                @click="submitComment"
                :disabled="
                  submittingComment || !isLoggedIn || !newComment.message
                "
              >
                {{ submittingComment ? "SLANJE..." : "POŠALJI" }}
              </button>
              
              <!-- Inline message for comment form -->
              <div
                v-if="commentMessage.visible"
                :class="['inline-message', commentMessage.type]"
              >
                {{ commentMessage.text }}
              </div>
              
              <p
                v-if="!isLoggedIn && !commentMessage.visible"
                style="color: #cacaca; margin: 8px 0 0 2px; font-size: 13px"
              >
                Morate biti prijavljeni da ostavite komentar.
                <router-link
                  to="/prijava"
                  style="
                    color: var(--yellow-primary);
                    text-decoration: underline;
                  "
                  >Prijavite se</router-link
                >.
              </p>
            </div>
          </div>

          <!-- Comments list -->
          <div class="comments-list">
            <template
              v-for="(comment, index) in formattedComments"
              :key="index"
            >
              <!-- Main comment -->
              <div class="comment-item">
                <div class="comment-header">
                  <div class="user-info">
                    <div class="avatar"></div>
                    <div class="name-time">
                      <span class="username">{{ comment.name }}</span>
                      <div class="dot"></div>
                      <span class="time">{{ comment.time }}</span>
                    </div>
                  </div>
                </div>
                <div class="comment-content">
                  <p 
                    :id="`comment-text-${comment.id}`"
                    :class="['comment-text', isExpanded(comment.id) ? 'expanded' : 'clipped']"
                  >{{ comment.message }}</p>
                </div>
                <button 
                  :id="`comment-read-more-${comment.id}`"
                  class="read-more hidden"
                  @click="toggleReadMore(comment.id)"
                >
                  {{ isExpanded(comment.id) ? 'Sakrij' : 'Pročitaj više' }}
                </button>
                <div class="comment-actions">
                  <div class="vote-buttons">
                    <button 
                      class="vote-btn like"
                      :class="{ 
                        active: hasUserVoted(comment.id, 'like'),
                        voting: isVoting(comment.id)
                      }"
                      @click="handleVote(comment.id, 'like')"
                      :disabled="isVoting(comment.id) || !isLoggedIn"
                    >
                      <img src="@/assets/icons/thumbs-up.svg" alt="Like" />
                      <span class="vote-count">
                        {{ getVoteCount(comment.id, 'like') }}
                      </span>
                    </button>
                    <button 
                      class="vote-btn dislike"
                      :class="{ 
                        active: hasUserVoted(comment.id, 'dislike'),
                        voting: isVoting(comment.id)
                      }"
                      @click="handleVote(comment.id, 'dislike')"
                      :disabled="isVoting(comment.id) || !isLoggedIn"
                    >
                      <img src="@/assets/icons/thumbs-down.svg" alt="Dislike" />
                      <span class="vote-count">
                        {{ getVoteCount(comment.id, 'dislike') }}
                      </span>
                    </button>
                  </div>
                  <button class="reply-btn" @click="startReply(comment.id)">
                    <span>OSTAVI KOMENTAR</span>
                    <span class="arrow"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 320 512"
                      >
                        <path
                          d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                        /></svg>
                    </span>
                  </button>
                </div>

                <!-- Reply form for this comment -->
                <div
                  v-if="replyingTo === comment.id"
                  class="reply-form-container"
                >
                  <div class="reply-form">
                    <div class="form-group">
                      <label>Odgovor</label>
                      <textarea
                        class="form-input message"
                        v-model="replyComment.message"
                        @input="hideReplyMessage"
                        placeholder="Unesite vaš odgovor..."
                      ></textarea>
                    </div>
                    <div class="reply-actions">
                      <button
                        class="send-reply-btn"
                        @click="submitReply(comment.id)"
                        :disabled="
                          submittingReply ||
                          !isLoggedIn ||
                          !replyComment.message
                        "
                      >
                        {{ submittingReply ? "SLANJE..." : "POŠALJI" }}
                      </button>
                      <button class="cancel-reply-btn" @click="cancelReply">
                        ODUSTANI
                      </button>
                    </div>
                    
                    <!-- Inline message for reply form -->
                    <div
                      v-if="replyMessage.visible"
                      :class="['inline-message', replyMessage.type]"
                    >
                      {{ replyMessage.text }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Nested replies -->
              <template v-if="comment.replies && comment.replies.length > 0">
                <div
                  v-for="(reply, replyIndex) in comment.replies"
                  :key="'reply-' + replyIndex"
                  class="comment-item reply"
                >
                  <div class="reply-arrow"></div>
                  <div class="comment-header">
                    <div class="user-info">
                      <div class="avatar"></div>
                      <div class="name-time">
                        <span class="username">{{ reply.name }}</span>
                        <div class="dot"></div>
                        <span class="time">{{ reply.time }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="comment-content">
                    <p 
                      :id="`reply-text-${reply.id}`"
                      :class="['comment-text', isExpanded(reply.id, true) ? 'expanded' : 'clipped']"
                    >{{ reply.message }}</p>
                  </div>
                   <div class="comment-actions">
                     <div class="vote-buttons">
                       <button 
                         class="vote-btn like"
                         :class="{ 
                           active: hasUserVoted(reply.id, 'like'),
                           voting: isVoting(reply.id)
                         }"
                         @click="handleVote(reply.id, 'like', comment.id)"
                         :disabled="isVoting(reply.id) || !isLoggedIn"
                       >
                         <img src="@/assets/icons/thumbs-up.svg" alt="Like" />
                         <span class="vote-count">
                           {{ getVoteCount(reply.id, 'like') }}
                         </span>
                       </button>
                       <button 
                         class="vote-btn dislike"
                         :class="{ 
                           active: hasUserVoted(reply.id, 'dislike'),
                           voting: isVoting(reply.id)
                         }"
                         @click="handleVote(reply.id, 'dislike', comment.id)"
                         :disabled="isVoting(reply.id) || !isLoggedIn"
                       >
                         <img
                           src="@/assets/icons/thumbs-down.svg"
                           alt="Dislike"
                         />
                         <span class="vote-count">
                           {{ getVoteCount(reply.id, 'dislike') }}
                         </span>
                       </button>
                     </div>
                    <button 
                      :id="`reply-read-more-${reply.id}`"
                      class="read-more hidden"
                      @click="toggleReadMore(reply.id, true)"
                    >
                      {{ isExpanded(reply.id, true) ? 'Sakrij' : 'Pročitaj više' }}
                    </button>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
        <!-- Load all comments button -->
        <div v-if="hasMultiplePages" class="load-all-comments-section">
          <div class="pagination-info">
            <span v-if="pagination">
              Prikazano {{ pagination.per_page }} od {{ pagination.total }} komentara
            </span>
          </div>
          <button 
            class="load-all-comments-btn" 
            @click="handleLoadAllComments"
            :disabled="loadingAllComments"
          >
            {{ loadingAllComments ? "UČITAVANJE..." : "UČITAJ SVE KOMENTARE" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { postComment, voteComment } from "@/services/api";

export default {
  name: "CommentsPage",
  props: {
    articleId: {
      type: String,
      required: true,
    },
    comments: {
      type: Array,
      default: () => [],
    },
    pagination: {
      type: Object,
      default: null,
    },
    hasMultiplePages: {
      type: Boolean,
      default: false,
    },
    loadingAllComments: {
      type: Boolean,
      default: false,
    },
    showingAllComments: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoggedIn: false,
      newComment: {
        name: "",
        email: "",
        message: "",
      },
      replyComment: {
        name: "",
        email: "",
        message: "",
      },
      replyingTo: null,
      submittingComment: false,
      submittingReply: false,
      // Track expanded state for each comment and reply
      expandedComments: new Set(),
      expandedReplies: new Set(),
      // Inline messages for forms
      commentMessage: {
        text: '',
        type: '', // 'success' or 'error'
        visible: false
      },
      replyMessage: {
        text: '',
        type: '', // 'success' or 'error'
        visible: false
      },
      // Vote tracking
      votingComments: new Set(), // Track which comments are currently being voted on
      userVotes: {}, // Track user's votes { commentId: 'like'|'dislike'|null }
      voteCounts: {}, // Track vote counts { commentId: { likes: 0, dislikes: 0 } }
    };
  },
  mounted() {
    // Initialize login state and prefill user info if available
    this.checkAuthAndPrefill();

    // React to login/logout in other tabs
    window.addEventListener("storage", this.checkAuthAndPrefill);

    // Check for text overflow after component is mounted
    this.$nextTick(() => {
      this.checkAllCommentsForOverflow();
    });
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.checkAuthAndPrefill);
  },
  computed: {
    formattedComments() {
      const allComments = this.comments.map((comment) => {
        const formattedComment = {
          id: comment.id,
          name: comment.user_name || "Anonymous",
          time: this.formatDate(comment.publish_date),
          message: this.stripHtml(comment.content),
          likes: comment.likes || 0,
          dislikes: comment.dislikes || 0,
          parentId: comment.parent_comment_id,
          replies: [],
        };

        // Initialize vote counts for this comment
        if (!this.voteCounts[comment.id]) {
          this.voteCounts[comment.id] = {
            likes: formattedComment.likes,
            dislikes: formattedComment.dislikes
          };
        }

        return formattedComment;
      });

      // Separate top-level comments from replies
      const topLevelComments = allComments.filter(
        (comment) => !comment.parentId
      );
      const replies = allComments.filter((comment) => comment.parentId);

      // Nest replies under their parent comments
      topLevelComments.forEach((parentComment) => {
        parentComment.replies = replies.filter(
          (reply) => reply.parentId === parentComment.id
        );
      });

      return topLevelComments;
    },
  },
  watch: {
    // Watch for changes in comments and check for text overflow
    formattedComments: {
      handler() {
        this.$nextTick(() => {
          this.checkAllCommentsForOverflow();
        });
      },
      deep: true
    }
  },
  methods: {
    checkAuthAndPrefill() {
      try {
        const userJson =
          localStorage.getItem("user") || sessionStorage.getItem("user");
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        this.isLoggedIn = Boolean(userJson && token);

        if (this.isLoggedIn) {
          const user = JSON.parse(userJson);
          // Try to compose display name from profile data we store
          const displayName =
            user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.name || user.username || user.email || "";

          const email = user.email || "";

          // Prefill current form models without overwriting message fields
          this.newComment.name = displayName;
          this.newComment.email = email;

          this.replyComment.name = displayName;
          this.replyComment.email = email;
        } else {
          // Clear names/emails if logged out
          this.newComment.name = "";
          this.newComment.email = "";
          this.replyComment.name = "";
          this.replyComment.email = "";
        }
      } catch (e) {
        console.error("Failed to parse user from storage:", e);
        this.isLoggedIn = false;
      }
    },
    async submitComment() {
      // Clear any existing messages
      this.hideCommentMessage();
      
      if (!this.isLoggedIn) {
        this.showCommentMessage("Morate biti prijavljeni da biste ostavili komentar.", "error");
        setTimeout(() => {
          this.$router.push("/prijava");
        }, 2000);
        return;
      }

      if (!this.newComment.message.trim()) {
        this.showCommentMessage("Poruka je obavezna.", "error");
        return;
      }

      this.submittingComment = true;

      try {
        const commentData = {
          name: this.newComment.name,
          content: this.newComment.message,
          type: "comment",
          email: this.newComment.email,
        };

        await postComment(this.articleId, commentData);

        // Clear the form
        this.newComment = {
          name: this.newComment.name,
          email: this.newComment.email,
          message: "",
        };

        // Emit event to parent to refresh comments
        this.$emit("comment-added");

        // Show success message
        this.showCommentMessage("Komentar je uspešno poslat!", "success");
      } catch (error) {
        console.error("Error posting comment:", error);
        this.showCommentMessage("Greška pri slanju komentara. Molimo pokušajte ponovo.", "error");
      } finally {
        this.submittingComment = false;
      }
    },

    async submitReply(commentId) {
      // Clear any existing messages
      this.hideReplyMessage();
      
      if (!this.isLoggedIn) {
        this.showReplyMessage("Morate biti prijavljeni da biste odgovorili na komentar.", "error");
        setTimeout(() => {
          this.$router.push("/prijava");
        }, 2000);
        return;
      }

      if (!this.replyComment.message.trim()) {
        this.showReplyMessage("Poruka je obavezna.", "error");
        return;
      }

      this.submittingReply = true;

      try {
        const replyData = {
          name: this.replyComment.name,
          content: this.replyComment.message,
          type: "reply",
          email: this.replyComment.email,
          commentId: commentId,
        };

        await postComment(this.articleId, replyData);

        // Show success message before clearing form
        this.showReplyMessage("Odgovor je uspešno poslat!", "success");
        
        // Clear the reply form and hide it after a short delay
        setTimeout(() => {
          this.replyComment = {
            name: this.replyComment.name,
            email: this.replyComment.email,
            message: "",
          };
          this.replyingTo = null;
          this.hideReplyMessage();
        }, 2000);

        // Emit event to parent to refresh comments
        this.$emit("comment-added");
      } catch (error) {
        console.error("Error posting reply:", error);
        this.showReplyMessage("Greška pri slanju odgovora. Molimo pokušajte ponovo.", "error");
      } finally {
        this.submittingReply = false;
      }
    },

    startReply(commentId) {
      if (!this.isLoggedIn) {
        this.showCommentMessage("Morate biti prijavljeni da biste odgovorili na komentar.", "error");
        setTimeout(() => {
          this.$router.push("/prijava");
        }, 2000);
        return;
      }

      // Clear any existing messages when starting a reply
      this.hideReplyMessage();
      this.replyingTo = commentId;
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyComment = { name: "", email: "", message: "" };
      this.hideReplyMessage();
    },

    formatDate(dateString) {
      // Robust parse and return ISO 8601 format
      if (!dateString) return "";

      let date;
      if (typeof dateString === "number") {
        const ms = dateString > 1e12 ? dateString : dateString * 1000;
        date = new Date(ms);
      } else if (typeof dateString === "string") {
        const trimmed = dateString.trim();
        const dmYhm = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?\s+(\d{1,2}):(\d{2})$/;
        const dmY = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/;
        const dmySlash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/;
        const ymdHms = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;
        let m = trimmed.match(dmySlash);
        if (m) {
          const [_, d, mth, y, h, min] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h || 0), Number(min || 0));
        } else if ((m = trimmed.match(dmYhm))) {
          const [_, d, mth, y, h, min] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min));
        } else if ((m = trimmed.match(dmY))) {
          const [_, d, mth, y] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d));
        } else if ((m = trimmed.match(ymdHms))) {
          const [_, y, mth, d, h, min, s] = m;
          date = new Date(Number(y), Number(mth) - 1, Number(d), Number(h), Number(min), Number(s || 0));
        } else {
          const normalized = trimmed.replace(/\.(\d{3})\d+(Z|[+-]\d{2}:?\d{2})$/, ".$1$2");
          date = new Date(normalized);
        }
      } else {
        date = new Date(dateString);
      }

      if (!(date instanceof Date) || isNaN(date.getTime())) return "";

      // Return ISO 8601 format: YYYY-MM-DDTHH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    },
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    },

    // Check if comment text needs "read more" button
    needsReadMore(commentId, isReply = false) {
      this.$nextTick(() => {
        const elementId = isReply ? `reply-text-${commentId}` : `comment-text-${commentId}`;
        const element = document.getElementById(elementId);
        if (element) {
          // Check if content overflows 3 lines
          const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight);
          const maxHeight = lineHeight * 3;
          const actualHeight = element.scrollHeight;
          
          const readMoreBtn = document.getElementById(
            isReply ? `reply-read-more-${commentId}` : `comment-read-more-${commentId}`
          );
          
          if (readMoreBtn) {
            if (actualHeight > maxHeight + 2) { // +2px tolerance
              readMoreBtn.classList.remove('hidden');
            } else {
              readMoreBtn.classList.add('hidden');
            }
          }
        }
      });
    },

    // Toggle read more for comments
    toggleReadMore(commentId, isReply = false) {
      if (isReply) {
        if (this.expandedReplies.has(commentId)) {
          this.expandedReplies.delete(commentId);
        } else {
          this.expandedReplies.add(commentId);
        }
      } else {
        if (this.expandedComments.has(commentId)) {
          this.expandedComments.delete(commentId);
        } else {
          this.expandedComments.add(commentId);
        }
      }
    },

    // Check if comment is expanded
    isExpanded(commentId, isReply = false) {
      return isReply 
        ? this.expandedReplies.has(commentId)
        : this.expandedComments.has(commentId);
    },

    // Check all comments and replies for text overflow
    checkAllCommentsForOverflow() {
      this.formattedComments.forEach(comment => {
        this.needsReadMore(comment.id);
        
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            this.needsReadMore(reply.id, true);
          });
        }
      });
    },

    // Show inline message for comment form
    showCommentMessage(text, type) {
      this.commentMessage = {
        text,
        type,
        visible: true
      };
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.hideCommentMessage();
        }, 5000);
      }
    },

    // Hide comment form message
    hideCommentMessage() {
      this.commentMessage.visible = false;
    },

    // Show inline message for reply form
    showReplyMessage(text, type) {
      this.replyMessage = {
        text,
        type,
        visible: true
      };
      
      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          this.hideReplyMessage();
        }, 5000);
      }
    },

    // Hide reply form message
    hideReplyMessage() {
      this.replyMessage.visible = false;
    },

    // Handle load all comments button click
    handleLoadAllComments() {
      this.$emit('load-all-comments');
    },

    // Handle like/dislike vote
    async handleVote(commentId, action, parentCommentId = null) {
      if (!this.isLoggedIn) {
        this.showCommentMessage("Morate biti prijavljeni da biste glasali.", "error");
        setTimeout(() => {
          this.$router.push("/prijava");
        }, 2000);
        return;
      }

      // Prevent multiple votes on the same comment simultaneously
      if (this.votingComments.has(commentId)) {
        return;
      }

      // Check if user is changing their vote or voting for the first time
      const currentVote = this.userVotes[commentId];
      const isChangingVote = currentVote && currentVote !== action;
      const isSameVote = currentVote === action;

      // If clicking the same vote, remove the vote
      if (isSameVote) {
        action = 'remove';
      }

      this.votingComments.add(commentId);

      try {
        await voteComment({
          action: action,
          commentId: commentId,
          parentCommentId: parentCommentId
        });

        // Update local vote counts and user vote tracking
        if (action === 'remove') {
          // Remove vote
          if (currentVote === 'like') {
            this.voteCounts[commentId].likes = Math.max(0, this.voteCounts[commentId].likes - 1);
          } else if (currentVote === 'dislike') {
            this.voteCounts[commentId].dislikes = Math.max(0, this.voteCounts[commentId].dislikes - 1);
          }
          this.userVotes[commentId] = null;
        } else if (isChangingVote) {
          // Change vote
          if (currentVote === 'like') {
            this.voteCounts[commentId].likes = Math.max(0, this.voteCounts[commentId].likes - 1);
            this.voteCounts[commentId].dislikes += 1;
          } else {
            this.voteCounts[commentId].dislikes = Math.max(0, this.voteCounts[commentId].dislikes - 1);
            this.voteCounts[commentId].likes += 1;
          }
          this.userVotes[commentId] = action;
        } else {
          // New vote
          if (action === 'like') {
            this.voteCounts[commentId].likes += 1;
          } else {
            this.voteCounts[commentId].dislikes += 1;
          }
          this.userVotes[commentId] = action;
        }

        // Vue 3 reactivity handles updates automatically

      } catch (error) {
        console.error("Error voting on comment:", error);
        this.showCommentMessage("Već ste glasali.", "error");
      } finally {
        this.votingComments.delete(commentId);
      }
    },

    // Check if user has voted on a comment
    hasUserVoted(commentId, voteType) {
      return this.userVotes[commentId] === voteType;
    },

    // Check if comment is being voted on
    isVoting(commentId) {
      return this.votingComments.has(commentId);
    },

    // Get vote count for a comment
    getVoteCount(commentId, voteType) {
      return this.voteCounts[commentId] ? this.voteCounts[commentId][voteType + 's'] || 0 : 0;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap");

.comments-page {
  background: var(--bg-90);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  gap: 24px;
}

.main-column {
  flex: 1;
  max-width: 800px;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-form-container {
  background: var(--bg-80);
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 20px;
  line-height: 23px;
  border-left: none;
  padding-left: 0;
  margin-bottom: 24px;
  color: var(--text-white);
  border-left-color: var(--text-white);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 30px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-group label {
  font-size: 13px;
  line-height: 15px;
  color: #cacaca;
  padding: 0 5px;
}

.form-input {
  background: var(--bg-70);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  padding: 10px;
  color: var(--text-white);
}

.form-input.message {
  height: 104px;
  resize: none;
}

.send-message-btn {
  align-self: flex-start;
  background: var(--yellow-primary);
  color: var(--text-90);
  border: none;
  border-radius: 4px;
  padding: 12px 20px;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  cursor: pointer;
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
}

.send-message-btn:hover:not(:disabled) {
  opacity: var(--hover);
  transition: var(--transition);
}

.send-message-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-item {
  position: relative;
  background: var(--dark-gradient);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item.reply {
  margin-left: 40px;
  background: linear-gradient(270deg, var(--bg-70) 0%, var(--bg-90) 100%);
}

.reply-arrow {
  position: absolute;
  left: -24px;
  top: 28px;
  width: 16px;
  height: 52%;
  border-left: 2px solid var(--bg-40);
  border-bottom: 2px solid var(--bg-40);
  border-bottom-left-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #ccc;
  border-radius: 50%;
}

.name-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 500;
  font-size: 14px;
  line-height: 150%;
  color: var(--text-white);
}

.dot {
  width: 2px;
  height: 2px;
  background: var(--bg-20);
  border-radius: 50%;
}

.time {
  font-family: "Heebo";
  font-size: 14px;
  line-height: 150%;
  color: var(--text-25);
}

.reply-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: var(--yellow-primary);
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  line-height: 1;
}

.arrow svg {
  width: 7.5px;
  height: 15px;
  fill: var(--yellow-primary);
}

.comment-content {
  font-family: "Heebo";
  font-size: 14px;
  line-height: 150%;
  color: var(--text-white);
}

.comment-text {
  margin: 0;
}

.comment-text.clipped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.comment-text.expanded {
  display: block;
  overflow: visible;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-buttons {
  display: flex;
  gap: 8px;
}

.vote-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
  border-radius: 20px;
}

.vote-btn img {
  width: 21px;
  height: 21px;
  object-fit: contain;
}

.vote-btn.like img {
  color: var(--green-primary);
}

.vote-btn.dislike img {
  color: var(--red-primary);
}

.vote-btn:hover:not(:disabled) {
  background: var(--bg-40);
  transform: scale(1.05);
  border-radius: 20px;
}

.vote-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vote-btn.active.like {
  background: #4CAF50;
  border-radius: 20px;
  padding: 8px 12px;
  color: #FFFFFF;
}

.vote-btn.active.dislike {
  background: #F44336;
  border-radius: 20px;
  padding: 8px 12px;
  color: #FFFFFF;
}

.vote-btn.dislike.active img,
.vote-btn.like.active img {
  filter: brightness(0) invert(1);
}

.vote-btn.voting {
  opacity: 0.7;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.vote-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-white);
  line-height: 1;
  text-align: center;
}

.read-more {
  background: none;
  border: none;
  font-family: "Heebo";
  font-weight: 500;
  font-size: 14px;
  line-height: 150%;
  color: var(--text-25);
  cursor: pointer;
  transition: color 0.2s ease;
}

.read-more:hover {
  color: var(--yellow-primary);
}

.read-more.hidden {
  display: none;
}

/* Reply form styles */
.reply-form-container {
  background: var(--bg-80);
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid var(--bg-20);
}

.reply-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.send-reply-btn {
  background: var(--yellow-primary);
  color: var(--text-90);
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
}

.send-reply-btn:hover:not(:disabled) {
  opacity: var(--hover);
  transition: var(--transition);
}

.send-reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-reply-btn {
  background: transparent;
  color: var(--text-25);
  border: 1px solid var(--bg-20);
  border-radius: 4px;
  padding: 8px 16px;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.cancel-reply-btn:hover {
  background: var(--bg-20);
  transition: var(--transition);
}

/* Inline message styles */
.inline-message {
  margin: 8px 0 0 2px;
  font-size: 13px;
  line-height: 1.4;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.inline-message.success {
  color: #4ade80;
  background-color: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.inline-message.error {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.inline-message.hidden {
  display: none;
}

/* Load all comments section styles */
.load-all-comments-section {
  background: var(--bg-80);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
}

.pagination-info {
  color: var(--text-25);
  font-size: 14px;
  line-height: 150%;
}

.load-all-comments-btn {
  background: var(--yellow-primary);
  color: var(--text-90);
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-family: var(--sport-category-tags);
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  cursor: pointer;
  box-shadow: -2px 2px 3px rgba(0, 0, 0, 0.25);
  transition: opacity 0.2s ease;
}

.load-all-comments-btn:hover:not(:disabled) {
  opacity: var(--hover);
}

.load-all-comments-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
