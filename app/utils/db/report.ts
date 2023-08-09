import { getCsvFileDir } from "../files/files.utils" 
import { appendToCsv } from "../csv/fast-csv.utils"
import { getConnection } from "./db-connection"
import { RowDataPacket } from "mysql2"
import path from "path"

interface ReportDataOptions {
    server: string
}

interface ReportData {
    date: string,
    recipe_category: string,
    recipe_id: number,
    total_amnt: string,
    server_id: string,
    name: string,
    barcode: string,
    units: string,
    total_qnty: string
}

export const reportData = async ({server}: ReportDataOptions ) => {
    const connection = await getConnection()
    const {sql, values} = getQuery({server: server})
    const [data,_] = await connection.query<ReportData[] & RowDataPacket[]>(sql, values);
    const formatedData = data.map(e=>({...e, date: new Date(e.date).toISOString()}))
    await appendToCsv(path.join(await getCsvFileDir(), "csv.csv"), formatedData)
}


function getQuery({server}:{server:string}){
    const sql:string = `

    WITH CTE_totals (recipe_name, recipe_unit_id, recipe_barcode, recipe_category,recipe_id, ordered_qnty, total_amnt,  server_id, date) as (
        SELECT
            r.name              as recipe_name,
            r.view_unit_id      as recipe_unit_id, 
            r.bar_code          as recipe_barcode,
            mc.name             as recipe_category, 
            r.id                as recipe_id, 
            SUM(tae.quantity)   as ordered_qnty,
            SUM(tae.quantity) * me.sale_price    as total_amnt, 
            ? as server_id, 
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
            AND tae.quantity != 0 
        GROUP BY r.id
        ORDER BY
            r.id
        )
        SELECT 
            t.date,
            t.recipe_category,  
            t.recipe_id,        
            t.total_amnt,       
            t.server_id,        
            IF(COUNT(p.id) = 1, p.name, t.recipe_name ) as name, 
            IF(COUNT(p.id) = 1, p.bar_code, t.recipe_barcode ) as barcode,  
            IF(COUNT(p.id) = 1, (SELECT IF( u2.translation_key IS NOT NULL, u2.translation_key, u1.translation_key) FROM units as u1 LEFT JOIN units as u2 ON u1.parent_id = u2.id WHERE u1.id = p.view_unit_id), (SELECT translation_key FROM units WHERE id = t.recipe_unit_id) ) as units,  
            IF(COUNT(p.id) = 1, re.unit_quantity_in_master , 1) * ordered_qnty as total_qnty 
         FROM CTE_totals as t
            LEFT  JOIN recipe_elements as re ON re.recipe_id = t.recipe_id
            LEFT JOIN products_in_warehouses as piw on re.product_warehouse_id = piw.id
            LEFT JOIN products as p ON piw.product_id = p.id
        GROUP BY t.recipe_id
        ORDER BY t.recipe_id
    `;
    const values:any[] = [server];
    return {
        sql,
        values
    }
}