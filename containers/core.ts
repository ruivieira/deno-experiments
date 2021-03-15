type Environment = { [p: string]: string };

interface Entry {
  render(): string;
}

export class Base implements Entry {
  public readonly from: string;
  public readonly tag: string;

  constructor(from: string, tag: string = "latest") {
    this.from = from;
    this.tag = tag;
  }

  render(): string {
    return `FROM ${this.from}:${this.tag}`;
  }
}

export class Command implements Entry {
  private commands: string[] = [];
  constructor() {}
  add(cmd: string): Command {
    this.commands.push(cmd);
    return this;
  }

  render(): string {
    const c = this.commands.map((c) => `"${c}"`).join(", ");
    return `CMD [${c}]`;
  }
}

export class Env implements Entry {
  private envs: Environment = {};
  constructor() {}
  add(key: string, value: string): Env {
    this.envs[key] = value;
    return this;
  }
  render(): string {
    const result = [];
    for (const key of Object.keys(this.envs)) {
      result.push(`ENV ${key}=${this.envs[key]}`);
    }
    return result.join("\n");
  }
}

export class Port implements Entry {
  public readonly port: number;
  constructor(port: number) {
    this.port = port;
  }
  render(): string {
    return `EXPOSE ${this.port}`;
  }
}

export class Workdir implements Entry {
  private readonly dir: string;
  constructor(dir: string) {
    this.dir = dir;
  }
  render(): string {
    return `WORKDIR ${this.dir}`;
  }
}

export class User implements Entry {
  private readonly user: string;
  constructor(user: string) {
    this.user = user;
  }
  render(): string {
    return `USER ${this.user}`;
  }
}

export class Copy implements Entry {
  private readonly source: string;
  private readonly dest: string;
  constructor(source: string, dest: string) {
    this.source = source;
    this.dest = dest;
  }
  render(): string {
    return `COPY ${this.source} ${this.dest}`;
  }
}

export class Add implements Entry {
  private readonly source: string;
  private readonly dest: string;
  constructor(source: string, dest: string) {
    this.source = source;
    this.dest = dest;
  }
  render(): string {
    return `ADD ${this.source} ${this.dest}`;
  }
}

export class Run implements Entry {
  private readonly command: string;
  constructor(command: string) {
    this.command = command;
  }
  render(): string {
    return `RUN ${this.command}`;
  }
}

export class Container {
  protected entries: Entry[] = [];
  public readonly base: Base;
  constructor(base: Base) {
    this.base = base;
    this.entries.push(base);
  }
  add(entry: Entry): Container {
    this.entries.push(entry);
    return this;
  }

  render(): string {
    const manifest = this.entries.map((x) => x.render());
    return manifest.join("\n");
  }
}

export class Composer {
  private services: Service[] = [];

  constructor() {}
  add(service: Service) {
    this.services.push(service);
  }
}

export class Service {
  private readonly name: string;
  private readonly container: Container;
  private readonly ports: [Port, Port][] = [];
  constructor(name: string, container: Container) {
    this.name = name;
    this.container = container;
  }
  addPorts(a: Port, b: Port) {
    this.ports.push([a, b]);
  }
  addPort(p: Port) {
    this.ports.push([p, p]);
  }
  render(): string {
    const ports = this.ports
      .map((x) => `              - "${x[0].port}":"${x[1].port}"`)
      .join("\n");
    return `    ${this.name}:
          image: ${this.container.base.from}:${this.container.base.tag}
          ports:
${ports}
  `;
  }
}