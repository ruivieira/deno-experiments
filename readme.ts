/**
 * INFO: script to auto-generate this repo's `README.md`
 */
import { walkSync } from "https://deno.land/std/fs/mod.ts";
import { renderFile } from "https://deno.land/x/mustache/mod.ts";

interface Info {
  path: string;
  info: string;
}

const infos: Array<Info> = [];

for (const fileInfo of walkSync(".")) {
  var fileExt = fileInfo.name.split(".").pop();
  // console.log(
  //   `path: ${fileInfo.path}, name: ${fileInfo.name}, ext: ${fileExt}`,
  // );
  if (fileExt == "ts") {
    // process the file
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(Deno.readFileSync(fileInfo.path));
    let lines = text.split("\n");
    for (let line of lines) {
      // console.log(`line: ${line}`);
      if (line.startsWith(" * INFO: ")) {
        infos.push({
          path: fileInfo.path,
          info: line.substring(9, line.length),
        });
      }
    }
  }
}

// Sort information by path lenght
infos.sort((a, b) => {
  const x = a.path.length + a.info.length;
  const y = b.path.length + b.info.length;
  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  return 0;
});

// get the graduated projects
const graduatedText = Deno.readTextFileSync(`./graduated.json`);
const graduated = JSON.parse(graduatedText);

// get the online apps
const appsText = Deno.readTextFileSync(`./apps.json`);
const apps = JSON.parse(appsText);

const s = await renderFile(`README.template.md`, {
  infos: infos,
  graduated: graduated,
  apps: apps,
});

Deno.writeTextFile("README.md", s).then((r) => console.log("Done!"));

console.log(s);
