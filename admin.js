const git = require('simple-git')();

module.exports.initialize = (db) => {
    db.transaction(() => {
        // Initialises all the tables
        db.prepare(`CREATE TABLE IF NOT EXISTS Members (
                uid INTEGER PRIMARY KEY NOT NULL,
                aggregateVoteCount INTEGER DEFAULT 0,
                roundVoteCount INTEGER DEFAULT 0
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Contestants (
                uid INTEGER PRIMARY KEY NOT NULL,
                alive BOOLEAN DEFAULT 0,
                allowedResponseCount INTEGER DEFAULT 1,
                responseCount INTEGER DEFAULT 0
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                uid INTEGER NOT NULL,
                vid INTEGER NOT NULL,
                gseed TEXT UNIQUE NOT NULL,
                vote TEXT
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                uid INTEGER NOT NULL,
                rid INTEGER NOT NULL,
                response TEXT
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS Status (
                roundNum INTEGER,
                prompt TEXT,
                phase TEXT,
                deadline INTEGER
            );
        `).run();
        db.prepare(`CREATE TABLE IF NOT EXISTS ResponseArchive (
                roundNum INTEGER NOT NULL,
                id INTEGER NOT NULL,
                uid INTEGER NOT NULL,
                rid INTEGER NOT NULL,
                rank INTEGER NOT NULL,
                response TEXT NOT NULL,
                score DOUBLE NOT NULL,
                skew DOUBLE NOT NULL
            );
        `).run();
        if (!db.prepare("SELECT * FROM Status;").get()) {
            db.prepare("INSERT INTO Status VALUES (1, '', signups, -1);");
        }
    })();
}

module.exports.wipe = (db) => {
    db.transaction(() => {
        // Wipes all data
        db.prepare(`DROP TABLE IF EXISTS Members;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Contestants;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Votes;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Responses;`).run(); 
        db.prepare(`DROP TABLE IF EXISTS Status;`).run();
        db.prepare(`DROP TABLE IF EXISTS ResponseArchive;`).run();
    })();
}
module.exports.fullReset = (db) => {
    this.wipe(db);
    this.initialize(db);
}

module.exports.pull = () => {
    git.pull("gitlab-origin", "master");
}

module.exports.addMember = (db, uid) => {
    db.transaction(() => {db.prepare("INSERT OR IGNORE INTO Members (uid) VALUES (?);").run(uid)})();
}