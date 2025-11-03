require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const webhookHandler = require("./webhook");
const app = express();

app.use(bodyparser.json());

// webhook endpoint
app.post("/webhook", webhookHandler);


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
