$(document).ready(function() {
    // Get department ID from URL
    const pathParts = window.location.pathname.split('/');
    const departmentId = pathParts[pathParts.length - 1];
    
    if (!departmentId) {
        window.location.href = '/';
        return;
    }

    // Load cart count
    loadCartCount();
    loadDepartments();

    // Load department data
    loadDepartmentData(departmentId);
});

function loadDepartmentData(departmentId) {
    $.get(`/api/public/departments/${departmentId}`)
        .done(function(data) {
            const { department, categories, products } = data;

            // Update breadcrumb
            $('#breadcrumbDepartment').text(department.name);

            // Update department header
            $('#departmentName').text(department.name);
            $('#departmentDescription').text(department.description || '');
            
            // Set department image
            const deptImage = department.imageUpload?.url || department.image || 'https://via.placeholder.com/400x300';
            $('#departmentImage').attr('src', deptImage).attr('alt', department.name);

            // Render categories
            renderCategories(categories);

            // Render products
            renderProducts(products);

            // Update page title
            document.title = `${department.name} - D.Watson Pharmacy`;
        })
        .fail(function(error) {
            console.error('Error loading department:', error);
            if (error.status === 404) {
                alert('Department not found');
                window.location.href = '/';
            } else {
                alert('Error loading department. Please try again.');
            }
        });
}

function renderCategories(categories) {
    const container = $('#categoriesGrid');
    
    if (!categories || categories.length === 0) {
        $('#categoriesSection').hide();
        return;
    }

    container.html(categories.map(cat => {
        const catId = cat._id || cat.id;
        const catImage = cat.imageUpload?.url || cat.image || 'https://via.placeholder.com/300x200';
        
        return `
            <div class="col-md-4 col-sm-6">
                <div class="card h-100 shadow-sm">
                    <img src="${catImage}" class="card-img-top" alt="${cat.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${cat.name}</h5>
                        <p class="card-text text-muted">${cat.description || ''}</p>
                        <a href="/category/${catId}" class="btn btn-primary">View Products</a>
                    </div>
                </div>
            </div>
        `;
    }).join(''));
}

function renderProducts(products) {
    const container = $('#productsGrid');
    const noProducts = $('#noProducts');
    
    if (!products || products.length === 0) {
        container.html('');
        noProducts.show();
        return;
    }

    noProducts.hide();
    
    container.html(products.map(product => {
        const productId = product._id || product.id;
        const productImage = product.imageUpload?.url || product.image || 'https://via.placeholder.com/300x300';
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        const categoryName = product.category?.name || 'Uncategorized';
        
        return `
            <div class="col-lg-3 col-md-4 col-sm-6">
                <div class="card h-100 shadow-sm product-card">
                    <div class="position-relative">
                        <img src="${productImage}" class="card-img-top" alt="${product.name}" style="height: 250px; object-fit: cover;">
                        ${product.discount > 0 ? `<span class="badge bg-danger position-absolute top-0 end-0 m-2">-${product.discount}%</span>` : ''}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <small class="text-muted">${categoryName}</small>
                        <h6 class="card-title mt-2">${product.name}</h6>
                        <p class="card-text text-muted small flex-grow-1">${product.description?.substring(0, 100)}${product.description?.length > 100 ? '...' : ''}</p>
                        <div class="mt-auto">
                            <div class="mb-2">
                                <strong class="text-primary">Rs. ${finalPrice.toFixed(2)}</strong>
                                ${product.discount > 0 ? `<small class="text-muted text-decoration-line-through ms-2">Rs. ${product.price.toFixed(2)}</small>` : ''}
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary add-to-cart" data-id="${productId}" data-product-id="${productId}">
                                    <i class="fas fa-shopping-cart"></i> Add to Cart
                                </button>
                                <a href="/product/${productId}" class="btn btn-outline-primary btn-sm">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join(''));

    // Attach event handlers
    $('.add-to-cart').click(function() {
        const productId = $(this).data('id');
        handleAddToCart(productId);
    });
}

function handleAddToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }

    $.ajaxSetup({
        headers: {
            'x-auth-token': token
        }
    });

    $.ajax({
        url: '/api/cart/add',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ productId, quantity: 1 })
    })
    .done(function(data) {
        alert('Product added to cart!');
        loadCartCount();
    })
    .fail(function(error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    });
}

function loadCartCount() {
    const token = localStorage.getItem('token');
    if (!token) return;

    $.ajaxSetup({
        headers: {
            'x-auth-token': token
        }
    });

    $.get('/api/cart/count')
        .done(function(data) {
            $('.cart-count').text(data.count || 0);
        })
        .fail(function() {
            $('.cart-count').text('0');
        });
}

function loadDepartments() {
    $.get('/api/departments')
        .done(function(departments) {
            const menu = $('#departmentsMenu');
            const footer = $('#footerDepartments');
            
            if (menu.length) {
                menu.html(departments.map(dept => {
                    const deptId = dept._id || dept.id;
                    return `<li><a class="dropdown-item" href="/department/${deptId}">${dept.name}</a></li>`;
                }).join(''));
            }
            
            if (footer.length) {
                footer.html(departments.map(dept => {
                    const deptId = dept._id || dept.id;
                    return `<li><a href="/department/${deptId}">${dept.name}</a></li>`;
                }).join(''));
            }
        })
        .fail(function() {
            console.error('Error loading departments');
        });
}

