import mongoose from 'mongoose'
import { Migrator } from "mgdb-migrator"
import MigrationController from "./migrations/index"

export default async function connectMongoDb() {
  const MONGO_URL = Bun.env.MONGO_URL

  try {
    await mongoose.connect(MONGO_URL)
    console.info("Mongodb Connected")
  } catch (error) {
    console.error("Mongodb Not Connected: ", error)
  }

  const migrator = new Migrator({
    // false disables logging
    log: true,
    // null or a function
    logger: (level, ...args) => console.info(args),
    // enable/disable info log "already at latest."
    logIfLatest: true,
    // migrations collection name
    collectionName: "migrations",
    // mongdb connection properties object or mongo Db instance
    db: {
      // mongdb connection url
      connectionUrl: MONGO_URL,
      // optional database name, in case using it in connection string is not an option
      // name: 'your database name',
      // optional mongdb Client options
      // options: {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // },
    },
  })

  await migrator.config()
  MigrationController(migrator)
  await migrator.migrateTo("latest")
}