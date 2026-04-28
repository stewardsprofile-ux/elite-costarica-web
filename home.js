const homeSlides = document.querySelectorAll(".home-bg-slide");
let activeHomeSlide = 0;

if (homeSlides.length > 1) {
    setInterval(() => {
        homeSlides[activeHomeSlide].classList.remove("active");
        activeHomeSlide = (activeHomeSlide + 1) % homeSlides.length;
        homeSlides[activeHomeSlide].classList.add("active");
    }, 2000);
}

const homeTestimonialsSlides = document.querySelectorAll(".home-testimonials-bg-slide");
let activeHomeTestimonialsSlide = 0;

if (homeTestimonialsSlides.length > 1) {
    setInterval(() => {
        homeTestimonialsSlides[activeHomeTestimonialsSlide].classList.remove("active");
        activeHomeTestimonialsSlide = (activeHomeTestimonialsSlide + 1) % homeTestimonialsSlides.length;
        homeTestimonialsSlides[activeHomeTestimonialsSlide].classList.add("active");
    }, 2000);
}

const homeScroll = document.querySelector(".home-scroll");
const homePanels = document.querySelectorAll(".home-panel");
let snapLocked = false;

function snapHome(direction) {
    if (!homeScroll || snapLocked) return;

    const current = Math.round(homeScroll.scrollTop / window.innerHeight);
    const next = Math.max(0, Math.min(homePanels.length - 1, current + direction));

    if (next === current) return;

    snapLocked = true;
    homeScroll.scrollTo({
        top: next * window.innerHeight,
        behavior: "smooth"
    });

    setTimeout(() => {
        snapLocked = false;
    }, 760);
}

if (homeScroll) {
    homeScroll.addEventListener("wheel", (event) => {
        if (Math.abs(event.deltaY) < 18) return;
        event.preventDefault();
        snapHome(event.deltaY > 0 ? 1 : -1);
    }, { passive: false });
}

const years = [2023, 2024, 2025, 2026];
const homeYears = document.getElementById("homeYears");
const homeTestimonialGroups = [];
let homeTestimonialsTimer = null;
const repoOwner = "stewardsprofile-ux";
const repoName = "elite-catalogo";
const repoBranch = "main";

function homeTestimonialUrl(path) {
    if (!path) return "assets/placeholder.webp";
    if (/^https?:\/\//i.test(path)) return path;
    const clean = path.replace(/^\.\//, "").replace(/^\//, "");

    if (clean.startsWith("assets/")) {
        return `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@${repoBranch}/${clean}`;
    }

    return clean;
}

function buildHomeYear(year, images) {
    const section = document.createElement("article");
    section.className = "home-year-card";

    const title = document.createElement("h3");
    title.textContent = year;
    section.appendChild(title);

    if (!images.length) {
        const empty = document.createElement("p");
        empty.className = "home-year-empty";
        empty.textContent = "Pronto agregaremos clientes satisfechos de este ano.";
        section.appendChild(empty);
        return section;
    }

    const urls = images.map((path) => homeTestimonialUrl(path));
    const stage = document.createElement("div");
    stage.className = "home-testimonial-stage";

    const slots = urls.slice(0, 2).map((url, index) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `Cliente satisfecho ${year} ${index + 1}`;
        img.loading = "lazy";
        stage.appendChild(img);
        return img;
    });

    section.appendChild(stage);
    homeTestimonialGroups.push({
        year,
        urls,
        slots,
        index: slots.length
    });
    return section;
}

function startHomeTestimonialsAutoAdvance() {
    if (!homeTestimonialGroups.length) return;
    if (homeTestimonialsTimer) clearInterval(homeTestimonialsTimer);

    homeTestimonialsTimer = setInterval(() => {
        homeTestimonialGroups.forEach((group) => {
            if (group.urls.length <= group.slots.length) return;

            group.slots.forEach((slot) => {
                slot.classList.add("is-fading");
            });

            setTimeout(() => {
                group.slots.forEach((slot, slotIndex) => {
                    const imageIndex = (group.index + slotIndex) % group.urls.length;
                    slot.src = group.urls[imageIndex];
                    slot.alt = `Cliente satisfecho ${group.year} ${imageIndex + 1}`;
                    slot.classList.remove("is-fading");
                });

                group.index = (group.index + group.slots.length) % group.urls.length;
            }, 520);
        });
    }, 3800);
}

async function loadHomeTestimonials() {
    if (!homeYears) return;

    const responses = await Promise.all(
        years.map(async (year) => {
            try {
                const res = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/assets/data/testimonios/${year}.json?t=${Date.now()}`);
                if (!res.ok) return { year, images: [] };
                const data = await res.json();
                return { year, images: Array.isArray(data.images) ? data.images : [] };
            } catch (_error) {
                return { year, images: [] };
            }
        })
    );

    homeYears.innerHTML = "";
    homeTestimonialGroups.length = 0;
    responses.forEach(({ year, images }) => {
        homeYears.appendChild(buildHomeYear(year, images));
    });
    startHomeTestimonialsAutoAdvance();
}

loadHomeTestimonials();
