// ==========================================
// RENTIT APPLICATION - JAVASCRIPT IMPLEMENTATION
// ==========================================
// This file contains the complete frontend logic for the RentIt peer-to-peer rental marketplace.
// It handles user interactions, state management, dynamic content rendering, form validation,
// mobile responsiveness, and simulates the core rental workflow including verification,
// trust scoring, and checkout processes.

// APPLICATION STATE MANAGEMENT
// ============================
// The central data store for the RentIt application. Contains user profile information,
// rental items inventory, and application state flags. This simulates what would be
// stored in a backend database in a production application.
const appState = {
  // USER PROFILE DATA
  // Stores the current user's information, trust metrics, and verification status.
  // This data drives the trust-based rental system where higher trust levels unlock more items.
  user: {
    name: "Ayo",                    // User's display name
    estate: "Estate Alpha",         // Community/estate identifier for hyper-local rentals
    trust: { completedRentals: 2 }, // Trust metrics - number of successful rentals completed
    verification: {                 // Identity verification status and data
      status: "unverified",         // "verified" or "unverified" - determines rental access
      idNumber: null,              // NIN/BVN number for identity verification
      selfieUrl: null              // URL to user's verification selfie
    },
    guarantorLink: null,           // Generated link for guarantor verification
    handoverVideo: null,           // URL to handover condition video
    termsAccepted: false           // Whether user has accepted rental terms
  },
  filters: {
    query: "",
    category: "all",
    sort: "recommended"
  },
  selectedBooking: null,

  // RENTAL ITEMS INVENTORY
  // Array of available rental items in the marketplace. Each item represents
  // a rentable asset with pricing, location, and requirement information.
  // Items are filtered and displayed based on user's trust level and search queries.
  items: [
    {
      id: "item-1",
      title: "Power Washer",
      category: "Cleaning",
      price: 3000,                    // Daily rental price in Naira
      distance: "2 streets away",     // Hyper-local distance indicator
      description: "Perfect for compound cleaning, cars, driveways, and quick outdoor jobs.",
      highlight: "Requires verification" // Special requirement or feature
    },
    {
      id: "item-2",
      title: "Heavy-duty Ladder",
      category: "Tools",
      price: 2000,
      distance: "1 street away",
      description: "Sturdy 12ft ladder for painting, home repair, and light installations.",
      highlight: "Low-value rental"
    },
    {
      id: "item-3",
      title: "Professional Camera",
      category: "Media",
      price: 4500,
      distance: "Estate central",
      description: "Mirrorless camera for events, shoots, and content creation.",
      highlight: "Verified owner"
    },
    {
      id: "item-4",
      title: "Portable Generator",
      category: "Power",
      price: 6500,
      distance: "3 streets away",
      description: "Reliable generator for small gatherings, outages, or outdoor work.",
      highlight: "Requires guarantor"
    },
    {
      id: "item-5",
      title: "Smart Projector",
      category: "Events",
      price: 3200,
      distance: "Estate east",
      description: "Compact projector for movie nights and presentations.",
      highlight: "Fast pickup"
    },
    {
      id: "item-6",
      title: "Cordless Drill Set",
      category: "Tools",
      price: 1800,
      distance: "1 street away",
      description: "Compact drill set for home repairs, furniture assembly, and weekend projects.",
      highlight: "Great for beginners"
    },
  ],
};

// DOM ELEMENT REFERENCES
// =======================
// Cached references to HTML elements that are manipulated by JavaScript.
// These are stored in variables for performance and to avoid repeated DOM queries.
// Elements are identified by their IDs and used throughout the application for
// dynamic content updates, event handling, and user interaction responses.

// TRUST PROFILE ELEMENTS
// Elements related to displaying and updating the user's trust score and profile
const trustLevel = document.getElementById("trustLevel");           // Current trust level badge (1-4)
const completedRentals = document.getElementById("completedRentals"); // Number of successful rentals
const trustProgress = document.getElementById("trustProgress");     // Visual progress bar fill

// VERIFICATION ELEMENTS
// Elements for handling identity verification workflow
const verifyStartBtn = document.getElementById("verifyStartBtn");    // Button to start verification process
const guarantorBtn = document.getElementById("guarantorBtn");        // Button to generate guarantor link
const guarantorMessage = document.getElementById("guarantorMessage"); // Container for guarantor link display
const verificationForm = document.getElementById("verificationForm"); // Selfie/ID submission form
const selfieInput = document.getElementById("selfieInput");          // Selfie URL input field
const idInput = document.getElementById("idInput");                  // NIN/BVN input field
const verifySpinner = document.getElementById("verifySpinner");      // Loading spinner during verification
const verifySuccess = document.getElementById("verifySuccess");      // Success message after verification
const verificationState = document.getElementById("verificationState"); // Current verification status display

// HANDOVER ELEMENTS
// Elements for the rental handover and checkout process
const handoverBtn = document.getElementById("handoverBtn");          // Button to upload handover video
const handoverStatus = document.getElementById("handoverStatus");    // Status of handover video upload
const termsCheckbox = document.getElementById("termsCheckbox");      // Terms acceptance checkbox
const checkoutBtn = document.getElementById("checkoutBtn");          // Checkout button (disabled until terms accepted)
const checkoutMessage = document.getElementById("checkoutMessage");  // Success message after checkout

// MARKETPLACE ELEMENTS
// Elements for browsing and searching rental items
const searchInput = document.getElementById("searchInput");          // Search input for filtering items
const categoryFilter = document.getElementById("categoryFilter");    // Category dropdown for narrowing the marketplace
const sortSelect = document.getElementById("sortSelect");            // Sort dropdown for changing item order
const resultCount = document.getElementById("resultCount");          // Count of currently visible marketplace items
const itemsGrid = document.getElementById("itemsGrid");              // Container for displaying item cards

// BOOKING ELEMENTS
// Elements for displaying the quote generated from a selected marketplace item
const bookingSummary = document.getElementById("bookingSummary");
const bookingBreakdown = document.getElementById("bookingBreakdown");

// NAVIGATION ELEMENTS
// Elements for site navigation and user flow
const exploreBtn = document.getElementById("exploreBtn");            // Button to scroll to marketplace
const profileBtn = document.getElementById("profileBtn");            // Button to scroll to trust profile

// MODAL ELEMENTS
// Elements for the item detail modal overlay
const itemModal = document.getElementById("itemModal");              // Modal container (shown/hidden)
const modalContent = document.getElementById("modalContent");        // Dynamic content area for item details
const closeModal = document.getElementById("closeModal");            // Close button for modal

// MOBILE MENU ELEMENTS
// Elements for mobile navigation functionality
const menuToggle = document.getElementById("menuToggle");            // Hamburger menu button
const navMenu = document.getElementById("navMenu");                  // Mobile navigation menu container

// Utility functions for trust calculation and formatting
// UTILITY FUNCTIONS
// =================
// Helper functions that perform calculations, formatting, and data transformations.
// These functions are pure and reusable across different parts of the application.

// TRUST CALCULATION FUNCTIONS
// Functions that determine user trust levels and progress based on rental history
function getTrustLevel(completedRentals = 0) {
  // Determines trust level (1-4) based on completed rentals
  // Higher trust levels unlock access to more valuable rental items
  // Trust levels: 1 (0-1 rentals), 2 (2-3), 3 (4-5), 4 (6+)
  if (completedRentals >= 6) return 4;  // Maximum trust - all items available
  if (completedRentals >= 4) return 3;  // High trust - most items available
  if (completedRentals >= 2) return 2;  // Medium trust - many items available
  return 1;                             // Basic trust - limited items available
}

function getTrustProgress(completedRentals = 0) {
  // Calculates progress percentage within current trust level (0-100)
  // Used to fill the trust progress bar visually
  // Progress resets at each level boundary for clear visual feedback
  const level = getTrustLevel(completedRentals);
  const ratio = level === 1 ? completedRentals / 2 :           // Level 1: 0-2 rentals
                level === 2 ? (completedRentals - 2) / 2 :     // Level 2: 2-4 rentals
                level === 3 ? (completedRentals - 4) / 2 :     // Level 3: 4-6 rentals
                1;                                             // Level 4: 6+ rentals (always 100%)
  return Math.min(100, ratio * 100); // Cap at 100% and convert to percentage
}

// FORMATTING FUNCTIONS
// Functions that format data for display to users
function formatNaira(value) {
  // Formats numbers as Nigerian Naira currency with proper locale formatting
  // Example: 3000 becomes "₦3,000"
  // Uses Nigerian locale for correct comma placement and currency symbol
  return `₦${value.toLocaleString("en-NG")}`;
}

function clampRentalDays(value) {
  const days = Number.parseInt(value, 10);
  if (Number.isNaN(days)) return 1;
  return Math.min(14, Math.max(1, days));
}

function getRentalQuote(item, days = 1) {
  const safeDays = clampRentalDays(days);
  const subtotal = item.price * safeDays;
  const commission = Math.round(subtotal * 0.1);
  const deposit = Math.round(item.price * 0.4);

  return {
    days: safeDays,
    subtotal,
    commission,
    deposit,
    total: subtotal + commission + deposit
  };
}

function renderQuoteBreakdown(quote) {
  return `
    <div><span>Rental subtotal</span><strong>${formatNaira(quote.subtotal)}</strong></div>
    <div><span>RentIt 10% fee</span><strong>${formatNaira(quote.commission)}</strong></div>
    <div><span>Refundable deposit</span><strong>${formatNaira(quote.deposit)}</strong></div>
    <div class="quote-total"><span>Total due today</span><strong>${formatNaira(quote.total)}</strong></div>
  `;
}

function updateBookingSummary() {
  const booking = appState.selectedBooking;

  if (!booking) {
    bookingSummary.textContent = "Choose an item from the marketplace to create a rental quote.";
    bookingBreakdown.classList.add("hidden");
    bookingBreakdown.innerHTML = "";
    checkoutBtn.disabled = true;
    return;
  }

  const item = appState.items.find(rentalItem => rentalItem.id === booking.itemId);
  if (!item) {
    appState.selectedBooking = null;
    updateBookingSummary();
    return;
  }

  const quote = getRentalQuote(item, booking.days);
  appState.selectedBooking.quote = quote;
  bookingSummary.textContent = `${item.title} reserved for ${quote.days} day${quote.days === 1 ? "" : "s"}. Complete the handover checklist to continue.`;
  bookingBreakdown.innerHTML = renderQuoteBreakdown(quote);
  bookingBreakdown.classList.remove("hidden");
  checkoutBtn.disabled = !appState.user.termsAccepted;
}

// Profile update function
// PROFILE MANAGEMENT FUNCTIONS
// ============================
// Functions that handle updating and displaying user profile information

function updateProfile() {
  // Updates all profile-related UI elements based on current app state
  // Called whenever user data changes (verification, trust updates, etc.)
  // Synchronizes the DOM with the application state

  // Extract user data for easier access
  const { trust, verification, handoverVideo } = appState.user;

  // Update trust level display and progress indicators
  const level = getTrustLevel(trust.completedRentals);
  trustLevel.textContent = level;                                    // Update trust level badge
  completedRentals.textContent = `${trust.completedRentals} safe returns`; // Update rental count
  trustProgress.style.width = `${getTrustProgress(trust.completedRentals)}%`; // Update progress bar

  // Update verification status display based on current state
  verificationState.innerHTML = verification.status === "verified"
    // Verified state: Show success message and hide form
    ? `<strong>Verified</strong><p>Selfie and NIN/BVN verified. You can rent higher-value items.</p>`
    // Unverified state: Show instructions and keep form visible
    : `<strong>Not verified</strong><p>Upload a selfie and enter your NIN/BVN to simulate verification.</p>`;

  // Toggle form visibility based on verification status
  if (verification.status === "verified") {
    verificationForm.classList.add("hidden");      // Hide form when verified
    verifySpinner.classList.add("hidden");         // Ensure spinner is hidden
    verifySuccess.classList.remove("hidden");      // Show success message
  } else {
    verificationForm.classList.remove("hidden");   // Show form when unverified
    verifySuccess.classList.add("hidden");         // Hide success message
  }

  // Update handover video status
  handoverStatus.textContent = handoverVideo
    ? "Handover video saved. Condition accepted."   // Video uploaded
    : "No video uploaded yet.";                     // No video yet

  // Enable/disable checkout button based on booking selection and terms acceptance
  checkoutBtn.disabled = !appState.selectedBooking || !appState.user.termsAccepted;
}

// MARKETPLACE RENDERING FUNCTIONS
// ================================
// Functions that handle displaying and filtering rental items in the marketplace

function getFilteredItems() {
  const { query, category, sort } = appState.filters;
  const normalized = query.trim().toLowerCase();

  const filtered = appState.items.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(normalized)
      || item.category.toLowerCase().includes(normalized)
      || item.description.toLowerCase().includes(normalized);
    const matchesCategory = category === "all" || item.category === category;

    return matchesQuery && matchesCategory;
  });

  return filtered.sort((first, second) => {
    if (sort === "price-low") return first.price - second.price;
    if (sort === "price-high") return second.price - first.price;
    if (sort === "title") return first.title.localeCompare(second.title);
    return appState.items.indexOf(first) - appState.items.indexOf(second);
  });
}

function populateCategoryFilter() {
  const categories = [...new Set(appState.items.map(item => item.category))].sort();

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderItems() {
  // Renders the marketplace grid with rental items, optionally filtered by search query
  // Takes a search string and filters items by title, category, or description
  // Displays "no results" message if no items match the search criteria

  // Clear existing items from the grid
  itemsGrid.innerHTML = "";

  // Filter items based on search query, category, and sort controls
  const filtered = getFilteredItems();
  resultCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} available`;

  // Handle empty search results with helpful message
  if (filtered.length === 0) {
    itemsGrid.innerHTML = `<p class="muted">No matching items found. Try searching for "drill", "camera", or "generator".</p>`;
    return; // Exit early if no items to display
  }

  // Generate HTML cards for each filtered item
  filtered.forEach(item => {
    // Create semantic article element for each item card
    const card = document.createElement("article");
    card.className = "item-card";

    // Build item card HTML with all necessary information and interactions
    card.innerHTML = `
      <div class="item-image">
        <div class="item-category">${item.category}</div>  <!-- Category badge overlay -->
        <div class="item-price">${formatNaira(item.price)}</div>  <!-- Formatted daily price -->
      </div>
      <div class="item-details">
        <h3 class="item-title">${item.title}</h3>  <!-- Item name as heading -->
        <p class="item-description">${item.description}</p>  <!-- Detailed description -->
        <div class="item-meta">
          <span class="item-distance">${item.distance}</span>  <!-- Hyper-local distance -->
          <span class="item-highlight">${item.highlight}</span>  <!-- Special feature/requirement -->
        </div>
        <button class="btn btn-secondary" data-item-id="${item.id}">View details</button>  <!-- Button opens modal -->
      </div>
    `;

    // Add completed card to the marketplace grid
    itemsGrid.appendChild(card);
  });
}

// MODAL MANAGEMENT FUNCTIONS
// ===========================
// Functions that handle the item detail modal overlay display and interactions

function openItemModal(itemId) {
  // Opens the item detail modal with comprehensive information about a rental item
  // Takes an item ID, finds the corresponding item, and displays detailed view
  // Modal shows pricing, features, rental terms, and action buttons

  // Find the item by ID from the application state
  const item = appState.items.find(i => i.id === itemId);
  if (!item) return; // Exit if item not found (defensive programming)

  const startingDays = appState.selectedBooking?.itemId === item.id
    ? appState.selectedBooking.days
    : 2;
  const quote = getRentalQuote(item, startingDays);

  // Build detailed modal content with item information and rental terms
  modalContent.innerHTML = `
    <h2>${item.title}</h2>  <!-- Item title as main heading -->
    <p class="muted">${item.category} · ${item.distance} · ${formatNaira(item.price)}/day</p>  <!-- Meta information -->
    <p>${item.description}</p>  <!-- Full item description -->

    <!-- Feature list explaining rental benefits and requirements -->
    <ul class="modal-feature-list">
      <li><strong>Why this works:</strong> Hyper-local pickup keeps trust higher and delivery easy.</li>
      <li><strong>Owner fee:</strong> You pay 10% RentIt commission on every booking.</li>
      <li><strong>Checklist:</strong> Condition acceptance is mandatory before rental starts.</li>
    </ul>

    <label class="duration-control">
      Rental duration
      <input id="rentalDaysInput" type="number" min="1" max="14" value="${quote.days}" />
    </label>
    <div id="quoteSummary" class="quote-summary">
      ${renderQuoteBreakdown(quote)}
    </div>

    <!-- Action buttons for rental workflow -->
    <div class="modal-actions">
      <button id="rentNowBtn" class="btn btn-primary" data-rent-id="${item.id}">Reserve rental</button>  <!-- Primary rental action -->
      <button id="closeModalBtn" class="btn btn-secondary">Back to marketplace</button>  <!-- Return to grid view -->
    </div>
  `;

  // Display the modal by removing hidden class
  itemModal.classList.remove("hidden");
}

// GUARANTOR SYSTEM FUNCTIONS
// ===========================
// Functions that handle the guarantor verification system for high-value rentals

function showGuarantorLink() {
  // Generates and displays a unique guarantor verification link
  // Guarantors are trusted neighbors who vouch for the renter's reliability
  // This is required for renting high-value items to reduce risk

  // Generate a random 8-character alphanumeric code for uniqueness
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();

  // Create the full guarantor link URL and store it in app state
  appState.user.guarantorLink = `https://rentit.local/guarantor/${code}`;

  // Display the link to the user with instructions
  guarantorMessage.textContent = `Share this link with trusted neighbors: ${appState.user.guarantorLink}`;

  // Make the message visible by removing hidden class
  guarantorMessage.classList.remove("hidden");
}

// EVENT HANDLER SETUP
// ====================
// Functions that attach event listeners to DOM elements for user interactions

function mountEventListeners() {
  // Sets up all event listeners for the RentIt application
  // This function is called once on page load to wire up user interactions
  // Handles search, navigation, verification, and mobile menu functionality

  // SEARCH FUNCTIONALITY
  // Real-time search filtering as user types in the search input
  searchInput.addEventListener("input", (event) => {
    appState.filters.query = event.target.value;
    renderItems();
  });

  categoryFilter.addEventListener("change", (event) => {
    appState.filters.category = event.target.value;
    renderItems();
  });

  sortSelect.addEventListener("change", (event) => {
    appState.filters.sort = event.target.value;
    renderItems();
  });

  // NAVIGATION HANDLERS
  // Smooth scrolling navigation to different sections of the page
  exploreBtn.addEventListener("click", () => document.getElementById("marketplace").scrollIntoView({ behavior: "smooth" }));
  profileBtn.addEventListener("click", () => document.getElementById("trust").scrollIntoView({ behavior: "smooth" }));

  // VERIFICATION WORKFLOW
  // Scroll to verification section when user wants to get verified
  verifyStartBtn.addEventListener("click", () => document.getElementById("verification").scrollIntoView({ behavior: "smooth" }));

  // GUARANTOR SYSTEM
  // Generate guarantor link for high-value rentals
  guarantorBtn.addEventListener("click", showGuarantorLink);

  // MOBILE MENU TOGGLE
  // Hamburger menu functionality with blur background effect
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

  // MOBILE MENU CLOSE HANDLERS
  // Close menu when clicking navigation links or outside the menu
  navMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("active");
      document.body.classList.remove("blur-background");
    }
  });

  // Close menu when clicking outside menu area
  document.addEventListener("click", (event) => {
    if (!menuToggle.contains(event.target) && !navMenu.contains(event.target)) {
      navMenu.classList.remove("open");
      menuToggle.classList.remove("active");
      document.body.classList.remove("blur-background");
    }
  });

  // VERIFICATION FORM HANDLING
  // Handle identity verification form submission with validation
  verificationForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page reload

    // Extract and validate form inputs
    const selfie = selfieInput.value.trim();
    const idNumber = idInput.value.trim();

    if (!selfie || !idNumber) {
      alert("Please provide both selfie URL and NIN/BVN number.");
      return;
    }

    // Show loading state during verification simulation
    verifySpinner.classList.remove("hidden");
    verificationForm.classList.add("hidden");

    // Simulate verification API call delay
    setTimeout(() => {
      // Update user verification status on successful verification
      appState.user.verification = { status: "verified", selfieUrl: selfie, idNumber };

      // Refresh UI and scroll to trust profile to show verification success
      updateProfile();
      window.scrollTo({ top: document.getElementById("trust").offsetTop - 20, behavior: "smooth" });
    }, 1200); // 1.2 second delay to simulate processing
  });

  // HANDOVER VIDEO SIMULATION
  // Simulate uploading a condition acceptance video for rental handover
  handoverBtn.addEventListener("click", () => {
    appState.user.handoverVideo = "simulated-handover.mp4";
    handoverStatus.textContent = "Handover video saved. Condition accepted.";
  });

  // TERMS ACCEPTANCE HANDLING
  // Enable/disable checkout button based on terms agreement
  termsCheckbox.addEventListener("change", (event) => {
    appState.user.termsAccepted = event.target.checked;
    checkoutBtn.disabled = !appState.selectedBooking || !event.target.checked;
  });

  // CHECKOUT SIMULATION
  // Handle the complete rental checkout process with validation
  checkoutBtn.addEventListener("click", () => {
    if (!appState.user.termsAccepted) return; // Prevent checkout without terms acceptance

    if (!appState.selectedBooking) {
      alert("Please reserve an item from the marketplace before checkout.");
      return;
    }

    if (!appState.user.handoverVideo) {
      alert("Please complete the handover checklist before checkout.");
      return;
    }

    const rentedItem = appState.items.find(item => item.id === appState.selectedBooking.itemId);
    const rentedTitle = rentedItem ? rentedItem.title : "your rental";

    // Simulate successful rental completion - increase trust score
    appState.user.trust.completedRentals += 1;

    // Reset booking state for next rental
    appState.user.termsAccepted = false;
    appState.user.handoverVideo = null;
    appState.selectedBooking = null;
    termsCheckbox.checked = false;

    // Show success message and update UI
    checkoutMessage.textContent = `Payment simulated for ${rentedTitle}. Your trust score has increased.`;
    checkoutMessage.classList.remove("hidden");
    updateProfile();
    updateBookingSummary();

    // Auto-hide success message after 4 seconds
    setTimeout(() => checkoutMessage.classList.add("hidden"), 4000);
  });

  // ITEM MODAL INTERACTIONS
  // Handle clicks on item cards and modal buttons using event delegation
  document.body.addEventListener("click", (event) => {
    // Open item modal when clicking "View details" button
    if (event.target.matches("[data-item-id]")) {
      openItemModal(event.target.dataset.itemId);
    }

    // Handle "Rent Now" button in modal
    if (event.target.id === "rentNowBtn") {
      const item = appState.items.find(i => i.id === event.target.dataset.rentId);

      if (item) {
        // Check if item requires verification and user is verified
        const needsVerification = item.highlight.toLowerCase().includes("requires verification") ||
                                  item.highlight.toLowerCase().includes("requires guarantor");

        if (appState.user.verification.status !== "verified" && needsVerification) {
          alert("This item requires identity verification before renting. Please verify first.");
          return;
        }

        const rentalDaysInput = document.getElementById("rentalDaysInput");
        const days = clampRentalDays(rentalDaysInput?.value || 1);
        appState.selectedBooking = {
          itemId: item.id,
          days,
          quote: getRentalQuote(item, days)
        };
        updateBookingSummary();

        // Close modal and scroll to verification section for checkout
        itemModal.classList.add("hidden");
        window.scrollTo({ top: document.getElementById("verification").offsetTop - 24, behavior: "smooth" });
      }
    }

    // Close modal when clicking "Back to marketplace" button
    if (event.target.id === "closeModalBtn") {
      itemModal.classList.add("hidden");
    }
  });

  // MODAL CLOSE HANDLERS
  // Close modal via close button or clicking outside modal area
  closeModal.addEventListener("click", () => itemModal.classList.add("hidden"));
  itemModal.addEventListener("click", (event) => {
    if (event.target === itemModal) itemModal.classList.add("hidden");
  });

  document.body.addEventListener("input", (event) => {
    if (event.target.id !== "rentalDaysInput") return;

    const itemId = document.getElementById("rentNowBtn")?.dataset.rentId;
    const item = appState.items.find(rentalItem => rentalItem.id === itemId);
    const quoteSummary = document.getElementById("quoteSummary");

    if (item && quoteSummary) {
      const quote = getRentalQuote(item, event.target.value);
      event.target.value = quote.days;
      quoteSummary.innerHTML = renderQuoteBreakdown(quote);
    }
  });
}

// APPLICATION INITIALIZATION
// ===========================
// Functions that set up the application when the page loads

function init() {
  // Initializes the RentIt application when the DOM is ready
  // This is the main entry point that sets up the entire application state
  // Called automatically when the script loads at the bottom of the HTML

  // Render the initial marketplace with all available items
  populateCategoryFilter();
  renderItems();

  // Update all profile-related UI elements with current user state
  updateProfile();
  updateBookingSummary();

  // Attach all event listeners for user interactions
  mountEventListeners();
}

// Start the application
// This call executes when the script loads, initializing the entire RentIt app
init();
