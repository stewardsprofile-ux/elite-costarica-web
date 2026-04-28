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

function canScrollInside(element, deltaY) {
    if (!element) return false;

    const maxScroll = element.scrollHeight - element.clientHeight;
    if (maxScroll <= 1) return false;

    if (deltaY > 0) return element.scrollTop < maxScroll - 1;
    return element.scrollTop > 1;
}

if (homeScroll) {
    homeScroll.addEventListener("wheel", (event) => {
        if (Math.abs(event.deltaY) < 18) return;
        const internalScroll = event.target.closest(".home-advisor-quiz, .home-advisor-results");

        if (canScrollInside(internalScroll, event.deltaY)) {
            return;
        }

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
const eliteWhatsapp = "50662104761";
let homePerfumes = [];

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

const advisorQuestions = [
    { id: "genero", title: "Para quien seria el perfume?", options: ["Hombre", "Mujer", "Unisex", "Es para un regalo", "Sin etiqueta"] },
    { id: "edad", title: "En que etapa estas mas o menos?", options: ["Menos de 18", "18 - 24", "25 - 34", "35 - 44", "45 - 54", "55 o mas"] },
    { id: "clima", title: "Donde vas a usarlo normalmente?", options: ["Mucho calor", "Clima templado", "Fresco o lluvioso", "Aire acondicionado", "Dia soleado", "De noche"] },
    { id: "ocasion", title: "Para que momento lo quieres principalmente?", options: ["Trabajo / Diario", "Salidas normales", "Citas", "Fiestas", "Reuniones", "Eventos elegantes", "Gimnasio", "Perfume principal"] },
    { id: "objetivo", title: "Que te gustaria que piensen de ti?", options: ["Limpio", "Elegante", "Sexy", "Diferente", "Exitoso", "Relajado", "Agradable", "Que me noten", "Fino", "Que me recuerden"] },
    { id: "perfil_aroma", title: "Que te gusta mas en un perfume?", options: ["Muy fresco", "Fresco y dulce", "Balanceado", "Dulce", "Muy dulce", "Amaderado", "Perfume fino", "No se"] },
    { id: "intensidad", title: "Que tan fuerte quieres que sea?", options: ["Suave", "Moderado", "Fuerte", "Muy fuerte", "Depende"] },
    { id: "personalidad", title: "Si el perfume fuera una persona...", options: ["Elegante", "Misterioso", "Divertido", "Seguro", "Tranquilo", "Sexy", "Profesional", "Millonario", "Rebelde", "Romantico"] },
    { id: "referencia", title: "Hay algun perfume que ya te guste mucho?", options: ["Si, tengo uno", "Quiero cambiar", "Casi no uso", "Es mi primero", "Se cuales me gustan"] }
];

let advisorStep = 0;
let advisorAnswers = {};

const startAdvisor = document.getElementById("startAdvisor");
const restartAdvisor = document.getElementById("restartAdvisor");
const advisorQuiz = document.getElementById("homeAdvisorQuiz");
const advisorResults = document.getElementById("homeAdvisorResults");
const advisorQuestion = document.getElementById("homeAdvisorQuestion");
const advisorOptions = document.getElementById("homeAdvisorOptions");
const advisorProgress = document.getElementById("homeAdvisorProgress");
const advisorGrid = document.getElementById("homeAdvisorGrid");
const advisorSection = document.getElementById("home-advisor");

async function loadHomePerfumes() {
    try {
        const res = await fetch("perfumes.json");
        const perfumesBase = await res.json();
        let perfumesNuevos = [];

        try {
            const adminRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/assets/data/perfumes`);
            if (adminRes.ok) {
                const files = await adminRes.json();
                const data = await Promise.all(
                    files
                        .filter((file) => file.name.endsWith(".json"))
                        .map((file) => fetch(file.download_url).then((r) => r.json()))
                );

                perfumesNuevos = data.map((p) => ({
                    id: p.id,
                    marca: p.marca,
                    Title: p.nombre,
                    genero: p.genero,
                    tipo: p.tipo,
                    Image: p.imagen,
                    descripcion: p.descripcion,
                    categoria: p.tipo
                }));
            }
        } catch (_error) {
            perfumesNuevos = [];
        }

        homePerfumes = [...perfumesNuevos, ...perfumesBase].filter((item) => item && item.Title && item.Image);
    } catch (error) {
        console.error("No se pudo cargar el catalogo para el asesor.", error);
        homePerfumes = [];
    }
}

function startAdvisorFlow() {
    advisorStep = 0;
    advisorAnswers = {};
    advisorSection?.classList.remove("has-advisor-results");
    advisorSection?.classList.add("has-advisor-quiz");
    advisorResults.hidden = true;
    advisorQuiz.hidden = false;
    renderAdvisorQuestion();
}

function renderAdvisorQuestion() {
    const data = advisorQuestions[advisorStep];
    advisorQuestion.textContent = data.title;
    advisorProgress.style.setProperty("--advisor-progress", `${(advisorStep / advisorQuestions.length) * 100}%`);
    advisorOptions.innerHTML = "";

    data.options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "home-advisor-option";
        button.type = "button";
        button.textContent = option;
        button.addEventListener("click", () => {
            advisorAnswers[data.id] = option;

            if (data.id === "referencia" && option === "Si, tengo uno") {
                askFavoritePerfume();
            } else {
                advanceAdvisor();
            }
        });
        advisorOptions.appendChild(button);
    });
}

function advanceAdvisor() {
    advisorStep++;

    if (advisorStep < advisorQuestions.length) {
        renderAdvisorQuestion();
    } else {
        advisorProgress.style.setProperty("--advisor-progress", "100%");
        consultAdvisor();
    }
}

function askFavoritePerfume() {
    advisorQuestion.textContent = "Como se llama ese perfume que te encanta?";
    advisorOptions.innerHTML = "";

    const input = document.createElement("input");
    input.className = "home-advisor-input";
    input.id = "homeAdvisorFavorite";
    input.type = "text";
    input.placeholder = "Ej: Sauvage, 212 VIP...";

    const button = document.createElement("button");
    button.className = "home-advisor-option home-advisor-continue";
    button.type = "button";
    button.textContent = "Continuar";
    button.addEventListener("click", () => {
        advisorAnswers.nombre_favorito = input.value.trim() || "No especificado";
        advanceAdvisor();
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") button.click();
    });

    advisorOptions.appendChild(input);
    advisorOptions.appendChild(button);
    input.focus();
}

function localAdvisorFallback() {
    const targetGender = (advisorAnswers.genero || "").toLowerCase();
    const aroma = `${advisorAnswers.perfil_aroma || ""} ${advisorAnswers.objetivo || ""} ${advisorAnswers.personalidad || ""}`.toLowerCase();

    const scored = homePerfumes.map((perfume) => {
        const haystack = `${perfume.Title || ""} ${perfume.genero || ""} ${perfume.categoria || ""} ${perfume.tipo || ""} ${perfume.marca || ""}`.toLowerCase();
        let score = 0;

        if (targetGender && haystack.includes(targetGender)) score += 4;
        if (targetGender === "unisex" && haystack.includes("unisex")) score += 5;
        if (aroma.includes("dulce") && /sweet|candy|vanilla|yara|rose|pink|elixir|intense/i.test(haystack)) score += 2;
        if (aroma.includes("fresco") && /blue|aqua|fresh|sport|marine|light|cool/i.test(haystack)) score += 2;
        if (aroma.includes("elegante") && /noir|gold|prive|royal|club|oud/i.test(haystack)) score += 2;

        return { perfume, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((item) => item.perfume);
}

async function consultAdvisor() {
    advisorQuestion.textContent = "Buscando perfumes ideales...";
    advisorOptions.innerHTML = '<div class="home-advisor-loading">Analizando tu estilo Elite...</div>';

    const perfil = `
        Cliente: ${advisorAnswers.genero}, etapa ${advisorAnswers.edad}.
        Uso: ${advisorAnswers.ocasion} en clima ${advisorAnswers.clima}.
        Busca: ${advisorAnswers.objetivo}.
        Preferencia: ${advisorAnswers.perfil_aroma}, intensidad ${advisorAnswers.intensidad}.
        Personalidad: ${advisorAnswers.personalidad}.
        Favorito: ${advisorAnswers.nombre_favorito || "N/A"}.
    `;

    try {
        if (!homePerfumes.length) await loadHomePerfumes();
        if (!homePerfumes.length) throw new Error("Catalogo no disponible");

        const res = await fetch("/api/recomendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ perfil, catalogoNombres: homePerfumes.map((p) => p.Title) })
        });

        if (!res.ok) throw new Error("IA no disponible");
        const data = await res.json();
        const recommended = (data.recomendados || [])
            .map((name) => {
                const search = name.toLowerCase().trim();
                return homePerfumes.find((p) => p.Title.toLowerCase().trim() === search) ||
                    homePerfumes.find((p) => p.Title.toLowerCase().includes(search));
            })
            .filter(Boolean);

        renderAdvisorResults(recommended.length ? recommended.slice(0, 6) : localAdvisorFallback());
    } catch (error) {
        console.warn("Usando recomendacion local del asesor.", error);
        renderAdvisorResults(localAdvisorFallback());
    }
}

function quoteAdvisorPerfume(perfume) {
    const url = `${window.location.origin}/${perfume.Image}`;
    const text = `Hola, quiero cotizar este perfume recomendado por el Asesor Elite IA:\n\n${perfume.Title}\n\n${url}`;
    window.open(`https://wa.me/${eliteWhatsapp}?text=${encodeURIComponent(text)}`, "_blank");
}

function renderAdvisorResults(perfumes) {
    advisorQuiz.hidden = true;
    advisorResults.hidden = false;
    advisorSection?.classList.remove("has-advisor-quiz");
    advisorSection?.classList.add("has-advisor-results");
    advisorGrid.innerHTML = "";

    perfumes.forEach((perfume) => {
        const card = document.createElement("article");
        card.className = "home-advisor-card";

        const img = document.createElement("img");
        img.src = perfume.Image;
        img.alt = perfume.Title;
        img.loading = "lazy";
        img.onerror = () => { img.src = "assets/placeholder.webp"; };

        const title = document.createElement("h4");
        title.textContent = perfume.Title;

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Cotizar";
        button.addEventListener("click", () => quoteAdvisorPerfume(perfume));

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(button);
        advisorGrid.appendChild(card);
    });

    advisorResults.scrollTop = 0;
}

if (startAdvisor) startAdvisor.addEventListener("click", startAdvisorFlow);
if (restartAdvisor) restartAdvisor.addEventListener("click", startAdvisorFlow);
loadHomePerfumes();
