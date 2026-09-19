/**
 * ============================================================================
 * CivicConnect - AI-Powered Citizen Grievance Management System
 * script.js (Full Frontend + Backend REST Integration)
 * 
 * Features:
 * 1. Full Spring Boot REST Integration (http://localhost:8080/api)
 * 2. Role-Based Access Control (CITIZEN vs ADMIN)
 * 3. Municipal Admin Command Center & Analytics Dashboard
 * 4. AI Real-Time Analysis & Smart Department Routing
 * 5. Multipart Media Evidence Proof Storage & Viewer
 * 6. Single Support Vote per citizen & Discussion comments
 * 7. Resilient Fallback to LocalStorage if backend is offline
 * ============================================================================
 */

const API_BASE = "http://localhost:8080/api";
let isBackendConnected = true;

// Storage Keys
const STORAGE_KEY_USERS = "civicconnect_users";
const STORAGE_KEY_CURRENT_USER = "civicconnect_currentUser";
const STORAGE_KEY_COMPLAINTS = "civicconnect_complaints";
const STORAGE_KEY_SUPPORTED_PREFIX = "civicconnect_supported_";

// ============================================================================
// 1. STATE MANAGEMENT
// ============================================================================
let complaintsData = [];
let currentView = "feed"; // 'feed' | 'my-complaints' | 'admin'
let currentCategory = "All";
let currentSearchQuery = "";

// Admin Filter State
let adminStatusFilterVal = "ALL";
let adminCategoryFilterVal = "ALL";
let adminPriorityFilterVal = "ALL";
let adminSearchVal = "";

// Upload states for form
let currentImageProof = null; // { name, type, data, url }
let currentVideoProof = null; // { name, type, data, url }

// Modal states
let editingComplaintId = null;
let deletingComplaintId = null;
let activeCommentComplaintId = null;
let adminActionComplaintId = null;

// ============================================================================
// 2. DOM ELEMENTS
// ============================================================================
// Navigation
const navHomeBtn = document.getElementById("navHomeBtn");
const navComplaintsBtn = document.getElementById("navComplaintsBtn");
const navMyComplaintsBtn = document.getElementById("navMyComplaintsBtn");
const navAdminBtn = document.getElementById("navAdminBtn");
const navSubmitBtn = document.getElementById("navSubmitBtn");
const heroSubmitBtn = document.getElementById("heroSubmitBtn");
const heroBrowseBtn = document.getElementById("heroBrowseBtn");
const openModalBtn = document.getElementById("openModalBtn");
const authNavBox = document.getElementById("authNavBox");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

// Main Citizen Views
const complaintsMain = document.getElementById("complaints");
const complaintsFeed = document.getElementById("complaintsFeed");
const feedHeading = document.getElementById("feedHeading");
const feedSubheading = document.getElementById("feedSubheading");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const filterButtonsContainer = document.getElementById("filterButtons");
const resultsCount = document.getElementById("resultsCount");
const toastContainer = document.getElementById("toastContainer");

// Main Admin Section
const adminSection = document.getElementById("adminSection");
const refreshAdminStatsBtn = document.getElementById("refreshAdminStatsBtn");
const adminTotalStat = document.getElementById("adminTotalStat");
const adminPendingStat = document.getElementById("adminPendingStat");
const adminProgressStat = document.getElementById("adminProgressStat");
const adminResolvedStat = document.getElementById("adminResolvedStat");
const adminRejectedStat = document.getElementById("adminRejectedStat");
const adminHighPriorityStat = document.getElementById("adminHighPriorityStat");
const categoryAnalyticsBars = document.getElementById("categoryAnalyticsBars");
const departmentAnalyticsBars = document.getElementById("departmentAnalyticsBars");
const adminSearchInput = document.getElementById("adminSearchInput");
const adminStatusFilter = document.getElementById("adminStatusFilter");
const adminCategoryFilter = document.getElementById("adminCategoryFilter");
const adminPriorityFilter = document.getElementById("adminPriorityFilter");
const resetAdminFiltersBtn = document.getElementById("resetAdminFiltersBtn");
const adminComplaintsList = document.getElementById("adminComplaintsList");
const adminTableCount = document.getElementById("adminTableCount");

// Form Inputs
const complaintModal = document.getElementById("complaintModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const newComplaintForm = document.getElementById("newComplaintForm");
const modalTitle = document.getElementById("modalTitle");
const complaintTitleInput = document.getElementById("complaintTitle");
const complaintLocationInput = document.getElementById("complaintLocation");
const complaintCategorySelect = document.getElementById("complaintCategory");
const complaintUrgencySelect = document.getElementById("complaintUrgency");
const complaintDescInput = document.getElementById("complaintDescription");
const complaintAffectedInput = document.getElementById("complaintAffected");
const aiAssistText = document.getElementById("aiAssistText");
const evidenceError = document.getElementById("evidenceError");

// Media Upload Elements
const imageProofInput = document.getElementById("imageProofInput");
const chooseImageBtn = document.getElementById("chooseImageBtn");
const imageProofPreview = document.getElementById("imageProofPreview");
const videoProofInput = document.getElementById("videoProofInput");
const chooseVideoBtn = document.getElementById("chooseVideoBtn");
const videoProofPreview = document.getElementById("videoProofPreview");

// Modals
const proofModal = document.getElementById("proofModal");
const closeProofModalBtn = document.getElementById("closeProofModalBtn");
const proofModalTitle = document.getElementById("proofModalTitle");
const proofModalSubtitle = document.getElementById("proofModalSubtitle");
const proofModalMediaContainer = document.getElementById("proofModalMediaContainer");
const proofFooterBar = document.getElementById("proofFooterBar");

const deleteModal = document.getElementById("deleteModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModalBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteComplaintPreview = document.getElementById("deleteComplaintPreview");

const commentModal = document.getElementById("commentModal");
const closeCommentModalBtn = document.getElementById("closeCommentModalBtn");
const commentsList = document.getElementById("commentsList");
const commentForm = document.getElementById("commentForm");
const newCommentText = document.getElementById("newCommentText");

const loginModal = document.getElementById("loginModal");
const closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
const loginForm = document.getElementById("loginForm");
const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const loginErrorMsg = document.getElementById("loginError");
const switchToRegisterLink = document.getElementById("switchToRegisterLink");

const registerModal = document.getElementById("registerModal");
const closeRegisterModalBtn = document.getElementById("closeRegisterModalBtn");
const registerForm = document.getElementById("registerForm");
const registerNameInput = document.getElementById("registerName");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const registerConfirmPasswordInput = document.getElementById("registerConfirmPassword");
const registerErrorMsg = document.getElementById("registerError");
const switchToLoginLink = document.getElementById("switchToLoginLink");

// Admin Action Modals
const adminStatusModal = document.getElementById("adminStatusModal");
const closeAdminStatusModalBtn = document.getElementById("closeAdminStatusModalBtn");
const cancelAdminStatusBtn = document.getElementById("cancelAdminStatusBtn");
const adminStatusForm = document.getElementById("adminStatusForm");
const adminStatusSelect = document.getElementById("adminStatusSelect");
const adminStatusNotes = document.getElementById("adminStatusNotes");
const adminStatusModalTitle = document.getElementById("adminStatusModalTitle");
const adminStatusModalSubtitle = document.getElementById("adminStatusModalSubtitle");

const adminDeptModal = document.getElementById("adminDeptModal");
const closeAdminDeptModalBtn = document.getElementById("closeAdminDeptModalBtn");
const cancelAdminDeptBtn = document.getElementById("cancelAdminDeptBtn");
const adminDeptForm = document.getElementById("adminDeptForm");
const adminDeptSelect = document.getElementById("adminDeptSelect");
const adminDeptModalTitle = document.getElementById("adminDeptModalTitle");
const adminDeptModalSubtitle = document.getElementById("adminDeptModalSubtitle");

// Stats Counters
const totalComplaintsStat = document.getElementById("totalComplaintsStat");
const resolvedStat = document.getElementById("resolvedStat");
const inProgressStat = document.getElementById("inProgressStat");
const citizensSupportedStat = document.getElementById("citizensSupportedStat");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

// ============================================================================
// 3. AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (err) {}
}

function isComplaintOwner(complaint) {
  if (!complaint) return false;
  const user = getCurrentUser();
  if (!user || !user.id) return false;
  return Number(complaint.createdBy) === Number(user.id) || user.role === "ADMIN";
}

function updateAuthUI() {
  if (!authNavBox) return;
  const user = getCurrentUser();

  if (user) {
    const isAdmin = user.role === "ADMIN";
    if (navAdminBtn) {
      navAdminBtn.style.display = isAdmin ? "inline-block" : "none";
    }

    authNavBox.innerHTML = `
      <div class="user-profile-badge" title="Logged in as ${escapeHTML(user.email)} (${user.role})">
        <span class="user-avatar-small">${isAdmin ? "🛡️" : "👤"}</span>
        <span class="user-name-text">${escapeHTML(user.name)}</span>
      </div>
      <button class="btn-logout" id="logoutBtn" title="Log out">🚪 Logout</button>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);
  } else {
    if (navAdminBtn) navAdminBtn.style.display = "none";
    authNavBox.innerHTML = `
      <button class="nav-link nav-link-login" id="loginBtn">Login</button>
      <button class="nav-link nav-link-register" id="registerBtn">Register</button>
    `;
    document.getElementById("loginBtn")?.addEventListener("click", () => openLoginModal());
    document.getElementById("registerBtn")?.addEventListener("click", () => openRegisterModal());
  }
}

function handleLogout() {
  setCurrentUser(null);
  updateAuthUI();
  switchToView("feed");
  showToast("Logged out successfully.", "info");
}

// User-specific support history
function getUserSupportedComplaints(userKey) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPPORTED_PREFIX + userKey);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (err) {
    return new Set();
  }
}

function saveUserSupportedComplaints(userKey, set) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPPORTED_PREFIX + userKey, JSON.stringify(Array.from(set)));
  } catch (err) {}
}

// ============================================================================
// 4. BACKEND REST API CALLS WITH LOCALSTORAGE RESILIENCE
// ============================================================================

async function fetchComplaintsFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/complaints`);
    if (res.ok) {
      const body = await res.json();
      if (body && body.data) {
        complaintsData = body.data;
        isBackendConnected = true;
        return;
      }
    }
  } catch (err) {
    console.warn("Backend REST API offline or unreachable, using local storage mode:", err);
    isBackendConnected = false;
  }
  loadComplaintsFromLocalStorage();
}

async function apiRegisterUser(name, email, password) {
  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    return await res.json();
  } catch (err) {
    // Local fallback
    const users = getRegisteredUsersLocal();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "This email is already registered." };
    }
    const newUser = { id: Date.now(), name, email, password, role: "CITIZEN" };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    return { success: true, message: "Citizen registered locally!", data: newUser };
  }
}

async function apiLoginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  } catch (err) {
    // Local fallback
    if (email.toLowerCase() === "admin@civicconnect.com" && password === "admin123") {
      return { success: true, message: "Login successful!", data: { id: 999, name: "Municipal Administrator", email, role: "ADMIN" } };
    }
    const users = getRegisteredUsersLocal();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      return { success: true, message: "Login successful!", data: { id: user.id, name: user.name, email: user.email, role: user.role || "CITIZEN" } };
    }
    return { success: false, message: "Invalid email or password." };
  }
}

async function apiCreateComplaint(payload) {
  try {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.data) return data.data;
    }
  } catch (err) {
    console.warn("Backend save failed, using local save:", err);
  }

  // Local fallback object
  const newC = {
    id: Date.now(),
    title: payload.title,
    description: payload.description,
    category: payload.category || "Water",
    location: payload.location,
    priority: payload.priority || "Medium",
    status: "PENDING",
    createdBy: payload.createdBy,
    createdByName: payload.createdByName || "Citizen",
    supportCount: 0,
    department: payload.department || "General Municipal Administration",
    imageUrl: payload.imageUrl,
    videoUrl: payload.videoUrl,
    createdAt: new Date().toISOString()
  };
  complaintsData.unshift(newC);
  saveComplaintsToLocalStorage();
  return newC;
}

async function apiUpdateComplaint(id, payload) {
  try {
    const user = getCurrentUser();
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": user ? String(user.id) : "",
        "X-User-Role": user ? user.role : "CITIZEN"
      },
      body: JSON.stringify({ ...payload, callerId: user?.id, callerRole: user?.role })
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {}

  // Local fallback
  const idx = complaintsData.findIndex((c) => c.id === id);
  if (idx !== -1) {
    Object.assign(complaintsData[idx], payload);
    saveComplaintsToLocalStorage();
    return complaintsData[idx];
  }
  return null;
}

async function apiDeleteComplaint(id) {
  try {
    const user = getCurrentUser();
    const res = await fetch(`${API_BASE}/complaints/${id}?callerId=${user?.id}&callerRole=${user?.role}`, {
      method: "DELETE",
      headers: {
        "X-User-Id": user ? String(user.id) : "",
        "X-User-Role": user ? user.role : "CITIZEN"
      }
    });
    if (res.ok) return true;
  } catch (err) {}

  const idx = complaintsData.findIndex((c) => c.id === id);
  if (idx !== -1) {
    complaintsData.splice(idx, 1);
    saveComplaintsToLocalStorage();
    return true;
  }
  return false;
}

async function apiSupportComplaint(id, userId) {
  try {
    const res = await fetch(`${API_BASE}/complaints/${id}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    const c = complaintsData.find((item) => item.id === id);
    if (c) {
      c.supportCount = (c.supportCount || 0) + 1;
      saveComplaintsToLocalStorage();
      return { success: true, data: c };
    }
    return { success: false, message: "Complaint not found." };
  }
}

async function apiFetchComments(complaintId) {
  try {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/comments`);
    if (res.ok) {
      const body = await res.json();
      return body.data || [];
    }
  } catch (err) {}
  const c = complaintsData.find((item) => item.id === complaintId);
  return c?.comments || [];
}

async function apiAddComment(complaintId, userId, userName, text) {
  try {
    const res = await fetch(`${API_BASE}/complaints/${complaintId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, userName, text })
    });
    if (res.ok) {
      const body = await res.json();
      return body.data;
    }
  } catch (err) {}

  const c = complaintsData.find((item) => item.id === complaintId);
  if (c) {
    if (!c.comments) c.comments = [];
    const newComment = { id: Date.now(), complaintId, userId, userName, text, createdAt: new Date().toISOString() };
    c.comments.push(newComment);
    saveComplaintsToLocalStorage();
    return newComment;
  }
  return null;
}

async function apiAnalyzeText(title, description) {
  try {
    const res = await fetch(`${API_BASE}/complaints/ai-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });
    if (res.ok) {
      const body = await res.json();
      return body.data;
    }
  } catch (err) {}
  return null;
}

async function apiUploadMedia(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: "POST",
      body: formData
    });
    if (res.ok) {
      const body = await res.json();
      return body.data?.fileUrl;
    }
  } catch (err) {}
  return null;
}

// LocalStorage helpers
function getRegisteredUsersLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [
      { id: 1, name: "Faiz", email: "faiz@test.com", password: "123456", role: "CITIZEN" },
      { id: 2, name: "Arun", email: "arun@test.com", password: "123456", role: "CITIZEN" }
    ];
  } catch (e) {
    return [];
  }
}

function saveComplaintsToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(complaintsData));
  } catch (e) {}
}

function loadComplaintsFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        complaintsData = parsed;
        return;
      }
    }
  } catch (e) {}
}

// ============================================================================
// 5. CITIZEN FEED RENDERING
// ============================================================================

function getStatusBadgeDetails(status) {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "RESOLVED":
      return { className: "resolved", icon: "✓", label: "Resolved" };
    case "IN_PROGRESS":
      return { className: "in-progress", icon: "⏳", label: "In Progress" };
    case "REJECTED":
      return { className: "pending", icon: "⛔", label: "Rejected" };
    case "PENDING":
    default:
      return { className: "pending", icon: "⚠️", label: "Pending Review" };
  }
}

function getPriorityBadgeDetails(priority) {
  const p = (priority || "").toUpperCase();
  if (p === "HIGH") return { label: "🔴 High Priority", isHigh: true };
  if (p === "LOW") return { label: "🟢 Low Priority", isHigh: false };
  return { label: "🟡 Medium Priority", isHigh: false };
}

function getCategoryEmoji(category) {
  const map = { Water: "💧", Roads: "🛣️", Electricity: "⚡", Waste: "🗑️", Sanitation: "🏥", Traffic: "🚦", Other: "📌" };
  return map[category] || "📌";
}

function renderComplaints() {
  if (!complaintsFeed) return;
  complaintsFeed.innerHTML = "";

  const currentUser = getCurrentUser();
  const userKey = currentUser ? (currentUser.email || `user_${currentUser.id}`) : "guest";
  const supportedSet = currentUser ? getUserSupportedComplaints(userKey) : new Set();

  let list = complaintsData;
  if (currentView === "my-complaints") {
    if (currentUser) {
      list = complaintsData.filter((c) => Number(c.createdBy) === Number(currentUser.id));
    } else {
      list = [];
    }
  }

  if (currentCategory !== "All") {
    list = list.filter((c) => (c.category || "").toLowerCase() === currentCategory.toLowerCase());
  }

  const query = currentSearchQuery.trim().toLowerCase();
  if (query !== "") {
    list = list.filter((c) => {
      const t = (c.title || "").toLowerCase();
      const d = (c.description || "").toLowerCase();
      const l = (c.location || "").toLowerCase();
      const cat = (c.category || "").toLowerCase();
      return t.includes(query) || d.includes(query) || l.includes(query) || cat.includes(query);
    });
  }

  if (resultsCount) {
    resultsCount.textContent = `Showing ${list.length} of ${complaintsData.length} complaints`;
  }

  if (list.length === 0) {
    if (currentView === "my-complaints" && !currentUser) {
      complaintsFeed.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔐</div>
          <h3 class="empty-title">Please login to view your complaints</h3>
          <button class="btn btn-primary" id="emptyLoginBtn" style="margin-top: 1rem;"><span>🔐</span> Login Now</button>
        </div>
      `;
      document.getElementById("emptyLoginBtn")?.addEventListener("click", () => openLoginModal());
    } else {
      complaintsFeed.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔎</div>
          <h3 class="empty-title">No complaints found.</h3>
          <p class="empty-desc">Try clearing the search filter or submit a new grievance.</p>
        </div>
      `;
    }
    updateStatsCounters();
    return;
  }

  list.forEach((complaint) => {
    const statusDetails = getStatusBadgeDetails(complaint.status);
    const priorityDetails = getPriorityBadgeDetails(complaint.priority);
    const categoryEmoji = getCategoryEmoji(complaint.category);
    const isSupported = supportedSet.has(complaint.id);
    const isOwner = isComplaintOwner(complaint);

    const hasImage = complaint.imageUrl || (complaint.imageProof && complaint.imageProof.data);
    const hasVideo = complaint.videoUrl || (complaint.videoProof && complaint.videoProof.data);
    const imageSrc = complaint.imageUrl ? (complaint.imageUrl.startsWith("http") ? complaint.imageUrl : API_BASE.replace("/api", "") + complaint.imageUrl) : complaint.imageProof?.data;
    const videoSrc = complaint.videoUrl ? (complaint.videoUrl.startsWith("http") ? complaint.videoUrl : API_BASE.replace("/api", "") + complaint.videoUrl) : complaint.videoProof?.data;

    let mediaHTML = "";
    if (hasImage && !hasVideo) {
      mediaHTML = `
        <div class="complaint-media-preview trigger-proof-img" data-id="${complaint.id}" title="Click to enlarge proof">
          <img src="${imageSrc}" alt="Proof" class="complaint-card-image" loading="lazy" />
          <span class="preview-overlay-tag">🔍 View Proof</span>
        </div>
      `;
    } else if (hasVideo && !hasImage) {
      mediaHTML = `
        <div class="complaint-media-preview">
          <video src="${videoSrc}" class="complaint-card-video" controls playsinline></video>
        </div>
      `;
    } else if (hasImage && hasVideo) {
      mediaHTML = `
        <div class="complaint-media-grid">
          <div class="complaint-media-preview trigger-proof-img" data-id="${complaint.id}">
            <img src="${imageSrc}" alt="Photo evidence" class="complaint-card-image" />
          </div>
          <div class="complaint-media-preview">
            <video src="${videoSrc}" class="complaint-card-video" controls playsinline></video>
          </div>
        </div>
      `;
    }

    const card = document.createElement("article");
    card.className = "complaint-card";
    card.dataset.id = complaint.id;

    card.innerHTML = `
      <div class="card-top-row">
        <div class="author-info">
          <div class="author-avatar">${(complaint.createdByName || "C").charAt(0).toUpperCase()}</div>
          <div class="author-meta">
            <span class="author-name">${escapeHTML(complaint.createdByName || "Citizen")}</span>
            <span class="card-time">${escapeHTML(complaint.timeAgo || "Recently")}</span>
          </div>
        </div>
        <span class="status-badge ${statusDetails.className}">
          <span>${statusDetails.icon}</span> ${statusDetails.label}
        </span>
      </div>

      <div class="ai-card-tag ${priorityDetails.isHigh ? 'high-priority' : ''}">
        <span>🤖</span>
        <span>${priorityDetails.label} • Assigned: <strong>${escapeHTML(complaint.department || "General Administration")}</strong></span>
      </div>

      <h3 class="complaint-title">${escapeHTML(complaint.title)}</h3>

      <div class="complaint-meta-tags">
        <span class="meta-pill">${categoryEmoji} <strong>${escapeHTML(complaint.category || "General")}</strong></span>
        <span class="meta-pill">📍 ${escapeHTML(complaint.location || "Local Ward")}</span>
        ${complaint.department ? `<span class="meta-pill">🏢 ${escapeHTML(complaint.department)}</span>` : ""}
      </div>

      <p class="complaint-desc">${escapeHTML(complaint.description)}</p>

      ${complaint.aiSummary ? `
        <div class="admin-ai-summary-box">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary);">✨ AI Executive Summary:</span>
          <span>${escapeHTML(complaint.aiSummary)}</span>
        </div>
      ` : ""}

      ${complaint.adminNotes ? `
        <div class="admin-ai-summary-box" style="border-left-color: #16a34a; background-color: #f0fdf4;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #16a34a;">🏛️ Official Authority Note:</span>
          <span>${escapeHTML(complaint.adminNotes)}</span>
        </div>
      ` : ""}

      ${mediaHTML}

      <div class="card-impact-bar">
        <span class="impact-icon">👥</span>
        <span><strong class="affected-counter" id="affected-${complaint.id}">${complaint.supportCount || 0}</strong> citizens supported</span>
      </div>

      <div class="card-actions">
        <button class="support-btn ${isSupported ? 'supported' : ''}" data-id="${complaint.id}">
          ${isSupported ? '✓ Supported' : '👍 I Have This Problem'}
        </button>
        <button class="action-btn comment-btn" data-id="${complaint.id}">
          💬 Comments (${complaint.comments ? complaint.comments.length : 0})
        </button>
        ${isOwner ? `
          <button class="action-btn btn-edit" data-id="${complaint.id}">✏️ Edit</button>
          <button class="action-btn btn-delete-danger" data-id="${complaint.id}">🗑️ Delete</button>
        ` : ''}
        <button class="action-btn share-btn" data-id="${complaint.id}">↗ Share</button>
      </div>
    `;

    complaintsFeed.appendChild(card);
  });

  updateStatsCounters();
}

function updateStatsCounters() {
  const total = complaintsData.length;
  const resolved = complaintsData.filter((c) => (c.status || "").toUpperCase() === "RESOLVED").length;
  const inProgress = complaintsData.filter((c) => (c.status || "").toUpperCase() === "IN_PROGRESS").length;
  const totalImpact = complaintsData.reduce((acc, c) => acc + (c.supportCount || 0), 0);

  if (totalComplaintsStat) totalComplaintsStat.textContent = total;
  if (resolvedStat) resolvedStat.textContent = resolved;
  if (inProgressStat) inProgressStat.textContent = inProgress;
  if (citizensSupportedStat) citizensSupportedStat.textContent = totalImpact;
}

// ============================================================================
// 6. ADMIN DASHBOARD RENDERING & OPERATIONS (PHASE 4, 5, 7, 10, 11)
// ============================================================================

async function renderAdminDashboard() {
  if (!adminSection) return;

  const user = getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    showToast("Access Denied: Admin authorization required.", "error");
    switchToView("feed");
    return;
  }

  // 1. Fetch live admin stats & analytics from backend
  try {
    const statsRes = await fetch(`${API_BASE}/admin/stats?role=ADMIN`);
    if (statsRes.ok) {
      const body = await statsRes.json();
      const s = body.data;
      if (adminTotalStat) adminTotalStat.textContent = s.totalComplaints;
      if (adminPendingStat) adminPendingStat.textContent = s.pendingComplaints;
      if (adminProgressStat) adminProgressStat.textContent = s.inProgressComplaints;
      if (adminResolvedStat) adminResolvedStat.textContent = s.resolvedComplaints;
      if (adminRejectedStat) adminRejectedStat.textContent = s.rejectedComplaints;
      if (adminHighPriorityStat) adminHighPriorityStat.textContent = s.highPriorityComplaints;
    }

    const analyticsRes = await fetch(`${API_BASE}/admin/analytics?role=ADMIN`);
    if (analyticsRes.ok) {
      const body = await analyticsRes.json();
      renderAnalyticsBars(body.data);
    }
  } catch (err) {
    // Fallback stats computation
    const total = complaintsData.length;
    const pending = complaintsData.filter((c) => (c.status || "").toUpperCase() === "PENDING").length;
    const inProg = complaintsData.filter((c) => (c.status || "").toUpperCase() === "IN_PROGRESS").length;
    const resolved = complaintsData.filter((c) => (c.status || "").toUpperCase() === "RESOLVED").length;
    const rejected = complaintsData.filter((c) => (c.status || "").toUpperCase() === "REJECTED").length;
    const highPri = complaintsData.filter((c) => (c.priority || "").toUpperCase() === "HIGH").length;

    if (adminTotalStat) adminTotalStat.textContent = total;
    if (adminPendingStat) adminPendingStat.textContent = pending;
    if (adminProgressStat) adminProgressStat.textContent = inProg;
    if (adminResolvedStat) adminResolvedStat.textContent = resolved;
    if (adminRejectedStat) adminRejectedStat.textContent = rejected;
    if (adminHighPriorityStat) adminHighPriorityStat.textContent = highPri;
  }

  // 2. Render Admin Complaints List with Filters & Search
  let list = complaintsData;

  if (adminStatusFilterVal !== "ALL") {
    list = list.filter((c) => (c.status || "").toUpperCase() === adminStatusFilterVal);
  }
  if (adminCategoryFilterVal !== "ALL") {
    list = list.filter((c) => (c.category || "").toLowerCase() === adminCategoryFilterVal.toLowerCase());
  }
  if (adminPriorityFilterVal !== "ALL") {
    list = list.filter((c) => (c.priority || "").toLowerCase() === adminPriorityFilterVal.toLowerCase());
  }
  if (adminSearchVal.trim() !== "") {
    const q = adminSearchVal.trim().toLowerCase();
    list = list.filter((c) => {
      const t = (c.title || "").toLowerCase();
      const d = (c.description || "").toLowerCase();
      const l = (c.location || "").toLowerCase();
      const cit = (c.createdByName || "").toLowerCase();
      const dept = (c.department || "").toLowerCase();
      const idStr = String(c.id);
      return t.includes(q) || d.includes(q) || l.includes(q) || cit.includes(q) || dept.includes(q) || idStr.includes(q);
    });
  }

  if (adminTableCount) {
    adminTableCount.textContent = `Showing ${list.length} of ${complaintsData.length} total grievances`;
  }

  if (!adminComplaintsList) return;
  adminComplaintsList.innerHTML = "";

  if (list.length === 0) {
    adminComplaintsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <h3 class="empty-title">No complaints match your admin filter</h3>
      </div>
    `;
    return;
  }

  list.forEach((c) => {
    const statusDetails = getStatusBadgeDetails(c.status);
    const priorityDetails = getPriorityBadgeDetails(c.priority);
    const categoryEmoji = getCategoryEmoji(c.category);

    const card = document.createElement("div");
    card.className = "admin-complaint-card";
    card.innerHTML = `
      <div class="admin-card-header">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <span class="admin-id-badge">ID #${c.id}</span>
          <span class="status-badge ${statusDetails.className}"><span>${statusDetails.icon}</span> ${statusDetails.label}</span>
          <span class="admin-dept-pill">🏢 ${escapeHTML(c.department || "General Administration")}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          👤 <strong>${escapeHTML(c.createdByName || "Citizen")}</strong> (Citizen ID: ${c.createdBy}) • 👥 ${c.supportCount || 0} votes
        </div>
      </div>

      <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin: 0.2rem 0;">${escapeHTML(c.title)}</h4>

      <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <span>${categoryEmoji} <strong>${escapeHTML(c.category)}</strong></span>
        <span>📍 ${escapeHTML(c.location)}</span>
        <span>${priorityDetails.label}</span>
      </div>

      <p style="font-size: 0.88rem; color: #334155; margin: 0.3rem 0;">${escapeHTML(c.description)}</p>

      ${c.aiSummary ? `
        <div class="admin-ai-summary-box">
          <span style="font-weight: 700; color: var(--primary);">✨ AI Auto-Summary:</span>
          <span>${escapeHTML(c.aiSummary)}</span>
        </div>
      ` : ""}

      ${c.isDuplicateOf ? `
        <div class="admin-duplicate-alert">
          ⚠️ <strong>AI Duplicate Alert:</strong> Similar issue detected under Complaint #${c.isDuplicateOf}.
        </div>
      ` : ""}

      ${c.adminNotes ? `
        <div class="admin-ai-summary-box" style="border-left-color: #16a34a; background-color: #f0fdf4;">
          <span style="font-weight: 700; color: #16a34a;">📝 Current Admin Remarks:</span>
          <span>${escapeHTML(c.adminNotes)}</span>
        </div>
      ` : ""}

      <div class="admin-actions-bar">
        <button class="btn-admin-action btn-admin-status" data-id="${c.id}" data-status="${c.status || 'PENDING'}" data-notes="${escapeHTML(c.adminNotes || '')}">
          ⚙️ Change Status
        </button>
        <button class="btn-admin-action btn-admin-dept" data-id="${c.id}" data-dept="${escapeHTML(c.department || '')}">
          🏢 Assign Department
        </button>
        <button class="btn-admin-action comment-btn" data-id="${c.id}">
          💬 Discussion (${c.comments ? c.comments.length : 0})
        </button>
        ${(c.imageUrl || c.videoUrl || c.imageProof || c.videoProof) ? `
          <button class="btn-admin-action trigger-proof-view" data-id="${c.id}">
            🔍 View Proof
          </button>
        ` : ''}
        <button class="btn-admin-action btn-delete-danger" data-id="${c.id}" style="margin-left: auto;">
          🗑️ Remove Grievance
        </button>
      </div>
    `;

    adminComplaintsList.appendChild(card);
  });
}

function renderAnalyticsBars(analytics) {
  if (!analytics) return;

  // 1. Category Bars
  if (categoryAnalyticsBars && analytics.categoryBreakdown) {
    categoryAnalyticsBars.innerHTML = "";
    const total = Object.values(analytics.categoryBreakdown).reduce((a, b) => a + b, 0) || 1;
    for (const [cat, count] of Object.entries(analytics.categoryBreakdown)) {
      const pct = Math.round((count / total) * 100);
      categoryAnalyticsBars.innerHTML += `
        <div class="analytics-bar-row">
          <div class="analytics-bar-header">
            <span>${getCategoryEmoji(cat)} ${escapeHTML(cat)}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div class="analytics-bar-track">
            <div class="analytics-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }
  }

  // 2. Department Bars
  if (departmentAnalyticsBars && analytics.departmentBreakdown) {
    departmentAnalyticsBars.innerHTML = "";
    const total = Object.values(analytics.departmentBreakdown).reduce((a, b) => a + b, 0) || 1;
    for (const [dept, count] of Object.entries(analytics.departmentBreakdown)) {
      const pct = Math.round((count / total) * 100);
      departmentAnalyticsBars.innerHTML += `
        <div class="analytics-bar-row">
          <div class="analytics-bar-header">
            <span>🏢 ${escapeHTML(dept)}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div class="analytics-bar-track">
            <div class="analytics-bar-fill" style="width: ${pct}%; background-color: #0284c7;"></div>
          </div>
        </div>
      `;
    }
  }
}

// Admin Filters Event Listeners
if (adminStatusFilter) {
  adminStatusFilter.addEventListener("change", (e) => {
    adminStatusFilterVal = e.target.value;
    renderAdminDashboard();
  });
}
if (adminCategoryFilter) {
  adminCategoryFilter.addEventListener("change", (e) => {
    adminCategoryFilterVal = e.target.value;
    renderAdminDashboard();
  });
}
if (adminPriorityFilter) {
  adminPriorityFilter.addEventListener("change", (e) => {
    adminPriorityFilterVal = e.target.value;
    renderAdminDashboard();
  });
}
if (adminSearchInput) {
  adminSearchInput.addEventListener("input", (e) => {
    adminSearchVal = e.target.value;
    renderAdminDashboard();
  });
}
if (resetAdminFiltersBtn) {
  resetAdminFiltersBtn.addEventListener("click", () => {
    adminStatusFilterVal = "ALL";
    adminCategoryFilterVal = "ALL";
    adminPriorityFilterVal = "ALL";
    adminSearchVal = "";
    if (adminStatusFilter) adminStatusFilter.value = "ALL";
    if (adminCategoryFilter) adminCategoryFilter.value = "ALL";
    if (adminPriorityFilter) adminPriorityFilter.value = "ALL";
    if (adminSearchInput) adminSearchInput.value = "";
    renderAdminDashboard();
  });
}
if (refreshAdminStatsBtn) {
  refreshAdminStatsBtn.addEventListener("click", () => {
    fetchComplaintsFromBackend().then(() => {
      renderAdminDashboard();
      showToast("Admin data refreshed!", "success");
    });
  });
}

// Admin Status Modal
function openAdminStatusModal(complaintId, currentStatus, currentNotes) {
  adminActionComplaintId = complaintId;
  if (adminStatusModalTitle) adminStatusModalTitle.textContent = `⚙️ Update Status (Complaint #${complaintId})`;
  if (adminStatusSelect) adminStatusSelect.value = (currentStatus || "PENDING").toUpperCase();
  if (adminStatusNotes) adminStatusNotes.value = currentNotes || "";
  adminStatusModal?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAdminStatusModal() {
  adminStatusModal?.classList.remove("active");
  document.body.style.overflow = "";
  adminActionComplaintId = null;
}

if (closeAdminStatusModalBtn) closeAdminStatusModalBtn.addEventListener("click", closeAdminStatusModal);
if (cancelAdminStatusBtn) cancelAdminStatusBtn.addEventListener("click", closeAdminStatusModal);

if (adminStatusForm) {
  adminStatusForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!adminActionComplaintId) return;

    const newStatus = adminStatusSelect.value;
    const notes = adminStatusNotes.value.trim();

    try {
      const res = await fetch(`${API_BASE}/admin/complaints/${adminActionComplaintId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-User-Role": "ADMIN" },
        body: JSON.stringify({ status: newStatus, adminNotes: notes, role: "ADMIN" })
      });
      if (res.ok) {
        showToast(`Complaint #${adminActionComplaintId} status updated to ${newStatus}!`, "success");
      }
    } catch (err) {}

    // Update in-memory
    const c = complaintsData.find((item) => item.id === adminActionComplaintId);
    if (c) {
      c.status = newStatus;
      c.adminNotes = notes;
      saveComplaintsToLocalStorage();
    }

    closeAdminStatusModal();
    fetchComplaintsFromBackend().then(() => {
      renderAdminDashboard();
      renderComplaints();
    });
  });
}

// Admin Department Modal
function openAdminDeptModal(complaintId, currentDept) {
  adminActionComplaintId = complaintId;
  if (adminDeptModalTitle) adminDeptModalTitle.textContent = `🏢 Assign Department (Complaint #${complaintId})`;
  if (adminDeptSelect) adminDeptSelect.value = currentDept || "General Municipal Administration";
  adminDeptModal?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAdminDeptModal() {
  adminDeptModal?.classList.remove("active");
  document.body.style.overflow = "";
  adminActionComplaintId = null;
}

if (closeAdminDeptModalBtn) closeAdminDeptModalBtn.addEventListener("click", closeAdminDeptModal);
if (cancelAdminDeptBtn) cancelAdminDeptBtn.addEventListener("click", closeAdminDeptModal);

if (adminDeptForm) {
  adminDeptForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!adminActionComplaintId) return;

    const newDept = adminDeptSelect.value;

    try {
      const res = await fetch(`${API_BASE}/admin/complaints/${adminActionComplaintId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-User-Role": "ADMIN" },
        body: JSON.stringify({ department: newDept, role: "ADMIN" })
      });
      if (res.ok) {
        showToast(`Complaint #${adminActionComplaintId} assigned to ${newDept}!`, "success");
      }
    } catch (err) {}

    const c = complaintsData.find((item) => item.id === adminActionComplaintId);
    if (c) {
      c.department = newDept;
      saveComplaintsToLocalStorage();
    }

    closeAdminDeptModal();
    fetchComplaintsFromBackend().then(() => {
      renderAdminDashboard();
      renderComplaints();
    });
  });
}

// ============================================================================
// 7. VIEW SWITCHING (FEED / MY-COMPLAINTS / ADMIN)
// ============================================================================

function switchToView(viewName) {
  currentView = viewName;

  if (viewName === "admin") {
    const user = getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      showToast("Access Denied: Admin authorization required.", "error");
      switchToView("feed");
      return;
    }

    if (complaintsMain) complaintsMain.style.display = "none";
    if (adminSection) adminSection.style.display = "block";
    if (navAdminBtn) navAdminBtn.classList.add("active");
    if (navComplaintsBtn) navComplaintsBtn.classList.remove("active");
    if (navMyComplaintsBtn) navMyComplaintsBtn.classList.remove("active");
    if (navHomeBtn) navHomeBtn.classList.remove("active");

    renderAdminDashboard();
    adminSection?.scrollIntoView({ behavior: "smooth" });
  } else if (viewName === "my-complaints") {
    const user = getCurrentUser();
    if (!user) {
      showToast("Please login to view your complaints.", "info");
      openLoginModal();
      return;
    }

    if (complaintsMain) complaintsMain.style.display = "block";
    if (adminSection) adminSection.style.display = "none";
    if (navMyComplaintsBtn) navMyComplaintsBtn.classList.add("active");
    if (navComplaintsBtn) navComplaintsBtn.classList.remove("active");
    if (navAdminBtn) navAdminBtn.classList.remove("active");
    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (feedHeading) feedHeading.textContent = "My Complaints";
    if (feedSubheading) feedSubheading.style.display = "block";

    renderComplaints();
    complaintsMain?.scrollIntoView({ behavior: "smooth" });
  } else {
    // Public complaints feed
    if (complaintsMain) complaintsMain.style.display = "block";
    if (adminSection) adminSection.style.display = "none";
    if (navComplaintsBtn) navComplaintsBtn.classList.add("active");
    if (navMyComplaintsBtn) navMyComplaintsBtn.classList.remove("active");
    if (navAdminBtn) navAdminBtn.classList.remove("active");
    if (navHomeBtn) navHomeBtn.classList.remove("active");
    if (feedHeading) feedHeading.textContent = "Public Grievances Feed";
    if (feedSubheading) feedSubheading.style.display = "none";

    renderComplaints();
    complaintsMain?.scrollIntoView({ behavior: "smooth" });
  }
}

if (navComplaintsBtn) navComplaintsBtn.addEventListener("click", (e) => { e.preventDefault(); switchToView("feed"); });
if (navMyComplaintsBtn) navMyComplaintsBtn.addEventListener("click", (e) => { e.preventDefault(); switchToView("my-complaints"); });
if (navAdminBtn) navAdminBtn.addEventListener("click", (e) => { e.preventDefault(); switchToView("admin"); });
if (heroBrowseBtn) heroBrowseBtn.addEventListener("click", (e) => { e.preventDefault(); switchToView("feed"); });

// Search & Category Filters for Citizen Feed
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    if (clearSearchBtn) clearSearchBtn.style.display = currentSearchQuery.length > 0 ? "block" : "none";
    renderComplaints();
  });
}
if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearchQuery = "";
    clearSearchBtn.style.display = "none";
    renderComplaints();
  });
}
if (filterButtonsContainer) {
  filterButtonsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterButtonsContainer.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderComplaints();
  });
}

// ============================================================================
// 8. AI REAL-TIME ASSIST IN SUBMISSION FORM
// ============================================================================

let aiDebounceTimer = null;
function triggerAIAssist() {
  clearTimeout(aiDebounceTimer);
  aiDebounceTimer = setTimeout(async () => {
    const title = complaintTitleInput?.value || "";
    const desc = complaintDescInput?.value || "";

    if (desc.trim().length < 5) {
      if (aiAssistText) aiAssistText.innerHTML = `<strong>AI Smart Assist:</strong> Type in your description to auto-suggest category, priority & department.`;
      return;
    }

    if (aiAssistText) {
      aiAssistText.innerHTML = `🤖 <em>Analyzing text with AI...</em>`;
    }

    const aiResult = await apiAnalyzeText(title, desc);
    if (aiResult) {
      if (complaintCategorySelect && !complaintCategorySelect.value) {
        complaintCategorySelect.value = aiResult.predictedCategory;
      }
      if (complaintUrgencySelect) {
        complaintUrgencySelect.value = aiResult.predictedPriority;
      }

      let dupWarning = "";
      if (aiResult.duplicate) {
        dupWarning = ` | ⚠️ <strong>Note:</strong> ${escapeHTML(aiResult.duplicateReason)}`;
      }

      if (aiAssistText) {
        aiAssistText.innerHTML = `✨ <strong>AI Suggested:</strong> <strong>${aiResult.predictedCategory}</strong> • <strong>${aiResult.predictedPriority} Priority</strong>${dupWarning}`;
      }
    } else {
      // Local fallback rules
      const lower = (title + " " + desc).toLowerCase();
      let cat = "Other";
      if (lower.includes("water") || lower.includes("pipe") || lower.includes("drain")) cat = "Water";
      else if (lower.includes("road") || lower.includes("pothole")) cat = "Roads";
      else if (lower.includes("light") || lower.includes("electric")) cat = "Electricity";
      else if (lower.includes("garbage") || lower.includes("waste")) cat = "Waste";
      else if (lower.includes("traffic") || lower.includes("signal")) cat = "Traffic";

      const prio = lower.includes("urgent") || lower.includes("hazard") || lower.includes("burst") ? "High" : "Medium";
      if (complaintCategorySelect && !complaintCategorySelect.value) complaintCategorySelect.value = cat;
      if (complaintUrgencySelect) complaintUrgencySelect.value = prio;
      if (aiAssistText) {
        aiAssistText.innerHTML = `✨ <strong>AI Auto-Detected:</strong> <strong>${cat}</strong> • <strong>${prio} Priority</strong>`;
      }
    }
  }, 400);
}

if (complaintDescInput) complaintDescInput.addEventListener("input", triggerAIAssist);
if (complaintTitleInput) complaintTitleInput.addEventListener("input", triggerAIAssist);

// ============================================================================
// 9. FORM SUBMISSION & PROOF UPLOADS (CREATE & EDIT)
// ============================================================================

function openComplaintModal() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to submit a complaint.", "info");
    openLoginModal();
    return;
  }

  editingComplaintId = null;
  newComplaintForm?.reset();
  currentImageProof = null;
  currentVideoProof = null;
  if (imageProofInput) imageProofInput.value = "";
  if (videoProofInput) videoProofInput.value = "";
  renderImagePreview();
  renderVideoPreview();
  clearEvidenceError();

  if (modalTitle) modalTitle.textContent = "Submit New Complaint";
  const submitBtn = newComplaintForm?.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.innerHTML = `<span>🚀</span> Submit Complaint`;

  complaintModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  setTimeout(() => complaintTitleInput?.focus(), 100);
}

function closeComplaintModal() {
  complaintModal?.classList.remove("active");
  document.body.style.overflow = "";
  newComplaintForm?.reset();
  editingComplaintId = null;
  currentImageProof = null;
  currentVideoProof = null;
  if (imageProofInput) imageProofInput.value = "";
  if (videoProofInput) videoProofInput.value = "";
  renderImagePreview();
  renderVideoPreview();
  clearEvidenceError();
  if (aiAssistText) {
    aiAssistText.innerHTML = `<strong>AI Smart Assist:</strong> Type in your description to auto-suggest category & urgency.`;
  }
}

if (openModalBtn) openModalBtn.addEventListener("click", (e) => { e.preventDefault(); openComplaintModal(); });
if (heroSubmitBtn) heroSubmitBtn.addEventListener("click", (e) => { e.preventDefault(); openComplaintModal(); });
if (navSubmitBtn) navSubmitBtn.addEventListener("click", (e) => { e.preventDefault(); openComplaintModal(); });
if (closeModalBtn) closeModalBtn.addEventListener("click", (e) => { e.preventDefault(); closeComplaintModal(); });
if (cancelModalBtn) cancelModalBtn.addEventListener("click", (e) => { e.preventDefault(); closeComplaintModal(); });

// Close modal ONLY when clicking directly on the backdrop overlay, never when interacting inside
if (complaintModal) {
  complaintModal.addEventListener("click", (e) => {
    if (e.target === complaintModal) {
      closeComplaintModal();
    }
  });
}

// Stop propagation on all modal cards to prevent accidental closing
document.querySelectorAll(".modal-card").forEach((card) => {
  card.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

// Image Proof Selection & Validation
if (chooseImageBtn && imageProofInput) {
  chooseImageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageProofInput.click();
  });

  imageProofInput.addEventListener("change", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearEvidenceError();

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // 1. Validate File Extension & MIME Type
    const allowedExts = ["jpg", "jpeg", "png", "webp"];
    const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    const isImageMime = file.type.startsWith("image/") || allowedExts.includes(ext);

    if (!allowedExts.includes(ext) && !isImageMime) {
      showEvidenceError("Invalid image type. Supported formats: JPG, JPEG, PNG, WEBP.");
      imageProofInput.value = "";
      return;
    }

    // 2. Validate File Size (Max 15MB)
    const maxImageBytes = 15 * 1024 * 1024;
    if (file.size > maxImageBytes) {
      showEvidenceError("Image is too large. Maximum allowed size is 15MB.");
      imageProofInput.value = "";
      return;
    }

    // 3. Instant Preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      currentImageProof = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type || "image/jpeg",
        data: event.target.result,
        url: null
      };
      renderImagePreview();
    };
    reader.onerror = () => {
      showEvidenceError("Failed to read the selected image file.");
    };
    reader.readAsDataURL(file);
  });
}

function renderImagePreview() {
  if (!imageProofPreview) return;
  if (!currentImageProof || (!currentImageProof.data && !currentImageProof.url)) {
    imageProofPreview.innerHTML = "";
    imageProofPreview.style.display = "none";
    if (chooseImageBtn) chooseImageBtn.style.display = "inline-flex";
    return;
  }

  if (chooseImageBtn) chooseImageBtn.style.display = "none";
  imageProofPreview.style.display = "block";

  const previewSrc = currentImageProof.data || (currentImageProof.url?.startsWith("http") ? currentImageProof.url : (API_BASE.replace("/api", "") + currentImageProof.url));
  const sizeText = currentImageProof.size ? ` (${(currentImageProof.size / (1024 * 1024)).toFixed(1)} MB)` : "";

  imageProofPreview.innerHTML = `
    <div class="proof-slot-card">
      <img src="${previewSrc}" alt="Photo evidence preview" class="proof-slot-thumb" />
      <div class="proof-slot-meta" title="${escapeHTML(currentImageProof.name || "Photo Evidence")}">
        <span>📷 ${escapeHTML(currentImageProof.name || "Photo Evidence")}${sizeText}</span>
      </div>
      <div class="proof-slot-actions">
        <button type="button" class="btn-slot-action" id="replaceImageBtn">🔄 Replace</button>
        <button type="button" class="btn-slot-action btn-slot-remove" id="removeImageBtn">🗑️ Remove</button>
      </div>
    </div>
  `;

  document.getElementById("replaceImageBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (imageProofInput) {
      imageProofInput.value = "";
      imageProofInput.click();
    }
  });

  document.getElementById("removeImageBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    currentImageProof = null;
    if (imageProofInput) imageProofInput.value = "";
    clearEvidenceError();
    renderImagePreview();
  });
}

// Helper for human-readable file size display
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Video Proof Selection & Validation
if (chooseVideoBtn && videoProofInput) {
  chooseVideoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    videoProofInput.click();
  });

  videoProofInput.addEventListener("change", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearEvidenceError();

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // 1. Validate File Extension & MIME Type (MP4, WEBM, MOV)
    const allowedExts = ["mp4", "webm", "mov"];
    const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
    const isVideoMime = file.type.startsWith("video/") || allowedExts.includes(ext);

    if (!allowedExts.includes(ext) && !isVideoMime) {
      showEvidenceError("Invalid video format. Supported formats: MP4, WEBM, MOV.");
      videoProofInput.value = "";
      return;
    }

    // 2. Validate File Size (Max 50MB)
    const maxVideoBytes = 50 * 1024 * 1024;
    if (file.size > maxVideoBytes) {
      showEvidenceError("Video size exceeds the maximum limit of 50MB.");
      videoProofInput.value = "";
      return;
    }

    // 3. Clean up any previous object URL
    if (currentVideoProof?.data && typeof currentVideoProof.data === "string" && currentVideoProof.data.startsWith("blob:")) {
      URL.revokeObjectURL(currentVideoProof.data);
    }

    // 4. Instant Video Preview via Object URL (Instant hardware-accelerated playback & seek)
    let videoPreviewUrl = "";
    try {
      videoPreviewUrl = URL.createObjectURL(file);
    } catch (err) {
      videoPreviewUrl = "";
    }

    currentVideoProof = {
      file: file,
      name: file.name,
      size: file.size,
      type: file.type || (ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : "video/mp4"),
      data: videoPreviewUrl,
      url: null
    };

    renderVideoPreview();
  });
}

function renderVideoPreview() {
  if (!videoProofPreview) return;
  if (!currentVideoProof || (!currentVideoProof.data && !currentVideoProof.url)) {
    videoProofPreview.innerHTML = "";
    videoProofPreview.style.display = "none";
    if (chooseVideoBtn) chooseVideoBtn.style.display = "inline-flex";
    return;
  }

  if (chooseVideoBtn) chooseVideoBtn.style.display = "none";
  videoProofPreview.style.display = "block";

  const previewSrc = currentVideoProof.data || (currentVideoProof.url?.startsWith("http") ? currentVideoProof.url : (API_BASE.replace("/api", "") + currentVideoProof.url));
  const sizeFormatted = currentVideoProof.size ? formatFileSize(currentVideoProof.size) : "";

  videoProofPreview.innerHTML = `
    <div class="proof-slot-card">
      <video class="proof-slot-video" controls playsinline preload="metadata">
        <source src="${previewSrc}" type="${currentVideoProof.type || 'video/mp4'}">
        Your browser does not support HTML5 video preview.
      </video>
      <div class="proof-slot-meta" title="${escapeHTML(currentVideoProof.name || "Video Evidence")}">
        <span>🎥 <strong>${escapeHTML(currentVideoProof.name || "Video Evidence")}</strong>${sizeFormatted ? ` (${sizeFormatted})` : ''}</span>
      </div>
      <div class="proof-slot-actions">
        <button type="button" class="btn-slot-action" id="replaceVideoBtn">🔄 Replace</button>
        <button type="button" class="btn-slot-action btn-slot-remove" id="removeVideoBtn">🗑️ Remove</button>
      </div>
    </div>
  `;

  document.getElementById("replaceVideoBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoProofInput) {
      videoProofInput.value = "";
      videoProofInput.click();
    }
  });

  document.getElementById("removeVideoBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentVideoProof?.data && typeof currentVideoProof.data === "string" && currentVideoProof.data.startsWith("blob:")) {
      URL.revokeObjectURL(currentVideoProof.data);
    }
    currentVideoProof = null;
    if (videoProofInput) videoProofInput.value = "";
    clearEvidenceError();
    renderVideoPreview();
  });
}

function showEvidenceError(msg) {
  if (evidenceError) {
    evidenceError.textContent = msg;
    evidenceError.style.display = "block";
  }
}

function clearEvidenceError() {
  if (evidenceError) {
    evidenceError.textContent = "";
    evidenceError.style.display = "none";
  }
}

// Edit handler
function handleEditComplaint(complaintId) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to edit.", "error");
    openLoginModal();
    return;
  }

  const complaint = complaintsData.find((c) => c.id === complaintId);
  if (!complaint) return;

  if (Number(complaint.createdBy) !== Number(user.id) && user.role !== "ADMIN") {
    showToast("You can only edit your own complaints.", "error");
    return;
  }

  editingComplaintId = complaint.id;
  if (complaintTitleInput) complaintTitleInput.value = complaint.title || "";
  if (complaintLocationInput) complaintLocationInput.value = complaint.location || "";
  if (complaintCategorySelect) complaintCategorySelect.value = complaint.category || "Water";
  if (complaintUrgencySelect) complaintUrgencySelect.value = complaint.priority || "Medium";
  if (complaintDescInput) complaintDescInput.value = complaint.description || "";
  if (complaintAffectedInput) complaintAffectedInput.value = complaint.supportCount || 1;

  if (complaint.imageUrl || complaint.imageProof) {
    currentImageProof = {
      name: "Existing Photo Evidence",
      url: complaint.imageUrl,
      data: complaint.imageProof?.data || null
    };
  } else {
    currentImageProof = null;
  }

  if (complaint.videoUrl || complaint.videoProof) {
    currentVideoProof = {
      name: "Existing Video Evidence",
      url: complaint.videoUrl,
      data: complaint.videoProof?.data || null
    };
  } else {
    currentVideoProof = null;
  }

  if (imageProofInput) imageProofInput.value = "";
  if (videoProofInput) videoProofInput.value = "";
  clearEvidenceError();
  renderImagePreview();
  renderVideoPreview();

  if (modalTitle) modalTitle.innerHTML = `✏️ Edit Complaint <span class="modal-editing-notice">Editing #${complaint.id}</span>`;
  const submitBtn = newComplaintForm?.querySelector("button[type='submit']");
  if (submitBtn) submitBtn.innerHTML = `<span>💾</span> Save Changes`;

  complaintModal?.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Form Submit Listener (Proof is 100% Optional)
if (newComplaintForm) {
  newComplaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = getCurrentUser();
    if (!user) {
      showToast("Please login to continue.", "error");
      closeComplaintModal();
      openLoginModal();
      return;
    }

    const title = complaintTitleInput.value.trim();
    const location = complaintLocationInput.value.trim();
    const category = complaintCategorySelect.value;
    const priority = complaintUrgencySelect.value;
    const description = complaintDescInput.value.trim();

    if (!title || !location || !category || !description) {
      showEvidenceError("Please fill in all required fields.");
      return;
    }

    // Process media proofs (upload to backend if file object is present, or fallback to DataURL)
    let imageUrl = currentImageProof?.url || null;
    if (currentImageProof?.file) {
      try {
        const uploadedUrl = await apiUploadMedia(currentImageProof.file);
        imageUrl = uploadedUrl || currentImageProof.data;
      } catch (err) {
        imageUrl = currentImageProof.data;
      }
    } else if (currentImageProof?.data && !imageUrl) {
      imageUrl = currentImageProof.data;
    }

    let videoUrl = currentVideoProof?.url || null;
    if (currentVideoProof?.file) {
      try {
        const uploadedUrl = await apiUploadMedia(currentVideoProof.file);
        videoUrl = uploadedUrl || currentVideoProof.data;
      } catch (err) {
        videoUrl = currentVideoProof.data;
      }
    } else if (currentVideoProof?.data && !videoUrl) {
      videoUrl = currentVideoProof.data;
    }

    const payload = {
      title,
      description,
      category,
      location,
      priority,
      createdBy: user.id,
      createdByName: user.name,
      imageUrl: imageUrl,
      videoUrl: videoUrl
    };

    if (editingComplaintId !== null) {
      await apiUpdateComplaint(editingComplaintId, payload);
      showToast("Complaint updated successfully!", "success");
    } else {
      await apiCreateComplaint(payload);
      showToast("Your civic grievance has been registered and routed!", "success");
    }

    closeComplaintModal();
    fetchComplaintsFromBackend().then(() => {
      renderComplaints();
      if (user.role === "ADMIN") renderAdminDashboard();
    });
  });
}

// ============================================================================
// 10. DELETE COMPLAINT CONFIRMATION
// ============================================================================

function openDeleteModal(complaintId) {
  const user = getCurrentUser();
  if (!user) { showToast("Please login to continue.", "error"); openLoginModal(); return; }

  const complaint = complaintsData.find((c) => c.id === complaintId);
  if (!complaint) return;

  if (Number(complaint.createdBy) !== Number(user.id) && user.role !== "ADMIN") {
    showToast("You can only delete your own complaints.", "error");
    return;
  }

  deletingComplaintId = complaint.id;
  if (deleteComplaintPreview) {
    deleteComplaintPreview.textContent = `"${complaint.title}" (${complaint.category} • ${complaint.location})`;
  }
  deleteModal?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeDeleteModal() {
  deleteModal?.classList.remove("active");
  document.body.style.overflow = "";
  deletingComplaintId = null;
}

if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener("click", closeDeleteModal);
if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeDeleteModal);
if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", async () => {
    if (deletingComplaintId === null) return;
    await apiDeleteComplaint(deletingComplaintId);
    showToast("Complaint has been removed permanently.", "info");
    closeDeleteModal();
    fetchComplaintsFromBackend().then(() => {
      renderComplaints();
      const user = getCurrentUser();
      if (user?.role === "ADMIN") renderAdminDashboard();
    });
  });
}

// ============================================================================
// 11. SUPPORT & COMMENTS LISTENERS
// ============================================================================

async function handleSupportClick(complaintId, buttonElement) {
  const user = getCurrentUser();
  if (!user) { showToast("Please login to support.", "error"); openLoginModal(); return; }

  const userKey = user.email || `user_${user.id}`;
  const userSupported = getUserSupportedComplaints(userKey);

  if (userSupported.has(complaintId)) {
    showToast("You have already supported this complaint.", "info");
    return;
  }

  const result = await apiSupportComplaint(complaintId, user.id);
  if (result.success) {
    userSupported.add(complaintId);
    saveUserSupportedComplaints(userKey, userSupported);
    buttonElement.classList.add("supported");
    buttonElement.innerHTML = "✓ Supported";
    const countEl = document.getElementById(`affected-${complaintId}`);
    if (countEl && result.data) countEl.textContent = result.data.supportCount;
    showToast("Thank you! Your support has been recorded.", "success");
    updateStatsCounters();
  } else {
    showToast(result.message || "Failed to record support.", "error");
  }
}

// Comments Modal
async function openCommentModal(complaintId) {
  const user = getCurrentUser();
  if (!user) { showToast("Please login to view/post comments.", "error"); openLoginModal(); return; }

  const complaint = complaintsData.find((c) => c.id === complaintId);
  if (!complaint) return;

  activeCommentComplaintId = complaintId;
  const titleEl = document.getElementById("commentModalTitle");
  const subEl = document.getElementById("commentModalSubtitle");
  if (titleEl) titleEl.textContent = `Discussion on Issue #${complaint.id}`;
  if (subEl) subEl.textContent = complaint.title;

  const comments = await apiFetchComments(complaintId);
  renderCommentsList(comments);

  commentModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  setTimeout(() => newCommentText?.focus(), 100);
}

function closeCommentModal() {
  commentModal?.classList.remove("active");
  document.body.style.overflow = "";
  activeCommentComplaintId = null;
  commentForm?.reset();
}

function renderCommentsList(comments) {
  if (!commentsList) return;
  commentsList.innerHTML = "";

  if (!comments || comments.length === 0) {
    commentsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1.5rem;">No comments yet. Be the first citizen to comment!</p>`;
    return;
  }

  comments.forEach((c) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    item.innerHTML = `
      <div class="comment-author-row">
        <span class="comment-author-name">${escapeHTML(c.userName || "Citizen")}</span>
        <span class="comment-time">${escapeHTML(c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently")}</span>
      </div>
      <p class="comment-body">${escapeHTML(c.text)}</p>
    `;
    commentsList.appendChild(item);
  });
}

if (commentForm) {
  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showToast("Please login to continue.", "error"); closeCommentModal(); openLoginModal(); return; }

    const text = newCommentText.value.trim();
    if (!text || !activeCommentComplaintId) return;

    await apiAddComment(activeCommentComplaintId, user.id, user.name, text);
    const updatedComments = await apiFetchComments(activeCommentComplaintId);
    renderCommentsList(updatedComments);
    commentForm.reset();
    showToast("Comment posted!", "success");
    fetchComplaintsFromBackend().then(() => renderComplaints());
  });
}

if (closeCommentModalBtn) closeCommentModalBtn.addEventListener("click", closeCommentModal);

// ============================================================================
// 12. PROOF VIEWER MODAL
// ============================================================================

function openProofModalForComplaint(complaintId) {
  const complaint = complaintsData.find((c) => c.id === complaintId);
  if (!complaint) return;

  const imageSrc = complaint.imageUrl ? (complaint.imageUrl.startsWith("http") ? complaint.imageUrl : API_BASE.replace("/api", "") + complaint.imageUrl) : complaint.imageProof?.data;
  const videoSrc = complaint.videoUrl ? (complaint.videoUrl.startsWith("http") ? complaint.videoUrl : API_BASE.replace("/api", "") + complaint.videoUrl) : complaint.videoProof?.data;

  if (!imageSrc && !videoSrc) return;

  if (proofModalTitle) proofModalTitle.textContent = `Evidence: ${complaint.title}`;
  if (proofModalSubtitle) proofModalSubtitle.textContent = `Location: ${complaint.location} • Category: ${complaint.category}`;
  if (proofModalMediaContainer) {
    proofModalMediaContainer.innerHTML = "";
    if (imageSrc) {
      proofModalMediaContainer.innerHTML += `
        <div style="margin-bottom: ${videoSrc ? '1rem' : '0'}; text-align: center;">
          <img src="${imageSrc}" alt="Evidence Photo" style="max-height: 60vh; border-radius: 8px; margin: 0 auto;" />
        </div>
      `;
    }
    if (videoSrc) {
      proofModalMediaContainer.innerHTML += `
        <div style="text-align: center;">
          <video src="${videoSrc}" controls autoplay style="max-height: 60vh; width: 100%; border-radius: 8px; background: #000;"></video>
        </div>
      `;
    }
  }

  if (proofFooterBar) proofFooterBar.style.display = "none";
  proofModal?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProofModal() {
  proofModal?.classList.remove("active");
  if (proofModalMediaContainer) proofModalMediaContainer.innerHTML = "";
  document.body.style.overflow = "";
}

if (closeProofModalBtn) closeProofModalBtn.addEventListener("click", closeProofModal);
if (proofModal) proofModal.addEventListener("click", (e) => { if (e.target === proofModal) closeProofModal(); });

// ============================================================================
// 13. AUTHENTICATION (LOGIN & REGISTRATION) MODALS
// ============================================================================

function openLoginModal(prefillEmail = "") {
  if (loginErrorMsg) { loginErrorMsg.textContent = ""; loginErrorMsg.style.display = "none"; }
  if (loginForm) loginForm.reset();
  if (prefillEmail && loginEmailInput) loginEmailInput.value = prefillEmail;
  closeRegisterModal();
  loginModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  setTimeout(() => (prefillEmail && loginPasswordInput ? loginPasswordInput.focus() : loginEmailInput?.focus()), 100);
}

function closeLoginModal() {
  loginModal?.classList.remove("active");
  document.body.style.overflow = "";
  if (loginErrorMsg) { loginErrorMsg.textContent = ""; loginErrorMsg.style.display = "none"; }
}

function openRegisterModal() {
  if (registerErrorMsg) { registerErrorMsg.textContent = ""; registerErrorMsg.style.display = "none"; }
  if (registerForm) registerForm.reset();
  closeLoginModal();
  registerModal?.classList.add("active");
  document.body.style.overflow = "hidden";
  setTimeout(() => registerNameInput?.focus(), 100);
}

function closeRegisterModal() {
  registerModal?.classList.remove("active");
  document.body.style.overflow = "";
  if (registerErrorMsg) { registerErrorMsg.textContent = ""; registerErrorMsg.style.display = "none"; }
}

if (loginBtn) loginBtn.addEventListener("click", () => openLoginModal());
if (registerBtn) registerBtn.addEventListener("click", () => openRegisterModal());
if (closeLoginModalBtn) closeLoginModalBtn.addEventListener("click", closeLoginModal);
if (closeRegisterModalBtn) closeRegisterModalBtn.addEventListener("click", closeRegisterModal);
if (loginModal) loginModal.addEventListener("click", (e) => { if (e.target === loginModal) closeLoginModal(); });
if (registerModal) registerModal.addEventListener("click", (e) => { if (e.target === registerModal) closeRegisterModal(); });
if (switchToRegisterLink) switchToRegisterLink.addEventListener("click", (e) => { e.preventDefault(); openRegisterModal(); });
if (switchToLoginLink) switchToLoginLink.addEventListener("click", (e) => { e.preventDefault(); openLoginModal(); });

// Registration Form Submit
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (registerErrorMsg) { registerErrorMsg.textContent = ""; registerErrorMsg.style.display = "none"; }

    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim().toLowerCase();
    const password = registerPasswordInput.value;
    const confirmPassword = registerConfirmPasswordInput.value;

    if (!name || !email || !password || !confirmPassword) {
      showRegisterError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showRegisterError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      showRegisterError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showRegisterError("Passwords do not match.");
      return;
    }

    const result = await apiRegisterUser(name, email, password);
    if (result.success) {
      closeRegisterModal();
      showToast("Registration successful! Please login.", "success");
      openLoginModal(email);
    } else {
      showRegisterError(result.message || "Registration failed.");
    }
  });
}

function showRegisterError(msg) {
  if (registerErrorMsg) { registerErrorMsg.textContent = msg; registerErrorMsg.style.display = "block"; }
}

// Login Form Submit (Role-Based Access Routing)
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (loginErrorMsg) { loginErrorMsg.textContent = ""; loginErrorMsg.style.display = "none"; }

    const email = loginEmailInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;

    if (!email || !password) {
      showLoginError("Please enter email and password.");
      return;
    }

    const result = await apiLoginUser(email, password);
    if (result.success && result.data) {
      const user = result.data;
      setCurrentUser(user);
      closeLoginModal();
      updateAuthUI();

      if (user.role === "ADMIN") {
        showToast("Welcome to Municipal Admin Command Center!", "success");
        switchToView("admin");
      } else {
        showToast(`Welcome back, ${user.name}!`, "success");
        switchToView("feed");
      }
    } else {
      showLoginError(result.message || "Invalid email or password.");
    }
  });
}

function showLoginError(msg) {
  if (loginErrorMsg) { loginErrorMsg.textContent = msg; loginErrorMsg.style.display = "block"; }
}

// ============================================================================
// 14. EVENT DELEGATION FOR FEED & ADMIN ACTIONS
// ============================================================================

document.addEventListener("click", (e) => {
  const target = e.target;

  // 1. Support
  const supportBtn = target.closest(".support-btn");
  if (supportBtn) {
    const id = parseInt(supportBtn.dataset.id, 10);
    handleSupportClick(id, supportBtn);
    return;
  }

  // 2. Proof Viewer
  const proofBtn = target.closest(".trigger-proof-view, .trigger-proof-img");
  if (proofBtn) {
    const id = parseInt(proofBtn.dataset.id, 10);
    openProofModalForComplaint(id);
    return;
  }

  // 3. Discussion Comments
  const commentBtn = target.closest(".comment-btn");
  if (commentBtn) {
    const id = parseInt(commentBtn.dataset.id, 10);
    openCommentModal(id);
    return;
  }

  // 4. Edit Complaint
  const editBtn = target.closest(".btn-edit");
  if (editBtn) {
    const id = parseInt(editBtn.dataset.id, 10);
    handleEditComplaint(id);
    return;
  }

  // 5. Delete Complaint
  const deleteBtn = target.closest(".btn-delete-danger");
  if (deleteBtn) {
    const id = parseInt(deleteBtn.dataset.id, 10);
    openDeleteModal(id);
    return;
  }

  // 6. Admin Status Update
  const adminStatusBtn = target.closest(".btn-admin-status");
  if (adminStatusBtn) {
    const id = parseInt(adminStatusBtn.dataset.id, 10);
    const status = adminStatusBtn.dataset.status;
    const notes = adminStatusBtn.dataset.notes;
    openAdminStatusModal(id, status, notes);
    return;
  }

  // 7. Admin Department Assignment
  const adminDeptBtn = target.closest(".btn-admin-dept");
  if (adminDeptBtn) {
    const id = parseInt(adminDeptBtn.dataset.id, 10);
    const dept = adminDeptBtn.dataset.dept;
    openAdminDeptModal(id, dept);
    return;
  }

  // 8. Share Button
  const shareBtn = target.closest(".share-btn");
  if (shareBtn) {
    const id = parseInt(shareBtn.dataset.id, 10);
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Complaint #${id} link copied to clipboard!`, "success");
  }
});

// Toast notification helper
function showToast(message, type = "info") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  const icon = type === "success" ? "✅" : type === "error" ? "⚠️" : "ℹ️";
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Mobile Hamburger
if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
}
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => navLinks?.classList.remove("open"));
});

// ============================================================================
// 15. INITIALIZATION ON PAGE LOAD
// ============================================================================
window.addEventListener("DOMContentLoaded", async () => {
  updateAuthUI();

  // If no user is logged in, default-seed logged-in user as Faiz (Citizen ID: 1)
  if (!getCurrentUser()) {
    setCurrentUser({ id: 1, name: "Faiz Ahmed", email: "faiz@test.com", role: "CITIZEN" });
    updateAuthUI();
  }

  await fetchComplaintsFromBackend();
  renderComplaints();
});
