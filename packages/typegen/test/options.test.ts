import * as fsSyncer from 'fs-syncer'
import * as typegen from '../src'
import * as path from 'path'
import {getHelper} from './helper'

export const {gdescParams, logger, poolHelper: helper} = getHelper({__filename})

// todo: test two tables, where sql parser can't automatically tell which table the columns are from.

beforeEach(async () => {
  jest.resetAllMocks()

  await helper.pool.query(helper.sql`
    create type test_enum as enum('aa', 'bb', 'cc');

    create table test_table(
      id int primary key,
      n int,
      t text,
      t_nn text not null,
      cv varchar(1),
      arr text[],
      e test_enum,
      tz timestamptz,
      tz_nn timestamptz not null default now(),
      j json,
      jb jsonb,
      j_nn json not null,
      jb_nn jsonb not null
    );

    comment on column test_table.t is 'Some custom comment on "t"';
  `)
})

test('write types', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'index.ts': `
      import {sql} from 'slonik'

      export default [
        sql\`select * from options_test.test_table\`,
        sql\`select id, t from test_table\`,
        sql\`select count(*) from test_table\`,
        sql\`select id as idalias, t as talias from test_table\`,
        sql\`select id from test_table where id = ${'${1}'} and n = ${'${2}'}\`,
        sql\`insert into test_table(id, j_nn, jb_nn) values (1, '{}', '{}')\`,
        sql\`update test_table set t = ''\`,
        sql\`insert into test_table(id, t_nn, j_nn, jb_nn) values (1, '', '{}', '{}') returning id, t\`,
        sql\`update test_table set t = '' returning id, t\`,
        sql\`insert into test_table as tt (id, j_nn, jb_nn) values (1, '{}', '{}') returning id, t\`,
        sql\`update test_table as tt set t = '' returning id, t\`,
        sql\`select pg_advisory_lock(123)\`,
        sql\`select t1.id from test_table t1 join test_table t2 on t1.id = t2.n\`,
        sql\`select jb->'foo'->>'bar' from test_table\`,
        sql\`select n::numeric from test_table\`,
        sql\`select * from (values (1, 'one'), (2, 'two')) as vals (num, letter)\`,
        sql\`select t from (select id from test_table) t\`,
        sql\`
          select t as t_aliased1, t_nn as t_nn_aliased
          from test_table as tt1
          where
            t_nn in (
              select t_nn as t_aliased2
              from test_table as tt2
              where n = 1
            )
        \`,
      ]
    `,
  })

  syncer.sync()

  await typegen.generate(gdescParams(syncer.baseDir))

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    index.ts: |-
      import {sql} from 'slonik'
      
      export default [
        sql<queries.TestTable>\`select * from options_test.test_table\`,
        sql<queries.TestTable_id_t>\`select id, t from test_table\`,
        sql<queries.TestTable_count>\`select count(*) from test_table\`,
        sql<queries.TestTable_idalias_talias>\`select id as idalias, t as talias from test_table\`,
        sql<queries.TestTable_id>\`select id from test_table where id = \${1} and n = \${2}\`,
        sql<queries._void>\`insert into test_table(id, j_nn, jb_nn) values (1, '{}', '{}')\`,
        sql<queries._void>\`update test_table set t = ''\`,
        sql<queries.TestTable_id_t>\`insert into test_table(id, t_nn, j_nn, jb_nn) values (1, '', '{}', '{}') returning id, t\`,
        sql<queries.TestTable_id_t>\`update test_table set t = '' returning id, t\`,
        sql<queries.TestTable_id_t>\`insert into test_table as tt (id, j_nn, jb_nn) values (1, '{}', '{}') returning id, t\`,
        sql<queries.TestTable_id_t>\`update test_table as tt set t = '' returning id, t\`,
        sql<queries.PgAdvisoryLock>\`select pg_advisory_lock(123)\`,
        sql<queries.TestTable_id>\`select t1.id from test_table t1 join test_table t2 on t1.id = t2.n\`,
        sql<queries.TestTable_1>\`select jb->'foo'->>'bar' from test_table\`,
        sql<queries.TestTable_n>\`select n::numeric from test_table\`,
        sql<queries.Vals>\`select * from (values (1, 'one'), (2, 'two')) as vals (num, letter)\`,
        sql<queries.T>\`select t from (select id from test_table) t\`,
        sql<queries.TestTable_tAliased1_tNnAliased>\`
          select t as t_aliased1, t_nn as t_nn_aliased
          from test_table as tt1
          where
            t_nn in (
              select t_nn as t_aliased2
              from test_table as tt2
              where n = 1
            )
        \`,
      ]
      
      export module queries {
        /** - query: \`select * from options_test.test_table\` */
        export interface TestTable {
          /** column: \`options_test.test_table.id\`, not null: \`true\`, regtype: \`integer\` */
          id: number
      
          /** column: \`options_test.test_table.n\`, regtype: \`integer\` */
          n: number | null
      
          /**
           * Some custom comment on \\"t\\"
           *
           * column: \`options_test.test_table.t\`, regtype: \`text\`
           */
          t: string | null
      
          /** column: \`options_test.test_table.t_nn\`, not null: \`true\`, regtype: \`text\` */
          t_nn: string
      
          /** column: \`options_test.test_table.cv\`, regtype: \`character varying(1)\` */
          cv: string | null
      
          /** column: \`options_test.test_table.arr\`, regtype: \`text[]\` */
          arr: Array<string> | null
      
          /** column: \`options_test.test_table.e\`, regtype: \`test_enum\` */
          e: ('aa' | 'bb' | 'cc') | null
      
          /** column: \`options_test.test_table.tz\`, regtype: \`timestamp with time zone\` */
          tz: number | null
      
          /** column: \`options_test.test_table.tz_nn\`, not null: \`true\`, regtype: \`timestamp with time zone\` */
          tz_nn: number
      
          /** column: \`options_test.test_table.j\`, regtype: \`json\` */
          j: unknown
      
          /** column: \`options_test.test_table.jb\`, regtype: \`jsonb\` */
          jb: unknown
      
          /** column: \`options_test.test_table.j_nn\`, not null: \`true\`, regtype: \`json\` */
          j_nn: unknown
      
          /** column: \`options_test.test_table.jb_nn\`, not null: \`true\`, regtype: \`jsonb\` */
          jb_nn: unknown
        }
      
        /**
         * queries:
         * - \`select id, t from test_table\`
         * - \`insert into test_table(id, t_nn, j_nn, jb_nn) values (1, '', '{}', '{}') returning id, t\`
         * - \`update test_table set t = '' returning id, t\`
         * - \`insert into test_table as tt (id, j_nn, jb_nn) values (1, '{}', '{}') returning id, t\`
         * - \`update test_table as tt set t = '' returning id, t\`
         */
        export interface TestTable_id_t {
          /** column: \`options_test.test_table.id\`, not null: \`true\`, regtype: \`integer\` */
          id: number
      
          /**
           * Some custom comment on \\"t\\"
           *
           * column: \`options_test.test_table.t\`, regtype: \`text\`
           */
          t: string | null
        }
      
        /** - query: \`select count(*) from test_table\` */
        export interface TestTable_count {
          /** not null: \`true\`, regtype: \`bigint\` */
          count: number
        }
      
        /** - query: \`select id as idalias, t as talias from test_table\` */
        export interface TestTable_idalias_talias {
          /** column: \`options_test.test_table.id\`, not null: \`true\`, regtype: \`integer\` */
          idalias: number
      
          /**
           * Some custom comment on \\"t\\"
           *
           * column: \`options_test.test_table.t\`, regtype: \`text\`
           */
          talias: string | null
        }
      
        /**
         * queries:
         * - \`select id from test_table where id = $1 and n = $2\`
         * - \`select t1.id from test_table t1 join test_table t2 on t1.id = t2.n\`
         */
        export interface TestTable_id {
          /** column: \`options_test.test_table.id\`, not null: \`true\`, regtype: \`integer\` */
          id: number
        }
      
        /**
         * queries:
         * - \`insert into test_table(id, j_nn, jb_nn) values (1, '{}', '{}')\`
         * - \`update test_table set t = ''\`
         */
        export interface _void {}
      
        /** - query: \`select pg_advisory_lock(123)\` */
        export interface PgAdvisoryLock {
          /** regtype: \`void\` */
          pg_advisory_lock: unknown
        }
      
        /** - query: \`select jb->'foo'->>'bar' from test_table\` */
        export interface TestTable_1 {
          /** regtype: \`text\` */
          '?column?': string | null
        }
      
        /** - query: \`select n::numeric from test_table\` */
        export interface TestTable_n {
          /** regtype: \`numeric\` */
          n: number | null
        }
      
        /** - query: \`select * from (values (1, 'one'), (2, 'two')) as vals (num, letter)\` */
        export interface Vals {
          /** regtype: \`integer\` */
          num: number | null
      
          /** regtype: \`text\` */
          letter: string | null
        }
      
        /** - query: \`select t from (select id from test_table) t\` */
        export interface T {
          /** regtype: \`record\` */
          t: unknown
        }
      
        /** - query: \`select t as t_aliased1, t_nn as t_nn_ali... [truncated] ...ed2 from test_table as tt2 where n = 1 )\` */
        export interface TestTable_tAliased1_tNnAliased {
          /**
           * Some custom comment on \\"t\\"
           *
           * column: \`options_test.test_table.t\`, regtype: \`text\`
           */
          t_aliased1: string | null
      
          /** column: \`options_test.test_table.t_nn\`, not null: \`true\`, regtype: \`text\` */
          t_nn_aliased: string
        }
      }
      "
  `)
})

test('can write queries to separate file', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'a.ts': `
      import {sql} from 'slonik'

      export default sql\`select 1 as a\`

      module queries {
        // this should be removed!
      }
    `,
    // this file has already imported its queries - need to make sure we don't end up with a double import statement
    'b.ts': `
      import {sql} from 'slonik'
      import * as queries from "./__sql__/b";

      export default sql\`select 1 as a\`

      module queries {
        // this should be removed!
      }
    `,
  })

  syncer.sync()

  await typegen.generate({
    ...gdescParams(syncer.baseDir),
    writeTypes: typegen.defaultWriteTypes({
      getTSModuleFromSource: filepath => path.join(path.dirname(filepath), '__sql__', path.basename(filepath)),
    }),
  })

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    a.ts: |-
      import * as queries from './__sql__/a'
      import {sql} from 'slonik'
      
      export default sql<queries.A>\`select 1 as a\`
      
    b.ts: |-
      import {sql} from 'slonik'
      import * as queries from './__sql__/b'
      
      export default sql<queries.A>\`select 1 as a\`
      
    __sql__: 
      a.ts: |-
        /** - query: \`select 1 as a\` */
        export interface A {
          /** regtype: \`integer\` */
          a: number | null
        }
        
      b.ts: |-
        /** - query: \`select 1 as a\` */
        export interface A {
          /** regtype: \`integer\` */
          a: number | null
        }
        "
  `)
})

test('replaces existing queries module', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'index.ts': `
      import {sql} from 'slonik'

      export default sql\`select 1 as a\`

      module queries {
        // this should be removed!
      }
    `,
  })

  syncer.sync()

  await typegen.generate(gdescParams(syncer.baseDir))

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    index.ts: |-
      import {sql} from 'slonik'
      
      export default sql<queries.A>\`select 1 as a\`
      
      export module queries {
        /** - query: \`select 1 as a\` */
        export interface A {
          /** regtype: \`integer\` */
          a: number | null
        }
      }
      "
  `)
})

test('ignore irrelevant syntax', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'index.ts': `
      import {sql} from 'slonik'

      export default () => {
        if (Math.random() > 0.5) {
          const otherTag: any = (val: any) => val
          return otherTag\`foo\`
        }
        if (Math.random() > 0.5) {
          const otherTag: any = {foo: (val: any) => val}
          return otherTag.foo\`bar\`
        }
        return sql\`select 1\`
      }
    `,
  })

  syncer.sync()

  await typegen.generate(gdescParams(syncer.baseDir))

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    index.ts: |-
      import {sql} from 'slonik'
      
      export default () => {
        if (Math.random() > 0.5) {
          const otherTag: any = (val: any) => val
          return otherTag\`foo\`
        }
        if (Math.random() > 0.5) {
          const otherTag: any = {foo: (val: any) => val}
          return otherTag.foo\`bar\`
        }
        return sql<queries.Anonymous>\`select 1\`
      }
      
      export module queries {
        /** - query: \`select 1\` */
        export interface Anonymous {
          /** regtype: \`integer\` */
          '?column?': number | null
        }
      }
      "
  `)
})

test(`queries with syntax errors don't affect others`, async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'index.ts': `
      import {sql} from 'slonik'

      export default [
        sql\`select id from options_test.test_table\`, // this should get a valid type
        sql\`this is a nonsense query which will cause an error\`
      ]
    `,
  })

  syncer.sync()

  await typegen.generate(gdescParams(syncer.baseDir))

  expect(logger.warn).toHaveBeenCalledTimes(1)
  expect(logger.warn.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "Describing query failed: AssertionError [ERR_ASSERTION]: Error running psql query.
    Query: \\"this is a nonsense query which will cause an error \\\\\\\\gdesc\\"
    Result: \\"psql:<stdin>:1: ERROR:  syntax error at or near \\\\\\"this\\\\\\"\\\\nLINE 1: this is a nonsense query which will cause an error \\\\n        ^\\"
    Error: Empty output received",
    ]
  `)

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    index.ts: |-
      import {sql} from 'slonik'
      
      export default [
        sql<queries.TestTable>\`select id from options_test.test_table\`, // this should get a valid type
        sql\`this is a nonsense query which will cause an error\`,
      ]
      
      export module queries {
        /** - query: \`select id from options_test.test_table\` */
        export interface TestTable {
          /** column: \`options_test.test_table.id\`, not null: \`true\`, regtype: \`integer\` */
          id: number
        }
      }
      "
  `)
})

test('custom glob pattern', async () => {
  const syncer = fsSyncer.jest.jestFixture({
    'excluded.ts': `
      import {sql} from 'slonik'

      export default sql\`select 0 as a\`
    `,
    'included1.ts': `
      import {sql} from 'slonik'

      export default sql\`select 1 as a\`
    `,
    'included2.ts': `
      import {sql} from 'slonik'

      export default sql\`select 2 as a\`
    `,
  })

  syncer.sync()

  await typegen.generate({
    ...gdescParams(syncer.baseDir),
    glob: 'included*.ts',
  })

  expect(syncer.yaml()).toMatchInlineSnapshot(`
    "---
    excluded.ts: |-
      import {sql} from 'slonik'
      
      export default sql\`select 0 as a\`
      
    included1.ts: |-
      import {sql} from 'slonik'
      
      export default sql<queries.A>\`select 1 as a\`
      
      export module queries {
        /** - query: \`select 1 as a\` */
        export interface A {
          /** regtype: \`integer\` */
          a: number | null
        }
      }
      
    included2.ts: |-
      import {sql} from 'slonik'
      
      export default sql<queries.A>\`select 2 as a\`
      
      export module queries {
        /** - query: \`select 2 as a\` */
        export interface A {
          /** regtype: \`integer\` */
          a: number | null
        }
      }
      "
  `)
})