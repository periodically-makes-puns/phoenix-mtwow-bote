module.exports.initialize = () => {
    // Initialises all the tables
    db.serialize(function() {
        db.run(`CREATE TABLE IF NOT EXISTS Members (
                id INT PRIMARY KEY NOT NULL,
                admin BOOLEAN DEFAULT 0,
                aggregateVoteCount INT DEFAULT 0,
                roundVoteCount INT DEFAULT 0
            );
        `);
        db.run(`CREATE TABLE IF NOT EXISTS Contestants (
                id INT PRIMARY KEY NOT NULL,
                alive BOOLEAN DEFAULT 0,
                allowedResponseCount INT DEFAULT 1,
                responseCount INT DEFAULT 0
            );
        `);
        db.run(`CREATE TABLE IF NOT EXISTS Votes (
                uid INT PRIMARY KEY NOT NULL,
                vid INT,
                gseed STRING,
                vote STRING
            );
        `);
        db.run(`CREATE TABLE IF NOT EXISTS Responses (
                uid INT PRIMARY KEY NOT NULL,
                rid INT,
                response STRING
            );
        `);
    });
}

module.exports.fullReset = () => {
    // Wipes all data
    db.serialize(function() {
        db.run(`DROP TABLE IF EXISTS Members;`); 
        db.run(`DROP TABLE IF EXISTS Contestants;`); 
        db.run(`DROP TABLE IF EXISTS Votes;`); 
        db.run(`DROP TABLE IF EXISTS Responses;`); 
    });
}