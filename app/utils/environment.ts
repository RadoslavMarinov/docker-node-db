type EnvVariableName =
  | "NODE_PORT"
  | "DB_PORT"
  | "DB_USER"
  | "DB_PASSWORD"
  | "DB_DATABASE_NAME"
  | "DB_HOSTNAME"
  | "MOUNT_DIR"
  | "BACKUP_FILES_DIR"
  | "BACKUP_FILES_COPY_DIR"
  |"CSV_FILE_DIR"

interface EnvVariables extends Record<EnvVariableName, string | number> {
  NODE_PORT: number;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE_NAME: string;
  MOUNT_DIR: string;
  DB_HOSTNAME: string;
  BACKUP_FILES_DIR: string;
  BACKUP_FILES_COPY_DIR: string;
  CSV_FILE_DIR: string;
}

export const getEnv = (): EnvVariables => {
  return {
    NODE_PORT: _getEnv("NODE_PORT", "number"),
    DB_DATABASE_NAME: _getEnv("DB_DATABASE_NAME", "string"),
    DB_PASSWORD: _getEnv("DB_PASSWORD", "string"),
    DB_PORT: _getEnv("DB_PORT", "number"),
    DB_USER: _getEnv("DB_USER", "string"),
    DB_HOSTNAME: _getEnv("DB_HOSTNAME", "string"),
    BACKUP_FILES_DIR: _getEnv("BACKUP_FILES_DIR", "string"),
    BACKUP_FILES_COPY_DIR: _getEnv("BACKUP_FILES_COPY_DIR", "string"),
    CSV_FILE_DIR: _getEnv("CSV_FILE_DIR", "string"),
    MOUNT_DIR: _getEnv("MOUNT_DIR", "string"),
  };
};

function _getEnv(name: EnvVariableName, type: "number"): number;
function _getEnv(name: EnvVariableName, type: "string"): string;
function _getEnv(name: EnvVariableName, type: "number" | "string") {
  switch (type) {
    case "number": {
      const envVar = process.env[name];
      if (!envVar || envVar.length <= 0 || isNaN(Number(envVar)))
        throw new Error(
          `Missing required environment variable ${name} ${envVar}`
        );
      return Number(envVar);
    }

    default: {
      const envVar = process.env[name];
      if (!envVar || envVar.length <= 0)
        throw new Error(
          `Missing required environment variable ${name} ${envVar}`
        );
      return envVar;
    }
  }
}
