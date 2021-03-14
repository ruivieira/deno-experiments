type Environment = { [p: string]: string };

interface Entry {
  render(): string;
}

export class Base implements Entry {
  private readonly from: string;
  private readonly tag: string;

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
  private port: number;
  constructor(port: number) {
    this.port = port;
  }
  render(): string {
    return `EXPOSE ${this.port}`;
  }
}

export class Container {
  private entries: Entry[] = [];
  constructor(base: Base) {
    this.entries.push(base);
  }
  add(entry: Entry) {
    this.entries.push(entry);
  }

  render(): string {
    const manifest = this.entries.map((x) => x.render());
    return manifest.join("\n");
  }
}
