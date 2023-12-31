import path from "path";
import { cwd } from "process";
import { getEnv } from "../../utils/environment";
import fsProm, { copyFile, readdir } from "fs/promises";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from "crypto";
import fs from "fs";
import { exec } from "child_process";
import zlib, { createGzip } from "node:zlib";
import { AppendInitVector } from "./AppendInitVector";

export async function decryptFile(src: string, dest: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const {DECRYPT_SECRET} = getEnv()
    const algorithm = "aes-256-ctr";
    const password = DECRYPT_SECRET;

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
  const mountDir = await getMountDirAbsPath()
  return path.join(mountDir, "db")
};

export const getBackupCopyDir = async () => {
  const mountDir = await getMountDirAbsPath()
  return path.join(mountDir, "db-copy")
};

export const getCsvFileDir = async () => {
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


export async function encripFile(src: string, dest: string, secret:string):Promise<string> {
  return new Promise((resolve, reject) => {
    const cipherKey = createHash("sha256").update(secret).digest();
    const readStream = fs.createReadStream(src);
    const gzip = createGzip();
    const initVector = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', cipherKey, initVector);
    const appendInitVector = new AppendInitVector(initVector);
    const writeStream = fs.createWriteStream(dest);

    readStream
        .pipe(gzip)
        .pipe(cipher)
        .pipe(appendInitVector)
        .pipe(writeStream)
        .on('finish', () => {
          resolve(dest);
        }).on('error',(e)=>{
          reject(e)
        });
  });
}
