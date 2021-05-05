/**
 * INFO: Syncthing utilities
 */
import {expandGlobSync, WalkEntry} from "https://deno.land/std/fs/mod.ts";
/**
 * Return a list of files (recursively) with a specified extension.
 * @param path Starting path
 * @param extension An extension, e.g. ".txt"
 * @param firstLevel Boolean. True if only root level should be searched
 */
export function find_duplicates(
    path: string
): Array<WalkEntry> {
    const files = [];
        for (const file of expandGlobSync(`${path}/**/*.sync-conflict*`)) {
            files.push(file);
        }
    return files;
}