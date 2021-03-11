/**
 * INFO: simple `.config` reader
 */
export function readSecrets<T>(topic: string, file:string = "credentials.json"): T {
    const HOME = Deno.env.get("HOME");
    const text = Deno.readTextFileSync(
        `${HOME}/.config/${topic}/${file}`
    );
    return JSON.parse(text)
}


