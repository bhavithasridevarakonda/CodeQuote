/**
 * CodeQuote - Single Page Application
 * Pure Vanilla JavaScript (No frameworks, No database, No external APIs)
 * Designed for DevOps Demonstration & Automated Testing
 */

// Local JavaScript array containing 26 developer quotes
// NOTE FOR AUTOMATED TESTS: Each quote starts on its own line with { id: X, ...
const quotes = [
  { id: 1, text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Programming" },
  { id: 2, text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson", category: "Programming" },
  { id: 3, text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Programming" },
  { id: 4, text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Programming" },
  { id: 5, text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", category: "Programming" },
  { id: 6, text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "Programming" },
  { id: 7, text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie", category: "Learning" },
  { id: 8, text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "Learning" },
  { id: 9, text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin", category: "Learning" },
  { id: 10, text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "Learning" },
  { id: 11, text: "Curiosity is the engine of achievement.", author: "Ken Robinson", category: "Learning" },
  { id: 12, text: "Creativity is intelligence having fun.", author: "Albert Einstein", category: "Creativity" },
  { id: 13, text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou", category: "Creativity" },
  { id: 14, text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates", category: "Creativity" },
  { id: 15, text: "Good software, like wine, takes time and craftsmanship.", author: "Joel Spolsky", category: "Creativity" },
  { id: 16, text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "Discipline" },
  { id: 17, text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "Discipline" },
  { id: 18, text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "Discipline" },
  { id: 19, text: "Success is nothing more than a few simple disciplines, practiced every day.", author: "Jim Rohn", category: "Discipline" },
  { id: 20, text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart", category: "Discipline" },
  { id: 21, text: "It always seems impossible until it is done.", author: "Nelson Mandela", category: "Motivation" },
  { id: 22, text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "Motivation" },
  { id: 23, text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "Motivation" },
  { id: 24, text: "Opportunities don't happen, you create them.", author: "Chris Grosser", category: "Motivation" },
  { id: 25, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "Motivation" },
  { id: 26, text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Motivation" },
];

// Local storage key for saved favorites
const FAVORITES_STORAGE_KEY = "codequote_favorites";

// State variables
let currentFeaturedQuote = null;
let currentCategory = "All";
let searchQuery = "";

/**
 * Returns a random quote from the quotes array.
 * Tries to avoid immediate duplicate if multiple quotes exist.
 */
function getRandomQuote() {
  if (!quotes || quotes.length === 0) return null;
  if (quotes.length === 1) return quotes[0];
  
  let candidate;
  do {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    candidate = quotes[randomIndex];
  } while (currentFeaturedQuote && candidate.id === currentFeaturedQuote.id && quotes.length > 1);

  return candidate;
}

/**
 * Deterministically returns the Quote of the Day based on calendar date.
 * Everyone visiting on the same date sees the exact same quote.
 */
function getDailyQuote(date = new Date()) {
  if (!quotes || quotes.length === 0) return null;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Deterministic seed formula using calendar components
  const dayOfYearSeed = (year * 10000) + (month * 100) + day;
  const index = Math.abs(dayOfYearSeed) % quotes.length;
  return quotes[index];
}

/**
 * Copies text to user clipboard with a friendly toast notification
 */
async function copyToClipboard(text, customMessage = "Copied to clipboard!") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(customMessage, "cyan");
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast(customMessage, "cyan");
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    showToast("Failed to copy text", "error");
  }
}

/**
 * Shares a quote via Web Share API, falling back to clipboard if unsupported
 */
async function shareQuote(quote) {
  const shareData = {
    title: "CodeQuote Inspiration",
    text: `"${quote.text}" — ${quote.author}`,
    url: window.location.href,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      showToast("Quote shared successfully!", "pink");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Share cancelled or failed, falling back to clipboard:", err);
        copyToClipboard(`"${quote.text}" — ${quote.author}`, "Share text copied to clipboard!");
      }
    }
  } else {
    // Fallback when Web Share is unsupported
    copyToClipboard(`"${quote.text}" — ${quote.author}`, "Share text copied to clipboard!");
  }
}

/**
 * LocalStorage Favorites Management
 */
function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading localStorage favorites:", e);
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
    updateFavoritesBadge();
  } catch (e) {
    console.error("Error writing to localStorage:", e);
  }
}

function isFavorited(quoteId) {
  const favs = getFavorites();
  return favs.some((q) => q.id === quoteId);
}

function toggleFavorite(quote) {
  const favs = getFavorites();
  const index = favs.findIndex((q) => q.id === quote.id);

  if (index >= 0) {
    favs.splice(index, 1);
    saveFavorites(favs);
    showToast("Quote removed from favorites", "pink");
  } else {
    favs.push(quote);
    saveFavorites(favs);
    showToast("Quote saved to favorites!", "pink");
  }

  // Refresh UI
  renderFeaturedQuote(currentFeaturedQuote);
  renderExplorerQuotes();
  renderFavorites();
}

/**
 * Toast notification system
 */
function showToast(message, type = "cyan") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "pink" ? "toast-pink" : type === "error" ? "toast-error" : ""}`;
  
  const icon = type === "error" ? "⚠️" : type === "pink" ? "💖" : "✨";
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 350);
  }, 3200);
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Update the navbar favorites badge count
 */
function updateFavoritesBadge() {
  const badge = document.getElementById("fav-count-badge");
  if (!badge) return;
  const count = getFavorites().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

/**
 * Render the Featured Quote section
 */
function renderFeaturedQuote(quote) {
  if (!quote) return;
  currentFeaturedQuote = quote;

  const textEl = document.getElementById("featured-text");
  const authorEl = document.getElementById("featured-author");
  const catEl = document.getElementById("featured-category");
  const saveBtn = document.getElementById("featured-btn-save");

  if (textEl) textEl.textContent = `"${quote.text}"`;
  if (authorEl) authorEl.textContent = quote.author;
  if (catEl) catEl.textContent = quote.category;

  if (saveBtn) {
    const saved = isFavorited(quote.id);
    saveBtn.innerHTML = saved ? "💖 Saved" : "🤍 Save";
    if (saved) {
      saveBtn.classList.add("btn-pink");
      saveBtn.classList.remove("btn-glass");
    } else {
      saveBtn.classList.remove("btn-pink");
      saveBtn.classList.add("btn-glass");
    }
  }
}

/**
 * Render the Daily Quote section
 */
function renderDailyQuote() {
  const daily = getDailyQuote();
  if (!daily) return;

  const textEl = document.getElementById("daily-text");
  const authorEl = document.getElementById("daily-author");
  const catEl = document.getElementById("daily-category");
  const dateEl = document.getElementById("daily-date-display");

  if (textEl) textEl.textContent = `"${daily.text}"`;
  if (authorEl) authorEl.textContent = daily.author;
  if (catEl) catEl.textContent = daily.category;

  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Set up daily quote action buttons
  const copyBtn = document.getElementById("daily-btn-copy");
  const shareBtn = document.getElementById("daily-btn-share");
  const saveBtn = document.getElementById("daily-btn-save");

  if (copyBtn) {
    copyBtn.onclick = () => copyToClipboard(`"${daily.text}" — ${daily.author}`, "Quote of the day copied!");
  }
  if (shareBtn) {
    shareBtn.onclick = () => shareQuote(daily);
  }
  if (saveBtn) {
    const saved = isFavorited(daily.id);
    saveBtn.innerHTML = saved ? "💖 Saved" : "🤍 Save";
    saveBtn.onclick = () => {
      toggleFavorite(daily);
      renderDailyQuote();
    };
  }
}

/**
 * Filter and search quotes in Explorer
 */
function getFilteredQuotes() {
  return quotes.filter((q) => {
    const matchesCategory = currentCategory === "All" || q.category === currentCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      q.text.toLowerCase().includes(query) ||
      q.author.toLowerCase().includes(query) ||
      q.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

/**
 * Render Explorer quotes cards
 */
function renderExplorerQuotes() {
  const grid = document.getElementById("quotes-grid");
  const countEl = document.getElementById("quotes-count-display");
  if (!grid) return;

  const filtered = getFilteredQuotes();

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${quotes.length} quotes`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No matching quotes</h3>
        <p class="empty-state-desc">Try clearing your search terms or selecting a different category filter.</p>
        <button class="btn btn-cyan btn-sm" id="reset-filters-btn">Reset All Filters</button>
      </div>
    `;
    const resetBtn = document.getElementById("reset-filters-btn");
    if (resetBtn) {
      resetBtn.onclick = () => {
        currentCategory = "All";
        searchQuery = "";
        const searchInput = document.getElementById("explorer-search-input");
        if (searchInput) searchInput.value = "";
        document.querySelectorAll(".filter-pill").forEach((pill) => {
          pill.classList.toggle("active", pill.dataset.category === "All");
        });
        renderExplorerQuotes();
      };
    }
    return;
  }

  grid.innerHTML = filtered
    .map((quote) => {
      const saved = isFavorited(quote.id);
      return `
        <article class="glass-card quote-card" data-id="${quote.id}">
          <div class="quote-card-header">
            <span class="quote-category-tag">${escapeHtml(quote.category)}</span>
            <span class="quote-id-tag">#${quote.id}</span>
          </div>
          <p class="quote-card-text">"${escapeHtml(quote.text)}"</p>
          <div class="quote-card-author">— ${escapeHtml(quote.author)}</div>
          <div class="quote-card-actions">
            <button class="card-action-btn action-copy" data-id="${quote.id}" title="Copy quote">
              📋 Copy
            </button>
            <button class="card-action-btn action-save ${saved ? "saved" : ""}" data-id="${quote.id}" title="${saved ? "Remove from favorites" : "Save to favorites"}">
              ${saved ? "💖 Saved" : "🤍 Save"}
            </button>
            <button class="card-action-btn action-share" data-id="${quote.id}" title="Share quote">
              🚀 Share
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach event handlers
  grid.querySelectorAll(".action-copy").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = quotes.find((q) => q.id === id);
      if (quote) copyToClipboard(`"${quote.text}" — ${quote.author}`);
    };
  });

  grid.querySelectorAll(".action-save").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = quotes.find((q) => q.id === id);
      if (quote) toggleFavorite(quote);
    };
  });

  grid.querySelectorAll(".action-share").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = quotes.find((q) => q.id === id);
      if (quote) shareQuote(quote);
    };
  });
}

/**
 * Render Saved Favorites Section
 */
function renderFavorites() {
  const grid = document.getElementById("favorites-grid");
  if (!grid) return;

  const favs = getFavorites();

  if (favs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">💫</div>
        <h3 class="empty-state-title">Your favorites list is empty</h3>
        <p class="empty-state-desc">Explore quotes above and click "Save" on any quote you love to build your personal inspiration board!</p>
        <a href="#explorer" class="btn btn-cyan btn-sm">Explore Quotes</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = favs
    .map((quote) => {
      return `
        <article class="glass-card quote-card" data-id="${quote.id}">
          <div class="quote-card-header">
            <span class="quote-category-tag">${escapeHtml(quote.category)}</span>
            <span class="quote-id-tag">#${quote.id}</span>
          </div>
          <p class="quote-card-text">"${escapeHtml(quote.text)}"</p>
          <div class="quote-card-author">— ${escapeHtml(quote.author)}</div>
          <div class="quote-card-actions">
            <button class="card-action-btn fav-action-copy" data-id="${quote.id}" title="Copy quote">
              📋 Copy
            </button>
            <button class="card-action-btn saved fav-action-remove" data-id="${quote.id}" title="Remove from favorites">
              🗑️ Remove
            </button>
            <button class="card-action-btn fav-action-share" data-id="${quote.id}" title="Share quote">
              🚀 Share
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Attach event handlers
  grid.querySelectorAll(".fav-action-copy").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = favs.find((q) => q.id === id);
      if (quote) copyToClipboard(`"${quote.text}" — ${quote.author}`);
    };
  });

  grid.querySelectorAll(".fav-action-remove").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = favs.find((q) => q.id === id);
      if (quote) toggleFavorite(quote);
    };
  });

  grid.querySelectorAll(".fav-action-share").forEach((btn) => {
    btn.onclick = (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      const quote = favs.find((q) => q.id === id);
      if (quote) shareQuote(quote);
    };
  });
}

/**
 * Initialize application events and state
 */
function initCodeQuote() {
  // 1. Dynamic copyright year in footer
  const yearEl = document.getElementById("copyright-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile navigation toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navLinks = document.getElementById("nav-links");
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener("click", () => {
      const expanded = mobileToggle.getAttribute("aria-expanded") === "true";
      mobileToggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    });

    // Close menu when clicking link
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 3. Featured Quote initialization & actions
  renderFeaturedQuote(getRandomQuote());

  const newQuoteBtn = document.getElementById("featured-btn-new");
  if (newQuoteBtn) {
    newQuoteBtn.onclick = () => {
      const quote = getRandomQuote();
      renderFeaturedQuote(quote);
      showToast("Fresh quote loaded!", "cyan");
    };
  }

  const heroInspireBtn = document.getElementById("hero-btn-inspire");
  if (heroInspireBtn) {
    heroInspireBtn.onclick = () => {
      const quote = getRandomQuote();
      renderFeaturedQuote(quote);
      const featSection = document.getElementById("featured");
      if (featSection) {
        featSection.scrollIntoView({ behavior: "smooth" });
      }
      showToast("Here is your fresh inspiration!", "cyan");
    };
  }

  const copyTextBtn = document.getElementById("featured-btn-copy-text");
  if (copyTextBtn) {
    copyTextBtn.onclick = () => {
      if (currentFeaturedQuote) {
        copyToClipboard(currentFeaturedQuote.text, "Quote text copied!");
      }
    };
  }

  const copyAuthorBtn = document.getElementById("featured-btn-copy-author");
  if (copyAuthorBtn) {
    copyAuthorBtn.onclick = () => {
      if (currentFeaturedQuote) {
        copyToClipboard(`"${currentFeaturedQuote.text}" — ${currentFeaturedQuote.author}`, "Quote with author copied!");
      }
    };
  }

  const saveFeaturedBtn = document.getElementById("featured-btn-save");
  if (saveFeaturedBtn) {
    saveFeaturedBtn.onclick = () => {
      if (currentFeaturedQuote) {
        toggleFavorite(currentFeaturedQuote);
      }
    };
  }

  const shareFeaturedBtn = document.getElementById("featured-btn-share");
  if (shareFeaturedBtn) {
    shareFeaturedBtn.onclick = () => {
      if (currentFeaturedQuote) {
        shareQuote(currentFeaturedQuote);
      }
    };
  }

  // 4. Quote of the day
  renderDailyQuote();

  // 5. Explorer controls
  const searchInput = document.getElementById("explorer-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderExplorerQuotes();
    });
  }

  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategory = pill.dataset.category;
      renderExplorerQuotes();
    });
  });

  renderExplorerQuotes();
  renderFavorites();
  updateFavoritesBadge();
}

// Auto-run on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCodeQuote);
} else {
  initCodeQuote();
}
