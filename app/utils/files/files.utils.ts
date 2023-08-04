import path from "path";
import { cwd } from "process";
import { getEnv } from "../../utils/environment";
import { copyFile } from "fs/promises";

export const getBackupsDirAbsPath = () => {
  const { DUMP_FILES_DIR } = getEnv();
  return path.resolve(cwd(), "..", DUMP_FILES_DIR);
};

export const getDumpCopyDirAbsPath = () => {
    const { COPY_DUMP_FILE_DIR } = getEnv();
    return path.resolve(cwd(), "..", COPY_DUMP_FILE_DIR);
  };

const _copyFile = async (src: string, dest: string) => {
  console.log(`👉 >>> Copy file 
        from::: ${src}
        to:::${dest}`);

    await copyFile(src,dest)
};
