(function () {
    "use strict";

    var STUDIO_ORIGIN = "https://everythingburger.studio";
    var SHOP_ORIGIN = "https://everything-burger.petercsnowden.workers.dev";

    function isLocalHost() {
        var host = window.location.hostname;
        return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
    }

    function isStudioHost(host) {
        return host === "everythingburger.studio" ||
            host === "www.everythingburger.studio" ||
            /\.github\.io$/i.test(host);
    }

    function isWorkerHost(host) {
        return /\.workers\.dev$/i.test(host);
    }

    function bounceToCanonicalHost() {
        if (isLocalHost()) {
            return;
        }

        var host = window.location.hostname;
        var path = window.location.pathname || "/";
        var rest = path + window.location.search + window.location.hash;

        if (isStudioHost(host) && path.indexOf("/shop/") === 0) {
            window.location.replace(SHOP_ORIGIN + rest);
            return;
        }

        if (isWorkerHost(host) && path.indexOf("/shop/") !== 0 && path.indexOf("/api/") !== 0) {
            window.location.replace(STUDIO_ORIGIN + rest);
        }
    }

    bounceToCanonicalHost();

    var NAV_STACK_LAYOUT = {
        startPercent: 0,
        heights: [26, 20, 19, 18, 17]
    };

    var NAV_LINKS = [
        { label: " ", static: true },
        { label: "Home", page: "/index.html" },
        { label: "About Me", page: "/about/about.html" },
        { label: "Gallery", page: "/gallery/gallery.html" },
        { label: "Shop", page: "/shop/shop.html", shop: true }
    ];

    function getRootPrefix() {
        var script = document.currentScript;
        if (script && script.src) {
            try {
                return new URL("./", script.src).pathname;
            } catch (err) {}
        }
        return "/";
    }

    function navHref(link) {
        if (link.shop) {
            return SHOP_ORIGIN + "/shop/shop.html";
        }
        if (isLocalHost()) {
            return link.page;
        }
        return STUDIO_ORIGIN + link.page;
    }

    function buildNavMenu(prefix) {
        var nav = document.createElement("nav");
        nav.className = "nav-menu";
        nav.id = "nav-menu";
        nav.setAttribute("aria-hidden", "true");

        var panel = document.createElement("div");
        panel.className = "nav-menu__panel";

        var content = document.createElement("div");
        content.className = "nav-menu__content";

        var logo = document.createElement("img");
        logo.className = "nav-menu__logo";
        logo.src = prefix + "assets/images/EverythingBurgerText.svg";
        logo.alt = "Everything Burger";

        var stack = document.createElement("div");
        stack.className = "nav-stack";

        var reveal = document.createElement("div");
        reveal.className = "nav-stack__reveal";

        var stackImg = document.createElement("img");
        stackImg.className = "nav-stack__image";
        stackImg.src = prefix + "assets/images/BurgerStack.png";
        stackImg.alt = "";
        reveal.appendChild(stackImg);

        var layers = document.createElement("div");
        layers.className = "nav-stack__layers";
        layers.style.setProperty("--nav-stack-start", NAV_STACK_LAYOUT.startPercent + "%");

        NAV_LINKS.forEach(function (link, index) {
            var slot = document.createElement(link.static ? "span" : "a");
            slot.className = "nav-stack__btn" + (link.static ? " nav-stack__btn--label" : "");
            slot.style.setProperty("--nav-slot-height", NAV_STACK_LAYOUT.heights[index] + "%");

            if (!link.static) {
                slot.href = navHref(link);
            }

            slot.textContent = link.label;
            layers.appendChild(slot);
        });

        stack.appendChild(reveal);
        stack.appendChild(layers);
        content.appendChild(logo);
        content.appendChild(stack);
        panel.appendChild(content);
        nav.appendChild(panel);
        return nav;
    }

    function mountNavMenu() {
        var prefix = getRootPrefix();
        var existing = document.getElementById("nav-menu");
        if (existing) {
            existing.remove();
        }

        var menu = buildNavMenu(prefix);
        var toggle = document.querySelector(".nav-toggle");
        var toolbar = toggle && toggle.closest(".shop-toolbar");

        if (toolbar) {
            toolbar.insertAdjacentElement("afterend", menu);
        } else if (toggle) {
            toggle.insertAdjacentElement("afterend", menu);
        } else {
            document.body.insertBefore(menu, document.body.firstChild);
        }

        return menu;
    }

    var menu = mountNavMenu();
    var toggle = document.querySelector(".nav-toggle");
    var scrollY = 0;

    function setMenuOpen(isOpen) {
        if (!toggle || !menu) {
            return;
        }
        if (isOpen) {
            scrollY = window.scrollY;
            document.body.style.top = "-" + scrollY + "px";
            document.documentElement.classList.add("nav-open");
            document.body.classList.add("nav-open");
            menu.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            menu.setAttribute("aria-hidden", "false");
            toggle.setAttribute("aria-label", "Close menu");
        } else {
            menu.classList.remove("is-open");
            document.documentElement.classList.remove("nav-open");
            document.body.classList.remove("nav-open");
            document.body.style.top = "";
            window.scrollTo(0, scrollY);
            toggle.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");
            toggle.setAttribute("aria-label", "Open menu");
        }
    }

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            setMenuOpen(!menu.classList.contains("is-open"));
        });

        menu.addEventListener("click", function (event) {
            if (event.target === menu) {
                setMenuOpen(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && menu.classList.contains("is-open")) {
                setMenuOpen(false);
                toggle.focus();
            }
        });
    }
    document.querySelectorAll('.flipbook').forEach(book => {
    const sheets = [...book.querySelectorAll('.flipbook__sheet')];
    const totalSheets = sheets.length;
    const totalPages = totalSheets * 2;
    const prevBtn = book.querySelector('.flipbook__btn--prev');
    const nextBtn = book.querySelector('.flipbook__btn--next');
    const countEl = book.querySelector('.flipbook__count');
    let currentSheet = 0;

    function render() {
        sheets.forEach((sheet, i) => {
            const flipped = i < currentSheet;
            sheet.style.transform = flipped ? 'rotateY(-180deg)' : 'rotateY(0deg)';
            sheet.style.zIndex = flipped ? 100 + i : 100 - i;
        });

        if (currentSheet === 0) {
            countEl.textContent = `1 / ${totalPages}`;
        } else if (currentSheet === totalSheets) {
            countEl.textContent = `${totalPages} / ${totalPages}`;
        } else {
            countEl.textContent = `${currentSheet * 2}-${currentSheet * 2 + 1} / ${totalPages}`;
        }

        prevBtn.disabled = currentSheet === 0;
        nextBtn.disabled = currentSheet === totalSheets;
    }

    prevBtn.addEventListener('click', () => {
        if (currentSheet > 0) { currentSheet--; render(); }
    });
    nextBtn.addEventListener('click', () => {
        if (currentSheet < totalSheets) { currentSheet++; render(); }
    });

    render();
});

//__________________________________________________________//
//helps set two zoom distances for interactable 3d models 
//___________________________________________________________//

function setModelZoom() {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const fov = isMobile ? '18deg' : '25deg';

    document.querySelectorAll('model-viewer').forEach(model => {
        model.setAttribute('field-of-view', fov);
        model.setAttribute('min-field-of-view', fov);
        model.setAttribute('max-field-of-view', fov);
    });
}

setModelZoom();
window.matchMedia('(max-width: 767px)').addEventListener('change', setModelZoom);


document.querySelectorAll('.single-flip__card').forEach(card => {
    const flip = () => {
        const flipped = card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', flipped);
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flip();
        }
    });
});
})();
