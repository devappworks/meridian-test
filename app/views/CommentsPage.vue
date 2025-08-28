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
                <label>Message</label>
                <textarea
                  class="form-input message"
                  v-model="newComment.message"
                ></textarea>
              </div>
              <button
                class="send-message-btn"
                @click="submitComment"
                :disabled="
                  submittingComment || !isLoggedIn || !newComment.message
                "
              >
                {{ submittingComment ? "SENDING..." : "SEND MESSAGE" }}
              </button>
              <p
                v-if="!isLoggedIn"
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
                  <button class="reply-btn" @click="startReply(comment.id)">
                    <span>OSTAVI KOMENTAR</span>
                    <span class="arrow"
                      ><svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 320 512"
                      >
                        <path
                          d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                        /></svg
                    ></span>
                  </button>
                </div>
                <div class="comment-content">
                  <p>{{ comment.message }}</p>
                </div>
                <div class="comment-actions">
                  <div class="vote-buttons">
                    <button class="vote-btn like">
                      <img src="@/assets/icons/thumbs-up.svg" alt="Like" />
                    </button>
                    <button class="vote-btn dislike">
                      <img src="@/assets/icons/thumbs-down.svg" alt="Dislike" />
                    </button>
                  </div>
                  <button class="read-more">Pročitaj više</button>
                </div>

                <!-- Reply form for this comment -->
                <div
                  v-if="replyingTo === comment.id"
                  class="reply-form-container"
                >
                  <div class="reply-form">
                    <div class="form-group">
                      <label>Reply</label>
                      <textarea
                        class="form-input message"
                        v-model="replyComment.message"
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
                        {{ submittingReply ? "SENDING..." : "SEND REPLY" }}
                      </button>
                      <button class="cancel-reply-btn" @click="cancelReply">
                        CANCEL
                      </button>
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
                    <button class="reply-btn" @click="startReply(reply.id)">
                      <span>OSTAVI KOMENTAR</span>
                      <span class="arrow"
                        ><svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 320 512"
                        >
                          <path
                            d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
                          /></svg
                      ></span>
                    </button>
                  </div>
                  <div class="comment-content">
                    <p>{{ reply.message }}</p>
                  </div>
                  <div class="comment-actions">
                    <div class="vote-buttons">
                      <button class="vote-btn like">
                        <img src="@/assets/icons/thumbs-up.svg" alt="Like" />
                      </button>
                      <button class="vote-btn dislike">
                        <img
                          src="@/assets/icons/thumbs-down.svg"
                          alt="Dislike"
                        />
                      </button>
                    </div>
                    <button class="read-more">Pročitaj više</button>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { postComment } from "@/services/api";

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
    };
  },
  mounted() {
    // Initialize login state and prefill user info if available
    this.checkAuthAndPrefill();

    // React to login/logout in other tabs
    window.addEventListener("storage", this.checkAuthAndPrefill);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.checkAuthAndPrefill);
  },
  computed: {
    formattedComments() {
      const allComments = this.comments.map((comment) => ({
        id: comment.id,
        name: comment.user_name || "Anonymous",
        time: this.formatDate(comment.publish_date),
        message: this.stripHtml(comment.content),
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        parentId: comment.parent_comment_id,
        replies: [],
      }));

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
      if (!this.isLoggedIn) {
        alert("Morate biti prijavljeni da biste ostavili komentar.");
        this.$router.push("/prijava");
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
        alert("Comment posted successfully!");
      } catch (error) {
        console.error("Error posting comment:", error);
        alert("Failed to post comment. Please try again.");
      } finally {
        this.submittingComment = false;
      }
    },

    async submitReply(commentId) {
      if (!this.isLoggedIn) {
        alert("Morate biti prijavljeni da biste odgovorili na komentar.");
        this.$router.push("/prijava");
        return;
      }

      if (!this.replyComment.message) {
        alert("Poruka je obavezna");
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

        // Clear the reply form and hide it
        this.replyComment = {
          name: this.replyComment.name,
          email: this.replyComment.email,
          message: "",
        };
        this.replyingTo = null;

        // Emit event to parent to refresh comments
        this.$emit("comment-added");

        // Show success message
        alert("Reply posted successfully!");
      } catch (error) {
        console.error("Error posting reply:", error);
        alert("Failed to post reply. Please try again.");
      } finally {
        this.submittingReply = false;
      }
    },

    startReply(commentId) {
      if (!this.isLoggedIn) {
        alert("Morate biti prijavljeni da biste odgovorili na komentar.");
        return;
      }

      this.replyingTo = commentId;
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyComment = { name: "", email: "", message: "" };
    },

    formatDate(dateString) {
      // Robust parse and humanize; gracefully handle invalid inputs
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

      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInHours < 1) {
        return "Just now";
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
      } else {
        return date.toLocaleDateString();
      }
    },
    stripHtml(html) {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
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

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vote-buttons {
  display: flex;
  gap: 12px;
}

.vote-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.vote-btn.like:hover,
.vote-btn.dislike:hover {
  transform: scale(1.1);
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
</style>
