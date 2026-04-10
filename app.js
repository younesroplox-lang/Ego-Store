const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const cartCount = document.getElementById("cartCount");
const resultsCount = document.getElementById("resultsCount");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const filterPills = document.querySelectorAll(".filter-pill");
const categoryButtons = document.querySelectorAll(".nav-chip, .mobile-chip");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const toast = document.getElementById("toast");

let allProducts = [];
let activeCategory = "all";
let activePrice = "all";
let activeSearch = "";
let activeSort = "default";

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function getCart() {
  return JSON.parse(localStorage.getItem("ego_cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("ego_cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function parsePrice(price) {
  return parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
}

function renderProducts(products) {
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No products found</h3>
        <p>Try another category, filter, or search term.</p>
      </div>
    `;
    if (resultsCount) resultsCount.textContent = "0";
    return;
  }

  grid.innerHTML = products.map((product) => {
    const shortDesc = product.description.length > 78
      ? product.description.slice(0, 78) + "..."
      : product.description;

    return `
      <article class="product-card">
        <a href="product.html?id=${product.id}" class="product-image-wrap">
          <span class="product-badge">New</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </a>

        <div class="product-info">
          <a href="product.html?id=${product.id}">
            <h3 class="product-title">${product.name}</h3>
          </a>

          <p class="product-desc">${shortDesc}</p>

          <div class="product-meta">
            <div class="product-price">${product.price}</div>
            <div class="product-category">${product.category}</div>
          </div>

          <div class="product-actions">
            <button class="add-btn" onclick="addToCart('${product.id}')">Add to cart</button>
            <a href="product.html?id=${product.id}" class="view-btn">View</a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  if (resultsCount) {
    resultsCount.textContent = products.length;
  }
}

function applyFilters() {
  let filtered = [...allProducts];

  if (activeCategory !== "all") {
    filtered = filtered.filter(
      (product) => product.category.toLowerCase() === activeCategory
    );
  }

  if (activePrice === "under-50") {
    filtered = filtered.filter((product) => parsePrice(product.price) < 50);
  } else if (activePrice === "50-80") {
    filtered = filtered.filter((product) => {
      const price = parsePrice(product.price);
      return price >= 50 && price <= 80;
    });
  } else if (activePrice === "over-80") {
    filtered = filtered.filter((product) => parsePrice(product.price) > 80);
  }

  if (activeSearch) {
    const q = activeSearch.toLowerCase();
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q)
    );
  }

  if (activeSort === "price-low") {
    filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (activeSort === "price-high") {
    filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (activeSort === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderProducts(filtered);
}

async function initStore() {
  try {
    const response = await fetch("products.json");
    allProducts = await response.json();

    updateCartCount();
    applyFilters();
  } catch (error) {
    console.error("Error loading products:", error);
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>Could not load products</h3>
          <p>Please check your products.json file.</p>
        </div>
      `;
    }
  }
}

function addToCart(productId) {
  const cart = getCart();
  cart.push(productId);
  setCart(cart);
  updateCartCount();
  showToast("Added to cart");
}

window.addToCart = addToCart;

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    activeSearch = e.target.value.trim();
    applyFilters();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    activeSort = e.target.value;
    applyFilters();
  });
}

filterPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    filterPills.forEach((item) => item.classList.remove("active"));
    pill.classList.add("active");
    activePrice = pill.dataset.price;
    applyFilters();
  });
});

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    activeCategory = category;

    categoryButtons.forEach((item) => {
      item.classList.toggle("active", item.dataset.category === category);
    });

    applyFilters();
  });
});

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    activeCategory = "all";
    activePrice = "all";
    activeSearch = "";
    activeSort = "default";

    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "default";

    filterPills.forEach((item) => {
      item.classList.toggle("active", item.dataset.price === "all");
    });

    categoryButtons.forEach((item) => {
      item.classList.toggle("active", item.dataset.category === "all");
    });

    applyFilters();
    showToast("Filters cleared");
  });
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = newsletterEmail.value.trim();
    if (!email) return;

    localStorage.setItem("ego_newsletter_email", email);
    newsletterEmail.value = "";
    showToast("You joined the list");
  });
}

initStore();
