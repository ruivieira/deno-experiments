export interface Task {
  body: string;
  done: boolean
}

export class Todo implements Task {
  body: string;
  done: boolean
  constructor(body: string, done = false) {
    this.body = body;
    this.done = done
  }
}
