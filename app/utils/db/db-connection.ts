import {Connection, ConnectionOptions, createConnection} from 'mysql2/promise'

let connection:Connection;

const connectionOptions: ConnectionOptions = {
  host: 'maria_db',
  user: 'root',
  port:  3306,
  password: 'secret',
  database: 'test'
}

console.log(`>>> Connection options: `, connectionOptions)

export async function getConnection(){
  if(connection) return connection;

  connection = await createConnection(connectionOptions)

  return connection
} 


