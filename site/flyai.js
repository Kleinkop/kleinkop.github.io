let currentStep = 0;
const steps = document.querySelectorAll('.step');
const totalSteps = steps.length;

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
    } else if (event.key === 'Escape') {
        closeModal();
    }
});