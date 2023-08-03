import path from "path"
import { cwd } from "process"
import { getEnv } from "../../utils/environment"

export const getDumpDirAbsPath = ()=>{
    const {DUMP_FILES_DIR} = getEnv()
    return path.resolve(cwd(), '..', DUMP_FILES_DIR)
}