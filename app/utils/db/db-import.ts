import { spawn } from "child_process";
import path from "path";
import { cwd } from "process";

const dbInport = (filePath:string) =>{
    const mysqlimport = spawn('mysql', ['-hmaria_db','-u root', '-psecret','--port=3301'])
    mysqlimport.stdin.write(path.resolve(cwd(), 'db/test-dump.sql'))
    mysqlimport.stdin.end()
    mysqlimport.stdout.on('data',(data)=>{
        console.log(`👉 >>> data = `, data);
    }).on('finish', function() {
        console.log('finished')
    })
    .on('error', function(err) {
        console.log(err)
    });
}