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

module.exports.adminCommandParser = (content) => {
    if (!content.startsWith("pa?")) {
        debugDiscord(`Attempted to parse invalid admin command: ${content}`);
        return;
    }
    content = "p?" + content.substr(3); // substitutes prefix
    return this.normalCommandParser(content); // shortcut to not repeat myself
}

module.exports.isAdmin = (uid) => client.guilds.get(instanceData.primaryServer).members.get(uid).hasPermission("ADMINISTRATOR"); 
// wow that's ugly
// but it checks if a uid has admin privileges