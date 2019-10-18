/**
 * @module
 */
const utils = require("./utils.js");
const { Random } = require("random-js");
const Database = require("better-sqlite3");
const fs = require("fs");
let engine;
let voteConfig = JSON.parse(fs.readFileSync("./data.json")).voteConfig;

/**
 * Returns true if the provided user ID represents a contestant.
 * @param {Database} db Database to search.
 * @param {String} uid User ID.
 * @returns {Boolean} True if uid represents a contestant.
 */
module.exports.isContestant = (db, uid) => {
    return !(!db.prepare("SELECT * FROM Contestants WHERE uid = ?;").get(uid));
}
/**
 * Returns true if the provided user ID represents a dead contestant.
 * @param {Database} db Database to search.
 * @param {String} uid User ID.
 * @returns {Boolean} True if uid represents a dead contestant.
 */
module.exports.isDead = (db, uid) => {
    return db.prepare("SELECT alive FROM Contestants WHERE uid=?;").get(uid).alive
}

/**
 * Adds a contestant to the Contestants table.
 * @param {Database} db Database to modify.
 * @param {String} uid User ID.
 */
module.exports.addContestant = (db, uid) => {
    db.transaction((uid) => {
        db.prepare("INSERT INTO Contestants (uid, alive) VALUES (?, 1);").run(uid);
    })(uid);
}

/**
 * Gets the current phase.
 * @param {Database} db Database to search.
 * @returns {String} Current phase in mTWOW.
 */
module.exports.phase = (db) => {
    return db.prepare("SELECT phase FROM Status;").get().phase;
}

/**
 * Gets the current round number.
 * @param {Database} db Database to search.
 * @returns {Number} Round number.
 */
module.exports.roundNum = (db) => {
    return db.prepare("SELECT roundNum FROM Status;").get().roundNum;
}

/**
 * Modifies the given response.
 * @param {Database} db Database to modify.
 * @param {String} uid Submitter of the response.
 * @param {Number} responseNumber Response number to be modified.
 * @param {String} response New response.
 */
module.exports.editResponse = (db, uid, responseNumber, response) => {
    db.transaction((uid, rNum, resp) => {
        db.prepare("UPDATE Responses SET response=? WHERE uid=? AND rid=?;").run(uid, rNum, resp);
    })(uid, responseNumber, response);
}

/**
 * Adds a given response in the Responses table.
 * @param {Database} db Database to modify.
 * @param {String} uid Submitter of the response.
 * @param {Number} responseNumber Response number to be submitted.
 * @param {String} response Response to be added.
 */
module.exports.addResponse = (db, uid, responseNumber, response) => {
    db.transaction((uid, rNum, resp) => {
        db.prepare("INSERT INTO Responses (uid, rid, response) VALUES (?, ?, ?);").run(uid, rNum, resp);
    })(uid, responseNumber, response);
}

/**
 * Gets the response identified by the given user ID and response number.
 * @param {Database} db Database to search.
 * @param {String} uid Submitter of the response.
 * @param {Number} responseNumber Response number to get.
 * @returns {Object} Row of response, or undefined if no response exists.
 */
module.exports.getResponseByUID = (db, uid, responseNumber) => {
    return db.prepare("SELECT * FROM Responses WHERE uid = ? AND rid = ?;").get(uid, responseNumber);
}

/**
 * Gets the response identified by the given row number.
 * @param {Database} db Database to search.
 * @param {Number} id Row number of the response.
 * @returns {Object} Row of response, or undefined if no response exists.
 */
module.exports.getResponseByID = (db, id) => {
    return db.prepare("SELECT * FROM Responses WHERE id = ?;").get(id);
}

/**
 * Gets the maximaum allowed responses for a contestant.
 * @param {Database} db Database to search.
 * @param {String} uid Contestant to check.
 * @returns {Number} Number of responses, or undefined if no such Contestant exists.
 */
module.exports.allowedResponses = (db, uid) => {
    return db.prepare("SELECT allowedResponses FROM Contestants WHERE uid = ?;").get(uid).allowedResponses;
}

/**
 * Gets all responses not submitted by this contestant. Primarily used for screen generation.
 * @param {Database} db Database to search.
 * @param {String} uid Contestant to exclude.
 * @return {Array} Array of all responses except those submitted by the contestant given.
 */
module.exports.getAllResponsesButOwn = (db, uid) => {
    return db.prepare("SELECT * FROM Responses WHERE uid != ?;").all(uid);
}

/**
 * Gets all responses.
 * @param {Database} db Database to search.
 * @return {Array} Array of all responses.
 */
module.exports.getAllResponses = (db) => {
    return db.prepare("SELECT * FROM Responses;").all();
}

/**
 * Finds the word count in a response.
 * @param {String} string Response to query.
 * @returns {Number} Number of words in string.
 */
module.exports.wordCount = (string) => {
    return string.trim().split(/\s+/g).length;
}

/**
 * Removes the following characters:
 * - zero-width spaces
 * - newlines
 * @param {String} string Unfiltered string.
 * @returns {String} Filtered string.
 */
module.exports.removeDisallowedChars = (string) => {
    let res = "";
    for (let i = 0; i < string.length; i++) {
        // filter out:
        /*
            - ZWSPs
            - Newlines
        */
        // don't make me have to add more
        if (!"\u200B\n".includes(string.charAt(i))) { 
            res += string.charAt(i);
        }
    }
}

/**
 * Calculate expected number of votes.
 * @param resp Response to count.
 * @returns {Number} Expected vote count.
 */
module.exports.expectedVoteCount = (resp) => {
    return resp.confirmedVoteCount + resp.pendingVoteCount * voteConfig.pendingWeight;
}

/**
 * A compare function for sorting.
 * @param a First response.
 * @param b Second response.
 */
function lessExpectedVotes(a, b) {
    return this.expectedVoteCount(a) - this.expectedVoteCount(b);
}

/**
 * Fired whenever a signup occurs.
 * First argument of return is the return code. 0 means success, 1 means warning, 2 means error.
 * Second argument is status message.
 * @param {Database} db Database to be updated/queried.
 * @param {String} uid Member to signup.
 * @returns {Array} Status code and message.
 */
module.exports.signup  = (db, uid) => {
    if (isContestant(db, uid)) {
        return [2, "You are already signed up."];
    }
    if (isAdmin(db, uid)) {
        return [2, "You are an administrator. You may not sign up."];
    }
    if (phase(db) != "signups" && (phase(db) != "responding" || roundNum(db) != 1)) {
        return [2, "Not in signup phase."];
    }
    addContestant(db, uid);
    return [0, "You have been signed up."];
}

/**
 * Fired whenever a response is attempted.
 * First argument of return is the return code. 0 means success, 1 means warning, 2 means error.
 * Second argument is status message.
 * @param {Database} db Database to be updated/queried.
 * @param {String} uid Contestant submitting.
 * @param {Number} responseNumber Response number to be added.
 * @param {String} response User response
 * @returns {Array} Status code and message.
 */
module.exports.respond  = (db, uid, responseNumber, response) => {
    responseNumber--;
    if (!isContestant(db, uid)) {
        return [2, "You are not a contestant!"];
    }
    if (isDead(db, uid)) {
        return [2, "You are eliminated!"];
    }
    if (phase(db) != "respond") {
        return [2, "Not in responding phase."];
    }
    if (allowedResponses(db, uid) <= responseNumber) {
        return [2, "You are not allowed to submit a response with that ID."];
    }
    status = 0;
    if (getResponse(db, uid, responseNumber)) {
        editResponse(db, uid, responseNumber, response);
        message = "Your response has been edited!";
    } else {
        addResponse(db, uid, responseNumber, response);    
        message = "Your response has been submitted!";
    }
    response = removeDisallowedChars(response);
    if (wordCount(response) > 10) {
        status = 1;
        message = "Your word count is over 10 words!";
    } else if (wordCount(response) < 10) {
        message = "Your word count is under 10 words.";
    }
    return [status, message];
}

/**
 * Fired whenever a response is attempted.
 * First argument of return is the return code. 0 means success, 1 means warning, 2 means error.
 * Second argument is status message.
 * @param {Database} db Database to be updated/queried.
 * @param {String} uid Member querying.
 * @param {Number} voteNumber Vote number to be queried.
 * @param {Number} screenSize Size of queried screen.
 * @returns {Array} Status code and message.
 */
module.exports.getScreen = (db, uid, voteNumber, screenSize) => {
    let engine = MersenneTwister19337.autoSeed();
    // our pool of responses
    let allowedResponses = [];
    // weights per response
    let weights = [];
    // confirmed in our screen
    let screen = [];
    if (voteConfig.giveContestantsOwnResponses) {
        let resp = getResponseByUID(db, uid, voteNumber);
        if (resp) {
            screen.push(resp);
            allowedResponses = getAllResponsesButOwn(db, uid);
        } else {
            allowedResponses = getAllResponses(db);
        }
    }
    switch (voteConfig.voteBalacingScheme) {
        case "equal":
            // All responses are treated equally.
            // Implemented by weighting all responses with weight 1
            for (const resp of allowedResponses) {
                weights.push(1);
            }
            break;
        case "pareto":
            // Responses are weighted by 1 / (voteCount + 1)
            for (const resp of allowedResponses) {
                weights.push(expectedVoteCount(resp));
            }
            break;
        case "linear":
            // Responses are weighted by maxVoteCount - thisVoteCount + 1
            let maxWeight = 0;
            for (const resp of allowedResponses) {
                maxWeight = Math.max(expectedVoteCount(resp), maxWeight);
            }
            for (const resp of allowedResponses) {
                weights.push(maxWeight - expectedVoteCount(resp) + 1);   
            }
            break;
        case "strict":
            // Responses with less votes ALWAYS go first.
            // Implemented by limiting response sample to lowest N responses as requested
            // then allowing randomizer to select all N in whatever order.
            allowedResponses.sort(lessExpectedVotes);
            numResps = screenSize - voteConfig.giveContestantsOwnResponses;
            allowedResponses = allowedResponses.slice(0, numResps);
            weights = new Array(numResps);
            weights.fill(1);
            break;
    }
}