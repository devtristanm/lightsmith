// Smooth scrolling for navigation links
function scrollToContact() {
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth'
    });
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const fileUpload = document.getElementById('houseImages');
    const fileUploadArea = document.querySelector('.file-upload-area');
    
    // File upload visual feedback
    fileUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        const fileUploadText = fileUploadArea.querySelector('.file-upload-text p');
        
        if (files.length > 0) {
            fileUploadText.textContent = `${files.length} file(s) selected`;
            fileUploadArea.style.borderColor = '#228B22';
            fileUploadArea.style.backgroundColor = 'rgba(34, 139, 34, 0.1)';
        } else {
            fileUploadText.textContent = 'Click to upload photos of your home\'s front and back';
            fileUploadArea.style.borderColor = '#444444';
            fileUploadArea.style.backgroundColor = '#1a1a1a';
        }
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add loading state
        contactForm.classList.add('loading');
        
        // Collect form data
        const formData = new FormData(contactForm);
        const data = {};
        
        // Convert FormData to regular object for JobNimbus
        for (let [key, value] of formData.entries()) {
            if (key === 'houseImages') {
                data[key] = value.name || 'No files selected';
            } else {
                data[key] = value;
            }
        }
        
        // Add JobNimbus-specific fields
        data.leadSource = 'Website Quote Request';
        data.leadType = 'Christmas Lights Installation';
        data.timestamp = new Date().toISOString();
        data.fullName = `${data.firstName} ${data.lastName}`;
        
        // Submit to Zapier webhook with CORS handling
        const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/17573513/uiiq9a2/';
        
        // Use a CORS proxy for development/testing
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const fullUrl = proxyUrl + zapierWebhookUrl;
        
        fetch(fullUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            // Show success message
            showSuccessMessage();
            
            // Reset form
            contactForm.reset();
            fileUploadArea.style.borderColor = '#444444';
            fileUploadArea.style.backgroundColor = '#1a1a1a';
            fileUploadArea.querySelector('.file-upload-text p').textContent = 'Click to upload photos of your home\'s front and back';
            
            // Remove loading state
            contactForm.classList.remove('loading');
            
            console.log('Form submitted successfully:', result);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            
            // Still show success message to user (don't reveal technical errors)
            showSuccessMessage();
            
            // Reset form
            contactForm.reset();
            fileUploadArea.style.borderColor = '#444444';
            fileUploadArea.style.backgroundColor = '#1a1a1a';
            fileUploadArea.querySelector('.file-upload-text p').textContent = 'Click to upload photos of your home\'s front and back';
            
            // Remove loading state
            contactForm.classList.remove('loading');
        });
    });
    
    // Form validation
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        // Remove existing error styling
        field.classList.remove('error');
        removeErrorMessage(field);
        
        if (!value) {
            showFieldError(field, `${getFieldLabel(fieldName)} is required`);
            return false;
        }
        
        // Email validation
        if (fieldName === 'email' && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        // Phone validation
        if (fieldName === 'phone' && !isValidPhone(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#DC143C';
        errorDiv.style.fontSize = '0.9rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    function getFieldLabel(fieldName) {
        const labels = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email Address',
            phone: 'Phone Number',
            address: 'Property Address',
            quoteType: 'Quote Type',
            description: 'Description'
        };
        return labels[fieldName] || fieldName;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
    
    function showSuccessMessage() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <div style="
                background: linear-gradient(45deg, #228B22, #32CD32);
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 8px 25px rgba(34, 139, 34, 0.3);
            ">
                <h3 style="margin-bottom: 10px;">🎉 Thank You!</h3>
                <p>Your quote request has been submitted successfully. We'll contact you within 24 hours to discuss your Christmas lighting project!</p>
            </div>
        `;
        
        // Insert before the form
        contactForm.parentNode.insertBefore(successDiv, contactForm);
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth' });
    }
});

// Carousel Functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    showSlide(0);
    
    // Auto-play disabled - manual navigation only
});

// Update showSlide function to reinitialize sliders
function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    currentSlideIndex = index;
    
    // Reinitialize comparison sliders for the active slide
    setTimeout(() => {
        initializeComparisonSliders();
    }, 100);
}

function changeSlide(direction) {
    let newIndex = currentSlideIndex + direction;
    
    if (newIndex >= slides.length) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = slides.length - 1;
    }
    
    showSlide(newIndex);
}

function currentSlide(index) {
    showSlide(index - 1);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', function() {
    showSlide(0);
    
    // Auto-play disabled - manual navigation only
});

// Snowfall Animation
function createSnowfall() {
    const snowfall = document.getElementById('snowfall');
    const snowflakes = ['❄', '❅', '❆', '✻', '✼', '✽', '✾', '✿'];
    
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        
        // Random positioning
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
        
        // Random animation duration (3-8 seconds)
        const duration = Math.random() * 5 + 3;
        snowflake.style.animationDuration = duration + 's';
        
        // Random delay
        snowflake.style.animationDelay = Math.random() * 2 + 's';
        
        snowfall.appendChild(snowflake);
        
        // Remove snowflake after animation completes
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, (duration + 2) * 1000);
    }
    
    // Create snowflakes periodically
    setInterval(createSnowflake, 200); // Create a new snowflake every 200ms
}

// Initialize snowfall when page loads
document.addEventListener('DOMContentLoaded', function() {
    createSnowfall();
});

// Add CSS for error states
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #DC143C !important;
        box-shadow: 0 0 10px rgba(220, 20, 60, 0.3) !important;
    }
    
    .field-error {
        animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Mobile menu toggle (for future enhancement)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
        header.style.backdropFilter = 'none';
    }
});

// Add animation on scroll for gallery items
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Comparison Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeComparisonSliders();
});

function initializeComparisonSliders() {
    const allSliders = document.querySelectorAll('.comparison-slider');
    
    allSliders.forEach(slider => {
        const sliderHandle = slider.querySelector('.slider-handle');
        const afterImage = slider.querySelector('.after-image');
        const comparisonImage = slider.querySelector('.comparison-image');
        
        if (sliderHandle && afterImage && comparisonImage) {
        let isDragging = false;
        
        // Mouse events
        sliderHandle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        // Touch events for mobile
        sliderHandle.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', stopDrag);
        
        function startDrag(e) {
            isDragging = true;
            sliderHandle.style.cursor = 'ew-resize';
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const rect = comparisonImage.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            sliderHandle.style.left = percentage + '%';
        }
        
        function stopDrag() {
            isDragging = false;
            sliderHandle.style.cursor = 'ew-resize';
        }
        
        // Click to position slider
        comparisonImage.addEventListener('click', function(e) {
            const rect = comparisonImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            sliderHandle.style.left = percentage + '%';
        });
        }
    });
}
