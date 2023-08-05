import express from "express";
import { getConnection } from "./utils/db/db-connection";
import { getEnv } from "./utils/environment";
import rootRoute from "./routes/root";
import { dbImport } from "./utils/db/db-import";
import { isNodeVersion } from "./utils/utils";
import {
  decryptFile,
  findFileByServerName,
  getDumpCopyDirAbsPath,
  getDumpFilesList,
  getListOfDumpFiles,
} from "./utils/files/files.utils";
const app = express();
const { NODE_PORT: PORT, DB_DATABASE_NAME } = getEnv();

app.use("/", rootRoute);

if (!isNodeVersion(18)) {
  throw new Error(`Must use NodeJS version 18`);
}

async function main() {
  const server = app.listen(PORT, () => {
    console.log(`👉 >>> Node server listening on port `, PORT);
  });
  const con = await getConnection();
  try {
    const backupList = await getDumpFilesList();
    const parsedFilesList = getListOfDumpFiles(backupList);

    for await (let file of parsedFilesList) {
      const backupFilePath = await findFileByServerName(file.server);
      if (!backupFilePath) {
        throw new Error(
          `❌ File '${backupFilePath}' for server '${file.server}' not found!`
        );
      }
      const destDir = getDumpCopyDirAbsPath();
      const sqlFile = await decryptFile(backupFilePath, destDir);
      console.log(
        `👉 >>> importing data into the database ${sqlFile}`
      );
      await dbImport(sqlFile, DB_DATABASE_NAME);
    }
  } catch (e) {
    console.log(`❌ERROR : `, e);
  } finally {
    setTimeout(() => {
      console.log(`👉 >>> Close the server = `);
      server.closeAllConnections();
      server.close(() => {
        console.log(`👉 >>> Node Server stopped`);
      });
      con.end();
    }, 1 * 1000);
  }
}

main();
