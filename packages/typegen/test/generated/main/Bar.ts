/* eslint-disable */
// tslint:disable
// this file is generated by a tool; don't change it manually.

export type Bar_AllTypes = [
  {
    /** pg_type.typname: direction */
    dir: 'up' | 'down' | 'left' | 'right'
  }
]
export interface Bar_QueryTypeMap {
  [`select * from bar`]: Bar_AllTypes[0]
}

export type Bar_UnionType = Bar_QueryTypeMap[keyof Bar_QueryTypeMap]

export type Bar = {
  [K in keyof Bar_UnionType]: Bar_UnionType[K]
}
export const Bar = {} as Bar

export const Bar_meta_v0 = [{"properties":[{"name":"dir","value":"'up' | 'down' | 'left' | 'right'","description":"pg_type.typname: direction"}],"description":"select * from bar"}]