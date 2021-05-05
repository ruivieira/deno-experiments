import Denomander from "https://deno.land/x/denomander/mod.ts";
import {find_duplicates} from "../syncthing/utils.ts"
const program = new Denomander({
    app_name: "stu",
    app_description: "Syncthing utils",
    app_version: "0.1.0",
});

program
    .command("conflicts", "Deal with conflicts")
    .option("-l --list", "Define the address")
    .option("-p --path", "Define the address")

program.parse(Deno.args);

if (program.conflicts) {
    if (program.list) {
        let path = "/Users/rui/Sync";
        if (program.path) {
            // path = program.path
            console.log(program.path);
        }
        let files = find_duplicates(path);
        console.log(files);
    }
}
