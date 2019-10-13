// Require necessary modules
const discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const debug = require("debug");
const admin = require("./admin.js");
const utils = require("./utils.js");

// Initialise loggers
// Using global because... I know it's bad design but I'm the only asshat coding this thing
global.debugExpress = debug("express");
global.debugDiscord = debug("discord");
global.debugSQLite = debug("better-sqlite3");
global.debugGit = debug("simple-git");

// Initialise database
const Database = require("better-sqlite3");
global.db = new Database("data.db", {verbose: debugSQLite});
admin.initialize();
debugSQLite("Initialised database!");

// Initialise clients
global.app = express()
global.client = new discord.Client();
global.instanceData = JSON.parse(fs.readFileSync("./data.json")); // Read in instance data

/* DISCORD SECTION */
// join handler
client.on("guildMemberAdd", (member) => {
    debugDiscord(`${member.id} joined server ${member.guild.id}`)
    if (member.guild.id == instanceData.primaryServer) {
        debugDiscord("In correct primary guild, adding to roster");
        admin.addMember(member.id);
    }
});

// we join handler
client.on("guildCreate", (guild) => {
    if (guild.id == instanceData.primaryServer) {
        debugDiscord("Rejoined primary server, let's check out our new roster");
        for (const [id, member] of guild.members) {
            debugSQLite(`Add ${member.id}`);
            admin.addMember(member.id);
        }
    }
});

// message handler
client.on("message", (msg) => {
    if (msg.author.bot) {return;}
    let args;
    if (msg.content.startsWith("p?")) {
        args = utils.normalCommandParser(msg.content);
        switch (args[0]) {

        }
    } else if (msg.content.startsWith("pa?")) {
        if (utils.isAdmin(msg.author.id)) {
            args = utils.adminCommandParser(msg.content);
            switch (args[0]) {
                case "pull":
                    admin.pull();
                    break;
            }
        } else {
            msg.channel.send("Unauthorized. Don't even try.");
            return;
        }
    }
})

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