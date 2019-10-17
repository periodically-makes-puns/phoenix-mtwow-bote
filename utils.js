/**
 * @module
 */
const discord = require("discord.js");

/**
 * Parses non-admin commands and returns array of command and arguments.
 * @param {String} content Command to be parsed.
 * @returns {Array} Array of arguments and command.
 */
module.exports.normalCommandParser = (content) => {
    if (!content.startsWith("p?")) {
        debugDiscord(`Attempted to parse invalid normal command: ${content}`);
        return;
    }
    content = content.substr(2);
    return content.split(/\s+/g); 
    // splits based on whitespace
    // will primarily be used on argument based functions
    // for commands with possibly arbitrarily long arguments with spaces
    // the original message content will be used instead
}

/**
 * Parses admin commands and returns array of command and arguments.
 * Basically a wrapper on normalCommandParser.
 * @param {String} content Command to be parsed.
 * @returns {Array} Array of arguments and command.
 */
module.exports.adminCommandParser = (content) => {
    if (!content.startsWith("pa?")) {
        debugDiscord(`Attempted to parse invalid admin command: ${content}`);
        return;
    }
    content = "p?" + content.substr(3); // substitutes prefix
    return this.normalCommandParser(content); // shortcut to not repeat myself
}

/**
 * Checks whether or not this user has administrator privileges.
 * @param {discord.Client} client Client.
 * @param {Object} instanceData Configuration object for this instance.
 * @param {String} uid User to be checked.
 * @returns {Boolean} Whether or not this user has administrator privileges
 */
module.exports.isAdmin = (client, instanceData, uid) => client.guilds.get(instanceData.primaryServer).members.get(uid).hasPermission("ADMINISTRATOR"); 
// wow that's ugly
// but it checks if a uid has admin privileges

/**
 * Checks whether or not this message is in DMs.
 * @param {discord.Message} msg Message to be checked.
 * @return {Boolean} Whether or not this message is in DMs.
 */
module.exports.inDMs = (msg) => msg.channel.type == "dm";
// checks if a message is in DMs