import { exec, spawn } from "child_process";
import path from "path";
import { cwd } from "process";
import { createReadStream } from "fs";
import { getEnv } from "../../utils/environment";
import { getDumpDirAbsPath } from "../../utils/files/files.utils";
const { DB_HOSTNAME, DB_USER, DB_PASSWORD, DB_PORT } = getEnv();

export const dbImport = (fileName: string, dbName?:string) => {
  return new Promise(async (resolve, reject) => {
    const filePath = path.join(getDumpDirAbsPath(), fileName);

    console.log(`👉 >>> filePath = `, filePath);
    if( dbName) {
      await reCreateDatabase(dbName)
    }
    exec(
      `mysql -h${DB_HOSTNAME} -u${DB_USER} --port=${DB_PORT} -p${DB_PASSWORD} ${dbName||""} <  ${filePath}`,
      (err, stdout) => {
        if (err) {
          console.log(`👉 >>> ERRROR!!! = `, err);
          reject(err);
        } else {
          console.log(`👉 >>> success! = `, stdout);
          resolve(true);
        }
      }
    );
  });
};

export const dbInportSpawn = () => {
  return new Promise((resolve, reject) => {
    const proc = spawn("mysql", [
      "-hmaria_db",
      "-uroot",
      "-psecret",
      "--port=3306",
    ]);
    const dumpFile = createReadStream(path.resolve(cwd(), "db/test-dump.sql"));
    dumpFile
      .pipe(proc.stdin)
      .on("error", function (error) {
        console.log(`Error piping file to proc.stdin: ${error.message}`);
        reject(error);
      })
      .on("end", () => {
        console.log(`👉 >>> File has been read and piped into the process`);
      })
      .on("close", () => {
        console.log(`👉 >>> File read stream CLOSED`);
      });

    proc.stdout
      .on("data", (data) => {
        console.log(`👉 >>> Process STDOUT data = `, data);
      })
      .on("error", (err) => {
        console.log(`👉 >>> Process STDOUT Error = `, err);
        reject(err);
      })
      .on("close", () => {
        console.log(`👉 >>> Process STDOUT close`);
      });

    proc.on("close", (code) => {
      console.log(`👉 >>> Process terminated with status code = ${code}`);
      resolve(true);
    });
  });
};



function reCreateDatabase(dbName:string){
  return new Promise((resolve,reject)=>{
    exec(
      `mysql -h${DB_HOSTNAME} -u${DB_USER} --port=${DB_PORT} -p${DB_PASSWORD} -e "DROP database if exists ${dbName}; CREATE database ${dbName}"`,
      (err, stdout) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  })

}