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

