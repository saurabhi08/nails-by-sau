// my nail booking website javascript
// made for capstone project

// wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    // call functions when page loads
    initNavigation();
    initCalendar();
    initTimeSlots();
    initForms();
    initAccessibility();
    initServiceCards();
    initAdminDashboard();
});

// navigation menu function
function initNavigation() {
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            var isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            
            // change button text
            navToggle.setAttribute('aria-label', 
                isExpanded ? 'Close navigation menu' : 'Open navigation menu');
        });
        
        // close menu when click outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open navigation menu');
            }
        });
        
        // close menu with escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open navigation menu');
                navToggle.focus();
            }
        });
    }
}

// Calendar functionality
function initCalendar() {
    const calendarContainer = document.querySelector('.calendar');
    if (!calendarContainer) return;
    
    let currentDate = new Date();
    let selectedDate = null;
    
    // Generate calendar
    function generateCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.backgroundColor = 'var(--primary-color)';
            dayHeader.style.color = 'var(--text-light)';
            calendarGrid.appendChild(dayHeader);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            emptyDay.textContent = '';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
            
            // Check if date is available (mock data)
            const isAvailable = checkDateAvailability(year, month + 1, day);
            if (isAvailable) {
                dayElement.classList.add('available');
            }
            
            dayElement.addEventListener('click', function() {
                selectDate(dayElement);
            });
            
            dayElement.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectDate(dayElement);
                }
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Check if a date is available for booking
    function checkDateAvailability(year, month, day) {
        // Mock availability - in real app, this would check against booked appointments
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Don't allow past dates
        if (date < today) return false;
        
        // Mock: available on weekdays, not weekends
        const dayOfWeek = date.getDay();
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    }
    
    // Select a date
    function selectDate(dayElement) {
        // Remove previous selection
        const previousSelected = document.querySelector('.calendar-day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add selection to clicked day
        dayElement.classList.add('selected');
        selectedDate = dayElement.getAttribute('data-date');
        
        // Generate time slots for selected date
        generateTimeSlots(selectedDate);
        
        // Update form with selected date
        const dateInput = document.querySelector('input[name="appointment-date"]');
        if (dateInput) {
            dateInput.value = selectedDate;
        }
    }
    
    // Navigation buttons
    const prevButton = document.querySelector('.calendar-nav.prev');
    const nextButton = document.querySelector('.calendar-nav.next');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
            updateCalendarHeader();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
            updateCalendarHeader();
        });
    }
    
    // Update calendar header
    function updateCalendarHeader() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const header = document.querySelector('.calendar-header h3');
        if (header) {
            header.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    }
    
    // Initialize calendar
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    updateCalendarHeader();
}

// Time slots functionality
function initTimeSlots() {
    // This will be called by the calendar when a date is selected
}

function generateTimeSlots(selectedDate) {
    const timeSlotsContainer = document.querySelector('.time-slots');
    if (!timeSlotsContainer) return;
    
    // Clear existing time slots
    timeSlotsContainer.innerHTML = '';
    
    // Mock time slots (9 AM to 5 PM, hourly)
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
    ];
    
    timeSlots.forEach(time => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        slotElement.textContent = time;
        slotElement.setAttribute('data-time', time);
        
        // Mock availability check
        const isAvailable = Math.random() > 0.3; // 70% chance of being available
        
        if (!isAvailable) {
            slotElement.classList.add('booked');
            slotElement.setAttribute('aria-label', `${time} - Not available`);
        } else {
            slotElement.setAttribute('aria-label', `${time} - Available`);
            slotElement.addEventListener('click', function() {
                selectTimeSlot(slotElement);
            });
            
            slotElement.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectTimeSlot(slotElement);
                }
            });
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

function selectTimeSlot(slotElement) {
    // Remove previous selection
    const previousSelected = document.querySelector('.time-slot.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }
    
    // Add selection to clicked slot
    slotElement.classList.add('selected');
    
    // Update form with selected time
    const timeInput = document.querySelector('input[name="appointment-time"]');
    if (timeInput) {
        timeInput.value = slotElement.getAttribute('data-time');
    }
}

// Form functionality
function initForms() {
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!validateForm(form)) {
                event.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.getAttribute('id');
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(field)} is required.`;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number.';
        }
    }
    
    // Password validation
    if (field.type === 'password' && value) {
        if (value.length < 8) {
            isValid = false;
            errorMessage = 'Password must be at least 8 characters long.';
        }
    }
    
    // Show/hide error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        return label.textContent.replace('*', '').trim();
    }
    return field.getAttribute('placeholder') || field.getAttribute('name') || 'This field';
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
}

// Accessibility features
function initAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(event) {
            event.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Focus management for modals and dropdowns
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab') {
            handleTabNavigation(event);
        }
    });
    
    // Announce dynamic content changes
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    document.body.appendChild(announcer);
    
    // Function to announce messages
    window.announceToScreenReader = function(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    };
}

function handleTabNavigation(event) {
    const focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
        if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
    } else {
        if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
}

// Service cards functionality
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceId = card.getAttribute('data-service-id');
            if (serviceId) {
                // Navigate to booking page with pre-selected service
                window.location.href = `book-appointment.html?service=${serviceId}`;
            }
        });
        
        // Make cards keyboard accessible
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });
    });
}

// Admin dashboard functionality
function initAdminDashboard() {
    // Dashboard stats animation
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
    
    // Table row interactions
    const tableRows = document.querySelectorAll('.table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove previous selection
            tableRows.forEach(r => r.classList.remove('selected'));
            // Add selection to clicked row
            row.classList.add('selected');
        });
    });
}

function animateNumber(element) {
    const target = parseInt(element.textContent);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Utility functions
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.alerts-container') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.setAttribute('role', 'alert');
    alert.innerHTML = `
        <span>${message}</span>
        <button type="button" class="alert-close" aria-label="Close alert">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeButton = alert.querySelector('.alert-close');
    closeButton.addEventListener('click', () => {
        alert.remove();
    });
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alerts-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '1000';
    document.body.appendChild(container);
    return container;
}

// Export functions for use in other scripts
window.NailBookingSystem = {
    validateForm,
    showAlert,
    formatDate,
    formatTime,
    announceToScreenReader: window.announceToScreenReader
};





