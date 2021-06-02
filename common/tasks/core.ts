export interface Task {
    content: string;
    status: Status;
    priority: number;
}

export enum Status {
    Done,
    Todo,
    Later
}

export class Todo implements Task {
    content: string;
    status: Status
    priority: number

    constructor(body: string, status = Status.Todo, priority = 10) {
        this.content = body;
        this.status = status
        this.priority = priority
    }
}

