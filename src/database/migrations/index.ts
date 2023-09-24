
import { Migrator } from "mgdb-migrator";
import { m0001 } from "./0001-init";

const MigrationController = (migrator: Migrator): void => {
  migrator.add(m0001);
};

export default MigrationController;