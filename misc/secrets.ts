/**
 * INFO: simple `.config` reader
 */

/**
 * Reads secrets from a JSON file from `~/.config/<topic>/<file>`.
 * As an example, `const s = readSecrets<any>("myapp", "keys.json")` will
 * read the values into a JSON object from `~/.config/myapp/keys.json`.
 * The values can then be extracted with `s.key1`, `s.key2`, etc.
 *
 * @param topic The secret's topic
 * @param file The filename, `credentials.json` by default
 * @returns
 */
export function readSecrets<T>(
  topic: string,
  file = "credentials.json",
): T {
  const HOME = Deno.env.get("HOME");
  const text = Deno.readTextFileSync(
    `${HOME}/.config/${topic}/${file}`,
  );
  return JSON.parse(text);
}
