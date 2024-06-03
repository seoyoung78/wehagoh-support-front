/**
 * 진단검사 유틸
 * @author khgkjg12 강현구A, 2023-12-22
 */

import { useEffect, useRef, useState } from "react";
import callApi from "services/apis";

/**
 * number로 엄격하게 변환하는 함수
 * @author khgkjg12 강현구A, 2023-12-22
 * @param {number | string} valu 변환하려는 값.
 * @returns {number | undefined} 변환된 값. 변환 불가 값일 시 undefined를 반환. undefined, null은 null반환.
 */
export function parseNumberStrict(valu = null) {
  if (!valu || valu.length < 1) return null;
  const parsedValu = Number(valu);
  if (Number.isNaN(parsedValu)) return;
  if (parsedValu === 0 && valu !== "0") return; //0처리되는 특수문자 거르기.
  return parsedValu;
}

/**
 * 판정값 계산 함수
 * @author khgkjg12 강현구A, 2023-12-22
 * @param {any} valu
 * @param {any} low
 * @param {any} high
 * @param {any} lowType
 * @param {any} highType
 * @returns { 'H' | 'L' | undefined } 참고치 상한값 이상일 때 'H', 참고치 하한값 이하일 때 'L'. 아무것도 아닐 때 undefind.
 */
export function calculateComp(valu, low, high, lowType, highType) {
  const parsedValu = parseNumberStrict(valu);
  if (parsedValu == null) return;
  //하한치 검사.
  const parsedLow = parseNumberStrict(low);
  if (parsedLow != null) {
    if (lowType === "O") {
      if (parsedValu <= parsedLow) return "L";
    } else {
      if (parsedValu < parsedLow) return "L";
    }
  }
  //상한치 검사.
  const parsedHigh = parseNumberStrict(high);
  if (parsedHigh != null) {
    if (highType === "U") {
      if (parsedValu >= parsedHigh) return "H";
    } else {
      if (parsedValu > parsedHigh) return "H";
    }
  }
}

/**
 * ManagedPromise에서 사용.
 * @author khgkjg12 강현구A
 * @since 2024-01-16
 */
class Sender {
  constructor(releaser) {
    this.releaser = releaser;
    this.releas = false;
    this.s = "end";
  }

  async release(...params) {
    try {
      const r = params ? await this.releaser(...params) : await this.releaser();
      if (this.releas) {
        this.s = "prog";
        return null;
      }
      this.s = "false";
      this.result = r;
    } catch (e) {
      this.s = "true";
      this.result = e;
    }
  }

  run() {
    this.releas = true;
  }
}

/**
 * @author khgkjg12 강현구A
 * @since 2024-01-11
 */
class ManagedPromise {
  constructor(setState, setResult) {
    this.setState = setState;
    this.setResult = setResult;
    this.msg = null;
    this.p = null;
  }

  attach(p) {
    this.p = p;
  }

  abortUndo() {
    if (this.msg && (this.msg.s === "halt" || this.msg.s === "end")) {
      this.msg.run();
    }
  }

  async release(...params) {
    this.abortUndo();
    const msg = new Sender(this.p);
    this.msg = msg;
    this.setState({ s: "halt", data: null });
    params ? await msg.release(...params) : await msg.release();
    if (msg.s === "false") {
      this.setState({
        s: "false",
        data: msg.result,
      });
    } else if (msg.s === "true") {
      this.setState({
        s: "true",
        data: msg.result,
      });
    }
  }
}

/**
 * ManagedPromise 생성 훅.
 */
export const useManagedPromise = (p, onFulFilled = null, onRejected = null, label = null) => {
  const [state, setState] = useState({
    s: "end",
    data: null,
  });
  const managedPromise = useRef(new ManagedPromise(setState));

  managedPromise.current.attach(p);
  useEffect(() => {
    switch (state.s) {
      case "false":
        onFulFilled && onFulFilled(state.data, label);
        break;
      case "true":
        onRejected && onRejected(state.data, label);
        break;
      default:
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(
    () => () => {
      managedPromise.current.abortUndo();
    },
    [],
  );
  return [
    (...param) => {
      if (param) managedPromise.current.release(...param);
      else managedPromise.current.release();
    },
  ];
};

/**
 * any를 string으로 변경. null & undefined은 ''으로
 * @author khgkjg12 강현구A
 * @param {any} 변환할 아무값.
 * @since 2024-01-19
 * @return {string}
 */
export const convertString = (value = null) => {
  if (!value) return "";
  return value.toString();
};

/**
 * 단문, 장문을 하나의 텍스트로 반환.
 *
 * 장문, 단문 둘다 없을경우 : ""
 *
 * 단문만 있을경우 : "[단문결과]"
 *
 * 장문이 있을경우 :
 * "[장문결과]
 *
 * [단문결과]"
 *
 * @param {any} short 단문결과 null 가능.
 * @param {any} long 장문결과 null 가능.
 * @return {string}
 */
export const getConcatRslt = (short = null, long = null) =>
  convertString(long).replaceAll("\\r\\n", "\n").replaceAll("\\n", "\n") +
  convertString(long && short && "\n\n") +
  convertString(short);

/**
 * 비동기 함수 목록을 cascade로 실행.
 * @since 2024-01-29
 * @author 강현구A
 * @param {((prevResult: any, idx:number)=>Promise)[]} runnableList
 * @param {(value: any, idx:number) => any } onFulFilled 비동기의 성공 결과를 처리. throw시 다음 비동기들이 스킵되고 예외로직 실행.
 * @param {(reason: any, idx:number) => PromiseLike<never>} onRejected 각 비동기의 실패 결과를 처리. throw시 다음 비동기 스킵되고 예외로직 실행.
 */
export const runCascade = (
  runnableList,
  onFulFilled = prevResult => prevResult,
  onRejected = e => {
    throw new Error(e);
  },
) =>
  runnableList.reduce(
    (acc, runnable, idx) =>
      acc
        .then(prevResult => runnable(prevResult, idx))
        .then(
          value => onFulFilled(value, idx),
          reason => onRejected(reason, idx),
        ),
    Promise.resolve(),
  );

/**
 * 검사처방 정보에서 검체 식별자를 생성.
 * 접수번호+검사실 부서일련이 동일한 환경에서는 해당 컬럼값 없이 호출 가능.
 * @author 강현구A
 * @param {{
 * spcm_cd: string;
 * rcpn_no: string | null | undefined;
 * hope_exrm_dept_sqno: number|string;
 * exmn_hope_date: string | null | undefined;
 * entd_exmn_yn: string;
 * }}
 * @return {string}
 */
export const getTempSpcmKey = item =>
  JSON.stringify({
    spcm_cd: item.spcm_cd,
    rcpn_no: item.rcpn_no,
    hope_exrm_dept_sqno: parseNumberStrict(item.hope_exrm_dept_sqno),
    exmn_hope_date: item.exmn_hope_date,
  });

/**
 * 검사처방에서 임시 검체 목록을 추출.
 * 접수번호+검사실 부서일련이 동일한 환경에서는 해당 컬럼값 없이 호출 가능.
 * @author 강현구A
 * @param {{
 * pid:string;
 * prsc_date:string;
 * prsc_sqno:string;
 * rcpn_no:string | null | undefined;
 * hope_exrm_dept_sqno:number| string | null | undefined;
 * exmn_hope_date:string;
 * entd_exmn_yn:string;}[]} list
 * @returns {{[key:string]:{
 * pid:string;
 * prsc_date:string;
 * prsc_sqno:string;
 * rcpn_no:string;
 * hope_exrm_dept_sqno:number;
 * exmn_hope_date:string;
 * entd_exmn_yn:string;}[]}}
 */
export const getTempSpcmList = list => {
  const spcmMap = {};
  for (const item of list) {
    const nextKey = getTempSpcmKey(item);
    if (!Object.keys(spcmMap).find(key => key === nextKey)) {
      spcmMap[nextKey] = [];
    }
    spcmMap[nextKey].push(item);
  }
  return spcmMap;
};

/**
 * obj를 shallow copy하는데 null/undefined는 null을 반환.
 * @author 강현구A
 * @param {{}} obj
 */
export const sCopyObj = (obj = null) => obj && { ...obj };

/**
 * obj를 shallow copy하는데 null/undefined는 null을 반환.
 * @author 강현구A
 * @param {{}} obj
 */
export const sCopyArr = (obj = null) => obj && { ...obj };

/**
 * 두 검사접수가 MST 항목이 같은지 여부를 반환. 어느 한쪽이 null|undefined라면  무조건 false
 * @param {{
 * rcpn_no:string;
 * exmn_hope_date: string;
 * hope_exrm_dept_sqno:number|string;
 * }} exmnRcpn1
 * @param exmnRcpn2
 * @param {boolean} useCndt 비교에 cndt_dy를 샤용하는지 여부를 반환.
 * @returns {boolean} 어느 한쪽이 null|undefined이거나, hope_exrm_dept_sqno 가 number혹은 숫자형의 텍스트가 아닐때 무조건 false
 * @author 강현구A
 */
export const compareExmnRcpn = (exmnRcpn1 = null, exmnRcpn2 = null, useCndt = false) => {
  const deptSqno1 = parseNumberStrict(exmnRcpn1?.hope_exrm_dept_sqno);
  const deptSqno2 = parseNumberStrict(exmnRcpn2?.hope_exrm_dept_sqno);
  let date1 = exmnRcpn1?.exmn_hope_date;
  let date2 = exmnRcpn2?.exmn_hope_date;
  if (useCndt) {
    date1 = exmnRcpn1?.cndt_dy;
    date2 = exmnRcpn2?.cndt_dy;
  }
  if (
    deptSqno1 == null ||
    deptSqno2 == null ||
    exmnRcpn1?.rcpn_no == null ||
    exmnRcpn2?.rcpn_no == null ||
    date1 == null ||
    date2 == null
  )
    return false;
  return exmnRcpn1.rcpn_no === exmnRcpn2.rcpn_no && deptSqno1 === deptSqno2 && date1 === date2;
};

/**
 * 검사 보고/보고취소/CVR 알람을 발송.
 * @author 강현구A
 * @param {"Report" | "ReportCancel" |"CVR"} type
 * @param {{
 * spcm_no:string;
 * exmn_cd:string;
 * }[]} rsltList 빈 리스트는 무시.
 * @return 정상 수행 여부.
 */
export const notifyAsync = async (type, rsltList) => {
  if (rsltList.length < 1) return false;
  try {
    const { resultCode, resultData } = await callApi("/MSC_020300/rtrvCvrNotiDetailList", { mslcMapList: rsltList });
    if (resultCode !== 200 || resultData.length < 1) return false;
    const param = {
      exrmClsfCd: "L",
      date: resultData[0].exmn_date,
      pt_nm: resultData[0].pt_nm,
    };
    if (type === "CVR") {
      const detailsList = [];
      for (const each of resultData) {
        detailsList.push({
          prsc_nm: each.prsc_nm,
          mdcr_dr_id: each.mdcr_dr_usr_sqno,
          result: each.exmn_rslt_valu,
          result_date: each.rslt_rgst_dt,
          prsc_dr_sqno: each.prsc_dr_usr_sqno,
          range: getRfvlFullTxt(
            each.cvr_lwlm_valu,
            each.cvr_lwlm_rang_type_cd,
            each.cvr_uplm_valu,
            each.cvr_uplm_rang_type_cd,
            each.exmn_rslt_unit_nm,
            "bracket",
          ),
        });
      }
      if (
        (
          await callApi("/exam/sendCvrRequestNoti", {
            ...param,
            detailsList,
          })
        ).resultCode !== 200
      )
        return false;
    } else {
      const detailsList = [];
      for (const each of resultData) {
        detailsList.push({
          prsc_cd: each.prsc_cd,
          prsc_nm: each.prsc_nm,
          date: each.exmn_date,
          pt_nm: each.pt_nm,
          mdcr_dr_id: each.mdcr_dr_usr_sqno,
          prsc_dr_sqno: each.prsc_dr_usr_sqno,
        });
      }
      if (
        (
          await callApi("/exam/sendNotiList", {
            type,
            ...param,
            detailsList,
          })
        ).resultCode !== 200
      )
        return false;
    }
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * 수치형 결과에 대해 유효숫자 여부에 따라 패딩을 붙여줌.
 *
 * 유효숫자 범위에 안들어오는 파라미터가 입력될 일은 없음. 앞선 단계의 validation에서 걸림.
 * 즉, 호출전 validation 필수.
 * @author 강현구A
 * @param {number} dcpr_nodg 소숫점 유효숫자.
 * @param {number} nodg 전체 자릿수 유효숫자.
 * @param {string} val 수치형 결과 원본값. Not null. {@link convertString}
 * @return { string }
 */
export const padValue = (dcpr_nodg, nodg, val) => {
  let result = val;
  if (val.length > 0) {
    //일단 -가 끝이거나 .까지 아무것도 없으면 0 넣기.
    const minusIdx = val.indexOf("-");
    const dotIdx = val.indexOf(".");
    if (minusIdx === val.length - 1 || minusIdx + 1 === dotIdx) {
      //minusIdx 가 -1이면서 두번째 조건이 참인경우는 앞에 아무것도 없는경우.
      result = (minusIdx > -1 ? "-0" : "0") + val.slice(minusIdx + 1, val.length);
    }
    //수치 결과에 한해서 . 뒤에 0 붙여서 계산하기.
    if (dcpr_nodg > 0) {
      //소숫점 유효숫자가 0보다 큰 경우 패딩 붙여주기.
      const dotIdx = val.indexOf(".");
      if (dotIdx < 0) {
        result += ".";
        for (let i = 0; i < dcpr_nodg; i++) {
          result += "0";
        }
      } else {
        for (let i = val.length - 1 - dotIdx; i < dcpr_nodg; i++) {
          result += "0";
        }
      }
    }
    //전체 기준 유효숫자 패딩
    if (nodg > 0) {
      let vCnt = 0;
      for (let i = 0; i < result.length; i++) {
        const ch = result.charAt(i);
        if (ch !== "-" && ch !== ".") vCnt++;
      }
      let idx = result.length - 1;
      while (vCnt > nodg) {
        const ch = result.charAt(idx);
        if (ch !== "-" && ch !== ".") {
          result = result.slice(0, idx);
          vCnt--;
        } else {
          result = result.slice(0, idx);
        }
        idx--;
      }
      //오히려 유효숫자가 부족한경우 패딩.
      if (vCnt < nodg) {
        if (!result.includes(".")) result += ".";
        while (vCnt < nodg) {
          result += "0";
          vCnt++;
        }
      }
    }
    //모든 수치에 대해 .이 남게되면 제거
    if (result.charAt(result.length - 1) === ".") result = result.slice(0, result.length - 1);
  }

  //0과 같은 값은 전부 0으로 통일.
  if (new RegExp("^-?0(\\.0+)?$").test(result)) {
    result = "0";
  }
  return result;
};

/**
 * 입력된 결과값의 유효숫자를 검사.
 *
 * @param {String} value not null 결과값.
 * @param {number} inprNodg 정수부 자릿수.
 * @param {number} dcprNodg 소수부 자릿수.
 * @param {number} nodg 전체 자릿수.
 * @returns {boolean} 요효성 여부.
 */
export const validateValue = (value, inprNodg, dcprNodg, nodg) => {
  let intRegex;
  if (inprNodg === 0) {
    intRegex = "0?";
  } else if (inprNodg > -1) {
    intRegex = `(([1-9][0-9]{0,${inprNodg - 1}})|([0-9]))?`;
  } else {
    intRegex = "(([1-9][0-9]*)|([0-9]))?";
  }
  let dcRegex;
  if (dcRegex === 0) {
    dcRegex = "";
  } else if (dcprNodg > -1) {
    dcRegex = `(\\.[0-9]{0,${dcprNodg}})?`;
  } else {
    dcRegex = "(\\.[0-9]*)?";
  }
  let success = new RegExp(`^-?${intRegex}${dcRegex}$`).test(value);
  if (nodg > -1 && value.match(/[0-9]/g)?.length > nodg) {
    success = false;
  }
  return success;
};

/**
 * 입력받은 문자열 중 가장 낮은 값을 구함.
 * @author 강현구A
 * @param {string[]} param 길이 0 이상인 문자열 리스트만 입력.
 */
export const getMinStr = param => {
  let min = param[0];
  param.forEach(p => {
    if (p < min) {
      min = p;
    }
  });
  return min;
};

/**
 * @author 강현구A
 * @since 2024-04-12
 * 참고치와 참고치 범위 유형 코드를 인자로 받아 참고치 텍스트를 반환.
 * @param {*} rfvl_valu 참고치.
 * @param {*} rang_type_cd 참고치 범위 유형 코드.
 * @returns {string} notnull 이다.
 */
export const getRfvlTxt = (rfvl_valu, rang_type_cd) => {
  if (parseNumberStrict(rfvl_valu) == null) return "";
  switch (rang_type_cd) {
    case "M":
      return rfvl_valu + " 이상";
    case "O":
      return rfvl_valu + " 초과";
    case "B":
      return rfvl_valu + " 이하";
    case "U":
      return rfvl_valu + " 미만";
  }
};

/**
 * 참고치, 단위를 사용해 텍스트를 생성하는 함수.
 * 참고치 대신 CVR값도 사용가능함.
 * @param {*} rfvl_lwlm_valu
 * @param {*} rfvl_lwlm_rang_type_cd
 * @param {*} rfvl_uplm_valu
 * @param {*} rfvl_uplm_rang_type_cd
 * @param {*} rslt_unit_dvsn
 * @param {"slash"|"bracket"} type 기본값 및 미 일치 값 slash
 * @returns
 */
export const getRfvlFullTxt = (
  rfvl_lwlm_valu,
  rfvl_lwlm_rang_type_cd,
  rfvl_uplm_valu,
  rfvl_uplm_rang_type_cd,
  exmn_rslt_unit_nm,
  type = "slash",
) => {
  let lwlm = getRfvlTxt(rfvl_lwlm_valu, rfvl_lwlm_rang_type_cd);
  const uplm = getRfvlTxt(rfvl_uplm_valu, rfvl_uplm_rang_type_cd);
  if (lwlm !== "" && uplm !== "") lwlm += " ";
  lwlm += uplm;
  const unit = convertString(exmn_rslt_unit_nm);
  if (unit !== "") {
    if (type === "bracket") {
      lwlm += "(" + unit + ")";
    } else {
      if (lwlm !== "") lwlm += " / ";
      lwlm += unit;
    }
  }
  return lwlm;
};

/**
 * 인자로 넘겨받은 행들의 결과 값을 검사해서 CVR범위를 벗어나는 행들의 목록을 반환.
 * @author 강현구A
 * @param {*} rows
 * @returns {{
 *  cvrList : [];
 *  others : [];
 * }} cvrList 는 넘어가는 항목들, others 는 정상 항목들을 나타낸다.
 */
export const chckCVR = rows => {
  // CVR검사
  const cvrList = [];
  const others = [];
  for (const each of rows) {
    // 비 수치 걸러내기.
    const valu = parseNumberStrict(each.exmn_rslt_valu);
    if (valu != null) {
      // 하한 미만(이하)걸러내기
      const cvr_lwlm_valu = parseNumberStrict(each.cvr_lwlm_valu);
      if (
        cvr_lwlm_valu != null &&
        (valu < cvr_lwlm_valu || ("O" === each.cvr_lwlm_rang_type_cd && valu === cvr_lwlm_valu))
      ) {
        cvrList.push({
          spcm_no: each.spcm_no,
          exmn_cd: each.exmn_cd,
        });
        continue;
      }
      // 상한 초과(이상) 걸러내기
      const cvr_uplm_valu = parseNumberStrict(each.cvr_uplm_valu);
      if (
        cvr_uplm_valu != null &&
        (cvr_uplm_valu < valu || ("U" === each.cvr_uplm_rang_type_cd && valu === cvr_uplm_valu))
      ) {
        cvrList.push({
          spcm_no: each.spcm_no,
          exmn_cd: each.exmn_cd,
        });
        continue;
      }
    }
    others.push({
      spcm_no: each.spcm_no,
      exmn_cd: each.exmn_cd,
    });
  }
  return { cvrList, others };
};
