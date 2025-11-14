const globals = {
    sections: null,
    sectionsLoaded: false,
    sectionsError: null,
    cache: {}
};

const heroCarousel = {
    currentIndex: 0,
    timer: null,
    slides: [],
    delay: 5000
};

const categoryImageFallbacks = {
    'allergy medicine': 'https://images.unsplash.com/photo-1580281780460-92f78080ade9?auto=format&fit=crop&w=800&q=85',
    'heart medicine': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85',
    'stomach medicine': 'https://images.unsplash.com/photo-1580894908373-fb1d4780d151?auto=format&fit=crop&w=800&q=85',
    'pain relief': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=85',
    'vitamins & supplements': 'https://images.unsplash.com/photo-1598511723374-3ba6bc5d5b47?auto=format&fit=crop&w=800&q=85',
    'skincare': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=85',
    'color cosmetics': 'https://images.unsplash.com/photo-1513483460601-25834dd141f2?auto=format&fit=crop&w=800&q=85'
};

const globalFallbackImage = 'https://images.unsplash.com/photo-1505577081107-4a4167cd81d0?auto=format&fit=crop&w=800&q=85';

const messengerSelectors = {
    toggle: '.messenger-toggle',
    window: '.messenger-window',
    close: '.close-messenger',
    messages: '#messengerMessages',
    body: '.messenger-body',
    input: '#messengerInput',
    send: '#sendMessage'
};

const SECTION_RENDERERS = {
    hero: renderHeroSection,
    promoGrid: renderPromoGrid,
    categorySpotlight: renderCategorySpotlights,
    brandMarquee: renderBrandMarquee,
    storeCta: renderStoreCta,
    productStrip: renderProductStrip,
    blogHighlights: renderBlogHighlights,
    custom: renderCustomSection
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing...');
    try {
        await loadSections();
        renderSections();
        await loadBanners();
        loadDepartments();
        await loadCartCount();
        initialiseMessenger();
        initialiseNewsletter();
        initialiseGlobalDelegates();
        console.log('Initialization complete. Event listeners attached.');
    } catch (error) {
        console.error('Error initialising homepage', error);
    }
});

// Also attach event listeners immediately (in case DOMContentLoaded already fired)
if (document.readyState === 'loading') {
    // DOM hasn't finished loading yet, wait for DOMContentLoaded
    console.log('Waiting for DOM to load...');
} else {
    // DOM is already loaded, attach listeners now
    console.log('DOM already loaded, attaching listeners immediately...');
    initialiseGlobalDelegates();
}

async function loadSections() {
    try {
        const sections = await fetchJSON('/api/sections');
        globals.sections = Array.isArray(sections) ? sections : [];
        globals.sectionsLoaded = true;
    } catch (error) {
        globals.sectionsError = error;
        globals.sectionsLoaded = false;
        console.error('Failed to load homepage sections', error);
    }
}

async function loadBanners() {
    try {
        // Get all active banners
        const banners = await fetchJSON('/api/banners');
        if (!Array.isArray(banners) || banners.length === 0) {
            return;
        }

        // Load banners by position
        const middleBanner = document.getElementById('middleBanner');
        const topBanner = document.getElementById('topBanner');
        const bottomBanner = document.getElementById('bottomBanner');

        // Find banners by position
        const middleBannerData = banners.find(b => b.position === 'middle' && b.isActive);
        const topBannerData = banners.find(b => b.position === 'top' && b.isActive);
        const bottomBannerData = banners.find(b => b.position === 'bottom' && b.isActive);

        // Render middle banner (existing location)
        if (middleBanner && middleBannerData) {
            const middleSection = document.getElementById('middleBannerSection');
            if (middleSection) middleSection.style.display = 'block';
            renderBanner(middleBanner, middleBannerData);
        }

        // Render top banner if container exists
        if (topBanner && topBannerData) {
            const topSection = document.getElementById('topBannerSection');
            if (topSection) topSection.style.display = 'block';
            renderBanner(topBanner, topBannerData);
        }

        // Render bottom banner if container exists
        if (bottomBanner && bottomBannerData) {
            const bottomSection = document.getElementById('bottomBannerSection');
            if (bottomSection) bottomSection.style.display = 'block';
            renderBanner(bottomBanner, bottomBannerData);
        }

    } catch (error) {
        // Silently fail - banners are optional
        console.warn('Failed to load banners', error);
    }
}

function renderBanner(container, banner) {
    if (!container || !banner) return;
    
    const imageUrl = resolveImageUrl(banner);
    const link = banner.link || '#';
    
    container.innerHTML = `
        <a href="${htmlEscape(link)}" class="promo-banner__link">
            <div class="promo-banner__media" style="background-image: url('${htmlEscape(imageUrl)}');">
                <div class="promo-banner__content">
                    ${banner.title ? `<h3>${htmlEscape(banner.title)}</h3>` : ''}
                    ${banner.description ? `<p>${htmlEscape(banner.description)}</p>` : ''}
                </div>
            </div>
        </a>
    `;
}

function renderSections() {
    if (!Array.isArray(globals.sections)) return;

    const heroContainer = document.getElementById('heroSlides');
    const heroDots = document.getElementById('heroDots');
    const categoryRibbon = document.getElementById('categoryRibbon');
    const featuredCategories = document.getElementById('featuredCategories');
    const categorySections = document.getElementById('categorySections');
    const tradingItems = document.getElementById('tradingItems');
    const discountedItems = document.getElementById('discountedProducts');
    const newItems = document.getElementById('newArrivals');
    const middleBanner = document.getElementById('middleBanner');

    heroContainer.innerHTML = '';
    heroDots.innerHTML = '';
    categoryRibbon.innerHTML = '';
    featuredCategories.innerHTML = '';
    categorySections.innerHTML = '';
    tradingItems.innerHTML = '';
    discountedItems.innerHTML = '';
    newItems.innerHTML = '';

    const groups = {
        hero: [],
        promoGrid: [],
        categorySpotlight: [],
        brandMarquee: [],
        storeCta: [],
        productStrip: [],
        blogHighlights: [],
        custom: []
    };

    globals.sections.forEach(section => {
        if (!section?.type || !SECTION_RENDERERS[section.type]) return;
        groups[section.type].push(section);
    });

    if (groups.hero.length) {
        renderHeroSection(groups.hero[0]);
    }

    if (groups.promoGrid.length) {
        renderPromoGrid(groups.promoGrid[0]);
    }

    if (groups.categorySpotlight.length) {
        renderCategorySpotlights(groups.categorySpotlight[0]);
    }

    if (groups.brandMarquee.length) {
        renderBrandMarquee(groups.brandMarquee[0]);
    }

    if (groups.storeCta.length) {
        renderStoreCta(groups.storeCta[0]);
    }

    if (groups.productStrip.length) {
        groups.productStrip.forEach(section => renderProductStrip(section));
    }

    if (groups.blogHighlights.length) {
        renderBlogHighlights(groups.blogHighlights[0]);
    }

    if (groups.custom.length) {
        groups.custom.forEach(section => renderCustomSection(section));
    }
}

function renderHeroSection(section) {
    const heroContainer = document.getElementById('heroSlides');
    const heroDots = document.getElementById('heroDots');
    if (!heroContainer || !section?.data?.slides) return;

    // Filter out slides without valid images or empty/null slides
    const validSlides = section.data.slides.filter(slide => {
        // Only keep slides that have an image (required for display)
        return slide && slide.image && slide.image.trim() !== '';
    });

    // If no valid slides, don't render anything
    if (validSlides.length === 0) {
        console.warn('No valid slides found for hero section');
        return;
    }

    heroCarousel.slides = validSlides;
    heroCarousel.currentIndex = 0;

    heroContainer.innerHTML = heroCarousel.slides.map((slide, index) => {
        // Hero slider should always show navigation link, not "Add to Cart"
        // "Add to Cart" buttons should only appear on product cards
        const link = slide.link || '/products';
        const imageUrl = slide.image || globalFallbackImage;
        const isActive = index === 0 ? ' is-active' : '';
        
        return `
        <article class="hero-slide${isActive}" style="background-image: url('${htmlEscape(imageUrl)}');">
            <div class="hero-slide__overlay">
                <span class="hero-tagline">Trusted since 1975</span>
                <h1>${htmlEscape(slide.title || '')}</h1>
                <p>${htmlEscape(slide.description || '')}</p>
                <a href="${htmlEscape(link)}" class="btn btn-primary btn-lg">
                    Explore <i class="fas fa-arrow-right ms-2"></i>
                </a>
            </div>
        </article>
    `;
    }).join('');

    if (heroDots) {
        heroDots.innerHTML = heroCarousel.slides.map((_, index) => `
            <button class="hero-dot${index === 0 ? ' is-active' : ''}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>
        `).join('');
    }

    bindHeroCarouselEvents();
    
    // Initialize the slider position - ensure track is at 0
    const track = document.querySelector('.hero-carousel__track');
    if (track) {
        track.style.transform = 'translateX(0%)';
    }
    
    moveHeroSlide(0);
    startHeroAutoplay();
}

function renderPromoGrid(section) {
    if (!Array.isArray(section?.data?.items)) return;
    const container = document.querySelector('.promo-grid .row');
    if (!container) return;

    container.innerHTML = section.data.items.map(item => `
        <div class="col-lg-4 col-md-6">
            <a class="promo-card" href="${item.link || '#'}">
                <div class="promo-card__media" style="background-image: url('${htmlEscape(item.image || globalFallbackImage)}');"></div>
                <div class="promo-card__body">
                    <h5>${item.title || ''}</h5>
                    <p>${item.description || ''}</p>
                </div>
            </a>
        </div>
    `).join('');
}

function renderCategorySpotlights(section) {
    const featuredContainer = document.getElementById('featuredCategories');
    const ribbonContainer = document.getElementById('categoryRibbon');
    const sectionsContainer = document.getElementById('categorySections');
    if (!section?.data?.categories || !featuredContainer || !ribbonContainer || !sectionsContainer) return;

    const categories = section.data.categories;

    featuredContainer.innerHTML = categories.slice(0, 4).map(category => {
        const categoryId = category._id || category.id;
        return `
        <div class="col-lg-3 col-sm-6">
            <a class="category-card" href="/category/${categoryId}">
                <div class="category-img">
                    <img src="${htmlEscape(category.image || globalFallbackImage)}" alt="${htmlEscape(category.name)}">
                </div>
                <div class="category-body">
                    <h5>${category.name}</h5>
                    <p>${category.description || ''}</p>
                    <span class="category-link">Browse products <i class="fas fa-arrow-right"></i></span>
                </div>
            </a>
        </div>
    `;
    }).join('');

    ribbonContainer.innerHTML = categories.slice(0, 8).map(category => {
        const categoryId = category._id || category.id;
        return `
        <a class="category-ribbon__item" href="/category/${categoryId}">
            <div class="category-ribbon__icon">
                <img src="${htmlEscape(category.image || globalFallbackImage)}" alt="${htmlEscape(category.name)}">
            </div>
            <span>${category.name}</span>
        </a>
    `;
    }).join('');

    sectionsContainer.innerHTML = categories.map(category => {
        const categoryId = category._id || category.id;
        return `
        <section class="category-section">
            <div class="category-section__banner" style="background-image: url('${htmlEscape(category.image || globalFallbackImage)}')">
                <div class="category-section__heading">
                    <span class="eyebrow">${category.name}</span>
                    <h3>${category.name}</h3>
                    <p>${category.description || ''}</p>
                </div>
            </div>
            <div class="category-section__content">
                <div class="container">
                    <div class="section-header mb-4">
                        <div>
                            <h4 class="mb-0">${htmlEscape(category.name)} Products</h4>
                        </div>
                        <a href="/category/${categoryId}" class="btn btn-outline-primary btn-sm">
                            View all products <i class="fas fa-arrow-right ms-2"></i>
                        </a>
                    </div>
                    <div class="category-products" id="category-products-${categoryId}">
                        ${CategoryProductMarkup(category.products)}
                    </div>
                </div>
            </div>
        </section>
    `;
    }).join('');
}

function CategoryProductMarkup(products = []) {
    if (!Array.isArray(products) || !products.length) {
        return '<p class="text-muted">Products coming soon.</p>';
    }

    return products.map(product => createCategoryProductCard(product)).join('');
}

function renderBrandMarquee(section) {
    if (!Array.isArray(section?.data?.logos)) return;
    const container = document.querySelector('.brand-marquee__inner');
    if (!container) return;

    container.innerHTML = section.data.logos.map(logo => `
        <div class="brand-marquee__item"><img src="${htmlEscape(logo.image || globalFallbackImage)}" alt="${htmlEscape(logo.alt || '')}"></div>
    `).join('');
}

function renderStoreCta(section) {
    const overlay = document.querySelector('.store-cta__overlay');
    const media = document.querySelector('.store-cta__media');
    if (!overlay || !media) return;

    const data = section.data || {};
    const primaryAction = data.primaryAction || {};
    const secondaryAction = data.secondaryAction || {};

    overlay.innerHTML = `
        <span class="eyebrow">${data.eyebrow || ''}</span>
        <h2>${data.title || ''}</h2>
        <p>${data.description || ''}</p>
        <div class="store-cta__actions">
            ${primaryAction.label ? `<a href="${primaryAction.href || '#'}" class="btn btn-primary" ${primaryAction.external ? 'target="_blank" rel="noopener"' : ''}>${primaryAction.label}</a>` : ''}
            ${secondaryAction.label ? `<a href="${secondaryAction.href || '#'}" class="btn btn-outline-primary" ${secondaryAction.external ? 'target="_blank" rel="noopener"' : ''}>${secondaryAction.label}</a>` : ''}
                </div>
            `;
            
    if (data.image) {
        media.style.backgroundImage = `url('${htmlEscape(data.image)}')`;
    }
}

function renderProductStrip(section) {
    const target = (section.config?.mode || '').toLowerCase();
    let containerId = null;
    switch (target) {
        case 'trending':
            containerId = 'tradingItems';
            break;
        case 'discounted':
            containerId = 'discountedProducts';
            break;
        case 'new':
        case 'newarrival':
        case 'new-arrival':
            containerId = 'newArrivals';
            break;
        default:
            return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    const products = section.data?.products || [];
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

function renderBlogHighlights(section) {
    if (!Array.isArray(section?.data?.articles)) return;
    const container = document.querySelector('.blog-highlights .row');
    if (!container) return;

    container.innerHTML = section.data.articles.map(article => `
        <div class="col-lg-4 col-md-6">
            <article class="blog-card">
                <div class="blog-card__media" style="background-image: url('${htmlEscape(article.image || globalFallbackImage)}');"></div>
                <div class="blog-card__body">
                    ${article.tag ? `<span class="blog-card__tag">${article.tag}</span>` : ''}
                    <h5>${article.title || ''}</h5>
                    <p>${article.description || ''}</p>
                    ${article.link ? `<a href="${article.link}" class="blog-card__link">Read article</a>` : ''}
                            </div>
            </article>
                        </div>
    `).join('');
}

function renderCustomSection(section) {
    console.info('Unhandled custom section rendering', section);
}

function loadDepartments() {
    fetchJSON('/api/departments')
        .then(departments => {
            if (!Array.isArray(departments)) return;
            const menu = document.getElementById('departmentsMenu');
            const showcase = document.getElementById('departmentsShowcase');
            if (!menu || !showcase) return;

            menu.innerHTML = departments.map(dept => {
                const deptId = dept._id || dept.id;
                return `
                <li><a class="dropdown-item" href="/department/${deptId}">${dept.name}</a></li>
            `;
            }).join('');

            showcase.innerHTML = departments.map(dept => {
                const deptId = dept._id || dept.id;
                return `
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="department-card">
                        <div class="department-media">
                            <img src="${htmlEscape(resolveImageUrl(dept))}" alt="${htmlEscape(dept.name)}">
                        </div>
                        <div class="department-body">
                            <h5>${dept.name}</h5>
                            <p>${dept.description || ''}</p>
                            <a href="/department/${deptId}" class="btn btn-outline-primary btn-sm">View Categories</a>
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        })
        .catch(error => console.error('Error loading departments', error));
}

function resolveImageUrl(entity) {
    if (!entity) return globalFallbackImage;
    if (entity.imageUpload && entity.imageUpload.url) return entity.imageUpload.url;
    if (entity.image) return entity.image;
    return globalFallbackImage;
}

function createProductCard(product) {
    if (!product) return '';

    // Extract product ID - handle both string and object formats
    let productId = '';
    if (product._id) {
        productId = typeof product._id === 'string' ? product._id : product._id.toString();
    } else if (product.id) {
        productId = typeof product.id === 'string' ? product.id : product.id.toString();
    }
    
    if (!productId) {
        console.error('Product missing ID:', product);
        return ''; // Don't render card if no ID
    }
    
    const name = htmlEscape(product.name || 'Product');
    const image = htmlEscape(product.image || globalFallbackImage);
    const discount = Number(product.discount) || 0;
    const priceValue = Number(product.price);
    const hasNumericPrice = !Number.isNaN(priceValue);
    const finalPrice = hasNumericPrice
        ? (discount > 0 ? priceValue * (1 - discount / 100) : priceValue)
        : null;

    const priceMarkup = hasNumericPrice
        ? `
            <div class="product-price">
                ${discount > 0
                    ? `<span class="product-price__current">Rs. ${finalPrice.toFixed(2)}</span>
                       <span class="product-price__old">Rs. ${priceValue.toFixed(2)}</span>`
                    : `<span class="product-price__current">Rs. ${priceValue.toFixed(2)}</span>`}
            </div>
        `
        : '';
    
    return `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="product-card">
                <div class="product-img">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="product-body">
                    <h6>${name}</h6>
                    ${product.category?.name ? `<span class="product-meta">${htmlEscape(product.category.name)}</span>` : ''}
                    ${priceMarkup}
                    <div class="product-actions">
                        <a href="/product/${htmlEscape(productId)}" class="btn btn-outline-primary btn-sm view-product" data-id="${htmlEscape(productId)}">View</a>
                        <button type="button" class="btn btn-primary btn-sm add-to-cart" data-id="${htmlEscape(productId)}" data-product-id="${htmlEscape(productId)}">Add to cart</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCategoryProductCard(product) {
    if (!product) return '';

    // Extract product ID - handle both string and object formats
    let productId = '';
    if (product._id) {
        productId = typeof product._id === 'string' ? product._id : product._id.toString();
    } else if (product.id) {
        productId = typeof product.id === 'string' ? product.id : product.id.toString();
    }
    
    if (!productId) {
        console.error('Product missing ID in category card:', product);
        return ''; // Don't render card if no ID
    }
    
    const name = htmlEscape(product.name || 'Product');
    const image = htmlEscape(product.image || globalFallbackImage);
    const priceValue = Number(product.price);
    const hasNumericPrice = !Number.isNaN(priceValue);

    return `
        <div class="product-card category-card-lite">
            <div class="product-img">
                <img src="${image}" alt="${name}">
            </div>
            <div class="product-body">
                <h6>${name}</h6>
                ${hasNumericPrice ? `<span class="product-price__current">Rs. ${priceValue.toFixed(2)}</span>` : ''}
                <div class="product-actions">
                    <a href="/product/${htmlEscape(productId)}" class="btn btn-outline-primary btn-sm view-product" data-id="${htmlEscape(productId)}">View</a>
                    <button type="button" class="btn btn-primary btn-sm add-to-cart" data-id="${htmlEscape(productId)}" data-product-id="${htmlEscape(productId)}">Add to cart</button>
                </div>
            </div>
        </div>
    `;
}

function bindHeroCarouselEvents() {
    const prevButton = document.querySelector('.hero-carousel__nav--prev');
    const nextButton = document.querySelector('.hero-carousel__nav--next');
    const dotsContainer = document.getElementById('heroDots');

    if (prevButton) {
        prevButton.onclick = () => {
            moveHeroSlide(heroCarousel.currentIndex - 1);
            restartHeroAutoplay();
        };
    }

    if (nextButton) {
        nextButton.onclick = () => {
            moveHeroSlide(heroCarousel.currentIndex + 1);
            restartHeroAutoplay();
        };
    }

    if (dotsContainer) {
        dotsContainer.onclick = event => {
            const target = event.target.closest('.hero-dot');
            if (!target) return;
            const index = Number(target.dataset.index);
            if (!Number.isNaN(index)) {
                moveHeroSlide(index);
                restartHeroAutoplay();
            }
        };
    }
}

function moveHeroSlide(targetIndex) {
    const slideCount = heroCarousel.slides.length;
    if (!slideCount) return;

    const normalizedIndex = (targetIndex + slideCount) % slideCount;
    heroCarousel.currentIndex = normalizedIndex;

    const slideElements = document.querySelectorAll('.hero-slide');
    const dotElements = document.querySelectorAll('.hero-dot');
    const track = document.querySelector('.hero-carousel__track');

    // Move the track container - this is the correct approach for flexbox layout
    if (track) {
        // Calculate the percentage to move (negative because we're moving left)
        const translateX = -normalizedIndex * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }

    // Remove any individual slide transforms (they shouldn't have any)
    slideElements.forEach((slide) => {
        slide.style.transform = '';
        slide.style.left = '';
        slide.style.right = '';
    });

    // Update slide active states
    slideElements.forEach((slide, index) => {
        slide.classList.toggle('is-active', index === normalizedIndex);
    });

    // Update dot active states
    dotElements.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === normalizedIndex);
    });
}

function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroCarousel.slides.length <= 1) return;

    heroCarousel.timer = window.setInterval(() => {
        moveHeroSlide(heroCarousel.currentIndex + 1);
    }, heroCarousel.delay);
}

function stopHeroAutoplay() {
    if (heroCarousel.timer) {
        window.clearInterval(heroCarousel.timer);
        heroCarousel.timer = null;
    }
}

function restartHeroAutoplay() {
    stopHeroAutoplay();
    startHeroAutoplay();
}

function initialiseMessenger() {
    const toggle = document.querySelector(messengerSelectors.toggle);
    const windowPanel = document.querySelector(messengerSelectors.window);
    const closeButton = document.querySelector(messengerSelectors.close);
    const sendButton = document.querySelector(messengerSelectors.send);
    const input = document.querySelector(messengerSelectors.input);

    toggle?.addEventListener('click', () => {
        windowPanel?.classList.toggle('active');
    });

    closeButton?.addEventListener('click', () => {
        windowPanel?.classList.remove('active');
    });

    sendButton?.addEventListener('click', () => {
        const message = input?.value.trim();
        if (!message) return;

        addUserMessage(message);
        if (input) input.value = '';

        window.setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            addBotMessage(aiResponse);
        }, 1000);
    });

    input?.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton?.click();
        }
    });
}

function initialiseNewsletter() {
    const form = document.querySelector('.newsletter-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput?.value.trim();
        if (!email) return;

        alert(`Thank you for subscribing with email: ${email}`);
        if (emailInput) emailInput.value = '';
    });
}

function initialiseGlobalDelegates() {
    // Use event delegation to handle dynamically created buttons
    document.addEventListener('click', async event => {
        // Debug: log what was clicked
        const target = event.target;
        const clickedElement = target.closest('button, a');
        
        // Handle add to cart buttons (on product cards)
        const addButton = event.target.closest('.add-to-cart');
        if (addButton) {
            event.preventDefault();
            event.stopPropagation();
            const productId = addButton.dataset.id || addButton.dataset.productId;
            console.log('Add to cart clicked, productId:', productId, 'Button:', addButton);
            if (productId) {
                await handleAddToCart(productId);
            } else {
                console.error('Add to cart button missing product ID. Button attributes:', {
                    id: addButton.id,
                    class: addButton.className,
                    dataset: addButton.dataset,
                    innerHTML: addButton.innerHTML
                });
                alert('Unable to add product to cart. Product ID is missing.');
            }
            return false;
        }

        // Note: "Add to Cart" buttons only appear on product cards, not on sliders, banners, categories, or departments

        // Handle cart icon click - navigate to cart page with checkout parameter
        const cartIcon = event.target.closest('.cart-icon a');
        if (cartIcon && !event.target.closest('.cart-count')) {
            event.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return false;
            }
            // Navigate to cart page with checkout parameter to auto-open modal
            window.location.href = '/cart?checkout=true';
            return false;
        }

        // Handle view product buttons
        const viewButton = event.target.closest('.view-product');
        if (viewButton) {
            event.preventDefault();
            const productId = viewButton.dataset.id || viewButton.dataset.productId;
            if (productId) {
                handleViewProduct(productId);
            }
            return false;
        }
    }, true); // Use capture phase to catch events earlier
}

async function loadCartCount() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            updateCartCount(0);
            return;
        }

        const response = await fetchJSON('/api/cart/count', {
            method: 'GET'
        });

        if (response && typeof response.count === 'number') {
            updateCartCount(response.count);
        }
    } catch (error) {
        // If user is not logged in or token is invalid, set count to 0
        updateCartCount(0);
    }
}

function updateCartCount(count) {
    const cartCountEl = document.querySelector('.cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = String(count || 0);
    }
}

async function handleAddToCart(productId) {
    console.log('handleAddToCart called with productId:', productId);
    
    if (!productId) {
        console.error('handleAddToCart: No productId provided');
        alert('Product ID is missing. Cannot add to cart.');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('handleAddToCart: No token found, redirecting to login');
        alert('Please log in to add products to cart.');
        window.location.href = '/login';
        return;
    }

    console.log('handleAddToCart: Making API call with productId:', productId);

    try {
        const response = await fetchJSON('/api/cart/add', {
            method: 'POST',
            body: { productId, quantity: 1 }
        });

        console.log('handleAddToCart: API response:', response);
        console.log('handleAddToCart: Response totalItems:', response?.totalItems);

        if (response && typeof response.totalItems === 'number') {
            updateCartCount(response.totalItems);
            console.log('handleAddToCart: Cart count updated to:', response.totalItems);
            alert('Product added to cart!');
        } else {
            // Fallback: reload cart count from API
            console.warn('handleAddToCart: Response missing totalItems, reloading cart count from API');
            try {
                await loadCartCount();
            } catch (countError) {
                console.error('handleAddToCart: Error loading cart count:', countError);
                // Last resort: increment manually
                const cartCountEl = document.querySelector('.cart-count');
                if (cartCountEl) {
                    const currentCount = Number(cartCountEl.textContent) || 0;
                    updateCartCount(currentCount + 1);
                }
            }
            alert('Product added to cart!');
        }
    } catch (error) {
        console.error('Add to cart failed', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            stack: error.stack
        });
        
        let errorMessage = 'Unable to add product to cart.';
        if (error.status === 401) {
            errorMessage = 'Please log in to add products to cart.';
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else if (error.status === 400 || error.status === 404) {
            errorMessage = error.message || 'Product not available.';
        }
        
        alert(errorMessage);
    }
}

function handleViewProduct(productId) {
    if (!productId) return;
    window.location.href = `/product/${productId}`;
}

function addUserMessage(message) {
    const container = document.querySelector(messengerSelectors.messages);
    if (!container) return;

    container.insertAdjacentHTML('beforeend', `
        <div class="message user-message">
            <p>${message}</p>
        </div>
    `);
    scrollToBottom();
}

function addBotMessage(message) {
    const container = document.querySelector(messengerSelectors.messages);
    if (!container) return;

    container.insertAdjacentHTML('beforeend', `
        <div class="message bot-message">
            <p>${message}</p>
        </div>
    `);
    scrollToBottom();
}

function scrollToBottom() {
    const messengerBody = document.querySelector(messengerSelectors.body);
    if (!messengerBody) return;
    messengerBody.scrollTop = messengerBody.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return 'Hello! How can I help you today? You can ask me about our products, departments, or current offers.';
    }
    if (message.includes('medicine') || message.includes('medicines')) {
        return "We have a wide range of medicines for various health conditions. Our medicine department includes categories like allergy medicine, heart medicine, stomach medicine, and more. Would you like to know about any specific category?";
    }
    if (message.includes('cosmetics') || message.includes('makeup')) {
        return 'Our cosmetics department offers a variety of products including color cosmetics, skincare, and beauty accessories. We have products from top brands at competitive prices.';
    }
    if (message.includes('perfume') || message.includes('fragrance')) {
        return 'We have an extensive collection of perfumes for men and women from international brands. You can find both luxury and affordable options in our perfume department.';
    }
    if (message.includes('discount') || message.includes('offer') || message.includes('sale')) {
        return "We currently have special discounts on selected products. You can check our 'Special Offers' section on the homepage for the latest deals. Would you like to know about any specific department's offers?";
    }
    if (message.includes('delivery') || message.includes('shipping')) {
        return 'We offer home delivery across Pakistan. Standard delivery takes 3-5 working days, while express delivery takes 1-2 working days in major cities. Delivery charges may apply based on your location.';
    }
    if (message.includes('payment')) {
        return 'We accept multiple payment methods including cash on delivery, credit/debit cards, and online bank transfers. All transactions are secure and encrypted.';
    }
    if (message.includes('return') || message.includes('refund')) {
        return 'We have a 7-day return policy for most products. Items must be unused, in original packaging, and accompanied by the receipt. Some restrictions apply to medicines and personal care items.';
    }
    return 'Thank you for your message. For more specific information, you can browse our departments or contact our customer service at +92 300 1234567. Is there anything else I can help you with?';
}

function fetchOptionsFrom({ method = 'GET', body, headers, ...rest } = {}) {
    const options = { method, headers: { ...(headers || {}) }, ...rest };

    if (body !== undefined) {
        options.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
    }

    return options;
}

async function fetchJSON(url, options) {
    const fetchOpts = fetchOptionsFrom(options);
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token && !fetchOpts.headers['x-auth-token']) {
        fetchOpts.headers['x-auth-token'] = token;
    }
    
    const response = await fetch(url, fetchOpts);

    if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        
        // Try to get error message from response
        try {
            const errorData = await response.json();
            error.message = errorData.message || error.message;
        } catch (e) {
            // If response is not JSON, use default message
        }
        
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

function htmlEscape(content = '') {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}