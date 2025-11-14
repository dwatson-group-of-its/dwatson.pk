 $(document).ready(function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/admin';
        return;
    }
    
    // Login form submission
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        
        const email = $('#email').val();
        const password = $('#password').val();
        
        // Show loading state
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.text();
        submitBtn.text('Logging in...').prop('disabled', true);
        
        // Make API call
        $.ajax({
            url: '/api/auth/login',
            method: 'POST',
            data: {
                email: email,
                password: password
            },
            success: function(response) {
                // Store token
                localStorage.setItem('token', response.token);
                
                // Redirect to admin dashboard
                window.location.href = '/admin';
            },
            error: function(xhr) {
                // Show error message
                let errorMessage = 'Login failed. Please try again.';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                showAlert(errorMessage, 'danger');
                
                // Reset button state
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    });
});

// Alert function
function showAlert(message, type) {
    // Remove any existing alerts
    $('.alert').remove();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('.login-body').prepend(alertHtml);
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}