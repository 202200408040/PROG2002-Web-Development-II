const categoriesUrl = "/api/categories";
const eventsUrl = "/api/events";

const searchForm = document.querySelector("#search-form");
const dateInput = document.querySelector("#search-date");
const locationInput = document.querySelector("#search-location");
const categorySelect = document.querySelector("#search-category");
const clearButton = document.querySelector("#clear-filters");
const searchStatus = document.querySelector("#search-status");
const searchResults = document.querySelector("#search-results");
const currentYear = document.querySelector("#current-year");

function setStatus(message, isError = false) {
    searchStatus.textContent = message;
    searchStatus.classList.toggle("error", isError);
}

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
    image.addEventListener("error", () => image.remove());

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

async function loadCategories() {
    try {
        const response = await fetch(categoriesUrl);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const categories = await response.json();

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.category_id;
            option.textContent = category.name;
            categorySelect.append(option);
        });
    } catch (error) {
        console.error(error);
        setStatus("Unable to load event categories.", true);
    }
}

function clearResults() {
    searchResults.replaceChildren();
}

async function searchEvents(event) {
    event.preventDefault();

    const date = dateInput.value.trim();
    const location = locationInput.value.trim();
    const category = categorySelect.value;

    clearResults();

    if (!date && !location && !category) {
        setStatus("Please select at least one filter.", true);
        return;
    }

    const params = new URLSearchParams();

    if (date) {
        params.set("date", date);
    }

    if (location) {
        params.set("location", location);
    }

    if (category) {
        params.set("category", category);
    }

    setStatus("Searching for events...");

    try {
        const response = await fetch(`${eventsUrl}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const events = await response.json();

        if (!Array.isArray(events) || events.length === 0) {
            setStatus("No matching events found.");
            return;
        }

        const fragment = document.createDocumentFragment();
        events.forEach((eventData) => {
            fragment.append(createEventCard(eventData));
        });

        searchResults.append(fragment);
        setStatus(`Found ${events.length} matching event${events.length === 1 ? "" : "s"}.`);
    } catch (error) {
        console.error(error);
        setStatus("Unable to search events. Please try again later.", true);
    }
}

clearButton.addEventListener("click", () => {
    searchForm.reset();
    clearResults();
    setStatus("");
    dateInput.focus();
});

searchForm.addEventListener("submit", searchEvents);

currentYear.textContent = new Date().getFullYear();
loadCategories();
