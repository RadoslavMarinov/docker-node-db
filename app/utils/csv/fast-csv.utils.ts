import { write } from "fast-csv";
import { existsSync, createWriteStream } from "fs";
import path from "path";

export async function appendToCsv(
  filePath: string,
  data: Array<Record<string, any>>
) {
  let writeHeader = false;
  if (!existsSync(filePath)) {
    writeHeader = true
  }

  const writeStream = createWriteStream(filePath, { flags: "a" });
  return new Promise((resolve, reject) => {
    const stream = write(data, { headers: writeHeader, includeEndRowDelimiter: true })
      .pipe(writeStream)
      .on('error',(e)=>{
        console.log(`👉 >>> Error writing to stream`, );
        stream.close()
        reject(e)
      })
      .on("finish", () => {
        console.log(`Data appended to csv Successfylly!`);
        resolve(true);
      });
  });
}