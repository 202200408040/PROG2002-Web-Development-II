const API_URL = "/api/events/home";
const eventsGrid = document.querySelector("#events-grid");
const statusMessage = document.querySelector("#event-status");
const currentYear = document.querySelector("#current-year");

function formatDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

function formatPrice(value) {
    const price = Number(value);

    if (price === 0) {
        return "Free";
    }

    return new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD"
    }).format(price);
}

function createMeta(label, value) {
    const row = document.createElement("span");
    const labelElement = document.createElement("strong");
    const valueElement = document.createElement("span");

    labelElement.textContent = `${label}:`;
    valueElement.textContent = value;
    row.append(labelElement, valueElement);

    return row;
}

function createEventCard(event) {
    const card = document.createElement("article");
    const imageWrap = document.createElement("div");
    const image = document.createElement("img");
    const category = document.createElement("span");
    const body = document.createElement("div");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const meta = document.createElement("div");
    const footer = document.createElement("div");
    const price = document.createElement("span");
    const link = document.createElement("a");

    card.className = "event-card";
    imageWrap.className = "event-card__image-wrap";
    image.className = "event-card__image";
    category.className = "event-card__category";
    body.className = "event-card__body";
    description.className = "event-card__description";
    meta.className = "event-meta";
    footer.className = "event-card__footer";
    price.className = "event-price";
    link.className = "event-link";

    image.src = event.image_url || "";
    image.alt = `${event.name} event image`;
    image.loading = "lazy";
    image.addEventListener("error", () => {
        image.remove();
    });

    category.textContent = event.category;
    title.textContent = event.name;
    description.textContent = event.short_description;
    price.textContent = formatPrice(event.ticket_price);

    meta.append(
        createMeta("Date", formatDate(event.event_date)),
        createMeta("Location", event.location)
    );

    link.href = `event.html?id=${encodeURIComponent(event.event_id)}`;
    link.textContent = "View Details";

    imageWrap.append(image, category);
    footer.append(price, link);
    body.append(title, description, meta, footer);
    card.append(imageWrap, body);

    return card;
}

async function loadEvents() {
    statusMessage.textContent = "Loading events...";
    statusMessage.classList.remove("error");
    eventsGrid.replaceChildren();

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const events = await response.json();

        if (!Array.isArray(events) || events.length === 0) {
            statusMessage.textContent = "No upcoming events are currently available.";
            return;
        }

        const fragment = document.createDocumentFragment();
        events.forEach((event) => {
            fragment.append(createEventCard(event));
        });

        eventsGrid.append(fragment);
        statusMessage.textContent = `Showing ${events.length} upcoming events.`;
    } catch (error) {
        console.error(error);
        statusMessage.textContent = "Unable to load events. Please try again later.";
        statusMessage.classList.add("error");
    }
}

currentYear.textContent = new Date().getFullYear();
loadEvents();
