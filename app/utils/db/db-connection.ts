import {
  Connection,
  ConnectionOptions,
  createConnection,
} from "mysql2/promise";
import { getEnv } from "../environment";

const { DB_PASSWORD, DB_PORT, DB_DATABASE_NAME, DB_USER, DB_HOSTNAME } =
  getEnv();

let connection: Connection;

const connectionOptions: ConnectionOptions = {
  host: DB_HOSTNAME,
  user: DB_USER, // or root ?
  port: DB_PORT,
  password: DB_PASSWORD,
  database: DB_DATABASE_NAME,
  multipleStatements: true,
};

console.log(`>>> Connection options: `, connectionOptions);

export async function getConnection() {
  if (connection) return connection;

  connection = await createConnection(connectionOptions,);

  return connection;
}
