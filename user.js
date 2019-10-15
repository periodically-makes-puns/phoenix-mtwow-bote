const utils = require("./utils.js");

function isContestant(db, uid) {
    return !(!db.prepare("SELECT * FROM Contestants WHERE uid = ?;").get(uid));
}

function isDead(db, uid) {
    return db.prepare("SELECT alive FROM Contestants WHERE uid=?;").get(uid).alive
}

function addContestant(db, uid) {
    db.transaction((uid) => {
        db.prepare("INSERT INTO Contestants (uid, alive) VALUES (?, 1);").run(uid);
    })(uid);
}

function phase(db) {
    return db.prepare("SELECT phase FROM Status;").get().phase;
}

function roundNum(db) {
    return db.prepare("SELECT roundNum FROM Status;").get().roundNum;
}

function editResponse(db, uid, responseNumber, response) {
    db.transaction((uid, rNum, resp) => {
        db.prepare("UPDATE Responses SET response=? WHERE uid=? AND rid=?;").run(uid, rNum, resp);
    })(uid, responseNumber, response);
}

function addResponse(db, uid, responseNumber, response) {
    db.transaction((uid, rNum, resp) => {
        db.prepare("INSERT INTO Responses (uid, rid, response) VALUES (?, ?, ?);").run(uid, rNum, resp);
    })(uid, responseNumber, response);
}

function getResponse(db, uid, responseNumber) {
    return db.prepare("SELECT * FROM Responses WHERE uid = ? AND rid = ?;").get(uid, responseNumber);
}

function getResponse(db, id) {
    return db.prepare("SELECT * FROM Responses WHERE id = ?;").get(id);
}

function allowedResponses(db, uid) {
    return db.prepare("SELECT allowedResponses FROM Contestants WHERE uid = ?;").get(uid).allowedResponses;
}

function wordCount(string) {
    return string.trim().split(/\s+/g).length;
}

function signup(db, uid) {
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

function respond(db, uid, responseNumber, response) {
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
    if (wordCount(response) > 10) {
        status = 1;
        message = "Your word count is over 10 words!";
    } else if (wordCount(response) < 10) {
        message = "Your word count is under 10 words.";
    }
    return [status, message];
}

function getScreen(db, uid, voteNumber) {
    
}