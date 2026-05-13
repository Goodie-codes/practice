// Application state management
const appState = {
  user: {
    name: "Ayo",
    estate: "Estate Alpha",
    trust: { completedRentals: 2 },
    verification: { status: "unverified", idNumber: null, selfieUrl: null },
    guarantorLink: null,
    handoverVideo: null,
    termsAccepted: false,
  },
  items: [
    {
      id: "item-1",
      title: "Power Washer",
      category: "Cleaning",
      price: 3000,
      distance: "2 streets away",
      description: "Perfect for compound cleaning, cars, driveways, and quick outdoor jobs.",
      highlight: "Requires verification",
    },
    {
      id: "item-2",
      title: "Heavy-duty Ladder",
      category: "Tools",
      price: 2000,
      distance: "1 street away",
      description: "Sturdy 12ft ladder for painting, home repair, and light installations.",
      highlight: "Low-value rental",
    },
    {
      id: "item-3",
      title: "Professional Camera",
      category: "Media",
      price: 4500,
      distance: "Estate central",
      description: "Mirrorless camera for events, shoots, and content creation.",
      highlight: "Verified owner",
    },
    {
      id: "item-4",
      title: "Portable Generator",
      category: "Power",
      price: 6500,
      distance: "3 streets away",
      description: "Reliable generator for small gatherings, outages, or outdoor work.",
      highlight: "Requires guarantor",
    },
    {
      id: "item-5",
      title: "Smart Projector",
      category: "Events",
      price: 3200,
      distance: "Estate east",
      description: "Compact projector for movie nights and presentations.",
      highlight: "Fast pickup",
    },
    {
      id: "item-6",
      title: "Cordless Drill Set",
      category: "Tools",
      price: 1800,
      distance: "1 street away",
      description: "Compact drill set for home repairs, furniture assembly, and weekend projects.",
      highlight: "Great for beginners",
    },
  ],
};

// DOM element references
const itemsGrid = document.getElementById("itemsGrid");
const trustLevel = document.getElementById("trustLevel");
const completedRentals = document.getElementById("completedRentals");
const trustProgress = document.getElementById("trustProgress");
const verifyStartBtn = document.getElementById("verifyStartBtn");
const guarantorBtn = document.getElementById("guarantorBtn");
const guarantorMessage = document.getElementById("guarantorMessage");
const verificationForm = document.getElementById("verificationForm");
const selfieInput = document.getElementById("selfieInput");
const idInput = document.getElementById("idInput");
const verifySpinner = document.getElementById("verifySpinner");
const verifySuccess = document.getElementById("verifySuccess");
const verificationState = document.getElementById("verificationState");
const handoverBtn = document.getElementById("handoverBtn");
const handoverStatus = document.getElementById("handoverStatus");
const termsCheckbox = document.getElementById("termsCheckbox");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutMessage = document.getElementById("checkoutMessage");
const searchInput = document.getElementById("searchInput");
const exploreBtn = document.getElementById("exploreBtn");
const profileBtn = document.getElementById("profileBtn");
const itemModal = document.getElementById("itemModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

// Utility functions for trust calculation and formatting
function getTrustLevel(completedRentals = 0) {
  if (completedRentals >= 6) return 4;
  if (completedRentals >= 4) return 3;
  if (completedRentals >= 2) return 2;
  return 1;
}

function getTrustProgress(completedRentals = 0) {
  const level = getTrustLevel(completedRentals);
  const ratio = level === 1 ? completedRentals / 2 : level === 2 ? (completedRentals - 2) / 2 : level === 3 ? (completedRentals - 4) / 2 : 1;
  return Math.min(100, ratio * 100);
}

function formatNaira(value) {
  return `₦${value.toLocaleString("en-NG")}`;
}

// Profile update function
function updateProfile() {
  const { trust, verification, handoverVideo } = appState.user;
  const level = getTrustLevel(trust.completedRentals);
  trustLevel.textContent = level;
  completedRentals.textContent = `${trust.completedRentals} safe returns`;
  trustProgress.style.width = `${getTrustProgress(trust.completedRentals)}%`;

  verificationState.innerHTML = verification.status === "verified"
    ? `<strong>Verified</strong><p>Selfie and NIN/BVN verified. You can rent higher-value items.</p>`
    : `<strong>Not verified</strong><p>Upload a selfie and enter your NIN/BVN to simulate verification.</p>`;

  if (verification.status === "verified") {
    verificationForm.classList.add("hidden");
    verifySpinner.classList.add("hidden");
    verifySuccess.classList.remove("hidden");
  } else {
    verificationForm.classList.remove("hidden");
    verifySuccess.classList.add("hidden");
  }

  handoverStatus.textContent = handoverVideo ? "Handover video saved. Condition accepted." : "No video uploaded yet.";
  checkoutBtn.disabled = !appState.user.termsAccepted;
}

// Items rendering function
function renderItems(query = "") {
  const normalized = query.trim().toLowerCase();
  itemsGrid.innerHTML = "";
  const filtered = appState.items.filter(item => {
    return item.title.toLowerCase().includes(normalized)
      || item.category.toLowerCase().includes(normalized)
      || item.description.toLowerCase().includes(normalized);
  });

  if (filtered.length === 0) {
    itemsGrid.innerHTML = `<p class="muted">No matching items found. Try searching for "drill", "camera", or "generator".</p>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML = `
      <div class="label-pill">${item.category}</div>
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <div class="item-meta">
        <span>${formatNaira(item.price)}/day</span>
        <span>${item.distance}</span>
      </div>
      <div class="item-meta" style="margin-top: 12px; gap: 10px;">
        <span class="label-pill">${item.highlight}</span>
      </div>
      <button class="btn btn-secondary" data-item-id="${item.id}">View details</button>
    `;
    itemsGrid.appendChild(card);
  });
}

// Modal management for item details
function openItemModal(itemId) {
  const item = appState.items.find(i => i.id === itemId);
  if (!item) return;
  modalContent.innerHTML = `
    <h2>${item.title}</h2>
    <p class="muted">${item.category} · ${item.distance} · ${formatNaira(item.price)}/day</p>
    <p>${item.description}</p>
    <ul class="feature-list" style="margin-top: 18px;">
      <li><strong>Why this works:</strong> Hyper-local pickup keeps trust higher and delivery easy.</li>
      <li><strong>Owner fee:</strong> You pay 10% RentIt commission on every booking.</li>
      <li><strong>Checklist:</strong> Condition acceptance is mandatory before rental starts.</li>
    </ul>
    <div class="modal-actions" style="margin-top: 24px; display: flex; gap: 14px; flex-wrap: wrap;">
      <button id="rentNowBtn" class="btn btn-primary">Rent for 2 days</button>
      <button id="closeModalBtn" class="btn btn-secondary">Back to marketplace</button>
    </div>
  `;
  itemModal.classList.remove("hidden");
}

// Guarantor link generation
function showGuarantorLink() {
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  appState.user.guarantorLink = `https://rentit.local/guarantor/${code}`;
  guarantorMessage.textContent = `Share this link with trusted neighbors: ${appState.user.guarantorLink}`;
  guarantorMessage.classList.remove("hidden");
}

// Event listeners setup
function mountEventListeners() {
  searchInput.addEventListener("input", (event) => renderItems(event.target.value));
  exploreBtn.addEventListener("click", () => document.getElementById("marketplace").scrollIntoView({ behavior: "smooth" }));
  profileBtn.addEventListener("click", () => document.getElementById("trust").scrollIntoView({ behavior: "smooth" }));
  verifyStartBtn.addEventListener("click", () => document.getElementById("verification").scrollIntoView({ behavior: "smooth" }));
  guarantorBtn.addEventListener("click", showGuarantorLink);

  // Mobile menu toggle functionality
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.contains("open");
    if (isOpen) {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("active");
      document.body.classList.remove("blur-background");
    } else {
      navMenu.classList.add("open");
      menuToggle.classList.add("active");
      document.body.classList.add("blur-background");
    }
  });

  // Close menu when clicking on nav links
  navMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("active");
      document.body.classList.remove("blur-background");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("active");
      document.body.classList.remove("blur-background");
    }
  });

  // Verification form handling
  verificationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const selfie = selfieInput.value.trim();
    const idNumber = idInput.value.trim();

    if (!selfie || !idNumber) {
      alert("Please provide both selfie URL and NIN/BVN number.");
      return;
    }

    verifySpinner.classList.remove("hidden");
    verificationForm.classList.add("hidden");
    setTimeout(() => {
      verifySpinner.classList.add("hidden");
      appState.user.verification = { status: "verified", selfieUrl: selfie, idNumber };
      updateProfile();
      window.scrollTo({ top: document.getElementById("trust").offsetTop - 20, behavior: "smooth" });
    }, 1200);
  });

  // Handover video simulation
  handoverBtn.addEventListener("click", () => {
    appState.user.handoverVideo = "simulated-handover.mp4";
    handoverStatus.textContent = "Handover video saved. Condition accepted.";
  });

  // Terms acceptance handling
  termsCheckbox.addEventListener("change", (event) => {
    appState.user.termsAccepted = event.target.checked;
    checkoutBtn.disabled = !event.target.checked;
  });

  // Checkout simulation
  checkoutBtn.addEventListener("click", () => {
    if (!appState.user.termsAccepted) return;
    if (!appState.user.handoverVideo) {
      alert("Please complete the handover checklist before checkout.");
      return;
    }
    appState.user.trust.completedRentals += 1;
    appState.user.termsAccepted = false;
    termsCheckbox.checked = false;
    checkoutMessage.textContent = "Payment simulated — rental started. Your trust score has increased.";
    checkoutMessage.classList.remove("hidden");
    updateProfile();
    setTimeout(() => checkoutMessage.classList.add("hidden"), 4000);
  });

  // Item modal interactions
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-item-id]")) {
      openItemModal(event.target.dataset.itemId);
    }
    if (event.target.id === "rentNowBtn") {
      const itemId = event.target.closest(".modal-panel").querySelector("h2").textContent;
      const item = appState.items.find(i => i.title === itemId);
      if (item) {
        const needsVerification = item.highlight.toLowerCase().includes("requires verification") || item.highlight.toLowerCase().includes("requires guarantor");
        if (appState.user.verification.status !== "verified" && needsVerification) {
          alert("This item requires identity verification before renting. Please verify first.");
          return;
        }
        itemModal.classList.add("hidden");
        window.scrollTo({ top: document.getElementById("verification").offsetTop - 24, behavior: "smooth" });
      }
    }
    if (event.target.id === "closeModalBtn") {
      itemModal.classList.add("hidden");
    }
  });

  // Modal close button
  closeModal.addEventListener("click", () => itemModal.classList.add("hidden"));
  itemModal.addEventListener("click", (event) => {
    if (event.target === itemModal) itemModal.classList.add("hidden");
  });
}

// Application initialization
function init() {
  renderItems();
  updateProfile();
  mountEventListeners();
}

init();
