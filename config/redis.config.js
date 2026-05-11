const { createClient } = require("redis");
require("dotenv").config();
let client;
const connectRedis = async () => {
    if (client) return client; 

    client = createClient({
        url: process.env.REDIS_URL,
    });

    client.on("error", (err) => {
        console.error("Redis Error:", err);
    });

    await client.connect();
    console.log("Redis connected");

    return client;
};

module.exports = connectRedis;