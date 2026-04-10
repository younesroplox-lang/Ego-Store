const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const cartCountEl = document.getElementById('cartCount');
const wishlistCountEl = document.getElementById('wishlistCount');
const resultsCountEl = document.getElementById('resultsCount');
const heroProductCountEl = document.getElementById('heroProductCount');
const sortSelect = document.getElementById('sortSelect');
const filterPills = document.querySelectorAll('.filter-pill[data-filter]');
const categoryButtons = document.querySelectorAll('.category-chip');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const showAllBtn = document.getElementById('showAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
const filtersPanel = document.getElementById('filtersPanel');
const promoPulseBtn = document.getElementById('promoPulseBtn');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMsg = document.getElementById('newsletterMsg');
const newsletterEmail = document.getElementById('newsletterEmail');
const menuToggle = document.getElementById('menuToggle');
const closeMenu = document.getElementById('closeMenu');
const mobilePanel = document.getElementById('mobilePanel');
const pageOverlay = document.getElementById('pageOverlay');
const scrollTrendingBtn = document.getElementById('scrollTrendingBtn');
const toast = document.getElementById('toast');

let allProducts = [];
let currentCategory = 'all';
let currentPriceFilter = 'all';
let wishlistOnly = false;
let currentSearch = '';
let currentSort = 'default';

function getCart() {
  return JSON.parse(localStorage.getItem('ego_cart')) || [];
}

function getWishlist() {
  return JSON.parse(localStorage.getItem('ego_wishlist')) || [];
}

function saveWishlist(list) {
  localStorage.setItem('ego_wishlist', JSON.stringify(list));
}

function parsePrice(price) {
  return parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function updateCartCount() {
  const cart = getCart();
  if (cartCountEl) cartCountEl.textContent = cart.length;
}

function updateWishlistCount() {
  const wishlist = getWishlist();
  if (wishlistCountEl) wishlistCountEl.textContent = wishlist.length;
}

function updateHeroCount() {
  if (heroProductCountEl) {
    heroProductCountEl.textContent = `${allProducts.length}+`;
  }
}

function setActiveCategory(category) {
  currentCategory = category;
  categoryButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

function setActivePriceFilter(filterValue) {
  currentPriceFilter = filterValue;
  filterPills.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterValue);
  });
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const exists = wishlist.includes(productId);

  const updated = exists
    ? wishlist.filter(id => id !== productId)
    : [...wishlist, productId];

  saveWishlist(updated);
  updateWishlistCount();
  applyAllFilters();
  showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
}

function addToCart(productId) {
  const cart = getCart();
  cart.push(productId);
  localStorage.setItem('ego_cart', JSON.stringify(cart));
  updateCartCount();
  showToast('Added to cart');
}

function matchesCategory(product) {
  if (currentCategory === 'all') return true;
  return String(product.category || '').toLowerCase() === currentCategory;
}

function matchesPrice(product) {
  const price = parsePrice(product.price);

  if (currentPriceFilter === 'under-50') return price < 50;
  if (currentPriceFilter === '50-100') return price >= 50 && price <= 100;
  if (currentPriceFilter === 'over-100') return price > 100;

  return true;
}

function matchesSearch(product) {
  if (!currentSearch) return true;

  const q = currentSearch.toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();
  const description = String(product.description || '').toLowerCase();

  return (
    name.includes(q) ||
    category.includes(q) ||
    description.includes(q)
  );
}

function matchesWishlist(product) {
  if (!wishlistOnly) return true;
  return getWishlist().includes(product.id);
}

function sortProducts(products) {
  const sorted = [...products];

  if (currentSort === 'price-low') {
    sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (currentSort === 'price-high') {
    sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (currentSort === 'name-asc') {
    sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  return sorted;
}

function renderProducts(products) {
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No matching pieces found</h3>
        <p>Try another search, category, or filter combination.</p>
      </div>
    `;
    if (resultsCountEl) resultsCountEl.textContent = '0';
    return;
  }

  const wishlist = getWishlist();

  grid.innerHTML = products.map(item => {
    const isFav = wishlist.includes(item.id);
    const safeCategory = item.category ? item.category : 'archive';
    const shortDesc = item.description
      ? item.description.slice(0, 80) + (item.description.length > 80 ? '...' : '')
      : 'Curated archive piece with bold visual identity.';

    return `
      <article class="product-card">
        <div class="product-media">
          <div class="card-top-actions">
            <div class="hot-badge">HOT</div>
            <div class="category-badge">${safeCategory}</div>
          </div>

          <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleWishlist('${item.id}')" aria-label="Wishlist">
            ♥
          </button>

          <a href="product.html?id=${item.id}">
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </a>
        </div>

        <div class="card-body">
          <a href="product.html?id=${item.id}">
            <div class="product-title">${item.name}</div>
          </a>

          <div class="product-desc">${shortDesc}</div>

          <div class="card-row">
            <div class="product-price">${item.price}</div>
            <div class="product-meta">high demand</div>
          </div>

          <div class="card-actions">
            <button class="quick-add-btn" onclick="addToCart('${item.id}')">Quick Add</button>
            <a href="product.html?id=${item.id}" class="view-btn">View</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (resultsCountEl) resultsCountEl.textContent = products.length;
}

function applyAllFilters() {
  let filtered = allProducts.filter(product =>
    matchesCategory(product) &&
    matchesPrice(product) &&
    matchesSearch(product) &&
    matchesWishlist(product)
  );

  filtered = sortProducts(filtered);
  renderProducts(filtered);
}

async function initStore() {
  try {
    const response = await fetch('products.json');
    allProducts = await response.json();

    updateCartCount();
    updateWishlistCount();
    updateHeroCount();
    applyAllFilters();
  } catch (error) {
    console.error('Failed to load products:', error);
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>Archive connection failed</h3>
          <p>Could not load products.json</p>
        </div>
      `;
    }
  }
}

if (searchInput) {
  searchInput.addEventListener('input', e => {
    currentSearch = e.target.value.trim();
    applyAllFilters();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', e => {
    currentSort = e.target.value;
    applyAllFilters();
  });
}

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveCategory(btn.dataset.category);
    applyAllFilters();

    if (mobilePanel) mobilePanel.classList.remove('open');
    if (pageOverlay) pageOverlay.classList.remove('show');
  });
});

filterPills.forEach(btn => {
  btn.addEventListener('click', () => {
    setActivePriceFilter(btn.dataset.filter);
    applyAllFilters();
  });
});

if (showFavoritesBtn) {
  showFavoritesBtn.addEventListener('click', () => {
    wishlistOnly = true;
    showFavoritesBtn.classList.add('active');
    if (showAllBtn) showAllBtn.classList.remove('active');
    applyAllFilters();
  });
}

if (showAllBtn) {
  showAllBtn.addEventListener('click', () => {
    wishlistOnly = false;
    if (showFavoritesBtn) showFavoritesBtn.classList.remove('active');
    applyAllFilters();
  });
}

if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    currentSearch = '';
    currentSort = 'default';
    wishlistOnly = false;

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (showFavoritesBtn) showFavoritesBtn.classList.remove('active');

    setActiveCategory('all');
    setActivePriceFilter('all');
    applyAllFilters();
    showToast('Filters cleared');
  });
}

if (toggleFiltersBtn && filtersPanel) {
  toggleFiltersBtn.addEventListener('click', () => {
    filtersPanel.classList.toggle('open');
  });
}

if (promoPulseBtn) {
  promoPulseBtn.addEventListener('click', () => {
    showToast('Promo mode activated');
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = newsletterEmail.value.trim();
    if (!email) return;

    localStorage.setItem('ego_newsletter_email', email);
    newsletterMsg.textContent = `Saved locally: ${email}`;
    newsletterEmail.value = '';
    showToast('You joined the list');
  });
}

if (menuToggle && mobilePanel && pageOverlay) {
  menuToggle.addEventListener('click', () => {
    mobilePanel.classList.add('open');
    pageOverlay.classList.add('show');
  });
}

if (closeMenu && mobilePanel && pageOverlay) {
  closeMenu.addEventListener('click', () => {
    mobilePanel.classList.remove('open');
    pageOverlay.classList.remove('show');
  });
}

if (pageOverlay && mobilePanel) {
  pageOverlay.addEventListener('click', () => {
    mobilePanel.classList.remove('open');
    pageOverlay.classList.remove('show');
  });
}

if (scrollTrendingBtn) {
  scrollTrendingBtn.addEventListener('click', () => {
    const catalog = document.getElementById('catalogSection');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  });
}

window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;

initStore();
