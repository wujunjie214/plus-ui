export interface OnlineQuery extends PageQuery {
  ipaddr: string;
  userName: string;
}

export interface OnlineVO extends BaseEntity {
  tokenId: string;
  userName: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  loginTime: number;
}
