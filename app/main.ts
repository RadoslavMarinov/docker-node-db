// import express from "express";
import { getConnection } from "./utils/db/db-connection";
import { getEnv } from "./utils/environment";
import rootRoute from "./routes/root";
import { dbImport } from "./utils/db/db-import";
import express from "express";
import { isNodeVersion } from "./utils/utils";
import { readdir } from "fs/promises";
import {
  decripFile,
  encripFile,
  getBackupsDirAbsPath,
  getDumpCopyDirAbsPath,
  unzipFile,
} from "./utils/files/files.utils";
import path from "path";
const app = express();
const { NODE_PORT: PORT } = getEnv();

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
    const backupsDir = getBackupsDirAbsPath();
    const backupList = await readdir(backupsDir).then(
      (files: string[]) =>
        files.map((fileName) => path.join(backupsDir, fileName))
    );
    console.log(`👉 >>> backupList = `, backupList);

    const backupFilePath = backupList[0]
    const destDir = getDumpCopyDirAbsPath()
    
    // await unzipFile(backupFilePath, sqlFileDir)
    // console.log(`👉 >>> Dine = `);

    const sqlFile = await decripFile(backupFilePath, destDir);
    console.log(`👉 >>> sqlFile = `, sqlFile);
    // await dbImport("test-dump.sql");
  } catch (e) {
    console.log(`ERROR : `, e);
  } finally {
    setTimeout(() => {
      console.log(`👉 >>> Close the server = `);
      server.closeAllConnections();
      server.close(() => {
        console.log(`👉 >>> Node Server stopped`);
      });
      con.end();
    }, 5000);
  }
}

main();
