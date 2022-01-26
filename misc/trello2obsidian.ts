import { readSecrets } from "./secrets.ts";
import { Trello, TrelloCard, TrelloList } from "../common/tasks/trello.ts";
import * as path from "https://deno.land/std/path/mod.ts";

const credentials = readSecrets<any>("trello");

const trello = new Trello(credentials.key, credentials.token);

const DESTINATION = path.join(
  Deno.env.get("HOME")!,
  "notes/logseq/pages/kanban",
);

const _header = `---

kanban-plugin: basic

---
`;

const cards = await trello.getMemberCards(credentials.memberId);
const boards = await trello.getBoards(credentials.memberId);

const data: { [id: string]: TrelloList[] } = {};

for (const board of boards) {
  console.log(`Fetching lists for board ${board.name}`);
  const lists = await trello.getListsOnBoard(board.id);
  lists.forEach((list) => {
    if (data[board.id] == null) {
      data[board.id] = [list];
    } else {
      data[board.id].push(list);
    }
  });
}

function buildCardTask(card: TrelloCard): string {
  const completed = card.closed ? "x" : " ";
  if (card.dueReminder != undefined) {
    console.log(card.dueReminder);
  }
  const dueDate = card.due != undefined ? `@${card.dueReminder!}` : "";
  return `- [${completed}] ${card.name} [🔗](https://trello.com/c/${card.shortLink}) ${dueDate}`;
}

boards.forEach((board) => {
  const boardLists = data[board.id];
  const boardText = [_header];
  boardLists.forEach((list) => {
    boardText.push(`\n## ${list.name}\n`);
    console.log(`List ${list.name} is on board ${board.name}`);
    const listCards = cards.filter((card) => card.idList == list.id);
    const processedCards = listCards.map((card) => {
      if (list.name == "Done") {
        card.closed = true;
      }
      return card;
    });
    processedCards.forEach((card) => {
      boardText.push(buildCardTask(card));
    });
    Deno.writeTextFile(
      path.join(DESTINATION, `${board.name} board.md`),
      boardText.join("\n"),
    );
  });
});
