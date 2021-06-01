export interface Task {
  body: string;
  status: Status;
  priority: number;
}

export enum Status {
    Done,
    Todo,
    Later
}

export class Todo implements Task {
  body: string;
  status: Status
  priority: number
  constructor(body: string, status = Status.Todo, priority = 10) {
    this.body = body;
    this.status = status
    this.priority = priority
  }
}

