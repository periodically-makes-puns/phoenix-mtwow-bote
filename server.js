// Require necessary modules
const discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const debug = require("debug");
const sqlAdmin = require("./admin.js");

// Initialise loggers
// Using global because... I know it's bad design but I'm the only asshat coding this thing
global.debugExpress = debug("express");
global.debugDiscord = debug("discord");
global.debugSQLite = debug("sqlite3");
global.sqlite3 = require("sqlite3");

// Initialise database
global.db = new sqlite3.Database("data.db");
sqlAdmin.initialize();
debugSQLite("Initialised database!");

// Initialise clients
global.app = express()
global.client = new discord.Client();
global.instanceData = JSON.parse(fs.readFileSync("./data.json")); // Read in instance data

/* DISCORD SECTION */
// Info message when ready
client.on("ready", () => {
    debugDiscord("Ready!");
});

// Login with token
client.login(instanceData.token);

/* EXPRESS SECTION */
app.use(express.static('public'))

app.get('/', (req, res, next) => {
    res.send("Hello world!");
});

// Info message when ready
// Listen on port specified in config
app.listen(instanceData.portNum, () => {
    debugExpress("Ready!");
});