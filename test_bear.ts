import * as bear from "./bear.ts"

bear.getDB().then(db => {
    bear.allNotes(db);
});
