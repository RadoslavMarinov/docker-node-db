import express from 'express'
import { getConnection } from './utils/db/db-connection'
const app = express()

app.get('/', async (req,res,next)=>{
  let data;
  try{
    const con = await getConnection()
    const [users, columns] = await con.query(`SELECT * FROM user`)
    data = users
  }catch(e){
    data = {msg: `Hello Riko ${Date.now()}`}
  }
  res.json(data)
})

async function main(){
  
  setInterval(async()=>{
    console.log(`TRY GET USERS`)
    try{
      const con = await getConnection()
      const [users, columns] = await con.query(`SELECT * FROM user`)
      console.log(`USEERS:::: `, users) 
  
    }catch(e){
      console.log(`ERROR : `, e)
    }
  }, 2000)
}
app.listen(3000, ()=> console.log(`Epress started on port ${3000}`))

main()