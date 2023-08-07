import { write } from "fast-csv";
import fs, { createWriteStream } from "fs";

(async function () {
  const ws = createWriteStream("fast.csv", { flags: "a" });
  const data = [
    {
      name: "Riko",
      age: 30,
    },
    {
      name: "Sonya",
      age: 35,
    },
    {
      name: "Gaby",
      age: 8,
    },
  ];
  write(data, { headers: false, includeEndRowDelimiter: true })
    .pipe(ws)
    .on("close", () => console.log(`Finish`))
    .on("close", () => console.log(`close`));
})();
