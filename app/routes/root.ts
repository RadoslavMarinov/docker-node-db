import express from "express";
import { getConnection } from "../utils/db/db-connection";
const router = express.Router();

router.get("/", async (req, res) => {
  let data;
  try {
    const con = await getConnection();
    const [data, columns] = await con.query(
      `SELECT * FROM general_settings`
    );
    res.json(data)
  } catch (e) {
    res.json({ msg: `Hello Riko ${Date.now()}` });
  }
});

export default router;
