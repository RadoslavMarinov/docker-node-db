import path from "path";
import { cwd } from "process";
import { getEnv } from "../../utils/environment";
import { copyFile } from "fs/promises";
import {createCipheriv, createDecipheriv, scryptSync} from "crypto"
import fs from 'fs'
import { exec } from "child_process";

export function encripFile(src?:string, dest?:string){

  return new Promise((resolve,reject)=>{
    const key = scryptSync('asdasdasdasd', 'saltsaltsaltsalt', 24);
    const iv = Buffer.alloc(16, 0);
    const cipher = createCipheriv('aes-192-cbc', key,iv)
    const input = fs.createReadStream(path.resolve(cwd(), '../README.md'));
    const output = fs.createWriteStream(path.resolve(cwd(), '../README.enc'));
    input.pipe(cipher).pipe(output).on('close', ()=>{
      console.log(`👉 >>> Kriptirano = `, );
      return resolve(1)
    })
  })

}

export function decripFile(src?:string, dest?:string){
  const key = scryptSync('asdasdasdasd', 'saltsaltsaltsalt', 24);
  const iv = Buffer.alloc(16, 0);
  const decipher = createDecipheriv('aes-192-cbc', key,iv)
  const input = fs.createReadStream(path.resolve(cwd(), '../README.enc'));
  const output = fs.createWriteStream(path.resolve(cwd(), '../README.gotovo.md'));

  input.pipe(decipher).pipe(output).on('close', ()=>{
    console.log(`👉 >>> DEKRITIRANo  `, );
  })
}

export const getBackupsDirAbsPath = () => {
  const { BACKUP_FILES_DIR } = getEnv();
  return path.resolve(cwd(), "..", BACKUP_FILES_DIR);
};

export const getDumpCopyDirAbsPath = () => {
  const { BACKUP_FILES_READ_DIR } = getEnv();
  return path.resolve(cwd(), "..", BACKUP_FILES_READ_DIR);
};

const _copyFile = async (src: string, dest: string) => {
  console.log(`👉 >>> Copy file 
        from::: ${src}
        to:::${dest}`);

  await copyFile(src, dest);
};


export const unzipFile = async (src: string, dest: string) => {
  return new Promise((resolve, reject) => {
    const cmd = `unzip -oj ${src} -d ${dest}`
    console.log(`👉 >>> cmd = `, cmd);
    exec(cmd, (err, stdout) => {
      console.log(`👉 >>> AAAAAAAAA = `,stdout);
      if (err) return reject(err);
      resolve(stdout);
    });
  });
};




// export const unzipFile = async (src: string, dest: string) => {
//     return decompres(src, dest, {}).then(files=> {
//         console.log(`👉 >>> DONBE = `);
//     })
// }
// TODO: see https://github.com/nodejs/help/issues/1826
// export const unzipFile = async (src: string, dest: string) => {
//   console.log(`👉 >>> Unzip
//     file ::: ${src}
//     to:::${dest}`);

//   const unzip = zlib.createUnzip();
//   const input = fs.createReadStream(src);
//   const output = fs.createWriteStream(dest);

//   return new Promise((resolve, reject) => {
//     input
//       .pipe(unzip)
//       .pipe(output)
//       .on("close", () => {
//         console.log(` CLOSE `), resolve(true);
//       })
//       .on("ready", () => {
//         console.log(` READY `);
//       })
//       .on("finish", () => {
//         console.log(` DINISH `);
//       })
//       .on("error", (err) => {
//         console.log(` ERROR `);
//         reject(err)
//       });
//   });
// };
