import {
  Base,
  Command,
  Container,
  Env,
  Port,
  Workdir,
  User,
  Copy,
  Run,
  Add
} from "../containers/core.ts";

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("Containers :: core :: FROM", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: CMD (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);
  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: ENV (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: EXPOSE (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
EXPOSE 8080
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const port = new Port(8080);
  container.add(port);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: WORKDIR (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
EXPOSE 8080
WORKDIR /app
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const port = new Port(8080);
  container.add(port);
  const workdir = new Workdir("/app");
  container.add(workdir);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: USER (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
EXPOSE 8080
USER deno
WORKDIR /app
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const port = new Port(8080);
  container.add(port);
  const user = new User("deno");
  container.add(user);
  const workdir = new Workdir("/app");
  container.add(workdir);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: COPY (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
EXPOSE 8080
USER deno
COPY example.ts .
WORKDIR /app
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const port = new Port(8080);
  container.add(port);
  const user = new User("deno");
  container.add(user);
  const copy = new Copy("example.ts", ".");
  container.add(copy);
  const workdir = new Workdir("/app");
  container.add(workdir);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: RUN (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
RUN deno cache example.ts`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const run = new Run("deno cache example.ts")
  container.add(run);
  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: ADD (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
EXPOSE 8080
USER deno
ADD . .
WORKDIR /app
ENV foo=bar
ENV HOME=test
CMD ["run", "--allow-net", "example.ts"]`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  const port = new Port(8080);
  container.add(port);
  const user = new User("deno");
  container.add(user);
  const add = new Add(".", ".");
  container.add(add);
  const workdir = new Workdir("/app");
  container.add(workdir);
  const environment = new Env();
  environment.add("foo", "bar").add("HOME", "test");
  container.add(environment);
  const commands = new Command();
  commands.add("run").add("--allow-net").add("example.ts");
  container.add(commands);

  const result = container.render();
  assertEquals(result, manifest);
});
});
