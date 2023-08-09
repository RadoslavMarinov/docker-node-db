import express from "express";
import { getConnection } from "../utils/db/db-connection";
const router = express.Router();

router.get("/", async (req, res) => {
  let data;
  try {
    const con = await getConnection();
    // const [data, columns] = await con.query(
    //   `SELECT * FROM general_settings`
    // );
    const [data, columns] = await con.query(
      `WITH CTE_totals (recipe_name, recipe_unit_id, recipe_barcode, recipe_category,recipe_id, total_qnty, total_amnt,  server_id, date) as (
        SELECT
            r.name              as recipe_name,
            r.view_unit_id      as recipe_unit_id, 
            r.bar_code          as recipe_barcode,
            mc.name             as recipe_category,
            r.id                as recipe_id,
            SUM(tae.quantity)   as total_qnty,
            COUNT(me.id) * me.sale_price    as total_amnt,
            55 as server_id,
            ta.closed_at as date 
        FROM table_accounts as ta
            INNER join table_account_elements as tae ON tae.table_account_id = ta.id
            INNER JOIN order_elements AS oe ON tae.order_element_id = oe.id
            INNER JOIN menu_elements AS me ON oe.menu_element_id = me.id
            INNER JOIN recipes AS r ON me.recipe_id = r.id
            INNER JOIN menu_categories as mc ON r.menu_category_id = mc.id
        WHERE
            ta.closed_at > NOW() - INTERVAL 6 WEEK
            AND r.is_deleted = 0
        GROUP BY r.id
        ORDER BY
            r.id
        )
        SELECT 
            t.recipe_category, 
            t.recipe_id,
            t.total_amnt,
            t.server_id,
            t.date,
            IF(COUNT(p.id) = 1, p.name, t.recipe_name ) as name,
            IF(COUNT(p.id) = 1, p.bar_code, t.recipe_barcode ) as barcode,
            IF(COUNT(p.id) = 1, (SELECT translation_key FROM units WHERE id = p.view_unit_id), (SELECT translation_key FROM units WHERE id = t.recipe_unit_id) ) as units,
            IF(COUNT(p.id) = 1, re.unit_quantity_in_master , 1) * total_qnty as total_qnty
         FROM CTE_totals as t
            LEFT  JOIN recipe_elements as re ON re.recipe_id = t.recipe_id
            LEFT JOIN products_in_warehouses as piw on re.product_warehouse_id = piw.id
            LEFT JOIN products as p ON piw.product_id = p.id
        GROUP BY t.recipe_id
        ORDER BY date`
    );
    res.json(data)
  } catch (e) {
    console.log(`👉 >>> e = `, e);
    res.json({ msg: `Hello Riko ${Date.now()}` });
  }
});

export default router;
