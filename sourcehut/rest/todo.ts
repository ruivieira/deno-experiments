/**
 * INFO: REST client for todo.sr.ht
 */
interface Collection<T> {
    next: any,
    results: T[],
    total: number,
    results_per_page: number
}

interface Tracker {
    id: number,
    owner: { canonical_name: string, name: string },
    created: string,
    updated: string,
    name: string,
    description: string,
    default_permissions: { anonymous: any[], submitter: any[], user: any[] }
}

interface TrackerShort {

}

interface UserShort {
}

interface BasicTicket {
    title: string,
    description: string
}

interface Ticket extends BasicTicket {

    id: number,
    "ref"?: string,
    tracker?: TrackerShort,
    "created": string,
    "updated": string,
    "submitter"?: UserShort,
    "status": string,
    "resolution": string,
    "permissions"?: {
        "anonymous"?: string[],
        "submitter"?: string[],
        "user"?: string[],
    },
    "labels"?: string[],
    "assignees"?: string[]
}

export class Todo {
    private readonly token: string
    static baseURL = "https://todo.sr.ht/api"

    constructor(token: string) {
        this.token = token;
    }

    getAllTrackers(): Promise<Collection<Tracker>> {
        return fetch(`${Todo.baseURL}/trackers`, {
            method: "GET",
            headers: {
                'Authorization': `token ${this.token}`,
            }

        }).then(r => r.json())
    }

    getAllTrackerTickets(tracker: string): Promise<Collection<Ticket>> {
        return fetch(`${Todo.baseURL}/trackers/${tracker}/tickets`, {
            method: "GET",
            headers: {
                'Authorization': `token ${this.token}`,
            }

        }).then(r => r.json())
    }

    createTicket(trackerName: string, ticket: BasicTicket) {
        return fetch(`${Todo.baseURL}/trackers/${trackerName}/tickets`, {
            method: "POST",
            headers: {
                'Authorization': `token ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket)

        }).then(r => r.json())
    }
}
