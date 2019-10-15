const git = require('simple-git')();

module.exports.initialize = (state) => {
    state.db.transaction(() => {
        // Initialises all the tables
        state.db.prepare(`CREATE TABLE IF NOT EXISTS Members (
                id INT PRIMARY KEY NOT NULL,
                aggregateVoteCount INT DEFAULT 0,
                roundVoteCount INT DEFAULT 0
            );
        `).run();
        state.db.prepare(`CREATE TABLE IF NOT EXISTS Contestants (
                id INT PRIMARY KEY NOT NULL,
                alive BOOLEAN DEFAULT 0,
                allowedResponseCount INT DEFAULT 1,
                responseCount INT DEFAULT 0
            );
        `).run();
        state.db.prepare(`CREATE TABLE IF NOT EXISTS Votes (
                id INT PRIMARY KEY NOT NULL,
                uid INT NOT NULL,
                vid INT NOT NULL,
                gseed TEXT UNIQUE NOT NULL,
                vote TEXT
            );
        `).run();
        state.db.prepare(`CREATE TABLE IF NOT EXISTS Responses (
                id INT PRIMARY KEY NOT NULL,
                uid INT NOT NULL,
                rid INT NOT NULL,
                response TEXT
            );
        `).run();
        state.db.prepare(`CREATE TABLE IF NOT EXISTS Status (
                roundNum INT,
                prompt TEXT,
                phase TEXT,
                deadline INT
            );
        `).run();
        state.db.prepare(`CREATE TABLE IF NOT EXISTS ResponseArchive (
                roundNum INT NOT NULL,
                id INT NOT NULL
                uid INT NOT NULL,
                rid INT NOT NULL,
                rank INT NOT NULL,
                response TEXT NOT NULL,
                score DOUBLE NOT NULL,
                skew DOUBLE NOT NULL
            );
        `).run();
    })();
}

module.exports.wipe = (state) => {
    state.db.transaction(() => {
        // Wipes all data
        state.db.prepare(`DROP TABLE IF EXISTS Members;`).run(); 
        state.db.prepare(`DROP TABLE IF EXISTS Contestants;`).run(); 
        state.db.prepare(`DROP TABLE IF EXISTS Votes;`).run(); 
        state.db.prepare(`DROP TABLE IF EXISTS Responses;`).run(); 
        state.db.prepare(`DROP TABLE IF EXISTS Status;`).run();
        state.db.prepare(`DROP TABLE IF EXISTS ResponseArchive;`).run();
    })();
}
module.exports.fullReset = (state) => {
    this.wipe(state);
    this.initialize(state);
}

module.exports.pull = (state) => {
    git.pull("gitlab-origin", "master");
}

module.exports.addMember = (state, uid) => {
    state.db.transaction(() => {state.db.prepare("INSERT OR IGNORE INTO Members (id) VALUES (?);").run(uid)})();
}