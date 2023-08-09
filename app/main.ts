import fsProm from "fs/promises";
import express from "express";
import { getConnection } from "./utils/db/db-connection";
import { getEnv } from "./utils/environment";
import rootRoute from "./routes/root";
import { dbImport } from "./utils/db/db-import";
import { isNodeVersion } from "./utils/utils";
import {
  copyFileToDir,
  decryptFile,
  deleteCsvFile,
  findFileByServerName,
  getBackupCopyDir,
  getDumpFilesList,
  getListOfDumpFiles,
  getMountDirAbsPath,
} from "./utils/files/files.utils";
import { reportData } from "./utils/db/report";
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
    await deleteCsvFile()
    await getMountDirAbsPath()
    const servers = getListOfDumpFiles(backupList).map(i=>i.server);

    for (let server of servers) {
      const backupFilePath = await findFileByServerName(server);
      if (!backupFilePath) {
        throw new Error(
          `❌ File '${backupFilePath}' for server '${server}' not found!`
        );
      }

      const copyDir = await getBackupCopyDir()
      const dumpFileCopy = await copyFileToDir(backupFilePath, copyDir);
      const sqlFile = await decryptFile(dumpFileCopy, copyDir);
      await fsProm.unlink(dumpFileCopy)
      console.log(`👉 >>> Import data for ${server} into the database`, );
      await dbImport(sqlFile, DB_DATABASE_NAME);
      await reportData({server})
      // await new Promise(resolve=> setTimeout(resolve, 50 * 1000))
      await fsProm.unlink(sqlFile)

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
