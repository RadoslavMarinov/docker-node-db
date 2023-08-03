// import express from "express";
import { getConnection } from "./utils/db/db-connection";
import { readFile } from "fs/promises";
import path from "path";
import { cwd } from "process";
import { getEnv } from "./utils/environment";
import rootRoute from "./routes/root";
import { dbImport, dbInportSpawn } from "./utils/db/db-import";
// const app = express();
const { NODE_PORT: PORT } = getEnv();

// app.use("/", rootRoute);

async function main() {
  // console.log(`👉 >>> SQ FILE = `, file.toString());
  // const file = await readFile(path.resolve(cwd(), "db/test-dump.sql"));
  // const con = await getConnection();
  // con.query(file.toString()).catch((e) => {
  //   console.log(`👉 >>> EEEEEEEEEEEEEE = `, e);
  // });
  
  // setInterval(async () => {
    //   console.log(`TRY GET USERS`);
    try {
      console.log(`👉 >>> connection established`);
      await dbImport('test-dump.sql')
      const con = await getConnection();
      const [users, columns] = await con.query(`SELECT * FROM user`);
      console.log(`USEERS:::: `, users);
      con.end()
    } catch (e) {
      console.log(`ERROR : `, e);
      // setInterval(()=>{
      //   console.log(`👉 >>> Something went wrong`, );
      // }, 2000)
    }
  // }, 2000);
}
// app.listen(PORT, () => console.log(`Epress started on port ${PORT}`));

main();