 $(document).ready(function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Set token for all AJAX requests
    $.ajaxSetup({
        headers: {
            'x-auth-token': token
        }
    });
    
    // Load dashboard data
    loadDashboardData();
    
    // Sidebar navigation
    $('.sidebar-menu a').click(function(e) {
        e.preventDefault();
        
        // Remove active class from all links and sections
        $('.sidebar-menu li').removeClass('active');
        $('.content-section').removeClass('active');
        
        // Add active class to clicked link
        $(this).parent().addClass('active');
        
        // Show corresponding section
        const sectionId = $(this).attr('href').substring(1) + '-section';
        $(`#${sectionId}`).addClass('active');
        
        // Load data for the section
        loadSectionData(sectionId);
    });
    
    // Logout
    $('#logout, #logoutLink').click(function(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    // Department handlers
    $('#add-department-btn').click(function() {
        resetDepartmentForm();
        $('#departmentModalTitle').text('Add Department');
        $('#departmentModal').modal('show');
    });
    
    $('#saveDepartment').click(function() {
        saveDepartment();
    });
    
    // Category handlers
    $('#add-category-btn').click(function() {
        resetCategoryForm();
        loadDepartmentsToSelect('#categoryDepartment');
        $('#categoryModalTitle').text('Add Category');
        $('#categoryModal').modal('show');
    });
    
    $('#saveCategory').click(function() {
        saveCategory();
    });
    
    // Product handlers
    $('#add-product-btn').click(function() {
        resetProductForm();
        loadDepartmentsToSelect('#productDepartment');
        $('#productModalTitle').text('Add Product');
        $('#productModal').modal('show');
    });
    
    $('#saveProduct').click(function() {
        saveProduct();
    });
    
    // Slider handlers
    $('#add-slider-btn').click(function() {
        resetSliderForm();
        $('#sliderModalTitle').text('Add Slider');
        $('#sliderModal').modal('show');
    });
    
    $('#saveSlider').click(function() {
        saveSlider();
    });
    
    // Banner handlers
    $('#add-banner-btn').click(function() {
        resetBannerForm();
        $('#bannerModalTitle').text('Add Banner');
        $('#bannerModal').modal('show');
    });
    
    $('#saveBanner').click(function() {
        saveBanner();
    });
    
    // Section handlers
    $('#add-section-btn').click(function() {
        resetSectionForm();
        $('#sectionModalTitle').text('Add Section');
        $('#sectionModal').modal('show');
    });
    
    $('#saveSection').click(function() {
        saveSection();
    });
    
    // Order handlers
    $('#orderStatusFilter').change(function() {
        loadOrders(1);
    });
    
    $('#confirmOrderBtn').click(function() {
        const orderId = $(this).data('order-id');
        confirmOrder(orderId);
    });
    
    $('#updateOrderStatusBtn').click(function() {
        const orderId = $(this).data('order-id');
        const currentStatus = $(this).data('current-status');
        showOrderStatusModal(orderId, currentStatus);
    });
    
    $('#orderStatusSelect').change(function() {
        if ($(this).val() === 'cancelled') {
            $('#cancelledReasonDiv').show();
        } else {
            $('#cancelledReasonDiv').hide();
        }
    });
    
    $('#saveOrderStatus').click(function() {
        updateOrderStatus();
    });
    
    // Report handlers
    $('#reportPeriod').change(function() {
        if ($(this).val() === 'custom') {
            $('#customDateRange').show();
            $('#customDateRangeEnd').show();
        } else {
            $('#customDateRange').hide();
            $('#customDateRangeEnd').hide();
        }
    });
    
    $('#reportDepartment').change(function() {
        const departmentId = $(this).val();
        loadReportCategories(departmentId);
        loadReportProducts(null, departmentId);
    });
    
    $('#reportCategory').change(function() {
        const categoryId = $(this).val();
        const departmentId = $('#reportDepartment').val();
        loadReportProducts(categoryId, departmentId);
    });
    
    $('#generateReport').click(function() {
        generateSalesReport();
    });
    
    $('#exportReport').click(function() {
        exportReport();
    });
    
    // Department change handler for product form
    $('#productDepartment').change(function() {
        const departmentId = $(this).val();
        loadCategoriesToSelect('#productCategory', departmentId);
    });

    // Setup image previews
    initImageField({ urlInput: '#departmentImage', fileInput: '#departmentImageFile', preview: '#departmentImagePreview' });
    initImageField({ urlInput: '#categoryImage', fileInput: '#categoryImageFile', preview: '#categoryImagePreview' });
    initImageField({ urlInput: '#productImage', fileInput: '#productImageFile', preview: '#productImagePreview' });
    initImageField({ urlInput: '#sliderImage', fileInput: '#sliderImageFile', preview: '#sliderImagePreview' });
    initImageField({ urlInput: '#bannerImage', fileInput: '#bannerImageFile', preview: '#bannerImagePreview' });

    setImagePreview('#departmentImagePreview', null);
    setImagePreview('#categoryImagePreview', null);
    setImagePreview('#productImagePreview', null);
    setImagePreview('#sliderImagePreview', null);
    setImagePreview('#bannerImagePreview', null);
});

// Functions to load data
function loadDashboardData() {
    $.get('/api/admin/dashboard')
        .done(function(data) {
            $('#departments-count').text(data.departments);
            $('#categories-count').text(data.categories);
            $('#products-count').text(data.products);
            $('#users-count').text(data.users);
        })
        .fail(function() {
            showAlert('Error loading dashboard data', 'danger');
        });
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'departments-section':
            loadDepartments();
            break;
        case 'categories-section':
            loadCategories();
            break;
        case 'products-section':
            loadProducts(1);
            break;
        case 'sliders-section':
            loadSliders();
            break;
        case 'banners-section':
            loadBanners();
            break;
        case 'sections-section':
            loadSections();
            break;
        case 'users-section':
            loadUsers(1);
            break;
        case 'orders-section':
            loadOrders(1);
            break;
        case 'reports-section':
            loadReportFilters();
            break;
    }
}

function loadDepartments() {
    $.get('/api/admin/departments')
        .done(function(departments) {
            let html = '';
            
            departments.forEach(function(dept) {
                const imageUrl = resolveItemImage(dept) || IMAGE_PLACEHOLDER;
                html += `
                    <tr>
                        <td>${dept.name}</td>
                        <td>${dept.description || ''}</td>
                        <td><img src="${imageUrl}" alt="${dept.name}" class="table-thumb"></td>
                        <td>
                            <span class="badge ${dept.isActive ? 'bg-success' : 'bg-danger'}">
                                ${dept.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-department" data-id="${dept._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-department" data-id="${dept._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#departments-table').html(html);
            
            // Add event handlers
            $('.edit-department').click(function() {
                const id = $(this).data('id');
                editDepartment(id);
            });
            
            $('.delete-department').click(function() {
                const id = $(this).data('id');
                deleteDepartment(id);
            });
        })
        .fail(function() {
            showAlert('Error loading departments', 'danger');
        });
}

function loadCategories() {
    $.get('/api/admin/categories')
        .done(function(categories) {
            let html = '';
            
            categories.forEach(function(cat) {
                const imageUrl = resolveItemImage(cat) || IMAGE_PLACEHOLDER;
                const departmentName = cat.department ? cat.department.name : 'N/A';
                html += `
                    <tr>
                        <td>${cat.name}</td>
                        <td>${departmentName}</td>
                        <td>${cat.description || ''}</td>
                        <td><img src="${imageUrl}" alt="${cat.name}" class="table-thumb"></td>
                        <td>
                            <span class="badge ${cat.isFeatured ? 'bg-primary' : 'bg-secondary'}">
                                ${cat.isFeatured ? 'Featured' : 'Regular'}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${cat.isActive ? 'bg-success' : 'bg-danger'}">
                                ${cat.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-category" data-id="${cat._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-category" data-id="${cat._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#categories-table').html(html);
            
            // Add event handlers
            $('.edit-category').click(function() {
                const id = $(this).data('id');
                editCategory(id);
            });
            
            $('.delete-category').click(function() {
                const id = $(this).data('id');
                deleteCategory(id);
            });
        })
        .fail(function() {
            showAlert('Error loading categories', 'danger');
        });
}

function loadProducts(page) {
    $.get(`/api/admin/products?page=${page}`)
        .done(function(data) {
            let html = '';
            
            data.products.forEach(function(product) {
                const departmentName = product.department ? product.department.name : 'N/A';
                const categoryName = product.category ? product.category.name : 'N/A';
                const finalPrice = product.discount > 0 
                    ? product.price * (1 - product.discount / 100) 
                    : product.price;
                
                html += `
                    <tr>
                        <td>${product.name}</td>
                        <td>${departmentName}</td>
                        <td>${categoryName}</td>
                        <td>Rs. ${finalPrice.toFixed(2)}</td>
                        <td>${product.discount}%</td>
                        <td>${product.stock}</td>
                        <td>
                            <span class="badge ${product.isFeatured ? 'bg-primary' : 'bg-secondary'}">
                                ${product.isFeatured ? 'Featured' : 'Regular'}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${product.isActive ? 'bg-success' : 'bg-danger'}">
                                ${product.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-product" data-id="${product._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-product" data-id="${product._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#products-table').html(html);
            
            // Add pagination
            let paginationHtml = '';
            
            if (data.currentPage > 1) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage - 1}">Previous</a></li>`;
            }
            
            for (let i = 1; i <= data.totalPages; i++) {
                paginationHtml += `
                    <li class="page-item ${i === data.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            
            if (data.currentPage < data.totalPages) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage + 1}">Next</a></li>`;
            }
            
            $('#products-pagination').html(paginationHtml);
            
            // Add event handlers
            $('.edit-product').click(function() {
                const id = $(this).data('id');
                editProduct(id);
            });
            
            $('.delete-product').click(function() {
                const id = $(this).data('id');
                deleteProduct(id);
            });
            
            $('.page-link').click(function(e) {
                e.preventDefault();
                const page = $(this).data('page');
                loadProducts(page);
            });
        })
        .fail(function() {
            showAlert('Error loading products', 'danger');
        });
}

function loadSliders() {
    $.get('/api/admin/sliders')
        .done(function(sliders) {
            let html = '';
            
            sliders.forEach(function(slider) {
                const imageUrl = resolveItemImage(slider) || IMAGE_PLACEHOLDER;
                html += `
                    <tr>
                        <td>${slider.title}</td>
                        <td>${slider.description}</td>
                        <td><img src="${imageUrl}" alt="${slider.title}" class="table-thumb"></td>
                        <td>${slider.link}</td>
                        <td>${slider.order}</td>
                        <td>
                            <span class="badge ${slider.isActive ? 'bg-success' : 'bg-danger'}">
                                ${slider.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-slider" data-id="${slider._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-slider" data-id="${slider._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#sliders-table').html(html);
            
            // Add event handlers
            $('.edit-slider').click(function() {
                const id = $(this).data('id');
                editSlider(id);
            });
            
            $('.delete-slider').click(function() {
                const id = $(this).data('id');
                deleteSlider(id);
            });
        })
        .fail(function() {
            showAlert('Error loading sliders', 'danger');
        });
}

function loadBanners() {
    $.get('/api/admin/banners')
        .done(function(banners) {
            let html = '';
            
            banners.forEach(function(banner) {
                const imageUrl = resolveItemImage(banner) || IMAGE_PLACEHOLDER;
                html += `
                    <tr>
                        <td>${banner.title}</td>
                        <td>${banner.description}</td>
                        <td><img src="${imageUrl}" alt="${banner.title}" class="table-thumb"></td>
                        <td>${banner.position}</td>
                        <td>
                            <span class="badge ${banner.isActive ? 'bg-success' : 'bg-danger'}">
                                ${banner.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-banner" data-id="${banner._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-banner" data-id="${banner._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#banners-table').html(html);
            
            // Add event handlers
            $('.edit-banner').click(function() {
                const id = $(this).data('id');
                editBanner(id);
            });
            
            $('.delete-banner').click(function() {
                const id = $(this).data('id');
                deleteBanner(id);
            });
        })
        .fail(function() {
            showAlert('Error loading banners', 'danger');
        });
}

function loadSections() {
    console.log('Loading sections...');
    $.get('/api/admin/sections')
        .done(function(sections) {
            console.log('Sections loaded:', sections);
            let html = '';
            
            if (!sections || sections.length === 0) {
                html = '<tr><td colspan="7" class="text-center">No sections found</td></tr>';
            } else {
                sections.forEach(function(section) {
                    const sectionId = section._id || section.id;
                    html += `
                        <tr>
                            <td>${section.name || 'Unnamed'}</td>
                            <td><span class="badge bg-info">${section.type || 'N/A'}</span></td>
                            <td>${section.title || '-'}</td>
                            <td>${section.ordering !== undefined ? section.ordering : 0}</td>
                            <td>
                                <span class="badge ${section.isActive ? 'bg-success' : 'bg-danger'}">
                                    ${section.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <span class="badge ${section.isPublished ? 'bg-primary' : 'bg-secondary'}">
                                    ${section.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary btn-action edit-section" data-id="${sectionId}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-action delete-section" data-id="${sectionId}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
            
            $('#sections-table').html(html);
            
            // Add event handlers
            $('.edit-section').click(function() {
                const id = $(this).data('id');
                console.log('Edit section clicked:', id);
                editSection(id);
            });
            
            $('.delete-section').click(function() {
                const id = $(this).data('id');
                console.log('Delete section clicked:', id);
                deleteSection(id);
            });
            
            console.log('Sections table updated');
        })
        .fail(function(error) {
            console.error('Error loading sections:', error);
            const errorMsg = error?.responseJSON?.message || 'Error loading sections';
            showAlert(errorMsg, 'danger');
            $('#sections-table').html('<tr><td colspan="7" class="text-center text-danger">Error loading sections</td></tr>');
        });
}

function loadUsers(page) {
    $.get(`/api/admin/users?page=${page}`)
        .done(function(data) {
            let html = '';
            
            data.users.forEach(function(user) {
                html += `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || 'N/A'}</td>
                        <td>
                            <span class="badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}">
                                ${user.role}
                            </span>
                        </td>
                        <td>
                            <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary btn-action edit-user" data-id="${user._id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action delete-user" data-id="${user._id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            $('#users-table').html(html);
            
            // Add pagination
            let paginationHtml = '';
            
            if (data.currentPage > 1) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage - 1}">Previous</a></li>`;
            }
            
            for (let i = 1; i <= data.totalPages; i++) {
                paginationHtml += `
                    <li class="page-item ${i === data.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            
            if (data.currentPage < data.totalPages) {
                paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage + 1}">Next</a></li>`;
            }
            
            $('#users-pagination').html(paginationHtml);
            
            // Add event handlers
            $('.edit-user').click(function() {
                const id = $(this).data('id');
                editUser(id);
            });
            
            $('.delete-user').click(function() {
                const id = $(this).data('id');
                deleteUser(id);
            });
            
            $('.page-link').click(function(e) {
                e.preventDefault();
                const page = $(this).data('page');
                loadUsers(page);
            });
        })
        .fail(function() {
            showAlert('Error loading users', 'danger');
        });
}

function loadOrders(page) {
    const status = $('#orderStatusFilter').val() || '';
    const url = `/api/orders/admin/all?page=${page}&limit=20${status ? '&status=' + status : ''}`;
    
    $.get(url)
        .done(function(data) {
            let html = '';
            
            if (!data.orders || data.orders.length === 0) {
                html = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
            } else {
                data.orders.forEach(function(order) {
                    const customerName = order.user ? order.user.name : 'Unknown';
                    const customerEmail = order.user ? order.user.email : '';
                    const date = new Date(order.createdAt).toLocaleDateString();
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    const statusClass = getStatusClass(order.status);
                    
                    html += `
                        <tr>
                            <td>${order.orderNumber || order._id}</td>
                            <td>${customerName}<br><small class="text-muted">${customerEmail}</small></td>
                            <td>${date}</td>
                            <td>${itemCount}</td>
                            <td>Rs. ${order.total.toFixed(2)}</td>
                            <td>
                                <span class="badge ${statusClass}">${order.status}</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary btn-action view-order" data-id="${order._id}" title="View Order">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-success btn-action update-status-btn" data-id="${order._id}" data-status="${order.status}" title="Update Status">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
            
            $('#orders-table').html(html);
            
            // Add pagination
            let paginationHtml = '';
            if (data.totalPages > 1) {
                if (data.currentPage > 1) {
                    paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage - 1}">Previous</a></li>`;
                }
                
                for (let i = 1; i <= data.totalPages; i++) {
                    paginationHtml += `
                        <li class="page-item ${i === data.currentPage ? 'active' : ''}">
                            <a class="page-link" href="#" data-page="${i}">${i}</a>
                        </li>
                    `;
                }
                
                if (data.currentPage < data.totalPages) {
                    paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${data.currentPage + 1}">Next</a></li>`;
                }
            }
            
            $('#orders-pagination').html(paginationHtml);
            
            // Add event handlers
            $('.view-order').click(function() {
                const id = $(this).data('id');
                viewOrder(id);
            });
            
            $('.update-status-btn').click(function() {
                const id = $(this).data('id');
                const status = $(this).data('status');
                showOrderStatusModal(id, status);
            });
            
            $('.page-link').click(function(e) {
                e.preventDefault();
                const page = $(this).data('page');
                loadOrders(page);
            });
        })
        .fail(function() {
            showAlert('Error loading orders', 'danger');
        });
}

function getStatusClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'confirmed': 'bg-info',
        'processing': 'bg-primary',
        'shipped': 'bg-secondary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

async function viewOrder(id) {
    try {
        const order = await $.get(`/api/orders/${id}`);
        
        let itemsHtml = '';
        order.items.forEach(item => {
            const productName = item.product ? item.product.name : 'Unknown Product';
            const itemTotal = item.subtotal || (item.price * item.quantity * (1 - (item.discount || 0) / 100));
            itemsHtml += `
                <tr>
                    <td>${productName}</td>
                    <td>${item.quantity}</td>
                    <td>Rs. ${item.price.toFixed(2)}</td>
                    <td>${item.discount || 0}%</td>
                    <td>Rs. ${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const customerInfo = order.user ? `
            <p><strong>Name:</strong> ${order.user.name}</p>
            <p><strong>Email:</strong> ${order.user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.user.phone || 'N/A'}</p>
        ` : '<p>Customer information not available</p>';
        
        const shippingAddress = order.shippingAddress ? `
            <p>${order.shippingAddress.street || ''}</p>
            <p>${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}</p>
            <p>${order.shippingAddress.country || ''}</p>
        ` : '<p>No shipping address provided</p>';
        
        const orderHtml = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="badge ${getStatusClass(order.status)}">${order.status}</span></p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                    <p><strong>Payment Status:</strong> ${order.paymentStatus || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Customer Information</h6>
                    ${customerInfo}
                    <h6 class="mt-3">Shipping Address</h6>
                    ${shippingAddress}
                </div>
            </div>
            <hr>
            <h6>Order Items</h6>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div class="text-end">
                <p><strong>Subtotal:</strong> Rs. ${order.subtotal.toFixed(2)}</p>
                <p><strong>Shipping:</strong> Rs. ${(order.shippingCost || 0).toFixed(2)}</p>
                <p><strong>Tax:</strong> Rs. ${(order.tax || 0).toFixed(2)}</p>
                <h5><strong>Total: Rs. ${order.total.toFixed(2)}</strong></h5>
            </div>
        `;
        
        $('#orderModalBody').html(orderHtml);
        $('#confirmOrderBtn').data('order-id', order._id);
        $('#updateOrderStatusBtn').data('order-id', order._id).data('current-status', order.status);
        
        if (order.status === 'pending') {
            $('#confirmOrderBtn').show();
        } else {
            $('#confirmOrderBtn').hide();
        }
        
        $('#orderModal').modal('show');
    } catch (error) {
        console.error('Error loading order', error);
        showAlert('Error loading order', 'danger');
    }
}

function showOrderStatusModal(orderId, currentStatus) {
    $('#orderStatusId').val(orderId);
    $('#orderStatusSelect').val(currentStatus);
    $('#cancelledReason').val('');
    if (currentStatus === 'cancelled') {
        $('#cancelledReasonDiv').show();
    } else {
        $('#cancelledReasonDiv').hide();
    }
    $('#orderStatusModal').modal('show');
}

async function confirmOrder(orderId) {
    try {
        await $.ajax({
            url: `/api/orders/${orderId}/confirm`,
            method: 'POST'
        });
        
        $('#orderModal').modal('hide');
        showAlert('Order confirmed successfully', 'success');
        loadOrders(1);
    } catch (error) {
        console.error('Error confirming order', error);
        showAlert('Error confirming order', 'danger');
    }
}

async function updateOrderStatus() {
    const orderId = $('#orderStatusId').val();
    const status = $('#orderStatusSelect').val();
    const cancelledReason = $('#cancelledReason').val();
    
    try {
        await $.ajax({
            url: `/api/orders/${orderId}/status`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ status, cancelledReason })
        });
        
        $('#orderStatusModal').modal('hide');
        $('#orderModal').modal('hide');
        showAlert('Order status updated successfully', 'success');
        loadOrders(1);
    } catch (error) {
        console.error('Error updating order status', error);
        showAlert('Error updating order status', 'danger');
    }
}

function loadReportFilters() {
    // Load departments
    $.get('/api/admin/reports/departments')
        .done(function(departments) {
            let html = '<option value="">All Departments</option>';
            departments.forEach(dept => {
                html += `<option value="${dept._id}">${dept.name}</option>`;
            });
            $('#reportDepartment').html(html);
        });
    
    // Load categories
    loadReportCategories();
}

function loadReportCategories(departmentId) {
    const url = departmentId 
        ? `/api/admin/reports/categories?departmentId=${departmentId}`
        : '/api/admin/reports/categories';
    
    $.get(url)
        .done(function(categories) {
            let html = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                html += `<option value="${cat._id}">${cat.name}</option>`;
            });
            $('#reportCategory').html(html);
        });
}

function loadReportProducts(categoryId, departmentId) {
    let url = '/api/admin/reports/products?';
    if (categoryId) url += `categoryId=${categoryId}&`;
    if (departmentId) url += `departmentId=${departmentId}`;
    
    $.get(url)
        .done(function(products) {
            let html = '<option value="">All Products</option>';
            products.forEach(prod => {
                html += `<option value="${prod._id}">${prod.name}</option>`;
            });
            $('#reportProduct').html(html);
        });
}

async function generateSalesReport() {
    const period = $('#reportPeriod').val();
    const departmentId = $('#reportDepartment').val() || undefined;
    const categoryId = $('#reportCategory').val() || undefined;
    const productId = $('#reportProduct').val() || undefined;
    const status = $('#reportStatus').val() || undefined;
    const startDate = $('#reportStartDate').val() || undefined;
    const endDate = $('#reportEndDate').val() || undefined;
    
    let url = '/api/admin/reports/sales?';
    if (period) url += `period=${period}&`;
    if (departmentId) url += `departmentId=${departmentId}&`;
    if (categoryId) url += `categoryId=${categoryId}&`;
    if (productId) url += `productId=${productId}&`;
    if (status) url += `status=${status}&`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    
    try {
        const report = await $.get(url);
        
        // Update summary
        $('#reportTotalSales').text('Rs. ' + report.summary.totalSales.toFixed(2));
        $('#reportTotalOrders').text(report.summary.totalOrders);
        $('#reportTotalItems').text(report.summary.totalItems);
        $('#reportAvgOrder').text('Rs. ' + report.summary.averageOrderValue.toFixed(2));
        
        // Update by department
        let deptHtml = '';
        if (report.byDepartment.length === 0) {
            deptHtml = '<tr><td colspan="4" class="text-center">No data</td></tr>';
        } else {
            report.byDepartment.forEach(dept => {
                deptHtml += `
                    <tr>
                        <td>${dept.name}</td>
                        <td>Rs. ${dept.sales.toFixed(2)}</td>
                        <td>${dept.orders}</td>
                        <td>${dept.items}</td>
                    </tr>
                `;
            });
        }
        $('#reportByDepartment').html(deptHtml);
        
        // Update by category
        let catHtml = '';
        if (report.byCategory.length === 0) {
            catHtml = '<tr><td colspan="3" class="text-center">No data</td></tr>';
        } else {
            report.byCategory.forEach(cat => {
                catHtml += `
                    <tr>
                        <td>${cat.name}</td>
                        <td>Rs. ${cat.sales.toFixed(2)}</td>
                        <td>${cat.items}</td>
                    </tr>
                `;
            });
        }
        $('#reportByCategory').html(catHtml);
        
        // Update by product
        let prodHtml = '';
        if (report.byProduct.length === 0) {
            prodHtml = '<tr><td colspan="4" class="text-center">No data</td></tr>';
        } else {
            // Sort by sales descending and take top 20
            const topProducts = report.byProduct.sort((a, b) => b.sales - a.sales).slice(0, 20);
            topProducts.forEach(prod => {
                prodHtml += `
                    <tr>
                        <td>${prod.name}</td>
                        <td>Rs. ${prod.sales.toFixed(2)}</td>
                        <td>${prod.items}</td>
                        <td>Rs. ${prod.price.toFixed(2)}</td>
                    </tr>
                `;
            });
        }
        $('#reportByProduct').html(prodHtml);
        
        $('#reportResults').show();
    } catch (error) {
        console.error('Error generating report', error);
        showAlert('Error generating report', 'danger');
    }
}

function exportReport() {
    // Simple CSV export implementation
    const csv = [];
    csv.push(['Metric', 'Value']);
    csv.push(['Total Sales', $('#reportTotalSales').text()]);
    csv.push(['Total Orders', $('#reportTotalOrders').text()]);
    csv.push(['Total Items', $('#reportTotalItems').text()]);
    csv.push(['Average Order Value', $('#reportAvgOrder').text()]);
    
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Helper functions
function loadDepartmentsToSelect(selectId, options = {}) {
    const { includeInactive = false, selectedId } = options;
    const url = includeInactive ? '/api/admin/departments' : '/api/departments';

    return $.get(url).then(
        function (departments = []) {
            let html = '<option value="">Select Department</option>';

            departments.forEach(function (dept) {
                const isActive = dept.isActive !== false;
                const label = isActive ? dept.name : `${dept.name} (inactive)`;
                html += `<option value="${dept._id}">${label}</option>`;
            });

            $(selectId).html(html);

            if (selectedId) {
                $(selectId).val(String(selectedId));
            }

            return departments;
        },
        function () {
            $(selectId).html('<option value="">Unable to load departments</option>');
            showAlert('Error loading departments', 'danger');
            return [];
        }
    );
}

function loadCategoriesToSelect(selectId, departmentId, options = {}) {
    const { selectedId } = options;

    if (!departmentId) {
        $(selectId).html('<option value="">Select Department First</option>');
        return $.Deferred().resolve([]).promise();
    }

    return $.get(`/api/categories/department/${departmentId}`).then(
        function (categories = []) {
            let html = '<option value="">Select Category</option>';

            categories.forEach(function (cat) {
                const isActive = cat.isActive !== false;
                const label = isActive ? cat.name : `${cat.name} (inactive)`;
                html += `<option value="${cat._id}">${label}</option>`;
            });

            $(selectId).html(html);

            if (selectedId) {
                $(selectId).val(String(selectedId));
            }

            return categories;
        },
        function () {
            $(selectId).html('<option value="">Unable to load categories</option>');
            showAlert('Error loading categories', 'danger');
            return [];
        }
    );
}

// Form reset functions
function resetDepartmentForm() {
    $('#departmentForm')[0].reset();
    $('#departmentId').val('');
    $('#departmentImageFile').val('');
    $('#departmentImageFileId').val('');
    setImagePreview('#departmentImagePreview', null);
}

function resetCategoryForm() {
    $('#categoryForm')[0].reset();
    $('#categoryId').val('');
    $('#categoryImageFile').val('');
    $('#categoryImageFileId').val('');
    setImagePreview('#categoryImagePreview', null);
    $('#categoryDepartment').html('<option value="">Select Department</option>');
}

function resetProductForm() {
    $('#productForm')[0].reset();
    $('#productId').val('');
    $('#productImageFile').val('');
    $('#productImageFileId').val('');
    setImagePreview('#productImagePreview', null);
    $('#productDepartment').html('<option value="">Select Department</option>');
    $('#productCategory').html('<option value="">Select Department First</option>');
}

function resetSliderForm() {
    $('#sliderForm')[0].reset();
    $('#sliderId').val('');
    $('#sliderImageFile').val('');
    $('#sliderImageFileId').val('');
    setImagePreview('#sliderImagePreview', null);
}

function resetBannerForm() {
    $('#bannerForm')[0].reset();
    $('#bannerId').val('');
    $('#bannerImageFile').val('');
    $('#bannerImageFileId').val('');
    setImagePreview('#bannerImagePreview', null);
}

function resetSectionForm() {
    $('#sectionForm')[0].reset();
    $('#sectionId').val('');
    $('#sectionOrdering').val('0');
    $('#sectionActive').prop('checked', true);
    $('#sectionPublished').prop('checked', false);
}

// Save functions
async function saveDepartment() {
    const id = $('#departmentId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/departments/${id}` : '/api/departments';

    try {
        const uploadedMedia = await uploadImageIfNeeded('#departmentImageFile', 'departments');
        const imageUrl = ($('#departmentImage').val() || '').trim();
        const existingFileId = normaliseFileId($('#departmentImageFileId').val());

    const payload = {
            name: $('#departmentName').val(),
            description: $('#departmentDescription').val(),
            isActive: $('#departmentActive').is(':checked')
        };

        if (!uploadedMedia && !imageUrl && !existingFileId) {
            showAlert('Please provide an image via URL or by uploading a file.', 'warning');
            return;
        }

        if (uploadedMedia) {
            payload.image = uploadedMedia.url;
            payload.imageFileId = uploadedMedia._id;
            $('#departmentImageFileId').val(uploadedMedia._id);
            $('#departmentImage').val(uploadedMedia.url);
            setImagePreview('#departmentImagePreview', uploadedMedia.url);
        } else {
            if (imageUrl) {
                payload.image = imageUrl;
            }
            if (existingFileId) {
                payload.imageFileId = existingFileId;
            }
        }

        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#departmentModal').modal('hide');
        showAlert(id ? 'Department updated successfully' : 'Department added successfully', 'success');
        loadDepartments();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving department', error);
        showAlert('Error saving department', 'danger');
    }
}

async function saveCategory() {
    const id = $('#categoryId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/categories/${id}` : '/api/categories';

    try {
        const uploadedMedia = await uploadImageIfNeeded('#categoryImageFile', 'categories');
        const imageUrl = ($('#categoryImage').val() || '').trim();
        const existingFileId = normaliseFileId($('#categoryImageFileId').val());

    const payload = {
            name: $('#categoryName').val(),
            department: $('#categoryDepartment').val(),
            description: $('#categoryDescription').val(),
            isFeatured: $('#categoryFeatured').is(':checked'),
            isActive: $('#categoryActive').is(':checked')
        };

        if (!uploadedMedia && !imageUrl && !existingFileId) {
            showAlert('Please provide an image via URL or by uploading a file.', 'warning');
            return;
        }

        if (uploadedMedia) {
            payload.image = uploadedMedia.url;
            payload.imageFileId = uploadedMedia._id;
            $('#categoryImageFileId').val(uploadedMedia._id);
            $('#categoryImage').val(uploadedMedia.url);
            setImagePreview('#categoryImagePreview', uploadedMedia.url);
        } else {
            if (imageUrl) {
                payload.image = imageUrl;
            }
            if (existingFileId) {
                payload.imageFileId = existingFileId;
            }
        }

        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#categoryModal').modal('hide');
        showAlert(id ? 'Category updated successfully' : 'Category added successfully', 'success');
        loadCategories();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving category', error);
        showAlert('Error saving category', 'danger');
    }
}

async function saveProduct() {
    const id = $('#productId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    try {
        const uploadedMedia = await uploadImageIfNeeded('#productImageFile', 'products');
        const imageUrl = ($('#productImage').val() || '').trim();
        const existingFileId = normaliseFileId($('#productImageFileId').val());

    const payload = {
            name: $('#productName').val(),
            price: parseFloat($('#productPrice').val()),
            category: $('#productCategory').val(),
            description: $('#productDescription').val(),
            stock: parseInt($('#productStock').val(), 10),
            discount: parseFloat($('#productDiscount').val()) || 0,
            isFeatured: $('#productFeatured').is(':checked'),
            isTrending: $('#productTrending').is(':checked'),
            isNewArrival: $('#productNewArrival').is(':checked'),
            isActive: $('#productActive').is(':checked')
        };

        if (!uploadedMedia && !imageUrl && !existingFileId) {
            showAlert('Please provide an image via URL or by uploading a file.', 'warning');
            return;
        }

        if (uploadedMedia) {
            payload.image = uploadedMedia.url;
            payload.imageFileId = uploadedMedia._id;
            $('#productImageFileId').val(uploadedMedia._id);
            $('#productImage').val(uploadedMedia.url);
            setImagePreview('#productImagePreview', uploadedMedia.url);
        } else {
            if (imageUrl) {
                payload.image = imageUrl;
            }
            if (existingFileId) {
                payload.imageFileId = existingFileId;
            }
        }

        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#productModal').modal('hide');
        showAlert(id ? 'Product updated successfully' : 'Product added successfully', 'success');
        loadProducts(1);
        loadDashboardData();
    } catch (error) {
        console.error('Error saving product', error);
        showAlert('Error saving product', 'danger');
    }
}

async function saveSlider() {
    const id = $('#sliderId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/sliders/${id}` : '/api/sliders';
    const isEdit = Boolean(id);

    const titleInput = $('#sliderTitle').val().trim();
    const descriptionInput = $('#sliderDescription').val().trim();
    const linkInput = $('#sliderLink').val().trim();
    const orderInput = $('#sliderOrder').val().trim();

    const uploadedMedia = await uploadImageIfNeeded('#sliderImageFile', 'sliders');
    const imageUrl = ($('#sliderImage').val() || '').trim();
    const existingFileId = normaliseFileId($('#sliderImageFileId').val());

    if (!uploadedMedia && !imageUrl && !existingFileId) {
        showAlert('Please provide an image via URL or by uploading a file.', 'warning');
        return;
    }

    let orderValue = undefined;
    if (orderInput) {
        orderValue = parseInt(orderInput, 10);
        if (Number.isNaN(orderValue)) {
            showAlert('Order must be a number.', 'warning');
            return;
        }
    } else if (!isEdit) {
        orderValue = 0;
    }

    let titleValue = titleInput;
    if (!titleValue) {
        if (uploadedMedia?.originalName) {
            titleValue = uploadedMedia.originalName.replace(/\.[^/.]+$/, '').trim();
        } else if (!isEdit) {
            titleValue = 'Untitled Slider';
        }
    }

    let descriptionValue = descriptionInput;
    if (!descriptionValue && !isEdit) {
        descriptionValue = 'Slider description';
    }

    let linkValue = linkInput;
    if (!linkValue && !isEdit) {
        linkValue = '/';
    }

    const payload = {
        isActive: $('#sliderActive').is(':checked')
    };

    if (titleValue !== undefined) payload.title = titleValue;
    if (descriptionValue !== undefined) payload.description = descriptionValue;
    if (linkValue !== undefined) payload.link = linkValue;
    if (orderValue !== undefined) payload.order = orderValue;

    if (uploadedMedia) {
        payload.image = uploadedMedia.url;
        payload.imageFileId = uploadedMedia._id;
        $('#sliderImageFileId').val(uploadedMedia._id);
        $('#sliderImage').val(uploadedMedia.url);
        setImagePreview('#sliderImagePreview', uploadedMedia.url);
    } else {
        if (imageUrl) {
            payload.image = imageUrl;
        }
        if (existingFileId) {
            payload.imageFileId = existingFileId;
        }
    }

    try {
        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#sliderModal').modal('hide');
        showAlert(id ? 'Slider updated successfully' : 'Slider added successfully', 'success');
        loadSliders();
    } catch (error) {
        console.error('Error saving slider', error);
        const message = error?.responseJSON?.message || 'Error saving slider';
        showAlert(message, 'danger');
    }
}

async function saveBanner() {
    const id = $('#bannerId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/banners/${id}` : '/api/banners';

    try {
        const uploadedMedia = await uploadImageIfNeeded('#bannerImageFile', 'banners');
        const imageUrl = ($('#bannerImage').val() || '').trim();
        const existingFileId = normaliseFileId($('#bannerImageFileId').val());
        const titleValue = ($('#bannerTitle').val() || '').trim();
        const descriptionValue = ($('#bannerDescription').val() || '').trim();
        const linkValue = ($('#bannerLink').val() || '').trim();
        const positionValue = $('#bannerPosition').val() || 'middle';

        const payload = {
            title: titleValue || 'Homepage Banner',
            description: descriptionValue || 'Banner description',
            link: linkValue || '/',
            position: positionValue,
            isActive: $('#bannerActive').is(':checked')
        };

        if (!uploadedMedia && !imageUrl && !existingFileId) {
            showAlert('Please provide an image via URL or by uploading a file.', 'warning');
            return;
        }

        if (uploadedMedia) {
            payload.image = uploadedMedia.url;
            payload.imageFileId = uploadedMedia._id;
            $('#bannerImageFileId').val(uploadedMedia._id);
            $('#bannerImage').val(uploadedMedia.url);
            setImagePreview('#bannerImagePreview', uploadedMedia.url);
        } else {
            if (imageUrl) {
                payload.image = imageUrl;
            }
            if (existingFileId) {
                payload.imageFileId = existingFileId;
            }
        }

        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#bannerModal').modal('hide');
        showAlert(id ? 'Banner updated successfully' : 'Banner added successfully', 'success');
        loadBanners();
    } catch (error) {
        console.error('Error saving banner', error);
        showAlert('Error saving banner', 'danger');
    }
}

async function saveSection() {
    const id = $('#sectionId').val();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/sections/${id}` : '/api/admin/sections';

    try {
        let config = {};
        const configText = ($('#sectionConfig').val() || '').trim();
        if (configText) {
            try {
                config = JSON.parse(configText);
            } catch (e) {
                showAlert('Invalid JSON in config field', 'warning');
                return;
            }
        }

        const payload = {
            name: $('#sectionName').val(),
            type: $('#sectionType').val(),
            title: $('#sectionTitle').val() || undefined,
            subtitle: $('#sectionSubtitle').val() || undefined,
            description: $('#sectionDescription').val() || undefined,
            ordering: parseInt($('#sectionOrdering').val(), 10) || 0,
            isActive: $('#sectionActive').is(':checked'),
            isPublished: $('#sectionPublished').is(':checked'),
            config: config
        };

        await $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload)
        });

        $('#sectionModal').modal('hide');
        showAlert(id ? 'Section updated successfully' : 'Section added successfully', 'success');
        loadSections();
        // Note: Main page will show new/updated sections on next page load or refresh
    } catch (error) {
        console.error('Error saving section', error);
        const message = error?.responseJSON?.message || 'Error saving section';
        showAlert(message, 'danger');
    }
}

// Edit functions
async function editDepartment(id) {
    try {
        const dept = await $.get(`/api/departments/${id}`);
        $('#departmentId').val(dept._id);
        $('#departmentName').val(dept.name);
        $('#departmentDescription').val(dept.description);
        $('#departmentImage').val(dept.image || '');
        $('#departmentImageFileId').val(dept.imageUpload ? dept.imageUpload._id : '');
        $('#departmentActive').prop('checked', dept.isActive);
        setImagePreview('#departmentImagePreview', resolveItemImage(dept));

        $('#departmentModalTitle').text('Edit Department');
        $('#departmentModal').modal('show');
    } catch (error) {
        console.error('Error loading department', error);
        showAlert('Error loading department', 'danger');
    }
}

async function editCategory(id) {
    try {
        const cat = await $.get(`/api/categories/${id}`);
        $('#categoryId').val(cat._id);
        $('#categoryName').val(cat.name);
        $('#categoryDescription').val(cat.description || '');
        $('#categoryImage').val(cat.image || '');
        $('#categoryImageFileId').val(cat.imageUpload ? cat.imageUpload._id : '');
        $('#categoryFeatured').prop('checked', cat.isFeatured);
        $('#categoryActive').prop('checked', cat.isActive);
        setImagePreview('#categoryImagePreview', resolveItemImage(cat));

        await loadDepartmentsToSelect('#categoryDepartment', { includeInactive: true, selectedId: cat.department ? cat.department._id : '' });
        $('#categoryDepartment').val(cat.department ? cat.department._id : '');

        $('#categoryModalTitle').text('Edit Category');
        $('#categoryModal').modal('show');
    } catch (error) {
        console.error('Error loading category', error);
        showAlert('Error loading category', 'danger');
    }
}

async function editProduct(id) {
    try {
        const product = await $.get(`/api/products/${id}`);
        $('#productId').val(product._id);
        $('#productName').val(product.name);
        $('#productPrice').val(product.price);
        $('#productDescription').val(product.description || '');
        $('#productImage').val(product.image || '');
        $('#productImageFileId').val(product.imageUpload ? product.imageUpload._id : '');
        $('#productStock').val(product.stock);
        $('#productDiscount').val(product.discount);
        $('#productFeatured').prop('checked', product.isFeatured);
        $('#productTrending').prop('checked', product.isTrending);
        $('#productNewArrival').prop('checked', product.isNewArrival);
        $('#productActive').prop('checked', product.isActive);
        setImagePreview('#productImagePreview', resolveItemImage(product));

        const departmentId = product.department ? product.department._id : '';
        const categoryId = product.category ? product.category._id : '';

        await loadDepartmentsToSelect('#productDepartment', { includeInactive: true, selectedId: departmentId });
        $('#productDepartment').val(departmentId);
        await loadCategoriesToSelect('#productCategory', departmentId, { selectedId: categoryId });
        $('#productCategory').val(categoryId);

        $('#productModalTitle').text('Edit Product');
        $('#productModal').modal('show');
    } catch (error) {
        console.error('Error loading product', error);
        showAlert('Error loading product', 'danger');
    }
}

async function editSlider(id) {
    try {
        const slider = await $.get(`/api/sliders/${id}`);
        $('#sliderId').val(slider._id);
        $('#sliderTitle').val(slider.title);
        $('#sliderDescription').val(slider.description || '');
        $('#sliderImage').val(slider.image || '');
        $('#sliderImageFileId').val(slider.imageUpload ? slider.imageUpload._id : '');
        $('#sliderLink').val(slider.link || '');
        $('#sliderOrder').val(slider.order || 0);
        $('#sliderActive').prop('checked', slider.isActive);
        setImagePreview('#sliderImagePreview', resolveItemImage(slider));

        $('#sliderModalTitle').text('Edit Slider');
        $('#sliderModal').modal('show');
    } catch (error) {
        console.error('Error loading slider', error);
        showAlert('Error loading slider', 'danger');
    }
}

async function editBanner(id) {
    try {
        const banner = await $.get(`/api/banners/detail/${id}`);
        $('#bannerId').val(banner._id);
        $('#bannerTitle').val(banner.title);
        $('#bannerDescription').val(banner.description || '');
        $('#bannerImage').val(banner.image || '');
        $('#bannerImageFileId').val(banner.imageUpload ? banner.imageUpload._id : '');
        $('#bannerLink').val(banner.link || '');
        $('#bannerPosition').val(banner.position || 'middle');
        $('#bannerActive').prop('checked', banner.isActive);
        setImagePreview('#bannerImagePreview', resolveItemImage(banner));

        $('#bannerModalTitle').text('Edit Banner');
        $('#bannerModal').modal('show');
    } catch (error) {
        console.error('Error loading banner', error);
        showAlert('Error loading banner', 'danger');
    }
}

async function editSection(id) {
    try {
        console.log('Loading section for edit:', id);
        const section = await $.get(`/api/admin/sections/${id}`);
        console.log('Section loaded:', section);
        
        if (!section) {
            showAlert('Section not found', 'danger');
            return;
        }

        // Reset form first to clear any previous values
        resetSectionForm();
        
        // Populate form fields
        $('#sectionId').val(section._id || '');
        $('#sectionName').val(section.name || '');
        $('#sectionType').val(section.type || '');
        $('#sectionTitle').val(section.title || '');
        $('#sectionSubtitle').val(section.subtitle || '');
        $('#sectionDescription').val(section.description || '');
        $('#sectionOrdering').val(section.ordering !== undefined ? section.ordering : 0);
        $('#sectionActive').prop('checked', section.isActive !== undefined ? section.isActive : true);
        $('#sectionPublished').prop('checked', section.isPublished !== undefined ? section.isPublished : false);
        
        // Handle config - ensure it's valid JSON
        let configValue = '{}';
        if (section.config) {
            if (typeof section.config === 'string') {
                configValue = section.config;
            } else {
                configValue = JSON.stringify(section.config, null, 2);
            }
        }
        $('#sectionConfig').val(configValue);

        $('#sectionModalTitle').text('Edit Section');
        $('#sectionModal').modal('show');
        
        console.log('Section form populated successfully');
    } catch (error) {
        console.error('Error loading section', error);
        const errorMsg = error?.responseJSON?.message || error?.message || 'Error loading section';
        showAlert(errorMsg, 'danger');
    }
}

function editUser(id) {
    // This would be implemented in a real application
    showAlert('Edit user functionality not implemented', 'info');
}


// Delete functions
function deleteDepartment(id) {
    if (confirm('Are you sure you want to delete this department?')) {
        $.ajax({
            url: `/api/departments/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Department deleted successfully', 'success');
                loadDepartments();
                loadDashboardData();
            },
            error: function() {
                showAlert('Error deleting department', 'danger');
            }
        });
    }
}

function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
        $.ajax({
            url: `/api/categories/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Category deleted successfully', 'success');
                loadCategories();
                loadDashboardData();
            },
            error: function() {
                showAlert('Error deleting category', 'danger');
            }
        });
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        $.ajax({
            url: `/api/products/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Product deleted successfully', 'success');
                loadProducts(1);
                loadDashboardData();
            },
            error: function() {
                showAlert('Error deleting product', 'danger');
            }
        });
    }
}

function deleteSlider(id) {
    if (confirm('Are you sure you want to delete this slider?')) {
        $.ajax({
            url: `/api/sliders/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Slider deleted successfully', 'success');
                loadSliders();
            },
            error: function() {
                showAlert('Error deleting slider', 'danger');
            }
        });
    }
}

function deleteBanner(id) {
    if (confirm('Are you sure you want to delete this banner?')) {
        $.ajax({
            url: `/api/banners/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Banner deleted successfully', 'success');
                loadBanners();
            },
            error: function() {
                showAlert('Error deleting banner', 'danger');
            }
        });
    }
}

function deleteSection(id) {
    if (confirm('Are you sure you want to delete this section? It will be removed from the main page.')) {
        $.ajax({
            url: `/api/admin/sections/${id}`,
            method: 'DELETE',
            success: function() {
                showAlert('Section deleted successfully. The main page will be updated on refresh.', 'success');
                loadSections();
                // Note: Main page will automatically reflect the deletion on next page load or refresh
            },
            error: function() {
                showAlert('Error deleting section', 'danger');
            }
        });
    }
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        // This would be implemented in a real application
        showAlert('Delete user functionality not implemented', 'info');
    }
}

// Alert function
function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('.content').prepend(alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}

const IMAGE_PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#f1f5f9" rx="16"/><text x="50%" y="52%" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">No image selected</text></svg>`);

function resolveItemImage(item) {
    if (!item) return null;
    if (item.imageUpload && item.imageUpload.url) {
        return item.imageUpload.url;
    }
    if (item.image) {
        return item.image;
    }
    return null;
}

function setImagePreview(selector, url) {
    const safeUrl = url || IMAGE_PLACEHOLDER;
    $(selector).attr('src', safeUrl);
}

function initImageField({ urlInput, fileInput, preview }) {
    const $urlInput = $(urlInput);
    const $fileInput = $(fileInput);

    $urlInput.on('input', function () {
        const value = $(this).val();
        if (value) {
            setImagePreview(preview, value);
        } else if (!$fileInput[0]?.files?.length) {
            setImagePreview(preview, null);
        }
    });

    $fileInput.on('change', function () {
        const file = this.files && this.files[0];
        if (!file) {
            const value = $urlInput.val();
            setImagePreview(preview, value || null);
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            setImagePreview(preview, event.target.result);
        };
        reader.readAsDataURL(file);
    });
}

async function uploadImageIfNeeded(fileInputSelector, folder) {
    const input = $(fileInputSelector)[0];
    if (!input || !input.files || !input.files.length) {
        return null;
    }

    const formData = new FormData();
    formData.append('file', input.files[0]);
    if (folder) {
        formData.append('folder', folder);
    }

    const response = await $.ajax({
        url: '/api/admin/media',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false
    });

    // Clear the file input so future saves do not re-upload
    input.value = '';
    return response;
}

function normaliseFileId(value) {
    if (!value || value === 'null' || value === 'undefined') {
        return '';
    }
    return value;
}