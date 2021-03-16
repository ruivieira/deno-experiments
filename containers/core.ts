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

  constructor() {
  }

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

  constructor() {
  }

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
  public readonly base: Base;
  private readonly _ports: Port[] = [];

  constructor(base: Base) {
    this.base = base;
    this._entries.push(base);
  }

  get ports(): Port[] {
    return this._ports;
  }

  private _entries: Entry[] = [];

  get entries(): Entry[] {
    return this._entries;
  }

  env(key: string, value: string): Container {
    const env = new Env();
    env.add(key, value);
    this._entries.push(env);
    return this;
  }

  cmd(...args: string[]): Container {
    const command = new Command();
    args.forEach((x) => command.add(x));
    this._entries.push(command);
    return this;
  }

  run(data: string): Container {
    this._entries.push(new Run(data));
    return this;
  }

  add(source: string, dest: string): Container {
    this._entries.push(new Add(source, dest));
    return this;
  }

  copy(source: string, dest: string): Container {
    this._entries.push(new Copy(source, dest));
    return this;
  }

  user(data: string): Container {
    this._entries.push(new User(data));
    return this;
  }

  workdir(data: string): Container {
    this._entries.push(new Workdir(data));
    return this;
  }

  port(data: number): Container {
    const port = new Port(data);
    this._entries.push(port);
    this._ports.push(port);
    return this;
  }

  render(): string {
    const manifest = this._entries.map((x) => x.render());
    return manifest.join("\n");
  }
}
