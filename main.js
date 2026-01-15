/* --- MENU MOBILE --- */
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
    menuBtn.setAttribute("aria-expanded", isOpen);
});

navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
    menuBtn.setAttribute("aria-expanded", "false");
});

/* --- SCROLL REVEAL (Animações) --- */
if (typeof ScrollReveal !== 'undefined') {
    const scrollRevealOptions = {
        distance: '50px',
        origin: 'bottom',
        duration: 800,
        reset: false,
    };

    ScrollReveal().reveal(".header__container h1", { ...scrollRevealOptions });
    ScrollReveal().reveal(".header__container .para", { ...scrollRevealOptions, delay: 200 });
    ScrollReveal().reveal(".header__container .btn", { ...scrollRevealOptions, delay: 500 });
    ScrollReveal().reveal(".about__item", { ...scrollRevealOptions, interval: 300 });
    ScrollReveal().reveal(".stats__image img", { ...scrollRevealOptions, origin: 'right', interval: 300 });
    ScrollReveal().reveal(".stats__card", { interval: 200, duration: 600, delay: 200 });
    ScrollReveal().reveal(".blog__card", { ...scrollRevealOptions, interval: 300 });
}

/* --- SWIPER (Carrossel) --- */
if (typeof Swiper !== 'undefined') {
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        grabCursor: true,
    });
}

/* --- TEMA DARK/LIGHT --- */
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = themeToggle.querySelector('.ri-moon-line');
const sunIcon = themeToggle.querySelector('.ri-sun-line');

function updateThemeIcon(isLight) {
    if (isLight) {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    } else {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }
}

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon(true);
} else {
    document.documentElement.removeAttribute('data-theme');
    updateThemeIcon(false);
}

themeToggle.addEventListener('click', () => {
    const hasLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
    if (hasLightTheme) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(true);
    }
});