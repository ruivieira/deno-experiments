/**
 * INFO: script to auto-generate this repo's `README.md`
 */
import {
  readFileStr,
  writeFileStrSync,
} from "https://deno.land/std@0.53.0/fs/mod.ts";
import { walkSync } from "https://deno.land/std@0.53.0/fs/mod.ts";
import { renderFile } from "https://deno.land/x/mustache/mod.ts";

interface Info {
  path: string;
  info: string;
}

let infos: Array<Info> = [];

for (const fileInfo of walkSync(".")) {
  var fileExt = fileInfo.name.split(".").pop();
  // console.log(
  //   `path: ${fileInfo.path}, name: ${fileInfo.name}, ext: ${fileExt}`,
  // );
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

let s = await renderFile(`README.template.md`, {
  infos: infos,
});

writeFileStrSync("README.md", s);

console.log(s);
