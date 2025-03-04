const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: "yw0nAIwHdbPeWbP3hyNK13D7E2UWMZrE",
  socket: {
    host: "redis-13513.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13513,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

async function connectRedis() {
  await client.connect();
}

connectRedis().catch((err) => console.log("Connection Error:", err));

module.exports = client;
