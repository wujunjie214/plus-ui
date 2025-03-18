
export interface RoleVO extends BaseEntity {
  roleId: string | number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  delFlag: string;
  menuCheckStrictly: boolean;
  remark?: any;
  flag: boolean;
  menuIds?: Array<string | number>;
  admin: boolean;
}

export interface RoleQuery extends PageQuery {
  roleName: string;
  roleKey: string;
  status: string;
}

export interface RoleForm {
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  menuCheckStrictly: boolean;
  remark: string;
  roleId: string | undefined;
  menuIds: Array<string | number>;
}
