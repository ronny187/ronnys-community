```javascript
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get("/", (req, res) => {
    res.send("Ronny's Community Discord Login Server läuft ✅");
});

app.get("/login", (req, res) => {

    const discordURL =
        "https://discord.com/oauth2/authorize" +
        "?client_id=" + CLIENT_ID +
        "&response_type=code" +
        "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
        "&scope=identify";

    res.redirect(discordURL);

});

app.get("/callback", async (req, res) => {

    const code = req.query.code;

    if (!code) {
        return res.send("❌ Kein Code von Discord erhalten.");
    }

    try {

        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",

            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI
            }),

            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        const userResponse = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers: {
                    Authorization: `Bearer ${tokenResponse.data.access_token}`
                }
            }
        );

        const user = userResponse.data;

        res.send(`
            <h1>✅ Login erfolgreich</h1>
            <h2>Willkommen ${user.username}</h2>
            <p>Discord ID: ${user.id}</p>
        `);

    } catch (error) {

        console.error(error.response?.data || error);

        res.status(500).send("❌ Fehler beim Discord Login.");

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
```
