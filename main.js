const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});

navLinks.addEventListener("click", (e) => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOptions = {
    distance: '50px',
    origin: 'bottom',
    duration: 1000,
};

ScrollReveal().reveal(".header__container h1", {
    ...scrollRevealOptions,
});

ScrollReveal().reveal(".header__container .btn", {
    ...scrollRevealOptions,
    delay: 500,
});

ScrollReveal().reveal(".about__item", {
    ...scrollRevealOptions,
    interval: 500,
});

ScrollReveal().reveal(".stats__image img", {
    ...scrollRevealOptions,
    origin: 'right',
    interval: 500,
});

ScrollReveal().reveal(".stats__card", {
    interval: 500,
    duration: 500,
    delay: 1000,
});

ScrollReveal().reveal(".blog__card", {
    ...scrollRevealOptions,
    interval: 500,
});

const swiper = new Swiper('.swiper', {
    loop: true,
    pagination: {
        el: ".swiper-pagination",
    },
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = themeToggle.querySelector('.ri-moon-line');
const sunIcon = themeToggle.querySelector('.ri-sun-line');

// Verificar tema salvo
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  toggleIcons(savedTheme);
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  toggleIcons(newTheme);
});

function toggleIcons(theme) {
  if (theme === 'dark') {
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  } else {
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  }
}

if (!savedTheme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = prefersDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', initialTheme);
  toggleIcons(initialTheme);
}
