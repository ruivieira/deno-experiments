import * as c from "../../deno-boxes/core.ts";
import { Composer, Service } from "../../deno-boxes/compose.ts";

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

const service1 = new Service("service1", container);
const service2 = new Service("service2", container);

service2.depends_on(service1);

const compose = new Composer();
compose.add(service1);
compose.add(service2);

console.log(compose.render());
