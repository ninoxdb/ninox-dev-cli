import {
  Database,
  DatabaseFile,
  DatabaseSchema,
  DatabaseSchemaBase,
  DatabaseSchemaBaseType,
  DatabaseType,
  TableBase,
  TableFile,
  TableFileType,
} from '../common/schemas.js'
import {FSUtil} from './fs-util.js'
import {createYamlDocument} from './yaml-util.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseData(db: any, sc: any) {
  const parsedDatabase = Database.safeParse(db)
  const parsedSchema = DatabaseSchema.safeParse(sc)

  if (!parsedDatabase.success || !parsedSchema.success)
    throw new Error('Validation errors: Database or Schema validation failed')

  const schema = DatabaseSchemaBase.parse(parsedSchema.data)
  const inputTypes = parsedSchema.data.types

  const tables = Object.entries(inputTypes).map(([key, value]) => {
    const parsedTable = TableBase.safeParse(value)
    if (!parsedTable.success)
      throw new Error(`Validation errors: Table validation failed ${parsedSchema.data.types[key]?.caption}`)
    return TableFile.parse({
      table: {
        ...parsedTable.data,
        _database: parsedDatabase.data.id,
        _id: key,
      },
    })
  })

  return {database: parsedDatabase.data, schema, tables}
}

// Write the database, schema and tables to their respective files
export async function writeToFiles(database: DatabaseType, schema: DatabaseSchemaBaseType, tables: TableFileType[]) {
  await FSUtil.ensureRootDirectoryStructure()
  // Create a subfolder in the root directory/Objects with name Database_${id}
  await FSUtil.createDatabaseFolderInObjects(database.id)
  await FSUtil.writeFile(
    FSUtil.getObjectPath(database.id, FSUtil.getObjectFileName('Database', database.settings.name)),
    createYamlDocument(
      DatabaseFile.parse({
        database: {
          ...database,
          schema: {...schema, _database: database.id},
        },
      }),
    ).toString(),
  )
  // table
  for (const table of tables) {
    // eslint-disable-next-line no-await-in-loop
    await FSUtil.writeFile(
      FSUtil.getObjectPath(
        database.id,
        FSUtil.getObjectFileName(table.table.kind === 'page' ? 'Page' : 'Table', table.table.caption as string),
      ),
      createYamlDocument(table).toString(),
    )
  }
}
