/* ==========================================
   EGO STORE BRAIN (app.js)
   المركز الرئيسي للعمليات الذكية
   ========================================== */

const grid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
let allProducts = [];

// 1. تشغيل النظام وجلب البيانات
async function initStore() {
    try {
        const response = await fetch('products.json');
        allProducts = await response.json();
        
        // إذا كنا في الصفحة الرئيسية، قم بعرض المنتجات
        if (grid) {
            renderProducts(allProducts);
        }
        
        updateCartCount(); // تحديث عداد السلة في كل الصفحات
    } catch (error) {
        console.error("System Error: Cannot connect to database", error);
        if (grid) grid.innerHTML = '<div style="padding:20px; color:red;">Error loading archives.</div>';
    }
}

// 2. هندسة عرض المنتجات (نظام التوجيه الذكي)
function renderProducts(products) {
    grid.innerHTML = ''; // مسح المنتجات القديمة
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="padding:20px; grid-column:1/-1; text-align:center;">No items found. Try another search.</div>';
        return;
    }

    products.forEach(item => {
        // لاحظ كيف نقوم بتوجيه الزائر لصفحة المنتج مع تمرير الـ ID الخاص به
        const cardHTML = `
            <a href="product.html?id=${item.id}" class="product-card">
                <div class="img-wrap">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="card-info">
                    <div class="p-title">${item.name}</div>
                    <div class="p-price">${item.price}</div>
                    <div class="p-sales">🔥 High Demand</div>
                </div>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 3. خوارزمية البحث الفوري
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
        renderProducts(filtered);
    });
}

// 4. نظام الذاكرة (سلة المشتريات)
function updateCartCount() {
    // قراءة السلة من ذاكرة هاتف أو حاسوب المستخدم
    const cart = JSON.parse(localStorage.getItem('ego_cart')) || [];
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.innerText = cart.length;
        // إخفاء العداد إذا كانت السلة فارغة
        badge.style.display = cart.length > 0 ? 'inline-block' : 'none'; 
    }
}

// تشغيل المحرك عند فتح الموقع
initStore();
