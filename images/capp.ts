import * as c from "https://deno.land/x/boxes/mod.ts";

const base = new c.Base("hayd/alpine-deno", "1.8.1");

const container = new c.Container(base);

container.port(1993)
  .workdir("/app")
  .user("deno")
  .copy("example.js", ".")
  .run("deno cache example.js")
  .add(".", ".")
  .run("deno cache example.js")
  .cmd("run", "-A", "--unstable", "example.js");

console.log(container.render());
