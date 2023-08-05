import path from "path";
import { cwd } from "process";
import { getEnv } from "../../utils/environment";
import { copyFile, readdir } from "fs/promises";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  scryptSync,
} from "crypto";
import fs, { PathLike } from "fs";
import { exec } from "child_process";
import zlib from "node:zlib";

export function encripFile(src?: string, dest?: string) {
  return new Promise((resolve, reject) => {
    const key = scryptSync("asdasdasdasd", "saltsaltsaltsalt", 24);
    const iv = Buffer.alloc(16, 0);
    const cipher = createCipheriv("aes-192-cbc", key, iv);
    const input = fs.createReadStream(
      path.resolve(cwd(), "../README.md")
    );
    const output = fs.createWriteStream(
      path.resolve(cwd(), "../README.enc")
    );
    input
      .pipe(cipher)
      .pipe(output)
      .on("close", () => {
        console.log(`👉 >>> Kriptirano = `);
        return resolve(1);
      });
  });
}

export async function decryptFile(
  src: string,
  dest: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const algorithm = "aes-256-ctr";
    const password = "eGewU26Gs71TYaYa6J3gCL8ljiB3QQ6k";

    const encodedFileName = path.basename(src);
    const destPath = path.join(
      dest,
      changeFileExtension(encodedFileName, "sql")
    );

    const initVector = await getInitVector(src);
    const cipherKey = createHash("sha256").update(password).digest();
    const decipher = createDecipheriv(
      algorithm,
      cipherKey,
      initVector
    );

    const unzip = zlib.createGunzip().on("error", (err) => {
      console.log(`👉 >>> ERROR while unzipping `, err);
    });

    const input = fs.createReadStream(src, { start: 16 });
    const output = fs.createWriteStream(destPath);

    input
      .pipe(decipher)
      .pipe(unzip)
      .on("error", (err) => reject(err))
      .pipe(output)
      .on("close", () => {
        console.log(`✅ Decrypted ${src} 
          -> ${destPath}`);
        resolve(destPath);
      })
      .on("error", (err: any) => {
        console.log(`❌ >>> ERRPR = `, err);
        reject(err);
      });
  });
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
    const cmd = `unzip -oj ${src} -d ${dest}`;
    console.log(`👉 >>> cmd = `, cmd);
    exec(cmd, (err, stdout) => {
      console.log(`👉 >>> AAAAAAAAA = `, stdout);
      if (err) return reject(err);
      resolve(stdout);
    });
  });
};

async function getInitVector(path: fs.PathLike): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const readStr = fs.createReadStream(path, { end: 15 });

    readStr
      .on("data", (data) => {
        chunks.push(data as Buffer);
      })
      .on("close", () => {
        resolve(Buffer.concat(chunks));
      })
      .on("error", (err) => reject(err));
  });
}

function changeFileExtension(fileName: string, newExtension: string) {
  const baseName = fileName.substring(0, fileName.lastIndexOf("."));
  return `${baseName}.${newExtension}`;
}

/**
 *
 * @returns List of absolute paths to each encoded dump file
 */
export async function getDumpFilesList(): Promise<string[]> {
  const backupsDir = getBackupsDirAbsPath();
  const backupList = await readdir(backupsDir).then(
    (files: string[]) =>
      files.map((fileName) => path.join(backupsDir, fileName))
  );
  return backupList;
}

export function getListOfDumpFiles(filesPath: string[]) {
  return filesPath.map(parseFilePath);
}

export async function findFileByServerName(serverName: string) {
  const dumbFilesList = await getDumpFilesList();
  return dumbFilesList.find(
    (filePath) => parseFilePath(filePath).server === serverName
  );
}

function parseFilePath(filePath: string) {
  const [server, _, timeStampSec, last] = path
    .basename(filePath)
    .split("-");
  return {
    server,
    timeStampSec,
    version: last.substring(0, last.lastIndexOf(".")),
    absPath: filePath,
  };
}

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
