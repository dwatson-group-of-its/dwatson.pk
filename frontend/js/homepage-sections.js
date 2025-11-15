/**
 * Homepage Sections Renderer
 * Renders dynamic homepage sections based on database configuration
 * Matches D.Watson Cosmetics style
 */

const HOMEPAGE_SECTION_RENDERERS = {
    heroSlider: renderHeroSlider,
    scrollingText: renderScrollingText,
    categoryFeatured: renderCategoryFeatured,
    categoryGrid: renderCategoryGrid,
    categoryCircles: renderCategoryCircles,
    productTabs: renderProductTabs,
    productCarousel: renderProductCarousel,
    bannerFullWidth: renderBannerFullWidth,
    videoBanner: renderVideoBanner,
    collectionLinks: renderCollectionLinks,
    newsletterSocial: renderNewsletterSocial,
    brandMarquee: renderBrandMarquee,
    customHTML: renderCustomHTML
};

// Load and render homepage sections
async function loadAndRenderHomepageSections() {
    const startTime = performance.now();
    try {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.info('Loading homepage sections...');
        }
        
        const response = await fetch('/api/homepage-sections/public');
        if (!response.ok) {
            const errorMsg = `Failed to load homepage sections: ${response.statusText}`;
            if (typeof window.Logger !== 'undefined') {
                window.Logger.error(errorMsg, new Error(response.statusText), { status: response.status });
            } else {
                console.warn(errorMsg);
            }
            return;
        }
        
        let sections = await response.json();
        if (!Array.isArray(sections) || sections.length === 0) {
            const msg = 'No homepage sections found';
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn(msg);
            } else {
                console.log(msg);
            }
            return;
        }
        
        // Sort by ordering
        sections.sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
        
        // Remove all categoryCircles sections - they are duplicates of category sections shown earlier
        sections = sections.filter(section => section.type !== 'categoryCircles');
        
        if (typeof window.Logger !== 'undefined') {
            window.Logger.info(`Found ${sections.length} homepage sections`, { count: sections.length });
        }
        
        // Render each section
        const mainContainer = document.querySelector('main');
        if (!mainContainer) {
            console.error('Main container not found');
            return;
        }
        
        // Use existing container or create it
        let homepageSectionsContainer = document.getElementById('homepage-sections-container');
        if (!homepageSectionsContainer) {
            homepageSectionsContainer = document.createElement('div');
            homepageSectionsContainer.id = 'homepage-sections-container';
            homepageSectionsContainer.className = 'homepage-sections-container';
            
            // Insert at the beginning of main
            if (mainContainer.firstChild) {
                mainContainer.insertBefore(homepageSectionsContainer, mainContainer.firstChild);
            } else {
                mainContainer.appendChild(homepageSectionsContainer);
            }
        }
        
        // Clear container before rendering new sections
        homepageSectionsContainer.innerHTML = '';
        
        // Hide old sections fallback if we have new sections
        const oldSectionsFallback = document.getElementById('old-sections-fallback');
        if (oldSectionsFallback && sections.length > 0) {
            oldSectionsFallback.style.display = 'none';
        }
        
        // Render each section and append to container
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            const index = i;
            const nextSection = sections[i + 1];
            const prevSection = sections[i - 1];
            
            // Check if current and next are both banners after a product section
            const isProductSection = section.type === 'productTabs' || section.type === 'productCarousel';
            const isBannerSection = section.type === 'bannerFullWidth';
            const nextIsBanner = nextSection && nextSection.type === 'bannerFullWidth';
            
            // If we have two consecutive banners, stack them
            if (isBannerSection && nextIsBanner) {
            const renderer = HOMEPAGE_SECTION_RENDERERS[section.type];
                const nextRenderer = HOMEPAGE_SECTION_RENDERERS[nextSection.type];
                
                if (renderer && nextRenderer) {
                    try {
                        // Render both banners
                        const banner1 = await renderer(section, index);
                        const banner2 = await nextRenderer(nextSection, index + 1);
                        
                        if (banner1 && banner2) {
                            // Create stacked container
                            const stackContainer = document.createElement('div');
                            stackContainer.className = 'banner-stack-container';
                            
                            // Wrap both banners in the stack
                            const bannerWrapper1 = document.createElement('div');
                            bannerWrapper1.className = 'banner-stack-item banner-stack-item--top';
                            bannerWrapper1.appendChild(banner1);
                            
                            const bannerWrapper2 = document.createElement('div');
                            bannerWrapper2.className = 'banner-stack-item banner-stack-item--bottom';
                            bannerWrapper2.appendChild(banner2);
                            
                            stackContainer.appendChild(bannerWrapper1);
                            stackContainer.appendChild(bannerWrapper2);
                            
                            homepageSectionsContainer.appendChild(stackContainer);
                            
                            // Skip next section since we already rendered it
                            i++;
                            continue;
                        }
                    } catch (error) {
                        console.error('Error rendering stacked banners:', error);
                    }
                }
            }
            
                        // Special handling for scrolling text - render at top before header
                        if (section.type === 'scrollingText') {
                const renderer = HOMEPAGE_SECTION_RENDERERS[section.type];
                if (renderer) {
                    try {
                        const sectionElement = await renderer(section, index);
                        if (sectionElement) {
                            const header = document.getElementById('header');
                            if (header && header.parentNode) {
                                header.parentNode.insertBefore(sectionElement, header);
                                if (typeof window.Logger !== 'undefined') {
                                    window.Logger.debug('Scrolling text inserted before header');
                                }
                                continue; // Skip adding to homepage container
                            }
                        }
                    } catch (error) {
                        console.error('Error rendering scrolling text:', error);
                    }
                }
                continue;
            }
            
            const renderer = HOMEPAGE_SECTION_RENDERERS[section.type];
            if (renderer) {
                try {
                    const sectionStartTime = performance.now();
                    const sectionElement = await renderer(section, index);
                    const sectionDuration = performance.now() - sectionStartTime;
                    
                    if (sectionElement) {
                        // Create wrapper element if needed
                        if (typeof sectionElement === 'string') {
                            const wrapper = document.createElement('div');
                            wrapper.innerHTML = sectionElement;
                            const firstChild = wrapper.firstElementChild;
                            if (firstChild) {
                                homepageSectionsContainer.appendChild(firstChild);
                            }
                        } else if (sectionElement instanceof Node) {
                            homepageSectionsContainer.appendChild(sectionElement);
                        }
                        
                        if (typeof window.Logger !== 'undefined') {
                            window.Logger.logSectionRender(section.name, section.type, true, null);
                            window.Logger.debug(`Section render time: ${sectionDuration.toFixed(2)}ms`, {
                                sectionName: section.name,
                                duration: sectionDuration
                            });
                        }
                        
                        // Add data attribute to track rendered sections
                        if (sectionElement instanceof Node) {
                            sectionElement.setAttribute('data-section-name', section.name);
                            sectionElement.setAttribute('data-section-order', section.ordering || 0);
                        } else if (sectionElement) {
                            const wrapper = document.createElement('div');
                            wrapper.innerHTML = typeof sectionElement === 'string' ? sectionElement : '';
                            const element = wrapper.firstElementChild;
                            if (element) {
                                element.setAttribute('data-section-name', section.name);
                                element.setAttribute('data-section-order', section.ordering || 0);
                            }
                        }
                    } else {
                        if (typeof window.Logger !== 'undefined') {
                            window.Logger.warn(`Section returned null: ${section.name}`, {
                                sectionName: section.name,
                                sectionType: section.type
                            });
                        }
                    }
                } catch (error) {
                    const errorMsg = `Error rendering section ${section.name} (${section.type})`;
                    if (typeof window.Logger !== 'undefined') {
                        window.Logger.logSectionRender(section.name, section.type, false, error);
                        window.Logger.error(errorMsg, error, {
                            sectionName: section.name,
                            sectionType: section.type,
                            sectionId: section._id
                        });
                    } else {
                        console.error(errorMsg, error);
                    }
                }
            } else {
                const warnMsg = `No renderer found for section type: ${section.type}`;
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.warn(warnMsg, {
                        sectionName: section.name,
                        sectionType: section.type
                    });
                } else {
                    console.warn(warnMsg);
                }
            }
        }
        
        // Initialize carousels and interactive elements after rendering
        initializeHomepageInteractions();
        
        const totalDuration = performance.now() - startTime;
        
        // Log all rendered sections for debugging
        const renderedSections = Array.from(homepageSectionsContainer.querySelectorAll('[data-section-type]'));
        const sectionList = renderedSections.map(s => ({
            name: s.getAttribute('data-section-name') || 'Unknown',
            type: s.getAttribute('data-section-type') || 'Unknown',
            order: s.getAttribute('data-section-order') || '0',
            visible: s.offsetHeight > 0 || s.offsetWidth > 0
        })).sort((a, b) => parseInt(a.order) - parseInt(b.order));
        
        if (typeof window.Logger !== 'undefined') {
            window.Logger.info(`Homepage sections loaded successfully in ${totalDuration.toFixed(2)}ms`, {
                sectionCount: sections.length,
                renderedCount: renderedSections.length,
                duration: totalDuration,
                sections: sectionList
            });
            
            // Log section summary to console
            console.log('\n📋 HOMEPAGE SECTIONS SUMMARY:');
            console.log(`Total sections in database: ${sections.length}`);
            console.log(`Rendered sections on page: ${renderedSections.length}`);
            console.log('\n✅ Rendered Sections:');
            sectionList.forEach((s, i) => {
                const visibility = s.visible ? '✅ Visible' : '⚠️ Hidden/Empty';
                console.log(`  ${i + 1}. ${s.name} (${s.type}) - Order: ${s.order} - ${visibility}`);
            });
            
            // Check for missing sections
            const renderedNames = sectionList.map(s => s.name.toLowerCase());
            const expectedNames = sections.map(s => s.name.toLowerCase());
            const missing = expectedNames.filter(name => !renderedNames.includes(name));
            if (missing.length > 0) {
                console.log('\n⚠️ Sections NOT Rendered:');
                missing.forEach(name => {
                    const section = sections.find(s => s.name.toLowerCase() === name);
                    console.log(`  - ${name} (${section?.type || 'unknown'}) - Order: ${section?.ordering || 0}`);
                    if (section && typeof window.Logger !== 'undefined') {
                        window.Logger.warn(`Section not rendered: ${name}`, {
                            sectionType: section.type,
                            sectionId: section._id,
                            config: section.config
                        });
                    }
                });
            }
            console.log('\n');
        } else {
            console.log(`✅ Homepage sections loaded: ${renderedSections.length}/${sections.length} sections rendered`);
        }
        
    } catch (error) {
        const errorMsg = 'Error loading homepage sections';
        if (typeof window.Logger !== 'undefined') {
            window.Logger.error(errorMsg, error, {});
        } else {
            console.error(errorMsg, error);
        }
    }
}

// Render Hero Slider
async function renderHeroSlider(section, index) {
    if (!section.config?.sliderIds || section.config.sliderIds.length === 0) {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.warn('Hero slider section has no slider IDs', { sectionId: section._id });
        }
        return null;
    }
    
    try {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.debug('Fetching sliders for hero section', { 
                sliderIds: section.config.sliderIds,
                sectionId: section._id 
            });
        }
        
        const slidersResponse = await fetch('/api/sliders');
        if (!slidersResponse.ok) {
            throw new Error(`Failed to fetch sliders: ${slidersResponse.statusText}`);
        }
        
        const allSliders = await slidersResponse.json();
        const sliders = allSliders.filter(s => 
            section.config.sliderIds.includes(s._id) && s.isActive
        ).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (sliders.length === 0) {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn('No active sliders found for hero section', { 
                    requestedIds: section.config.sliderIds,
                    availableSliders: allSliders.length 
                });
            }
            return null;
        }
        
        if (typeof window.Logger !== 'undefined') {
            window.Logger.debug(`Found ${sliders.length} active sliders`, { 
                sliderCount: sliders.length,
                sliderTitles: sliders.map(s => s.title) 
            });
        }
        
        const autoplay = section.config.autoplay !== false;
        const autoplaySpeed = section.config.autoplaySpeed || 3000;
        const showArrows = section.config.showArrows !== false;
        const showDots = section.config.showDots !== false;
        
        const sectionHtml = `
            <section class="hero-carousel position-relative homepage-section" data-section-type="heroSlider" data-section-id="${section._id}">
                <div class="hero-overlay"></div>
                <div class="hero-carousel__viewport">
                    <div class="hero-carousel__track" id="heroSlides_${index}">
                        ${sliders.map((slider, idx) => {
                            const imageUrl = slider.imageUpload?.url || slider.image || getGlobalFallbackImage();
                            const mobileImageUrl = slider.imageMobileUpload?.url || slider.imageMobile || imageUrl;
                            return `
                                <div class="hero-carousel__slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
                                    <picture>
                                        <source media="(max-width: 767px)" srcset="${htmlEscape(mobileImageUrl)}">
                                        <img src="${htmlEscape(imageUrl)}" alt="${htmlEscape(slider.imageAlt || slider.title)}" loading="${idx === 0 ? 'eager' : 'lazy'}">
                                    </picture>
                                    <div class="hero-carousel__content">
                                        ${slider.title ? `<h1 class="hero-slide-title">${htmlEscape(slider.title)}</h1>` : ''}
                                        ${slider.description ? `<p class="hero-slide-description">${htmlEscape(slider.description)}</p>` : ''}
                                        ${slider.buttonText && slider.buttonLink ? `
                                            <a href="${htmlEscape(slider.buttonLink || slider.link)}" class="btn btn-primary btn-lg hero-slide-button">
                                                ${htmlEscape(slider.buttonText)}
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    ${showDots ? `<div class="hero-carousel__dots" id="heroDots_${index}">
                        ${sliders.map((_, idx) => `<button class="dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}" aria-label="Go to slide ${idx + 1}"></button>`).join('')}
                    </div>` : ''}
                    ${showArrows ? `
                        <button class="hero-carousel__nav hero-carousel__nav--prev" type="button" aria-label="Previous slide">
                            <span>&lsaquo;</span>
                        </button>
                        <button class="hero-carousel__nav hero-carousel__nav--next" type="button" aria-label="Next slide">
                            <span>&rsaquo;</span>
                        </button>
                    ` : ''}
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        const sectionElement = tempDiv.firstElementChild;
        
        // Initialize carousel
        if (sectionElement) {
            initHeroCarousel(sectionElement, { autoplay, autoplaySpeed, showArrows, showDots });
        }
        
        return sectionElement;
    } catch (error) {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.error('Error rendering hero slider', error, {
                sectionId: section._id,
                sliderIds: section.config?.sliderIds
            });
        } else {
            console.error('Error rendering hero slider:', error);
        }
        return null;
    }
}

// Render Scrolling Text
function renderScrollingText(section, index) {
    const items = section.config?.items || [];
    if (items.length === 0) return null;
    
    const scrollSpeed = section.config?.scrollSpeed || 12;
    // Force white background for top slides
    const bgColor = '#ffffff';
    // Red font color for slides
    const textColor = section.config?.textColor || '#d93939';
    
    const sectionHtml = `
        <section class="scrolling-text homepage-section" 
                 data-section-type="scrollingText" 
                 data-section-id="${section._id}"
                 style="background-color: ${bgColor}; color: ${textColor}; height: 50px; padding: 12px 0;">
            <div class="scrolling-text__wrapper">
                <div class="scrolling-text__inner" style="--scroll-speed: ${scrollSpeed}s;">
                    <div class="scrolling-text__content">
                        ${items.map((item, idx) => `
                            <span class="scrolling-text__item">${htmlEscape(item)}</span>
                            ${idx < items.length - 1 ? '<i class="la la-heart scrolling-text__icon" aria-hidden="true"></i>' : ''}
                        `).join('')}
                        <div class="scrolling-text__spacer"></div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    return tempDiv.firstElementChild;
}

// Render Category Featured Grid
async function renderCategoryFeatured(section, index) {
    const categoryIds = section.config?.categoryIds || [];
    if (categoryIds.length === 0) {
        // Load featured categories if no specific IDs
        return await renderCategoryFeaturedFallback(section, index);
    }
    
    try {
        // Check if section has a banner to render first
        let sectionBanner = null;
        if (section.config?.sectionBannerId) {
            sectionBanner = await getSectionBanner(section.config.sectionBannerId);
        }
        
        const categoriesResponse = await fetch('/api/categories');
        const allCategories = await categoriesResponse.json();
        const categories = allCategories.filter(cat => 
            categoryIds.includes(cat._id) && cat.isActive
        );
        
        if (categories.length === 0) return null;
        
        const gridColumns = section.config?.gridColumns || 4;
        const showTitle = section.config?.showTitle !== false;
        
        const sectionHtml = `
            <section class="category-featured homepage-section" data-section-type="categoryFeatured" data-section-id="${section._id}">
                ${sectionBanner ? `
                    <div class="container-fluid px-0 mb-4">
                        <a href="${htmlEscape(sectionBanner.link || '#')}" class="banner-full-width__link">
                            <img src="${htmlEscape(sectionBanner.imageUpload?.url || sectionBanner.image || getGlobalFallbackImage())}" 
                                 alt="${htmlEscape(sectionBanner.imageAlt || sectionBanner.title || 'Banner')}" 
                                 class="banner-full-width__image"
                                 loading="lazy">
                        </a>
                    </div>
                ` : ''}
                <div class="container py-5">
                    ${section.title ? `
                        <div class="section-header mb-4">
                            <h2>${htmlEscape(section.title)}</h2>
                            ${section.subtitle ? `<p class="text-muted">${htmlEscape(section.subtitle)}</p>` : ''}
                        </div>
                    ` : ''}
                    <div class="row g-4" style="--grid-cols: ${gridColumns};">
                        ${categories.map(cat => {
                            const imageUrl = cat.imageUpload?.url || cat.image || getGlobalFallbackImage();
                            return `
                                <div class="col-lg-${12 / gridColumns} col-md-6 col-sm-6">
                                    <a href="/category/${cat._id}" class="cat-grid-item hover-zoom">
                                        <div class="cat_grid_item__image-wrapper">
                                            <img src="${htmlEscape(imageUrl)}" 
                                                 alt="${htmlEscape(cat.imageAlt || cat.name)}" 
                                                 class="cat-grid-img"
                                                 loading="lazy">
                                        </div>
                                        ${showTitle ? `<h4 class="cat-grid-title mt-3">${htmlEscape(cat.name)}</h4>` : ''}
                                    </a>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering category featured:', error);
        return null;
    }
}

async function renderCategoryFeaturedFallback(section, index) {
    try {
        const categoriesResponse = await fetch('/api/categories');
        const allCategories = await categoriesResponse.json();
        const categories = allCategories.filter(cat => cat.isFeatured && cat.isActive);
        
        if (!categories || categories.length === 0) return null;
        
        const gridColumns = section.config?.gridColumns || 4;
        
        const sectionHtml = `
            <section class="category-featured homepage-section" data-section-type="categoryFeatured" data-section-id="${section._id}">
                <div class="container py-5">
                    ${section.title ? `
                        <div class="section-header mb-4">
                            <h2>${htmlEscape(section.title)}</h2>
                        </div>
                    ` : ''}
                    <div class="row g-4">
                        ${categories.slice(0, gridColumns * 2).map(cat => {
                            const imageUrl = cat.imageUpload?.url || cat.image || getGlobalFallbackImage();
                            return `
                                <div class="col-lg-${12 / gridColumns} col-md-6 col-sm-6">
                                    <a href="/category/${cat._id}" class="cat-grid-item hover-zoom">
                                        <div class="cat_grid_item__image-wrapper">
                                            <img src="${htmlEscape(imageUrl)}" 
                                                 alt="${htmlEscape(cat.name)}" 
                                                 class="cat-grid-img"
                                                 loading="lazy">
                                        </div>
                                        <h4 class="cat-grid-title mt-3">${htmlEscape(cat.name)}</h4>
                                    </a>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering category featured fallback:', error);
        return null;
    }
}

// Render Category Grid
function renderCategoryGrid(section, index) {
    // Similar to categoryFeatured but with different styling
    return renderCategoryFeatured(section, index);
}

// Render Category Circles
async function renderCategoryCircles(section, index) {
    const categoryIds = section.config?.categoryIds || [];
    
    try {
        const categoriesResponse = await fetch('/api/categories');
        const allCategories = await categoriesResponse.json();
        const categories = categoryIds.length > 0
            ? allCategories.filter(cat => categoryIds.includes(cat._id) && cat.isActive)
            : allCategories.filter(cat => (cat.isFeatured || cat.isActive) && cat.isActive).slice(0, 8);
        
        if (categories.length === 0) return null;
        
        const sectionHtml = `
            <section class="category-circles homepage-section" data-section-type="categoryCircles" data-section-id="${section._id}">
                <div class="container py-5">
                    ${section.title ? `
                        <div class="section-header text-center mb-4">
                            <h2>${htmlEscape(section.title)}</h2>
                            ${section.subtitle ? `<p class="text-muted">${htmlEscape(section.subtitle)}</p>` : ''}
                        </div>
                    ` : ''}
                    <div class="category-circles__grid">
                        ${categories.map(cat => {
                            const imageUrl = cat.imageUpload?.url || cat.image || getGlobalFallbackImage();
                            return `
                                <a href="/category/${cat._id}" class="category-circle-item">
                                    <div class="category-circle__image">
                                        <img src="${htmlEscape(imageUrl)}" 
                                             alt="${htmlEscape(cat.name)}" 
                                             loading="lazy">
                                    </div>
                                    <span class="category-circle__name">${htmlEscape(cat.name)}</span>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering category circles:', error);
        return null;
    }
}

// Render Product Tabs
async function renderProductTabs(section, index) {
    const tabs = section.config?.tabs || [];
    if (tabs.length === 0) return null;
    
    try {
        // Check if section has a banner to render first
        const sectionBanner = section.config?.sectionBannerId ? await getSectionBanner(section.config.sectionBannerId) : null;
        const hasMultipleTabs = tabs.length > 1;
        
        const sectionHtml = `
            <section class="product-tabs homepage-section" data-section-type="productTabs" data-section-id="${section._id}">
                ${sectionBanner ? `
                    <div class="container-fluid px-0 mb-4">
                        <a href="${htmlEscape(sectionBanner.link || '#')}" class="banner-full-width__link">
                            <img src="${htmlEscape(sectionBanner.imageUpload?.url || sectionBanner.image || getGlobalFallbackImage())}" 
                                 alt="${htmlEscape(sectionBanner.imageAlt || sectionBanner.title || 'Banner')}" 
                                 class="banner-full-width__image"
                                 loading="lazy">
                        </a>
                    </div>
                ` : ''}
                <div class="container py-5">
                    ${section.title ? `
                        <div class="section-header mb-4">
                            <h2>${htmlEscape(section.title)}</h2>
                        </div>
                    ` : ''}
                    <div class="product-tabs__wrapper">
                        ${hasMultipleTabs ? `
                            <ul class="product-tabs__nav nav nav-tabs" role="tablist">
                                ${tabs.map((tab, idx) => `
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link ${idx === 0 ? 'active' : ''}" 
                                                data-bs-toggle="tab" 
                                                data-bs-target="#tab_${index}_${idx}" 
                                                type="button">
                                            ${htmlEscape(tab.label || `Tab ${idx + 1}`)}
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        ` : ''}
                        <div class="tab-content">
                            ${tabs.map((tab, idx) => `
                                <div class="tab-pane fade ${idx === 0 ? 'show active' : ''}" 
                                     id="tab_${index}_${idx}" 
                                     role="tabpanel">
                                    <div class="row g-4" id="tabProducts_${index}_${idx}">
                                        <!-- Products will be loaded here -->
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        const sectionElement = tempDiv.firstElementChild;
        
        // Load products for each tab
        tabs.forEach(async (tab, idx) => {
            await loadTabProducts(section, tab, index, idx);
        });
        
        return sectionElement;
    } catch (error) {
        console.error('Error rendering product tabs:', error);
        return null;
    }
}

async function loadTabProducts(section, tab, sectionIndex, tabIndex) {
    try {
        const categoryId = section.config?.categoryId || tab.categoryId || '';
        const filter = tab.filter || '';
        const limit = tab.limit || 8;
        
        let url = '/api/products?limit=' + limit;
        if (categoryId) url += '&categoryId=' + categoryId;
        
        // Handle filter - can be string ('new', 'trending', 'discounted') or object
        if (filter) {
            if (typeof filter === 'string') {
                url += '&filter=' + filter;
            } else if (typeof filter === 'object') {
                if (filter.isFeatured) url += '&filter=featured';
                if (filter.isNewArrival) url += '&filter=new';
                if (filter.isTrending) url += '&filter=trending';
                if (filter.isDiscounted) url += '&filter=discounted';
            }
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorMsg = `Failed to load products for tab ${tab.label || tabIndex}: ${response.statusText}`;
            if (typeof window.Logger !== 'undefined') {
                window.Logger.error(errorMsg, new Error(response.statusText), { 
                    sectionIndex, 
                    tabIndex, 
                    url, 
                    status: response.status 
                });
            } else {
                console.error(errorMsg);
            }
            
            const container = document.getElementById(`tabProducts_${sectionIndex}_${tabIndex}`);
            if (container) {
                container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No products available</p></div>';
            }
            return;
        }
        
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        
        const container = document.getElementById(`tabProducts_${sectionIndex}_${tabIndex}`);
        if (!container) {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn(`Container not found for tab ${tabIndex}`, { sectionIndex, tabIndex });
            }
            return;
        }
        
        if (products.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No products available for this tab</p></div>';
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn(`No products found for tab ${tab.label || tabIndex}`, { sectionIndex, tabIndex, url });
            }
            return;
        }
        
        container.innerHTML = products.map(product => renderProductCard(product)).join('');
        
        if (typeof window.Logger !== 'undefined') {
            window.Logger.debug(`Loaded ${products.length} products for tab ${tab.label || tabIndex}`, {
                sectionIndex,
                tabIndex,
                productCount: products.length
            });
        }
    } catch (error) {
        const errorMsg = `Error loading tab products: ${error.message}`;
        if (typeof window.Logger !== 'undefined') {
            window.Logger.error(errorMsg, error, { sectionIndex, tabIndex });
        } else {
            console.error(errorMsg, error);
        }
        
        const container = document.getElementById(`tabProducts_${sectionIndex}_${tabIndex}`);
        if (container) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-danger">Error loading products. Please refresh the page.</p></div>';
        }
    }
}

// Render Product Carousel
async function renderProductCarousel(section, index) {
    try {
        const categoryId = section.config?.categoryId || '';
        const limit = section.config?.limit || 10;
        const autoplay = section.config?.autoplay !== false;
        
        let url = '/api/products?limit=' + limit;
        if (categoryId) url += '&categoryId=' + categoryId;
        
        // Check filter from config (supports string filter or boolean flags)
        if (section.config?.filter) {
            const filter = section.config.filter;
            if (typeof filter === 'string') {
                url += '&filter=' + filter;
            } else if (filter === 'trending' || filter === 'new' || filter === 'discounted' || filter === 'featured') {
                url += '&filter=' + filter;
            }
        }
        if (section.config?.isFeatured) url += '&filter=featured';
        if (section.config?.isNewArrival) url += '&filter=new';
        if (section.config?.isTrending) url += '&filter=trending';
        
        const response = await fetch(url);
        if (!response.ok) {
            const errorMsg = `Failed to load products for carousel: ${response.statusText}`;
            if (typeof window.Logger !== 'undefined') {
                window.Logger.error(errorMsg, new Error(response.statusText), { 
                    sectionId: section._id, 
                    sectionName: section.name,
                    url, 
                    status: response.status 
                });
            }
            return null;
        }
        
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        
        if (products.length === 0) {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn(`No products found for carousel section: ${section.name}`, {
                    sectionId: section._id,
                    url
                });
            }
            return null;
        }
        
        const sectionHtml = `
            <section class="product-carousel homepage-section" data-section-type="productCarousel" data-section-id="${section._id}">
                <div class="container py-5">
                    ${section.title ? `
                        <div class="section-header mb-4">
                            <h2>${htmlEscape(section.title)}</h2>
                            ${section.subtitle ? `<p class="text-muted">${htmlEscape(section.subtitle)}</p>` : ''}
                        </div>
                    ` : ''}
                    <div class="product-carousel__wrapper">
                        <div class="product-carousel__track" id="productCarousel_${index}" data-autoplay="${autoplay}">
                            ${products.map(product => `
                                <div class="product-carousel__slide">
                                    ${renderProductCard(product)}
                                </div>
                            `).join('')}
                        </div>
                        <button class="product-carousel__nav product-carousel__nav--prev" aria-label="Previous">
                            <span>&lsaquo;</span>
                        </button>
                        <button class="product-carousel__nav product-carousel__nav--next" aria-label="Next">
                            <span>&rsaquo;</span>
                        </button>
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        const sectionElement = tempDiv.firstElementChild;
        
        // Initialize carousel
        if (sectionElement) {
            initProductCarousel(sectionElement, { autoplay });
        }
        
        return sectionElement;
    } catch (error) {
        console.error('Error rendering product carousel:', error);
        return null;
    }
}

// Render Banner Full Width
async function renderBannerFullWidth(section, index) {
    const bannerId = section.config?.bannerId;
    if (!bannerId) {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.warn('Banner section has no banner ID', { sectionId: section._id });
        }
        return null;
    }
    
    try {
        const bannerResponse = await fetch(`/api/banners/detail/${bannerId}`);
        
        if (!bannerResponse.ok) {
            if (bannerResponse.status === 401) {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.error('Banner fetch unauthorized (401)', new Error('Unauthorized'), { bannerId, sectionId: section._id });
                } else {
                    console.error('Banner fetch unauthorized (401):', bannerId);
                }
                // Try fallback - use banner image from all banners endpoint
                const allBannersResponse = await fetch('/api/banners');
                if (allBannersResponse.ok) {
                    const allBanners = await allBannersResponse.json();
                    const banner = allBanners.find(b => b._id === bannerId);
                    if (banner && banner.isActive) {
                        return renderBannerHTML(banner, section);
                    }
                }
            } else if (bannerResponse.status === 404) {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.warn('Banner not found (404)', { bannerId, sectionId: section._id });
                }
            } else {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.error('Banner fetch failed', new Error(`HTTP ${bannerResponse.status}`), { bannerId, sectionId: section._id, status: bannerResponse.status });
                } else {
                    console.error('Banner fetch failed:', bannerResponse.status, bannerId);
                }
            }
            return null;
        }
        
        const banner = await bannerResponse.json();
        
        if (!banner || !banner.isActive) {
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn('Banner is inactive or not found', { bannerId, sectionId: section._id, bannerActive: banner?.isActive });
            }
            return null;
        }
        
        return renderBannerHTML(banner, section);
    } catch (error) {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.error('Error rendering banner', error, { bannerId, sectionId: section._id });
        } else {
            console.error('Error rendering banner:', error);
        }
        return null;
    }
}

function renderBannerHTML(banner, section) {
    const imageUrl = banner.imageUpload?.url || banner.image || getGlobalFallbackImage();
    // Trim and check for non-empty title
    const bannerTitle = (banner.title && String(banner.title).trim()) || '';
    const bannerDescription = (banner.description && String(banner.description).trim()) || '';
    const hasTitle = bannerTitle.length > 0;
    
    const sectionHtml = `
        <section class="banner-full-width homepage-section" data-section-type="bannerFullWidth" data-section-id="${section._id}">
            ${hasTitle ? `
                <div class="container">
                    <div class="banner-full-width__header">
                        <h2 class="banner-full-width__title">${htmlEscape(bannerTitle)}</h2>
                        ${bannerDescription ? `<p class="banner-full-width__description">${htmlEscape(bannerDescription)}</p>` : ''}
                    </div>
                </div>
            ` : ''}
            <div class="container-fluid px-0">
                <a href="${htmlEscape(banner.link || '#')}" class="banner-full-width__link">
                    <img src="${htmlEscape(imageUrl)}" 
                         alt="${htmlEscape(banner.imageAlt || banner.title || 'Banner')}" 
                         class="banner-full-width__image"
                         loading="lazy">
                </a>
            </div>
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    return tempDiv.firstElementChild;
}

// Helper: Get section banner (for banners before sections)
async function getSectionBanner(bannerId) {
    try {
        const response = await fetch(`/api/banners/detail/${bannerId}`);
        if (!response.ok) {
            // Try fallback - fetch from all banners
            const allBannersResponse = await fetch('/api/banners');
            if (allBannersResponse.ok) {
                const allBanners = await allBannersResponse.json();
                return allBanners.find(b => b._id === bannerId && b.isActive) || null;
            }
            return null;
        }
        const banner = await response.json();
        return banner && banner.isActive ? banner : null;
    } catch (error) {
        if (typeof window.Logger !== 'undefined') {
            window.Logger.warn('Error fetching section banner', { bannerId, error: error.message });
        }
        return null;
    }
}

// Render Video Banner
async function renderVideoBanner(section, index) {
    try {
        // Fetch video banner from API
        let videoBanner = null;
        
        try {
            const response = await fetch(`/api/video-banners/public`);
            if (response.ok) {
                const responseData = await response.json();
                console.log('Video banners API response:', responseData);
                
                // Handle different response formats
                const banners = Array.isArray(responseData) ? responseData : (responseData.videoBanners || responseData.data || []);
                
                if (!Array.isArray(banners)) {
                    console.error('Invalid video banners response format:', responseData);
                    return null;
                }
                
                // Try to get video banner ID from config
                const videoBannerId = section.config?.videoBannerId;
                if (videoBannerId) {
                    videoBanner = banners.find(b => b._id === videoBannerId);
                    if (!videoBanner && banners.length > 0) {
                        // Use first active video banner if ID not found
                        console.warn(`Video banner with ID ${videoBannerId} not found, using first active banner`);
                        videoBanner = banners[0];
                    }
                } else {
                    // Use first active video banner
                    if (banners.length > 0) {
                        videoBanner = banners[0];
                        console.log('Using first active video banner:', videoBanner.title || videoBanner._id);
                    }
                }
            } else {
                console.error('Failed to fetch video banners:', response.status, response.statusText);
            }
        } catch (fetchError) {
            console.error('Error fetching video banners:', fetchError);
        }
        
        if (!videoBanner || !videoBanner.videoUrl) {
            console.warn('No video banner found or no video URL available');
            return null;
        }
        
        let videoEmbedUrl = '';
        const videoType = videoBanner.videoType || 'youtube';
        const videoUrl = videoBanner.videoUrl;
        
        // Generate embed URL based on video type
        if (videoType === 'youtube') {
            // Extract YouTube video ID
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
            const match = videoUrl.match(youtubeRegex);
            if (match && match[1]) {
                const videoId = match[1];
                // Add high quality parameters: hd=1 for HD, rel=0 to hide related videos, modestbranding=1
                videoEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${videoBanner.autoplay ? 1 : 0}&loop=${videoBanner.loop ? 1 : 0}&mute=${videoBanner.muted ? 1 : 0}&controls=${videoBanner.controls ? 1 : 0}&playlist=${videoId}&hd=1&vq=hd1080&rel=0&modestbranding=1&playsinline=1`;
            } else {
                videoEmbedUrl = videoUrl; // Fallback to original URL
            }
        } else if (videoType === 'vimeo') {
            // Extract Vimeo video ID
            const vimeoRegex = /vimeo\.com\/(\d+)/;
            const match = videoUrl.match(vimeoRegex);
            if (match && match[1]) {
                // Add quality parameter for Vimeo
                videoEmbedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=${videoBanner.autoplay ? 1 : 0}&loop=${videoBanner.loop ? 1 : 0}&muted=${videoBanner.muted ? 1 : 0}&quality=1080p&background=1`;
            } else {
                videoEmbedUrl = videoUrl; // Fallback to original URL
            }
        } else {
            // Direct video URL (MP4, WebM, etc.)
            videoEmbedUrl = videoUrl;
        }
        
        // Helper function to resolve image URL
        function resolveImageUrl(item) {
            if (!item) return null;
            if (item.posterImageUpload && item.posterImageUpload.url) {
                return item.posterImageUpload.url;
            }
            if (item.imageUpload && item.imageUpload.url) {
                return item.imageUpload.url;
            }
            if (item.posterImage) {
                return item.posterImage;
            }
            if (item.image) {
                return item.image;
            }
            return null;
        }
        
        const posterUrl = resolveImageUrl(videoBanner) || '';
        const overlayText = videoBanner.title || section.config?.overlayText || '';
        const description = videoBanner.description || '';
        const ctaText = videoBanner.buttonText || section.config?.ctaText || '';
        const ctaLink = videoBanner.buttonLink || videoBanner.link || section.config?.ctaLink || '#';
        
        let videoElement = '';
        if (videoType === 'youtube' || videoType === 'vimeo') {
            // Use iframe for YouTube/Vimeo with full coverage (CSS handles positioning)
            videoElement = `<iframe src="${htmlEscape(videoEmbedUrl)}" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            // Use video tag for direct URLs
            videoElement = `
                <video class="video-banner__video" autoplay="${videoBanner.autoplay}" loop="${videoBanner.loop}" muted="${videoBanner.muted}" controls="${videoBanner.controls}" playsinline ${posterUrl ? `poster="${htmlEscape(posterUrl)}"` : ''}>
                    <source src="${htmlEscape(videoEmbedUrl)}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        }
    
    const sectionHtml = `
        <section class="video-banner homepage-section" data-section-type="videoBanner" data-section-id="${section._id}">
                ${ctaLink && ctaLink !== '#' ? `<a href="${htmlEscape(ctaLink)}" class="video-banner__link">` : ''}
            <div class="video-banner__wrapper">
                    ${videoElement}
                    ${(overlayText || description || ctaText) ? `
                <div class="video-banner__overlay">
                            ${overlayText ? `<h2 class="video-banner__title">${htmlEscape(overlayText)}</h2>` : ''}
                            ${description ? `<p class="video-banner__description">${htmlEscape(description)}</p>` : ''}
                            ${ctaText ? `<span class="btn btn-primary btn-lg">${htmlEscape(ctaText)}</span>` : ''}
                </div>
                    ` : ''}
            </div>
                ${ctaLink && ctaLink !== '#' ? `</a>` : ''}
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering video banner:', error);
        return null;
    }
}

// Render Collection Links
async function renderCollectionLinks(section, index) {
    try {
        const categoriesResponse = await fetch('/api/categories');
        const allCategories = await categoriesResponse.json();
        const categories = allCategories.filter(cat => cat.isFeatured && cat.isActive);
        
        if (!categories || categories.length === 0) return null;
        
        const sectionHtml = `
            <section class="collection-links homepage-section" data-section-type="collectionLinks" data-section-id="${section._id}">
                <div class="container py-4">
                    <div class="collection-links__grid">
                        ${categories.slice(0, 10).map(cat => `
                            <a href="/category/${cat._id}" class="collection-link-item">
                                ${htmlEscape(cat.name)}
                            </a>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionHtml;
        return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering collection links:', error);
        return null;
    }
}

// Render Newsletter & Social
function renderNewsletterSocial(section, index) {
    const newsletterTitle = section.config?.newsletterTitle || section.title || 'Subscribe to our newsletter';
    const newsletterDesc = section.config?.newsletterDesc || section.description || 'Get updates on new products and special offers';
    const socialLinks = section.config?.socialLinks || {};
    
    const sectionHtml = `
        <section class="newsletter-social homepage-section" data-section-type="newsletterSocial" data-section-id="${section._id}">
            <div class="container py-5">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                        <h3>${htmlEscape(newsletterTitle)}</h3>
                        <p>${htmlEscape(newsletterDesc)}</p>
                        <form class="newsletter-form" id="newsletterForm_${index}">
                            <div class="input-group">
                                <input type="email" class="form-control" placeholder="Enter your email" required>
                                <button class="btn btn-primary" type="submit">Subscribe</button>
                            </div>
                        </form>
                    </div>
                    ${Object.keys(socialLinks).length > 0 ? `
                        <div class="col-lg-6 text-end">
                            <div class="social-links">
                                ${Object.entries(socialLinks).map(([platform, url]) => `
                                    <a href="${htmlEscape(url)}" target="_blank" rel="noopener" class="social-link">
                                        <i class="fab fa-${platform}"></i>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    const sectionElement = tempDiv.firstElementChild;
    
    // Attach newsletter form handler
    if (sectionElement) {
        const form = sectionElement.querySelector(`#newsletterForm_${index}`);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]').value;
                // Handle newsletter subscription
                console.log('Newsletter subscription:', email);
                alert('Thank you for subscribing!');
                form.reset();
            });
        }
    }
    
    return sectionElement;
}

// Render Brand Marquee
async function renderBrandMarquee(section, index) {
    try {
        console.log('Rendering brand marquee section:', section.name || section._id);
        
        // Fetch active brands from API
        let brands = [];
        try {
            const response = await fetch('/api/brands/public');
            if (response.ok) {
                const apiBrands = await response.json();
                // Ensure it's an array
                brands = Array.isArray(apiBrands) ? apiBrands : (apiBrands.brands || apiBrands.data || []);
                console.log(`Fetched ${brands.length} brands from API for brand marquee`);
            } else {
                console.warn('Failed to fetch brands from API:', response.status, response.statusText);
            }
        } catch (fetchError) {
            console.error('Error fetching brands from API:', fetchError);
        }
        
        // If no brands from API, check config
        if (brands.length === 0) {
    const logos = section.config?.logos || [];
            if (Array.isArray(logos) && logos.length > 0) {
                brands = logos;
                console.log(`Using ${brands.length} brands from section config`);
            }
        }
        
        // Filter out brands without images
        brands = brands.filter(brand => {
            const hasImage = brand.image || brand.logo;
            if (!hasImage) {
                console.warn('Skipping brand without image:', brand.name || brand);
            }
            return hasImage;
        });
        
        // If still no brands, return null (don't render empty section)
        if (!brands || brands.length === 0) {
            console.log('No brands with images found to display in brand marquee');
            if (typeof window.Logger !== 'undefined') {
                window.Logger.warn('Brand marquee section not rendered: No brands with images available', {
                    sectionType: 'brandMarquee',
                    sectionId: section._id
                });
            }
            return null;
        }
        
        console.log(`Rendering ${brands.length} brands in brand marquee`);
    
    const sectionHtml = `
        <section class="brand-marquee homepage-section" data-section-type="brandMarquee" data-section-id="${section._id}">
            <div class="container py-5">
                ${section.title ? `
                    <div class="section-header text-center mb-4">
                        <h2>${htmlEscape(section.title)}</h2>
                        ${section.subtitle ? `<p class="text-muted">${htmlEscape(section.subtitle)}</p>` : ''}
                    </div>
                ` : ''}
                <div class="brand-marquee__inner">
                    ${brands.map(brand => {
                        const logoUrl = brand.image || brand.logo || '';
                        const brandName = brand.name || brand.alt || 'Brand';
                        const brandAlt = brand.alt || brandName;
                            const brandLink = brand.link || '';
                            
                            if (!logoUrl || logoUrl === 'null' || logoUrl === 'undefined') {
                                console.warn('Skipping brand without valid image URL:', brandName);
                                return ''; // Skip brands without images
                            }
                            
                            // Wrap in link if provided
                            // Properly escape JavaScript strings for inline handlers using JSON.stringify
                            const escapedLogoUrl = JSON.stringify(String(logoUrl || ''));
                            const escapedBrandName = JSON.stringify(String(brandName || ''));
                            const logoHtml = `
                            <div class="brand-marquee__item">
                                    ${brandLink ? `<a href="${htmlEscape(brandLink)}" target="_blank" rel="noopener">` : '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">'}
                                    <img src="${htmlEscape(logoUrl)}" alt="${htmlEscape(brandAlt)}" loading="lazy" 
                                         onerror="console.error('Failed to load brand image:', ${escapedLogoUrl}, 'for brand:', ${escapedBrandName}); this.closest('.brand-marquee__item').style.display='none';"
                                         onload="console.log('✅ Loaded brand image:', ${escapedBrandName}, 'from:', ${escapedLogoUrl});">
                                    ${brandLink ? `</a>` : '</div>'}
                            </div>
                        `;
                            return logoHtml;
                        }).filter(html => html !== '').join('')}
                </div>
            </div>
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    return tempDiv.firstElementChild;
    } catch (error) {
        console.error('Error rendering brand marquee:', error);
        return null;
    }
}

// Render Custom HTML
function renderCustomHTML(section, index) {
    const html = section.config?.html || '';
    if (!html) return null;
    
    const sectionHtml = `
        <section class="custom-html homepage-section" data-section-type="customHTML" data-section-id="${section._id}">
            ${html}
        </section>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sectionHtml;
    return tempDiv.firstElementChild;
}

// Helper: Render Product Card
function renderProductCard(product) {
    const imageUrl = product.imageUpload?.url || product.image || getGlobalFallbackImage();
    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
    const hasDiscount = product.discount > 0;
    const isSoldOut = product.stockQuantity === 0 || product.isOutOfStock || false;
    const productId = product._id || product.id;
    
    return `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="product-card">
                <div class="product-card__image">
                    <a href="/product/${productId}" class="product-card__link">
                        <img src="${htmlEscape(imageUrl)}" 
                             alt="${htmlEscape(product.imageAlt || product.name)}" 
                             loading="lazy">
                    </a>
                    ${hasDiscount ? `<span class="product-card__badge product-card__badge--discount">-${product.discount}%</span>` : ''}
                    ${isSoldOut ? `<span class="product-card__badge product-card__badge--soldout">Sold Out</span>` : ''}
                    <button class="product-card__wishlist" 
                            data-product-id="${productId}"
                            title="Add to Wishlist"
                            aria-label="Add to Wishlist">
                        <i class="icon-heart"></i>
                    </button>
                </div>
                <div class="product-card__body">
                    <a href="/product/${productId}" class="product-card__link">
                        <h5 class="product-card__title">${htmlEscape(product.name)}</h5>
                        <div class="product-card__price">
                            ${hasDiscount ? `<span class="product-card__price--old">Rs. ${product.price.toFixed(2)}</span>` : ''}
                            <span class="product-card__price--current">Rs. ${finalPrice.toFixed(2)}</span>
                        </div>
                    </a>
                    ${!isSoldOut ? `
                        <button class="btn btn-primary btn-sm mt-2 w-100 add-to-cart-btn" 
                                data-product-id="${productId}"
                                data-product-price="${product.price}"
                                data-product-discount="${product.discount || 0}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-sm mt-2 w-100" disabled>
                            <i class="fas fa-ban"></i> Out of Stock
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Helper: Initialize Hero Carousel
function initHeroCarousel(container, options) {
    const track = container.querySelector('.hero-carousel__track');
    const slides = container.querySelectorAll('.hero-carousel__slide');
    const dots = container.querySelectorAll('.dot');
    const prevBtn = container.querySelector('.hero-carousel__nav--prev');
    const nextBtn = container.querySelector('.hero-carousel__nav--next');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let autoplayTimer = null;
    
    function showSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === index);
        });
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === index);
        });
        track.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }
    
    function nextSlide() {
        const next = (currentIndex + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showSlide(idx));
    });
    
    if (options.autoplay) {
        function startAutoplay() {
            autoplayTimer = setInterval(nextSlide, options.autoplaySpeed || 3000);
        }
        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }
        
        startAutoplay();
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
    }
}

// Helper: Initialize Product Carousel
function initProductCarousel(container, options) {
    const track = container.querySelector('.product-carousel__track');
    const slides = container.querySelectorAll('.product-carousel__slide');
    const prevBtn = container.querySelector('.product-carousel__nav--prev');
    const nextBtn = container.querySelector('.product-carousel__nav--next');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    const visibleSlides = 4; // Show 4 products at a time
    
    function updateCarousel() {
        const offset = -currentIndex * (100 / visibleSlides);
        track.style.transform = `translateX(${offset}%)`;
    }
    
    function nextSlide() {
        if (currentIndex < slides.length - visibleSlides) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    if (options.autoplay) {
        setInterval(() => {
            if (currentIndex >= slides.length - visibleSlides) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            updateCarousel();
        }, 4000);
    }
    
    updateCarousel();
}

// Helper: Initialize Homepage Interactions
function initializeHomepageInteractions() {
    // Attach add to cart handlers
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart');
            const productId = btn.dataset.productId || btn.dataset.id;
            
            if (!productId) {
                console.error('Product ID not found');
                return;
            }
            
            // Use existing add to cart function from main.js (available after main.js loads)
            if (typeof window.handleAddToCart === 'function') {
                window.handleAddToCart(productId);
            } else if (typeof window.addToGuestCart === 'function') {
                // Fallback: Add to guest cart
                const productPrice = parseFloat(btn.dataset.productPrice || 0);
                const productDiscount = parseFloat(btn.dataset.productDiscount || 0);
                window.addToGuestCart(productId, 1, productPrice, productDiscount);
                if (typeof window.loadCartCount === 'function') {
                    window.loadCartCount();
                } else {
                    // Update cart count manually
                    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[]}');
                    const cartCount = guestCart.items.reduce((sum, item) => sum + item.quantity, 0);
                    $('.cart-count').text(cartCount);
                }
                alert('Product added to cart! Sign in to save your cart.');
            } else {
                console.warn('Add to cart functions not available yet');
                alert('Please wait for the page to fully load.');
            }
        }
        
        // Attach wishlist handlers
        if (e.target.closest('.product-card__wishlist')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.target.closest('.product-card__wishlist');
            const productId = btn.dataset.productId;
            
            // Toggle wishlist icon (filled vs outline)
            const heartIcon = btn.querySelector('.icon-heart');
            if (heartIcon) {
                heartIcon.classList.toggle('las');
                heartIcon.classList.toggle('lar');
                heartIcon.classList.toggle('icon-heart');
            }
            
            // TODO: Add wishlist functionality (add/remove from wishlist)
            if (typeof window.Logger !== 'undefined') {
                window.Logger.info('Wishlist clicked', { productId });
            } else {
                console.log('Wishlist clicked for product:', productId);
            }
        }
    });
}

// Helper: HTML Escape (standalone implementation to avoid recursion)
function htmlEscape(text) {
    if (text === null || text === undefined) return '';
    if (typeof text !== 'string') {
        text = String(text);
    }
    // Use direct string replacement to avoid recursion
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Helper: Get global fallback image (will be available after main.js loads)
function getGlobalFallbackImage() {
    if (typeof window !== 'undefined' && window.globalFallbackImage) {
        return window.globalFallbackImage;
    }
    return 'https://images.unsplash.com/photo-1505577081107-4a4167cd81d0?auto=format&fit=crop&w=800&q=85';
}

// Export for use in main.js
if (typeof window !== 'undefined') {
    window.loadAndRenderHomepageSections = loadAndRenderHomepageSections;
    window.HOMEPAGE_SECTION_RENDERERS = HOMEPAGE_SECTION_RENDERERS;
}


