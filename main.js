/* --- MENU MOBILE & ACESSIBILIDADE --- */
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
    
    // Melhoria de SEO/Acessibilidade: Informa se o menu está expandido
    menuBtn.setAttribute("aria-expanded", isOpen);
});

navLinks.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
    menuBtn.setAttribute("aria-expanded", "false");
});

/* --- ANIMAÇÕES (SCROLL REVEAL) --- */
// Verificação de segurança para garantir que a lib carregou
if (typeof ScrollReveal !== 'undefined') {
    const scrollRevealOptions = {
        distance: '50px',
        origin: 'bottom',
        duration: 800, // Levemente mais rápido para melhorar a UX
        reset: false,  // SEO: 'false' evita que o conteúdo suma ao rolar pra cima
    };

    ScrollReveal().reveal(".header__container h1", {
        ...scrollRevealOptions,
    });

    ScrollReveal().reveal(".header__container .para", { // Adicionado para animar o texto descritivo
        ...scrollRevealOptions,
        delay: 200,
    });

    ScrollReveal().reveal(".header__container .btn", {
        ...scrollRevealOptions,
        delay: 500,
    });

    ScrollReveal().reveal(".about__item", {
        ...scrollRevealOptions,
        interval: 300, 
    });

    ScrollReveal().reveal(".stats__image img", {
        ...scrollRevealOptions,
        origin: 'right', // Mantido conforme original
        interval: 300,
    });

    ScrollReveal().reveal(".stats__card", {
        interval: 200, // Intervalo mais rápido para não travar a leitura
        duration: 600,
        delay: 200,
    });

    ScrollReveal().reveal(".blog__card", {
        ...scrollRevealOptions,
        interval: 300,
    });
}

/* --- CARROSSEL (SWIPER) --- */
if (typeof Swiper !== 'undefined') {
    const swiper = new Swiper('.swiper', {
        loop: true,
        autoplay: {             // Adicionado: Roda sozinho (bom para engajamento)
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,    // Adicionado: Permite clicar nas bolinhas
        },
        grabCursor: true,       // Melhora UX no Desktop
    });
}

/* --- DARK / LIGHT MODE --- */
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = themeToggle.querySelector('.ri-moon-line');
const sunIcon = themeToggle.querySelector('.ri-sun-line');

// Função para atualizar ícones
function updateThemeIcon(isLight) {
    if (isLight) {
        // Se está no modo claro, mostra a lua (para voltar ao escuro)
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    } else {
        // Se está no modo escuro, mostra o sol (para ir ao claro)
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    }
}

// Verifica preferência salva
const savedTheme = localStorage.getItem('theme');

// Lógica: O CSS padrão é ESCURO. Só aplicamos classe se for CLARO.
if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeIcon(true);
} else {
    // Padrão (Dark)
    document.documentElement.removeAttribute('data-theme');
    updateThemeIcon(false);
}

// Evento de Clique
themeToggle.addEventListener('click', () => {
    const hasLightTheme = document.documentElement.getAttribute('data-theme') === 'light';

    if (hasLightTheme) {
        // Mudar para Dark
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon(false);
    } else {
        // Mudar para Light
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcon(true);
    }
});