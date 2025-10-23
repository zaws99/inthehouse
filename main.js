// ========== KONFIGURASI ==========
const WHATSAPP_NUMBER = '6285157279122'; // Ganti dengan nomor WhatsApp kamu (format: 628xxx)

// ========== GLOBAL VARIABLES ==========
let allProducts = [];
let filteredProducts = [];

// ========== DOM ELEMENTS ==========
const productsContainer = document.getElementById('productsContainer');
const loadingElement = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

// ========== FETCH PRODUCTS ==========
async function fetchProducts() {
    try {
        loadingElement.style.display = 'block';
        
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error('Gagal memuat produk');
        }
        
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        loadingElement.style.display = 'none';
        
        populateCategories();
        renderProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error fetching products:', error);
        loadingElement.innerHTML = '<p style="color: red;">❌ Gagal memuat produk. Pastikan file products.json ada dan formatnya benar.</p>';
    }
}

// ========== POPULATE CATEGORIES ==========
function populateCategories() {
    const categories = [...new Set(allProducts.map(product => product.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// ========== RENDER PRODUCTS ==========
function renderProducts(products) {
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// ========== CREATE PRODUCT CARD ==========
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Format harga
    const formattedPrice = formatPrice(product.price);
    
    // Stock status
    let stockText = `Stok: ${product.stock}`;
    let stockClass = '';
    
    if (product.stock === 0) {
        stockText = 'Stok Habis';
        stockClass = 'out-of-stock';
    } else if (product.stock < 10) {
        stockText = `Stok Tersisa: ${product.stock}`;
        stockClass = 'low-stock';
    }
    
    // Generate WhatsApp link
    const whatsappLink = generateWhatsAppLink(product);
    
    card.innerHTML = `
        <img src="img/no-image.png" alt="${product.name}" class="product-image">

        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-stock ${stockClass}">${stockText}</div>
            <a href="${whatsappLink}" target="_blank" class="btn-whatsapp" ${product.stock === 0 ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                📱 Pesan via WhatsApp
            </a>
        </div>
    `;
    
    return card;
}

// ========== FORMAT PRICE ==========
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// ========== GENERATE WHATSAPP LINK ==========
function generateWhatsAppLink(product) {
    const message = product.whatsappMessage || `Halo, saya tertarik dengan produk: ${product.name}`;
    const fullMessage = `${message}%0A%0AHarga: ${formatPrice(product.price)}%0AStok: ${product.stock}`;
    
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
}

// ========== SEARCH FUNCTIONALITY ==========
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterProducts(searchTerm, categoryFilter.value);
});

// ========== CATEGORY FILTER ==========
categoryFilter.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    filterProducts(searchInput.value.toLowerCase(), selectedCategory);
});

// ========== FILTER PRODUCTS ==========
function filterProducts(searchTerm, category) {
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        
        const matchesCategory = category === 'all' || product.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filteredProducts);
}
// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

