const homeSlides = document.querySelectorAll(".home-bg-slide");
let activeHomeSlide = 0;

if (homeSlides.length > 1) {
    setInterval(() => {
        homeSlides[activeHomeSlide].classList.remove("active");
        activeHomeSlide = (activeHomeSlide + 1) % homeSlides.length;
        homeSlides[activeHomeSlide].classList.add("active");
    }, 6500);
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
const homeTestimonialTracks = [];
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

    const track = document.createElement("div");
    track.className = "home-testimonial-track";

    images.slice(0, 8).forEach((path, index) => {
        const img = document.createElement("img");
        img.src = homeTestimonialUrl(path);
        img.alt = `Cliente satisfecho ${year} ${index + 1}`;
        img.loading = "lazy";
        track.appendChild(img);
    });

    section.appendChild(track);
    homeTestimonialTracks.push(track);
    return section;
}

function startHomeTestimonialsAutoAdvance() {
    if (!homeTestimonialTracks.length) return;

    setInterval(() => {
        homeTestimonialTracks.forEach((track, index) => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (maxScroll <= 0) return;

            const step = Math.max(track.clientWidth * 0.52, 150);
            const isNearEnd = track.scrollLeft + step >= maxScroll - 8;

            track.scrollTo({
                left: isNearEnd ? 0 : track.scrollLeft + step,
                behavior: "smooth"
            });
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
    homeTestimonialTracks.length = 0;
    responses.slice(0, 3).forEach(({ year, images }) => {
        homeYears.appendChild(buildHomeYear(year, images));
    });
    startHomeTestimonialsAutoAdvance();
}

loadHomeTestimonials();
