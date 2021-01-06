import * as fsSyncer from 'fs-syncer'
import * as gdesc from '../src/gdesc'
import {getHelper} from './helper'

export const {gdescParams, logger, poolHelper: helper} = getHelper({__filename})

beforeEach(async () => {
  await helper.pool.query(helper.sql`
    create table test_table(
      id int primary key,
      n int
    );
  `)
})

// expect.addSnapshotSerializer({
//   test: () => true,
//   print: val => JSON.stringify(val, null, 2),
// })

test('get old format', () => {
  const syncer = fsSyncer.createFSSyncer({
    baseDir: __dirname + '/generated/with-date',
    targetState: {},
  })

  expect(syncer.read()).toMatchInlineSnapshot()
})

test.only('migrate old codegen', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    generated: {
      'FooWithDate.ts': `
        /* eslint-disable */
        // tslint:disable
        // this file is generated by a tool; don't change it manually.

        export type FooWithDate_AllTypes = [
          {
            /** pg_type.typname: timestamptz */
            d: Date
          }
        ]
        export interface FooWithDate_QueryTypeMap {
          [\`select d from foo where d is not null limit 1\`]: FooWithDate_AllTypes[0]
        }

        export type FooWithDate_UnionType = FooWithDate_QueryTypeMap[keyof FooWithDate_QueryTypeMap]

        export type FooWithDate = {
          [K in keyof FooWithDate_UnionType]: FooWithDate_UnionType[K]
        }
        export const FooWithDate = {} as FooWithDate

        export const FooWithDate_meta_v0 = [{\\"properties\\":[{\\"name\\":\\"d\\",\\"value\\":\\"Date\\",\\"description\\":\\"pg_type.typname: timestamptz\\"}],\\"description\\":\\"select d from foo where d is not null limit 1\\"}]
      `,
      '_pg_types.ts': `
        /* eslint-disable */
        // tslint:disable
        // this file is generated by a tool; don't change it manually.

        export const _pg_types = {
          aclitem: 'aclitem',
          any: 'any',
          // ... many skipped
          _xml: '_xml'
        } as const

        export type _pg_types = typeof _pg_types
      `,
      'index.ts': `
        /* eslint-disable */
        // tslint:disable
        // this file is generated by a tool; don't change it manually.
        import {FooWithDate} from './FooWithDate'
        import {_pg_types} from './_pg_types'

        export {FooWithDate}
        export {_pg_types}

        export interface KnownTypes {
          FooWithDate: FooWithDate
          _pg_types: _pg_types
        }

        /** runtime-accessible object with phantom type information of query results. */
        export const knownTypes: KnownTypes = {
          FooWithDate,
          _pg_types,
        }
      `,
    },
  })

  syncer.sync()

  await gdesc.gdescriber({
    ...gdescParams(syncer.baseDir),
    writeTypes: queries => {
      queries.forEach(query => {
        query.fields.forEach(field => {
          if (field.column?.endsWith('.id')) {
            field.typescript = `(${field.typescript} & { _brand: ${JSON.stringify(field.column)} })`
          }
        })
      })
      return gdesc.defaultWriteTypes()(queries)
    },
  })

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    index.ts: |-
      import {sql} from 'slonik'
      
      export default sql<queries.TestTable>\`select id, n from test_table\`
      
      module queries {
        /** - query: \`select id, n from test_table\` */
        export interface TestTable {
          /** column: \`branding_test.test_table.id\`, not null: \`true\`, postgres type: \`integer\` */
          id: number & {
            _brand: 'branding_test.test_table.id'
          }
      
          /** column: \`branding_test.test_table.n\`, postgres type: \`integer\` */
          n: number | null
        }
      }
      "
  `)
})