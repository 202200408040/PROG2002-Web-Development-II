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

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});