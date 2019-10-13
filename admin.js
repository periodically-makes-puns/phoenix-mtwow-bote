const git = require('simple-git')();

module.exports.initialize = () => {
    db.transaction(() => {
        // Initialises all the tables
        db.prepare(`CREATE TABLE IF NOT EXISTS Members (
                id INT PRIMARY KEY NOT NULL,
                aggregateVoteCount INT DEFAULT 0,
                roundVoteCount INT DEFAULT 0
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Contestants (
                id INT PRIMARY KEY NOT NULL,
                alive BOOLEAN DEFAULT 0,
                allowedResponseCount INT DEFAULT 1,
                responseCount INT DEFAULT 0
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Votes (
                uid INT PRIMARY KEY NOT NULL,
                vid INT,
                gseed TEXT,
                vote TEXT
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Responses (
                uid INT PRIMARY KEY NOT NULL,
                rid INT,
                response TEXT
            );
        `).run();
    })();
}

module.exports.wipe = () => {
    db.transaction(() => {
        // Wipes all data
        db.prepare(`DROP TABLE IF EXISTS Members;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Contestants;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Votes;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Responses;`).run(); 
    })();
}
module.exports.fullReset = () => {
    this.wipe();
    this.initialize();
}

module.exports.pull = () => {
    git.pull("origin", "master");
}

module.exports.addMember = (uid) => {
    db.transaction(() => {db.prepare("INSERT OR IGNORE INTO Members (id) VALUES (?);").run(uid)})();
}