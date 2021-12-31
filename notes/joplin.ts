/**
 * INFO: tools to manipulate Joplin's notes
 */

import { DataTypes, Database, Model, SQLite3Connector } from 'https://deno.land/x/denodb/mod.ts';

const HOME = Deno.env.get("HOME");

export function getJoplinDB(): Database {
  const connector = new SQLite3Connector({
    filepath: `${HOME}/.config/joplin-desktop/database.sqlite`,
  });
  
  const db: Database = new Database(connector);
  
  return db;
}

export class Notes extends Model {
  static table = 'notes';
  static timestamps = true;

  static fields = {
    id: { primaryKey: true, autoIncrement: false },
    title: DataTypes.STRING,
    body: DataTypes.STRING,
    created_time: DataTypes.TIMESTAMP,
  };

  static defaults = {
  };
}

export const db = getJoplinDB();
db.link([Notes]);

// export function listTitles(db: DB): Array<string> {
//   const titles: Array<string> = [];
//   for (const [title] of db.query("SELECT title FROM notes")) {
    
//     titles.push(title as string);
//   }
//   return titles;
// }

// export function getAllNotes(db: DB): Array<Note> {
//   const notes: Array<Note> = []; 
//   for (const [id, title, body, createdTime] of db.query("SELECT id, title, body, created_time FROM notes")) {
//     notes.push({
//       id: id as number,
//       title: title as string,
//       body: body as string,
//       createdTime: new Date(createdTime as number)
//     });
//   }
//   return notes;
// }