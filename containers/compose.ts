import {Container, Port} from "./core.ts";

export class Composer {
    private services: Service[] = [];
    private readonly version: string;

    constructor(version: string = "3.1") {
        this.version = version
    }

    add(service: Service) {
        this.services.push(service);
    }

    render(): string {
        const script: string[] = []
        script.push(`version: "${this.version}"`)
        script.push("services:")
        for (const service of this.services) {
            script.push(service.render())
        }
        return script.join("\n")
    }
}

export class Service {
    private readonly name: string;
    private readonly container: Container;
    private readonly depends: Service[] = []

    constructor(name: string, container: Container) {
        this.name = name;
        this.container = container;
    }

    private _ports: [Port, Port][] = [];

    get ports(): [Port, Port][] {
        return this._ports;
    }

    addPorts(a: Port, b: Port) {
        this._ports.push([a, b]);
    }

    addPort(p: Port) {
        this._ports.push([p, p]);
    }

    depends_on(other: Service) {
        this.depends.push(other)
    }

    render(): string {
        let script = [`\t\t${this.name}:`]
        script.push(`\t\t\timage: ${this.container.base.from}:${this.container.base.tag}`)
        script.push(`\t\t\tports:`)
        if (this._ports.length == 0) {
            this._ports = this.container.ports.map(port => [port, port])
        }
        for (const port of this._ports) {
            script.push(`\t\t\t\t- "${port[0].port}":"${port[1].port}"`)
        }
        if (this.depends.length > 0) {
            script.push(`\t\t\tdepends_on:`)
            for (const depend of this.depends) {
                script.push(`\t\t\t\t- ${depend.name}`)
            }
        }

        return script.join("\n")
    }
}