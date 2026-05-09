export interface FundSearchItem {
  CODE: string;
  NAME: string;
}

export interface FundSearchResponse {
  Datas: FundSearchItem[];
  ErrCode: number;
}

export interface FundValuationRaw {
  FCODE: string;
  SHORTNAME: string;
  PDATE: string;
  NAV: string;
  GSZ: string;
  GSZZL: string;
  NAVCHGRT: string;
  GZTIME: string;
}

export interface FundValuationResponse {
  Datas: FundValuationRaw[];
  ErrCode: number;
}

export interface FundValuation {
  fundcode: string;
  name: string;
  jzrq: string;
  dwjz: number | null;
  gsz: number | null;
  gszzl: number;
  gztime: string;
  hasReplace: boolean;
  num: number;
  cost: number;
  amount: number;
  gains: number;
  costGains: number;
  costGainsRate: number;
}

export interface IndexDiff {
  f2: string;
  f3: number;
  f4: string;
  f12: string;
  f13: number;
  f14: string;
}

export interface IndexResponse {
  data: {
    diff: IndexDiff[];
  };
}

export interface FundInfoRaw {
  FCODE: string;
  SHORTNAME: string;
  FTYPE: string;
  JJGS: string;
  JJJL: string;
  DWJZ: string;
  LJJZ: string;
  FSRQ: string;
  SGZT: string;
  SHZT: string;
  ENDNAV: string;
  SYL_Y: string;
  SYL_3Y: string;
  SYL_6Y: string;
  SYL_1N: string;
  RANKM: string;
  RANKQ: string;
  RANKHY: string;
  RANKY: string;
  FUNDBONUS?: {
    PDATE: string;
    CHGRATIO: string;
  };
}

export interface FundInfoResponse {
  Datas: FundInfoRaw;
}

export interface FundPositionRaw {
  GPDM: string;
  GPJC: string;
  JZBL: string;
}

export interface FundPositionResponse {
  Datas: {
    fundStocks: FundPositionRaw[];
  };
}

export interface HolidayData {
  version: string;
  lastDate: string;
  data: Record<string, Record<string, { holiday: boolean }>>;
}

export interface MarketFlowItem {
  name: string;
  up: number;
  down: number;
}

export interface MarketResponse {
  flows: MarketFlowItem[];
  sectors: MarketFlowItem[];
  north: MarketFlowItem[];
  south: MarketFlowItem[];
}
