document.addEventListener('DOMContentLoaded', () => {

    /* --- MODAL LOGIC --- */
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const exploreBtn = document.getElementById('exploreBtn');
    
    // Function to open modal
    window.openModal = (type) => {
        if(type === 'login') {
            signupModal.classList.remove('modal-active');
            loginModal.classList.add('modal-active');
        } else if (type === 'signup') {
            loginModal.classList.remove('modal-active');
            signupModal.classList.add('modal-active');
        }
    };

    // Function to close modal
    window.closeModal = () => {
        loginModal.classList.remove('modal-active');
        signupModal.classList.remove('modal-active');
    };

    // Trigger from Landing Page
    if(exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    }

    // Check URL parameters for errors (to reopen modal if login failed)
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('error')) {
        if(urlParams.get('error') === 'login_failed') openModal('login');
        if(urlParams.get('error') === 'email_exists') openModal('signup');
    }

    /* --- SCROLL ANIMATIONS --- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });

    document.querySelectorAll('.location-card, .package-card, .section-title').forEach((el) => {
        el.style.opacity = "0"; // Hide initially
        observer.observe(el);
    });

    /* --- BOOKING PRICE CALCULATION --- */
    const travelersInput = document.getElementById('travelers');
    if (travelersInput) {
        const price = document.getElementById('price-data').dataset.price;
        travelersInput.addEventListener('input', function() {
            const total = this.value * price;
            document.getElementById('totalPrice').innerText = total.toLocaleString();
        });
    }
});
 function togglePassword(inputId, icon) {
            const input = document.getElementById(inputId);
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        }
