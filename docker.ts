/**
 * INFO: generate Dockerfiles for Deno scripts
 */
import { render } from "https://deno.land/x/mustache/mod.ts";
import {
  writeFileStrSync,
} from "https://deno.land/std@0.53.0/fs/mod.ts";

const dockerfile = `
FROM registry.access.redhat.com/ubi8/ubi

RUN dnf -y install curl unzip
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
{{#files}}
COPY {{{.}}} {{{.}}}
{{/files}}
RUN /root/.deno/bin/deno cache {{{entrypoint}}}
ENTRYPOINT [ "/root/.deno/bin/deno", "run", "--allow-all", "--unstable", "{{{entrypoint}}}" ]
`;

function renderDockerfile(files: string[], entrypoint: string): string {
  return render(dockerfile, {
    files: files,
    entrypoint: entrypoint,
  });
}

function saveDockerfile(text: string, destination: string) {
  writeFileStrSync(destination, d);
}

let d = renderDockerfile(["rss/rss.ts", "rss/test_rss.ts"], "rss/test_rss.ts");
console.log(d);
saveDockerfile(d, "Dockerfile");
