// Require necessary modules
const discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const debug = require("debug");
const admin = require("./admin.js");
const utils = require("./utils.js");
const user = require("./user.js");

// Initialise loggers
// Using state object because... I know it's bad design but I'm the only asshat coding this thing
debugExpress = debug("express");
debugDiscord = debug("discord");
debugSQLite = debug("better-sqlite3");
debugGit = debug("simple-git");

// Initialise database
const Database = require("better-sqlite3");
db = new Database("data.db", {verbose: debugSQLite});
admin.initialize(db);
debugSQLite("Initialised database!");

// Initialise clients
app = express()
client = new discord.Client();
instanceData = JSON.parse(fs.readFileSync("./data.json")); // Read in instance data

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
            admin.addMember(db, member.id);
        }
    }
});

// message handler
client.on("message", (msg) => {
    if (msg.author.bot) {return;}
    let args;
    if (msg.content.startsWith("p?")) {
        args = utils.normalCommandParser(msg.content);
        debugDiscord("%O ran %O", msg.author.username, args);
        switch (args[0]) {
            
        }
    } else if (msg.content.startsWith("pa?")) {
        if (utils.isAdmin(db, msg.author.id)) {
            args = utils.adminCommandParser(msg.content);
            debugDiscord("Admin %O ran %O", msg.author.username, args);
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
app.use(express.static("public"));

app.use("/docs", express.static("docs"));

app.set('view engine', 'pug');

app.get("/", (req, res, next) => {
    res.render("index", {});
})

// Info message when ready
// Listen on port specified in config
app.listen(instanceData.portNum, () => {
    debugExpress("Ready!");
});