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

export enum TicketStatus {
    REPORTED = "reported",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    PENDING = "pending",
    RESOLVED = "resolved"
}

export enum TicketResolution {
    UNRESOLVED = "unresolved",
    FIXED = "fixed",
    IMPLEMENTED = "implemented",
    WONT_FIX = "wont_fix",
    BY_DESIGN = "by_design",
    INVALID = "invalid",
    DUPLICATE = "duplicate",
    NOT_OUR_BUG = "not_our_bug"
}

interface Ticket extends BasicTicket {

    id: number,
    "ref"?: string,
    tracker?: TrackerShort,
    "created": string,
    "updated": string,
    "submitter"?: UserShort,
    "status": TicketStatus,
    "resolution": TicketResolution,
    "permissions"?: {
        "anonymous"?: string[],
        "submitter"?: string[],
        "user"?: string[],
    },
    "labels"?: string[],
    "assignees"?: string[]
}

/**
 * Manages sourcehut issue trackers.
 */
export class Todo {
    static baseURL = "https://todo.sr.ht/api"
    private readonly token: string

    /**
     * Initialise a issue tracker manager.
     * @param token A OAuth1 token
     */
    constructor(token: string) {
        this.token = token;
    }

    /**
     * List all trackers associated with the current user.
     */
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

    /**
     * Get specific ticket from a tracker.
     * @param tracker The tracker's name
     * @param id Ticket id
     */
    getTrackerTicket(tracker: string, id: number): Promise<Ticket> {
        return fetch(`${Todo.baseURL}/trackers/${tracker}/tickets/${id}`, {
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
