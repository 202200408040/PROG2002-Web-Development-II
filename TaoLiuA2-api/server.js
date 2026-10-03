const express = require("express");
const db = require("./event_db");

const app = express();
const PORT = 3000;

app.use(express.json());

// Homepage events API
app.get("/api/events/home", (req, res) => {
    const sql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.event_date,
            e.event_time,
            e.location,
            e.ticket_price,
            e.fundraising_goal,
            e.current_amount,
            e.image_url,
            c.name AS category
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        WHERE e.status = 'active'
          AND e.event_date >= CURDATE()
        ORDER BY e.event_date ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({
                message: "Unable to retrieve events"
            });
        }

        res.json(results);
    });
});

// Event categories API
app.get("/api/categories", (req, res) => {
    const sql = `
        SELECT
            category_id,
            name,
            description
        FROM categories
        ORDER BY category_id ASC
    `;

    db.query(sql, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({
                message: "Unable to retrieve categories"
            });
        }

        res.json(results);
    });
});

// Event search API
app.get("/api/events", (req, res) => {
    const { date, location, category } = req.query;
    const conditions = ["e.status = 'active'"];
    const values = [];

    if (date) {
        conditions.push("e.event_date = ?");
        values.push(date);
    }

    if (location) {
        conditions.push("e.location LIKE ?");
        values.push(`%${location}%`);
    }

    if (category) {
        conditions.push("e.category_id = ?");
        values.push(category);
    }

    const sql = `
        SELECT
            e.event_id,
            e.name,
            e.short_description,
            e.event_date,
            e.event_time,
            e.location,
            e.ticket_price,
            e.fundraising_goal,
            e.current_amount,
            e.image_url,
            c.name AS category
        FROM events e
        JOIN categories c ON c.category_id = e.category_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY e.event_date ASC
    `;

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).json({
                message: "Unable to search events"
            });
        }

        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
