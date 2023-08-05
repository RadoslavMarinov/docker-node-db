// import express from "express";
import { getConnection } from "./utils/db/db-connection";
import { getEnv } from "./utils/environment";
import rootRoute from "./routes/root";
import { dbImport } from "./utils/db/db-import";
import express from "express";
import { isNodeVersion } from "./utils/utils";
import {
  decryptFile,
  findFileByServerName,
  getDumpCopyDirAbsPath,
  getDumpFilesList,
  getListOfDumpFiles,
} from "./utils/files/files.utils";
import path from "path";
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
    const backupList = await getDumpFilesList()
    const parsedFilesList = getListOfDumpFiles(backupList)
    console.log(parsedFilesList)
    for await (let file of parsedFilesList){
      const backupFilePath = await findFileByServerName( file.server )
      console.log(backupFilePath);
      if(backupFilePath){

        const destDir = getDumpCopyDirAbsPath()
        const sqlFile = await decryptFile(backupFilePath, destDir);
        console.log(`👉 >>> sqlFile = `, sqlFile);
        console.log(`👉 >>> importing data into the database `);
        await dbImport(sqlFile, DB_DATABASE_NAME);
      }else{
        throw new Error(`>>> File '${backupFilePath}' for server '${file.server}' not found!`)
      }
    }
    //---------
    // const backupFilePath = backupList[0]
    
    // await unzipFile(backupFilePath, sqlFileDir)
    // console.log(`👉 >>> Dine = `);
    
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
    }, 1 * 1000);
  }
}

main();
