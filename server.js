// Require necessary modules
const discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const debug = require("debug");
const admin = require("./admin.js");
const utils = require("./utils.js");
const user = require("./user.js");
var state = {}

// Initialise loggers
// Using state object because... I know it's bad design but I'm the only asshat coding this thing
state.debugExpress = debug("express");
state.debugDiscord = debug("discord");
state.debugSQLite = debug("better-sqlite3");
state.debugGit = debug("simple-git");

// Initialise database
const Database = require("better-sqlite3");
state.db = new Database("data.db", {verbose: state.debugSQLite});
admin.initialize(state);
state.debugSQLite("Initialised database!");

// Initialise clients
state.app = express()
state.client = new discord.Client();
state.instanceData = JSON.parse(fs.readFileSync("./data.json")); // Read in instance data

/* DISCORD SECTION */
// join handler
state.client.on("guildMemberAdd", (member) => {
    state.debugDiscord(`${member.id} joined server ${member.guild.id}`)
    if (member.guild.id == state.instanceData.primaryServer) {
        state.debugDiscord("In correct primary guild, adding to roster");
        admin.addMember(member.id);
    }
});

// we join handler
state.client.on("guildCreate", (guild) => {
    if (guild.id == state.instanceData.primaryServer) {
        state.debugDiscord("Rejoined primary server, let's check out our new roster");
        for (const [id, member] of guild.members) {
            state.debugSQLite(`Add ${member.id}`);
            admin.addMember(member.id);
        }
    }
});

// message handler
state.client.on("message", (msg) => {
    if (msg.author.bot) {return;}
    let args;
    if (msg.content.startsWith("p?")) {
        args = utils.normalCommandParser(msg.content);
        state.debugDiscord("%O ran %O", msg.author.username, args);
        switch (args[0]) {
            
        }
    } else if (msg.content.startsWith("pa?")) {
        if (utils.isAdmin(state, msg.author.id)) {
            args = utils.adminCommandParser(msg.content);
            state.debugDiscord("Admin %O ran %O", msg.author.username, args);
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
state.client.on("ready", () => {
    state.debugDiscord("Ready!");
});

// Login with token
state.client.login(state.instanceData.token);

/* EXPRESS SECTION */
state.app.use(express.static('public'))

state.app.get('/', (req, res, next) => {
    res.send("Hello world!");
});

// Info message when ready
// Listen on port specified in config
state.app.listen(state.instanceData.portNum, () => {
    state.debugExpress("Ready!");
});