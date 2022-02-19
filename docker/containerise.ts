/**
 * INFO: Quick creation of containerised Deno apps
 */
import parseArgs from "https://deno.land/x/deno_minimist/mod.ts";
import { basename } from "https://deno.land/std/path/mod.ts";

export const createDockerfile = (entry: string): string => {
  const template = `# syntax=docker/dockerfile:1
FROM denoland/deno:distroless
WORKDIR /app/
COPY ${entry} .
CMD ["run", "-A", "--unstable", "./${basename(entry)}"]`;
  return template;
};

const args = parseArgs(Deno.args);

if (args.entry != undefined) {
  const entry = args.entry as string;
  console.log(`Working with ${entry}`);
  const output = `${entry}.bundle.js`;
  console.log(`Bundling into ${output}`);
  const p = Deno.run({
    cmd: ["bash", "-c", `deno bundle ${entry} > ${output}`],
  });
  const status = await p.status();
  if (status.success) {
    console.log(`Writing Dockerfile`);
    await Deno.writeTextFile("Dockerfile", createDockerfile(output));
  } else {
    console.log("An entry file must be specified.");
  }
}
