/**
 * INFO: script to auto-generate this repo's `README.md`
 */
import { readFileStr, writeFileStrSync } from "https://deno.land/std/fs/mod.ts";
import { walkSync } from "https://deno.land/std/fs/mod.ts";
import { renderFile } from "https://deno.land/x/mustache/mod.ts";

let infos = [];

for (const fileInfo of walkSync(".")) {
  var fileExt = fileInfo.name.split(".").pop();
  console.log(
    `path: ${fileInfo.path}, name: ${fileInfo.name}, ext: ${fileExt}`,
  );
  if (fileExt == "ts") {
    // process the file
    const text = await readFileStr(fileInfo.path);
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

console.log(infos);
let s = await renderFile(`README.template.md`, {
  infos: infos,
});

writeFileStrSync("README.md", s);

console.log(s);

// const countWords = (s: string): number =>
//   s.split(/\s+/g).filter(w => /[a-z0-9]/.test(w)).length;

// const text = await readFileStr('input.txt');
// const count = countWords(text);
// console.log(`I read ${count} words.`);
