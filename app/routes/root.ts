import express from 'express'
import { getConnection } from '../utils/db/db-connection';
const router = express.Router()

router.get('/', async (req, res) => {
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

export default router