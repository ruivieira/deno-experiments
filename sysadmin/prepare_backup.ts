import { exec } from "https://deno.land/x/exec/mod.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

const HOME = Deno.env.get("HOME");

console.log(Colors.yellow("Sync code folders"));
let response = await exec(
  `zsh -c "rsync -avh --exclude-from='${HOME}/Sync/.stignore' --delete ~/Sync/code ~/Dropbox/code/backup/"`,
);
console.log(Colors.green("Done!"));

console.log(Colors.yellow("Sync notes folders"));
response = await exec(
  `zsh -c "rsync -avh --exclude-from='${HOME}/Sync/.stignore' --delete ~/notes ~/Dropbox/notes/"`,
);
console.log(Colors.green("Done!"));
