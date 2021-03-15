/**
 * INFO: Syncthing REST API client
 */
export class Syncthing {
  public apiKey: string;
  public host: string;
  public system: System;
  public database: Database;

  constructor(apiKey: string, host: string) {
    this.apiKey = apiKey;
    this.host = host;
    this.system = new System(this);
    this.database = new Database(this);
  }

  public buildURL(endpoint: string, command: string): string {
    return `http://${this.host}:8384/rest/${endpoint}/${command}`;
  }
}

abstract class Endpoint {
  protected parent: Syncthing;

  constructor(parent: Syncthing) {
    this.parent = parent;
  }
}

class System extends Endpoint {
  public ping(): Promise<any> {
    return fetch(this.parent.buildURL("system", "ping"), {
      method: "GET",
      headers: {
        "X-API-Key": this.parent.apiKey,
      },
    }).then((response) => response.json());
  }
}

class Database extends Endpoint {
  public completion(): Promise<any> {
    return fetch(this.parent.buildURL("db", "completion"), {
      method: "GET",
      headers: {
        "X-API-Key": this.parent.apiKey,
      },
    }).then((response) => response.json());
  }
}
