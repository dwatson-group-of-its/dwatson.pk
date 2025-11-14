$(document).ready(function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Set token for all AJAX requests
    $.ajaxSetup({
        headers: {
            'x-auth-token': token
        }
    });
    
    // Load cart on page load
    loadCart();
    loadCartCount();
    loadDepartments();
    
    // Auto-open checkout modal if cart has items and URL has ?checkout parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'true') {
        // Wait for cart to load, then open modal
        let checkCount = 0;
        const checkCart = setInterval(() => {
            checkCount++;
            const cartItems = $('#cartItems').children().length;
            const isEmptyCart = $('#emptyCart').is(':visible');
            
            if (cartItems > 0 && !isEmptyCart) {
                clearInterval(checkCart);
                $('#checkoutModal').modal('show');
            } else if (checkCount > 10 || isEmptyCart) {
                // Stop checking after 5 seconds or if cart is empty
                clearInterval(checkCart);
            }
        }, 500);
    }
    
    // Checkout button click
    $('#checkoutBtn').click(function() {
        $('#checkoutModal').modal('show');
    });
    
    // Handle modal shown event - ensure proper focus management
    $('#checkoutModal').on('shown.bs.modal', function() {
        // Focus on first input for accessibility (after Bootstrap sets aria-hidden to false)
        setTimeout(() => {
            $('#shippingStreet').focus();
        }, 100);
    });
    
    // Handle modal hide event - remove focus before hiding to prevent aria-hidden warning
    $('#checkoutModal').on('hide.bs.modal', function() {
        // Remove focus from any focused element inside modal before it's hidden
        const focusedElement = $(this).find(':focus');
        if (focusedElement.length) {
            focusedElement.blur();
        }
    });
    
    // Same as shipping address checkbox - hide billing fields by default
    $('#billingAddressFields').hide();
    
    $('#sameAsShipping').change(function() {
        if ($(this).is(':checked')) {
            $('#billingAddressFields').hide();
            copyShippingToBilling();
        } else {
            $('#billingAddressFields').show();
        }
    });
    
    // Place order button
    $('#placeOrderBtn').click(function() {
        // Remove focus from button before hiding modal to prevent aria-hidden warning
        $(this).blur();
        placeOrder();
    });
});

function loadCart() {
    $.get('/api/cart')
        .done(function(data) {
            console.log('Cart data loaded:', data);
            console.log('Cart items count:', data.items ? data.items.length : 0);
            
            if (!data.items || data.items.length === 0) {
                console.log('Cart is empty');
                $('#emptyCart').show();
                $('#cartContent').hide();
                return;
            }
            
            // Log each item to debug
            data.items.forEach((item, index) => {
                console.log(`Cart item ${index}:`, {
                    product: item.product,
                    productId: item.product?._id || item.product?.id,
                    quantity: item.quantity,
                    price: item.price
                });
            });
            
            renderCartItems(data.items);
            updateCartSummary(data);
        })
        .fail(function(error) {
            console.error('Error loading cart:', error);
            console.error('Error response:', error.responseJSON);
            if (error.status === 401) {
                showAlert('Please log in to view your cart.', 'warning');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const errorMsg = error.responseJSON?.message || 'Error loading cart. Please try again.';
                showAlert(errorMsg, 'danger');
            }
        });
}

function renderCartItems(items) {
    let html = '';
    let validItemsCount = 0;
    
    if (!items || items.length === 0) {
        $('#emptyCart').show();
        $('#cartContent').hide();
        return;
    }
    
    items.forEach(function(item) {
        const product = item.product;
        if (!product) {
            console.warn('Cart item missing product, skipping:', item);
            return;
        }
        
        validItemsCount++;
        
        // Handle product ID - could be string or object
        let productId = '';
        if (product._id) {
            productId = typeof product._id === 'string' ? product._id : product._id.toString();
        } else if (product.id) {
            productId = typeof product.id === 'string' ? product.id : product.id.toString();
        }
        
        if (!productId) {
            console.warn('Product missing ID:', product);
            return;
        }
        
        const productName = product.name || 'Unknown Product';
        const productImage = product.image || (product.imageUpload && product.imageUpload.url) || 'https://via.placeholder.com/100';
        const itemPrice = item.price || 0;
        const discount = item.discount || 0;
        const quantity = item.quantity || 1;
        const finalPrice = itemPrice * (1 - discount / 100);
        const itemSubtotal = item.subtotal || (finalPrice * quantity);
        
        html += `
            <div class="cart-item" data-product-id="${productId}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${productImage}" alt="${productName}" class="cart-item-image">
                    </div>
                    <div class="col-md-4">
                        <h6>${productName}</h6>
                        ${product.category?.name ? `<small class="text-muted">${product.category.name}</small>` : ''}
                    </div>
                    <div class="col-md-2">
                        <div class="price-info">
                            <div>Rs. ${finalPrice.toFixed(2)}</div>
                            ${discount > 0 ? `<small class="text-muted text-decoration-line-through">Rs. ${itemPrice.toFixed(2)}</small>` : ''}
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity" data-product-id="${productId}" type="button">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="form-control quantity-input" value="${quantity}" min="1" data-product-id="${productId}" readonly>
                            <button class="quantity-btn increase-quantity" data-product-id="${productId}" type="button">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-1 text-end">
                        <div class="item-subtotal mb-2">
                            <strong>Rs. ${itemSubtotal.toFixed(2)}</strong>
                        </div>
                        <button class="btn btn-sm btn-danger remove-item" data-product-id="${productId}" type="button">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (validItemsCount === 0) {
        console.warn('No valid items to render');
        $('#emptyCart').show();
        $('#cartContent').hide();
        return;
    }
    
    $('#cartItems').html(html);
    $('#emptyCart').hide();
    $('#cartContent').show();
    
    // Add event handlers
    $('.increase-quantity').click(function() {
        const productId = $(this).data('product-id');
        updateQuantity(productId, 1);
    });
    
    $('.decrease-quantity').click(function() {
        const productId = $(this).data('product-id');
        updateQuantity(productId, -1);
    });
    
    $('.quantity-input').change(function() {
        const productId = $(this).data('product-id');
        const newQuantity = parseInt($(this).val(), 10);
        if (newQuantity > 0) {
            setQuantity(productId, newQuantity);
        }
    });
    
    $('.remove-item').click(function() {
        const productId = $(this).data('product-id');
        removeItem(productId);
    });
}

function updateQuantity(productId, change) {
    $.get('/api/cart')
        .done(function(data) {
            const item = data.items.find(i => {
                const pid = i.product._id || i.product.id;
                const pidStr = typeof pid === 'string' ? pid : pid.toString();
                return pidStr === productId;
            });
            if (!item) return;
            
            const newQuantity = item.quantity + change;
            if (newQuantity < 1) {
                removeItem(productId);
            } else {
                setQuantity(productId, newQuantity);
            }
        })
        .fail(function(error) {
            console.error('Error loading cart for quantity update:', error);
        });
}

function setQuantity(productId, quantity) {
    $.ajax({
        url: '/api/cart/update',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ productId, quantity })
    })
    .done(function(data) {
        loadCart();
        loadCartCount();
    })
    .fail(function(error) {
        console.error('Error updating quantity:', error);
        const message = error.responseJSON?.message || 'Error updating quantity';
        showAlert(message, 'danger');
    });
}

function removeItem(productId) {
    if (!confirm('Are you sure you want to remove this item from cart?')) {
        return;
    }
    
    $.ajax({
        url: `/api/cart/remove/${productId}`,
        method: 'DELETE'
    })
    .done(function(data) {
        loadCart();
        loadCartCount();
        showAlert('Item removed from cart', 'success');
    })
    .fail(function(error) {
        console.error('Error removing item:', error);
        showAlert('Error removing item', 'danger');
    });
}

function updateCartSummary(data) {
    // Calculate subtotal from items if total is not provided
    let subtotal = data.total || 0;
    if (subtotal === 0 && data.items) {
        subtotal = data.items.reduce((sum, item) => {
            const itemPrice = item.price || 0;
            const discount = item.discount || 0;
            const quantity = item.quantity || 1;
            const finalPrice = itemPrice * (1 - discount / 100);
            return sum + (finalPrice * quantity);
        }, 0);
    }
    
    const shipping = 0; // Can be calculated based on address
    const tax = 0; // Can be calculated
    const total = subtotal + shipping + tax;
    
    $('#cartSubtotal').text('Rs. ' + subtotal.toFixed(2));
    $('#cartShipping').text('Rs. ' + shipping.toFixed(2));
    $('#cartTax').text('Rs. ' + tax.toFixed(2));
    $('#cartTotal').text('Rs. ' + total.toFixed(2));
}

function copyShippingToBilling() {
    $('#billingStreet').val($('#shippingStreet').val());
    $('#billingCity').val($('#shippingCity').val());
    $('#billingState').val($('#shippingState').val());
    $('#billingZipCode').val($('#shippingZipCode').val());
    $('#billingCountry').val($('#shippingCountry').val());
}

async function placeOrder() {
    // Validate form
    if (!$('#checkoutForm')[0].checkValidity()) {
        $('#checkoutForm')[0].reportValidity();
        return;
    }
    
    // Copy billing address if same as shipping
    if ($('#sameAsShipping').is(':checked')) {
        copyShippingToBilling();
    }
    
    const shippingAddress = {
        street: $('#shippingStreet').val(),
        city: $('#shippingCity').val(),
        state: $('#shippingState').val(),
        zipCode: $('#shippingZipCode').val(),
        country: $('#shippingCountry').val(),
        phone: $('#shippingPhone').val()
    };
    
    const billingAddress = {
        street: $('#billingStreet').val(),
        city: $('#billingCity').val(),
        state: $('#billingState').val(),
        zipCode: $('#billingZipCode').val(),
        country: $('#billingCountry').val()
    };
    
    const orderData = {
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        paymentMethod: $('#paymentMethod').val(),
        notes: $('#orderNotes').val() || ''
    };
    
    try {
        const response = await $.ajax({
            url: '/api/orders',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData)
        });
        
        // Remove focus from button before hiding modal
        $('#placeOrderBtn').blur();
        // Hide modal
        $('#checkoutModal').modal('hide');
        showAlert('Order placed successfully! Order Number: ' + (response.orderNumber || response._id), 'success');
        
        // Clear cart and reload
        setTimeout(() => {
            loadCart();
            loadCartCount();
        }, 2000);
        
        // Optionally redirect to order confirmation page
        // window.location.href = `/order/${response._id}`;
        
    } catch (error) {
        console.error('Error placing order:', error);
        console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            responseJSON: error.responseJSON,
            responseText: error.responseText
        });
        
        let message = 'Error placing order. Please try again.';
        
        if (error.responseJSON) {
            message = error.responseJSON.message || message;
            if (error.responseJSON.requestId) {
                console.error('Request ID for support:', error.responseJSON.requestId);
                message += ` (Request ID: ${error.responseJSON.requestId})`;
            }
        } else if (error.status === 0) {
            message = 'Network error. Please check your internet connection.';
        } else if (error.status === 500) {
            message = 'Server error. Please try again later or contact support.';
        } else if (error.status === 400) {
            message = error.responseText || 'Invalid request. Please check your information.';
        }
        
        showAlert(message, 'danger');
    }
}

function loadCartCount() {
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
                menu.html(departments.map(dept => `
                    <li><a class="dropdown-item" href="/department/${dept._id}">${dept.name}</a></li>
                `).join(''));
            }
            
            if (footer.length) {
                footer.html(departments.map(dept => `
                    <li><a href="/department/${dept._id}">${dept.name}</a></li>
                `).join(''));
            }
        })
        .fail(function() {
            console.error('Error loading departments');
        });
}

function showAlert(message, type) {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('body').append(alertHtml);
    
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}

