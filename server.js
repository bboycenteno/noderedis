var redis = require("redis");
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 3000;
var cacheHostName = process.env.REDISCACHEHOSTNAME;
var cachePassword = process.env.REDISCACHEKEY;
var reconnectAfter = 15000;

app.use(cors());

app.use(express.json());

// Connect to the Azure Cache for Redis over the TLS port using the key.
var cacheConnection = redis.createClient({
    // rediss for TLS
    url: "rediss://" + cacheHostName + ":6380",
    password: cachePassword,
});

cacheConnection.on('error', () => {
    console.log(new Date(), " Redis: disconnect");
    setTimeout(cacheConnection.connect(), reconnectAfter);
});

//API Root
app.get('/',  async (req, res) => {
    var pong = await cacheConnection.ping();
    var message = await cacheConnection.get("Message");
    var clients = await cacheConnection.sendCommand(["CLIENT", "LIST"]);
    res.json(
        [
            {PING: pong},
            {GET: message},
            {CLIENT_LIST: clients}
        ]
    );
});

app.listen(port, async () => {
    await cacheConnection.connect();
    console.log(`Rest Api Server listeting at http://localhost:${port}`);
});