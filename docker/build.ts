import * as c from "../containers/core.ts";

const base = new c.Base("hayd/alpine-deno", "1.8.1");

const container = new c.Container(base);

container.add(new c.Port(1993));
container.add(new c.Workdir("/app"));
container.add(new c.User("deno"));
container.add(new c.Copy("example.ts", "."));
container.add(new c.Run("deno cache example.ts"));
container.add(new c.Add(".", "."));
container.add(new c.Run("deno cache example.ts"));
container.add(new c.Command().add("run").add("-A").add("example.ts"));

console.log(container.render());

console.log("--------------------------------");
const service = new c.Service("example", container);
const p = new c.Port(2181);
const p2 = new c.Port(2182);
service.addPorts(p, p);
service.addPort(p2);
console.log(service.render());
