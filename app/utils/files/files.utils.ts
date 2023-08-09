import path from "path";
import { cwd } from "process";
import { getEnv } from "../../utils/environment";
import fsProm, { copyFile, readdir } from "fs/promises";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  scryptSync,
} from "crypto";
import fs from "fs";
import { exec } from "child_process";
import zlib from "node:zlib";

export async function decryptFile(src: string, dest: string): Promise<string> {
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
    const decipher = createDecipheriv(algorithm, cipherKey, initVector);

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

export const getMountDirAbsPath = async () => {
  const { MOUNT_DIR } = getEnv();
  const dirPath = path.resolve(cwd(), "..", MOUNT_DIR);

  await Promise.all([
    fsProm.mkdir(path.join(dirPath, "db-copy")).catch((e) => e),
    fsProm.mkdir(path.join(dirPath, "csv")).catch((e) => e),
    fsProm.mkdir(path.join(dirPath, "db")).catch((e) => e),
  ]);

  return dirPath;
};

export const getBackupsDirAbsPath = async () => {
  // const { BACKUP_FILES_DIR } = getEnv();
  // return path.resolve(cwd(), "..", BACKUP_FILES_DIR);
  const mountDir = await getMountDirAbsPath()
  return path.join(mountDir, "db")
};

export const getBackupCopyDir = async () => {
  // const { BACKUP_FILES_COPY_DIR } = getEnv();
  // return path.resolve(cwd(), "..", BACKUP_FILES_COPY_DIR);
  const mountDir = await getMountDirAbsPath()
  return path.join(mountDir, "db-copy")
};

export const getCsvFileDir = async () => {
  // const { CSV_FILE_DIR } = getEnv();
  // return path.resolve(cwd(), "..", CSV_FILE_DIR);

  const mountDir = await getMountDirAbsPath()
  return path.join(mountDir, "csv")
};

export const deleteCsvFile = async () => {
  const csvDir =await getCsvFileDir();
  const csvFiles = await readdir(csvDir).then((files: string[]) =>
    files
      .filter((f) => f.endsWith(".csv"))
      .map((fileName) => path.join(csvDir, fileName))
  );

  await Promise.all(csvFiles.map((file) => fsProm.unlink(file)));
  console.log(`👉 >>> csvFiles = `, csvFiles);
};

export const copyFileToDir = async (src: string, dest: string) => {
  const backupCopyDir = await getBackupCopyDir()
  const destFileAbsPath = path.join(backupCopyDir, path.basename(src));
  await fsProm.copyFile(src, destFileAbsPath);
  return destFileAbsPath;
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
  const chunks: Buffer[] = [];
  const readStr = fs.createReadStream(path, { end: 15 });

  for await (const chunk of readStr) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
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
  const backupsDir = await getBackupsDirAbsPath();
  const backupList = await readdir(backupsDir).then((files: string[]) =>
    files
      .filter((f) => f.endsWith(".enc"))
      .map((fileName) => path.join(backupsDir, fileName))
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
  const [server, _, timeStampSec, last] = path.basename(filePath).split("-");
  return {
    server,
    timeStampSec,
    version: last.substring(0, last.lastIndexOf(".")),
    absPath: filePath,
  };
}

export async function deleteAllInDir(dirPath: string) {
  await fsProm.rm(dirPath, { recursive: true });
  await fsProm.mkdir(dirPath);
}

// export function encripFile(src?: string, dest?: string) {
//   return new Promise((resolve, reject) => {
//     const key = scryptSync("asdasdasdasd", "saltsaltsaltsalt", 24);
//     const iv = Buffer.alloc(16, 0);
//     const cipher = createCipheriv("aes-192-cbc", key, iv);
//     const input = fs.createReadStream(path.resolve(cwd(), "../README.md"));
//     const output = fs.createWriteStream(path.resolve(cwd(), "../README.enc"));
//     input
//       .pipe(cipher)
//       .pipe(output)
//       .on("close", () => {
//         console.log(`👉 >>> Kriptirano = `);
//         return resolve(1);
//       });
//   });
// }
