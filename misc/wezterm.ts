export function readConfig(file = "wezterm.lua"): string {
  const HOME = Deno.env.get("HOME");
  const text = Deno.readTextFileSync(`${HOME}/.config/wezterm/${file}`);
  return text;
}

console.log(readConfig());
