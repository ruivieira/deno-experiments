import {expandGlobSync, WalkEntry} from 'https://deno.land/std/fs/mod.ts';

const HOME = Deno.env.get("HOME");

export function getAllMardownFiles(): Array<WalkEntry> {
    const files = [];
    for (const file of expandGlobSync(
        `${HOME}/Sync/code/sites/blog-source/**/*.md`
    )) {
        files.push(file);
    }
    return files;
}