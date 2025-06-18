let currentStep = 0;
const steps = document.querySelectorAll('.step');
const totalSteps = steps.length;

// Initialize galleries when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeGalleries();
});

// Initialize all image galleries
function initializeGalleries() {
    const imageContainers = document.querySelectorAll('.image-container');
    
    imageContainers.forEach(container => {
        const images = container.querySelectorAll('img');
        
        if (images.length > 1) {
            setupGallery(container, images);
        }
    });
}

// Setup gallery for a container with multiple images
function setupGallery(container, images) {
    // Add gallery class for styling
    container.classList.add('gallery');
    
    // Hide all images except the first
    images.forEach((img, index) => {
        if (index === 0) {
            img.classList.add('active');
        } else {
            img.style.display = 'none';
        }
    });
    
    // Create navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-btn gallery-prev';
    prevBtn.innerHTML = '‹';
    prevBtn.setAttribute('aria-label', 'Previous image');
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-btn gallery-next';
    nextBtn.innerHTML = '›';
    nextBtn.setAttribute('aria-label', 'Next image');
    
    // Create image counter
    const counter = document.createElement('div');
    counter.className = 'gallery-counter';
    counter.textContent = `1 / ${images.length}`;
    
    // Add elements to container
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(counter);
    
    // Set up navigation functionality
    let currentImageIndex = 0;
    
    function showImage(index) {
        // Hide current image with fade out
        const currentImg = images[currentImageIndex];
        currentImg.style.opacity = '0';
        
        setTimeout(() => {
            currentImg.style.display = 'none';
            currentImg.classList.remove('active');
            
            // Show new image with fade in
            currentImageIndex = index;
            const newImg = images[currentImageIndex];
            newImg.style.display = 'block';
            newImg.classList.add('active');
            
            // Force reflow before fade in
            newImg.offsetHeight;
            newImg.style.opacity = '1';
            
            // Update counter
            counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }, 150);
    }
    
    function nextImage() {
        const nextIndex = (currentImageIndex + 1) % images.length;
        showImage(nextIndex);
    }
    
    function prevImage() {
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        showImage(prevIndex);
    }
    
    // Add event listeners
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    // Initialize image transitions
    images.forEach(img => {
        img.style.transition = 'opacity 0.1s ease-in-out';
        img.style.opacity = '1';
    });
    
    // Keyboard navigation for focused galleries
    container.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevImage();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextImage();
        }
    });
    
    // Make container focusable for keyboard navigation
    container.setAttribute('tabindex', '0');
}

// Scroll to next step function
function scrollToNextStep() {
    if (currentStep < totalSteps - 1) {
        currentStep++;
    } else {
        currentStep = 0; // Loop back to first step
    }
    
    steps[currentStep].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

function scrollToPrevStep() {
    if (currentStep > 0) {
        currentStep--;
    } else {
        currentStep = totalSteps - 1; // Loop back to first step
    }
    
    steps[currentStep].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}
// Track which step is currently visible
function updateCurrentStep() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    steps.forEach((step, index) => {
        const stepTop = step.offsetTop;
        const stepBottom = stepTop + step.offsetHeight;
        
        if (scrollPosition >= stepTop && scrollPosition <= stepBottom) {
            currentStep = index;
        }
    });
}

var lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
function on_scroll(){ // or window.addEventListener("scroll"....
   var st = window.pageYOffset || document.documentElement.scrollTop;
   if (st > lastScrollTop) {
      // downscroll code
   } else if (st < lastScrollTop) {
      // upscroll code
   } // else was horizontal scroll
   lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
}

// Update current step on scroll
window.addEventListener('scroll', updateCurrentStep);

// Modal functionality for full-size images
function showModal(element) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    if (element.tagName === 'IMG' && element.src) {
        modalImg.src = element.src;
        modal.style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        scrollToNextStep();
    } else if (event.key === 'ArrowUp'){
        event.preventDefault();
        scrollToPrevStep();
    } else if (event.key === 'Escape') {
        closeModal();
    }
});