type EnvVariableName =
  | "NODE_PORT"
  | "DB_PORT"
  | "DB_USER"
  | "DB_PASSWORD"
  | "DB_DATABASE_NAME"
  | "DB_HOSTNAME"
  | "DUMP_FILES_DIR";

interface EnvVariables extends Record<EnvVariableName, string | number> {
  NODE_PORT: number;
  DB_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_DATABASE_NAME: string;
  DB_HOSTNAME: string;
  DUMP_FILES_DIR:string
}

export const getEnv = (): EnvVariables => {
  return {
    NODE_PORT: _getEnv("NODE_PORT", "number"),
    DB_DATABASE_NAME: _getEnv("DB_DATABASE_NAME", "string"),
    DB_PASSWORD: _getEnv("DB_PASSWORD", "string"),
    DB_PORT: _getEnv("DB_PORT", "number"),
    DB_USER: _getEnv("DB_USER", "string"),
    DB_HOSTNAME: _getEnv("DB_HOSTNAME", "string"),
    DUMP_FILES_DIR: _getEnv("DUMP_FILES_DIR", "string"),
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
