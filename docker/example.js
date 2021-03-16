class Base {
    constructor(from, tag = "latest"){
        this.from = from;
        this.tag = tag;
    }
    render() {
        return `FROM ${this.from}:${this.tag}`;
    }
}
class Command {
    commands = [];
    constructor(){
    }
    add(cmd) {
        this.commands.push(cmd);
        return this;
    }
    render() {
        const c = this.commands.map((c1)=>`"${c1}"`
        ).join(", ");
        return `CMD [${c}]`;
    }
}
class Port {
    constructor(port){
        this.port = port;
    }
    render() {
        return `EXPOSE ${this.port}`;
    }
}
class Workdir {
    constructor(dir){
        this.dir = dir;
    }
    render() {
        return `WORKDIR ${this.dir}`;
    }
}
class User {
    constructor(user){
        this.user = user;
    }
    render() {
        return `USER ${this.user}`;
    }
}
class Copy {
    constructor(source2, dest2){
        this.source = source2;
        this.dest = dest2;
    }
    render() {
        return `COPY ${this.source} ${this.dest}`;
    }
}
class Add {
    constructor(source1, dest1){
        this.source = source1;
        this.dest = dest1;
    }
    render() {
        return `ADD ${this.source} ${this.dest}`;
    }
}
class Run {
    constructor(command){
        this.command = command;
    }
    render() {
        return `RUN ${this.command}`;
    }
}
class Container {
    constructor(base){
        this.base = base;
        this._entries.push(base);
    }
    _entries = [];
    get entries() {
        return this._entries;
    }
    cmd(...args) {
        const command1 = new Command();
        args.forEach((x)=>command1.add(x)
        );
        this._entries.push(command1);
        return this;
    }
    run(data) {
        this._entries.push(new Run(data));
        return this;
    }
    add(source, dest) {
        this._entries.push(new Add(source, dest));
        return this;
    }
    copy(source, dest) {
        this._entries.push(new Copy(source, dest));
        return this;
    }
    user(data) {
        this._entries.push(new User(data));
        return this;
    }
    workdir(data) {
        this._entries.push(new Workdir(data));
        return this;
    }
    port(data) {
        this._entries.push(new Port(data));
        return this;
    }
    render() {
        const manifest = this._entries.map((x)=>x.render()
        );
        return manifest.join("\n");
    }
}
class Service {
    ports = [];
    constructor(name, container){
        this.name = name;
        this.container = container;
    }
    addPorts(a, b) {
        this.ports.push([
            a,
            b
        ]);
    }
    addPort(p) {
        this.ports.push([
            p,
            p
        ]);
    }
    render() {
        const ports = this.ports.map((x)=>`              - "${x[0].port}":"${x[1].port}"`
        ).join("\n");
        return `    ${this.name}:\n          image: ${this.container.base.from}:${this.container.base.tag}\n          ports:\n${ports}\n  `;
    }
}
const base1 = new Base("hayd/alpine-deno", "1.8.1");
const container1 = new Container(base1);
container1.port(1993).workdir("/app").user("deno").copy("example.js", ".").run("deno cache example.js").add(".", ".").run("deno cache example.js").cmd("run", "-A", "--unstable", "example.js");
console.log(container1.render());

