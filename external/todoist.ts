type Resource = Record<string, unknown>;

interface Task {
  content: string;
}

interface BodyParams {
  syncToken?: string;
  resourceTypes?: string[];
}

interface SyncResult {
  [resourceType: string]: Resource[] | undefined;
}

/**
 * See https://developer.todoist.com/sync/v8/
 */
export class Todoist {
  private readonly baseUrl = "https://api.todoist.com/sync/v8/sync";

  constructor(
    private token: string,
  ) {
  }

  public async getTasks(): Promise<Resource[] | undefined> {
    const result = await this.sync({
      resourceTypes: ["items"],
    });
    return result["items"];
  }

  public async sync(params: BodyParams): Promise<SyncResult> {
    const body = this.buildBody(params);
    const response = await fetch(this.baseUrl, {
      body,
      method: "POST",
      headers: {
        "Accept": "application/json",
      },
    });
    const result: SyncResult = await response.json();
    return result;
  }

  private buildBody(params: BodyParams) {
    const data = new URLSearchParams();
    data.append("token", this.token);
    if (params.resourceTypes) {
      data.append("resource_types", JSON.stringify(params.resourceTypes));
    }
    data.append("sync_token", params.syncToken ?? "*");
    return data;
  }
}
