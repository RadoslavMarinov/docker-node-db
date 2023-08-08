import { write } from "fast-csv";
import { existsSync, createWriteStream } from "fs";
import path from "path";

async function appendToCsv(
  filePath: string,
  data: Array<Record<string, any>>
) {
  let writeHeader = false;
  if (!existsSync(filePath)) {
    console.log(`FILE EXIST NOT EXISTS `, filePath)
    // throw new Error(`The file '${filePath}' dos not exists!`);
    writeHeader = true
  }
  console.log(`WRITE headers `, writeHeader)

  const writeStream = createWriteStream(filePath, { flags: "a" });
  return new Promise((resolve, reject) => {
    write(data, { headers: writeHeader, includeEndRowDelimiter: true })
      .pipe(writeStream)
      .on("finish", () => {
        console.log(`DATA APPENDED !`);
        resolve(true);
      });
  });
}

(async function () {
  const data = [
    {
      name: "Riko",
      age: 30, 
    },
    {
      name: "Sonya",
      age: 35
    },
    {
      name: "Gaby",
      age: 8,
    },
  ];
 
  await appendToCsv(path.resolve(__dirname, "csv.csv"), data);
  console.log(`DDDDOOONNEEE`)
})();
