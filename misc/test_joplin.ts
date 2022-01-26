import { Model } from "https://deno.land/x/denodb/mod.ts";
import { db, Notes } from "../notes/joplin.ts";

const notes = await Notes.orderBy("created_time", "desc").limit(10).get();
(notes as Model[]).forEach((note) => {
  console.log(note);
});
console.log("Done!");
db.close();
