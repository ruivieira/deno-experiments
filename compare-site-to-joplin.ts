import {getJoplinDB, listTitles} from "./joplin/joplin.ts";
import {getAllMardownFiles} from "./pepper/core/pepper.ts";
import * as Colors from 'https://deno.land/std/fmt/colors.ts';

const db = getJoplinDB();

const titles = listTitles(db);

const mdFiles = getAllMardownFiles();

// remove the extension from the markdown files
const names = mdFiles.map((x) => x.name.slice(0, -3));

const duplicates = [];

for (const name of names) {
    if (titles.includes(name)) {
        duplicates.push(name);
    }
}

console.log(
    `Found ${Colors.green(
        duplicates.length.toString()
    )} duplicates in ruivieira.dev and Joplin:`
);
for (const d of duplicates) {
    console.log(`\t- ${Colors.yellow(d)}`);
}

db.close();