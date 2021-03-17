import { Base, Container, Port } from "../../deno-boxes/core.ts";

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
  container.cmd("run", "--allow-net", "example.ts");
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
  container.env("foo", "bar").env("HOME", "test");
  container.cmd("run", "--allow-net", "example.ts");
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
  container.port(8080)
    .env("foo", "bar").env("HOME", "test")
    .cmd("run", "--allow-net", "example.ts");
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
  container.port(8080)
    .workdir("/app")
    .env("foo", "bar").env("HOME", "test")
    .cmd("run", "--allow-net", "example.ts");
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
  container.port(8080)
    .user("deno")
    .workdir("/app")
    .env("foo", "bar").env("HOME", "test")
    .cmd("run", "--allow-net", "example.ts");
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
  container.port(8080)
    .user("deno")
    .copy("example.ts", ".")
    .workdir("/app")
    .env("foo", "bar").env("HOME", "test")
    .cmd("run", "--allow-net", "example.ts");
  const result = container.render();
  assertEquals(result, manifest);
});

Deno.test("Containers :: core :: RUN (full)", () => {
  const manifest = `FROM hayd/alpine-deno:1.8.1
RUN deno cache example.ts`;
  const base = new Base("hayd/alpine-deno", "1.8.1");
  const container = new Container(base);
  container.run("deno cache example.ts");
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
  container.port(8080)
    .user("deno")
    .add(".", ".")
    .workdir("/app")
    .env("foo", "bar").env("HOME", "test")
    .cmd("run", "--allow-net", "example.ts");
  const result = container.render();
  assertEquals(result, manifest);
});
