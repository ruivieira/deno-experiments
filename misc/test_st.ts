import { Syncthing } from "../syncthing/core.ts";
import { readSecrets } from "./secrets.ts";

const credentials = readSecrets<any>("syncthing");

const st = new Syncthing(credentials.apiKey, "localhost");

//With Callback
st.system.ping().then((r) => console.log(r));
st.database.completion().then((r) => console.log(r));
