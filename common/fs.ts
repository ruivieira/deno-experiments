import { WalkEntry, expandGlobSync } from "https://deno.land/std/fs/mod.ts";
import { basename } from "https://deno.land/std/path/posix.ts";

/**
 * Return a list of files (recursively) with a specified extension.
 * @param path Starting path
 * @param extension An extension, e.g. ".txt"
 * @param firstLevel Boolean. True if only root level should be searched
 */
export function globFiles(
  path: string,
  extension: string,
  firstLevel = false
): Array<WalkEntry> {
  const files = [];
  if (!firstLevel) {
    for (const file of expandGlobSync(`${path}/**/*.${extension}`)) {
      files.push(file);
    }
  } else {
    for (const file of expandGlobSync(`${path}/*.${extension}`)) {
      files.push(file);
    }
  }
  return files;
}

export function basenameNoExt(path: string, extension: string): string {
  return basename(path).slice(0, -(extension.length + 1));
}
