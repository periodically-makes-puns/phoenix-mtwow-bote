const utils = require("./utils.js");

function isContestant(state, uid) {
    return !(!state.db.prepare("SELECT * FROM Contestants WHERE uid = ?").get(uid));
}

function addContestant(state, uid) {
    state.db.transaction((uid) => {
        state.db.prepare("INSERT INTO Contestants (uid, alive) VALUES (?, 1);").run(uid);
    })(uid);
}

function signup(state, uid) {
    if (isContestant(uid)) {
        return [2, "You are already signed up."];
    }
    

}