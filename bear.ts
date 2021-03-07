/**
 * INFO: tools to manipulate Bear's notes
 */
import {open, DB} from "https://deno.land/x/sqlite/mod.ts";
import {homedir} from "https://deno.land/std/node/os.ts";

export async function getDB() {
    return open(
        `${homedir()}/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`,
    );
}

export function allNotes(db: DB) {
    let rows = db.query("select ZTITLE from ZSFNOTE");
    for (const [ZTITLE] of rows) {
        console.log(ZTITLE);
    }
}
