/* eslint-disable */
// tslint:disable
// this file is generated by a tool; don't change it manually.

export interface CountInfo_QueryTypeMap {
  ["select count(*) as a_count, a as a_value\n      from foo\n      group by a"]: {
    /** int8 (oid: 20) */
    a_count: number
    /** text (oid: 25) */
    a_value: string
  }
}

export type CountInfo_UnionType = CountInfo_QueryTypeMap[keyof CountInfo_QueryTypeMap]

export type CountInfo = {
  [K in keyof CountInfo_UnionType]: CountInfo_UnionType[K]
}

export const CountInfo_meta_v0 = [{"properties":[{"name":"a_count","value":"number","description":"int8 (oid: 20)"},{"name":"a_value","value":"string","description":"text (oid: 25)"}],"description":"select count(*) as a_count, a as a_value\n      from foo\n      group by a"}]
