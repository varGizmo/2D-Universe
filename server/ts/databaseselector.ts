import * as path from "path";

export default function(config: any) {
  return require(path.resolve(__dirname, "db_providers", config.database));
}
