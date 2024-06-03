import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import callApi from "services/apis";
import { getLocalStorageItem } from "services/utils/localStorage";
import moment from "moment";
import { globals } from "global";

// common-ui-components
import { LUXButton } from "luna-rocket";

// css
import "assets/style/print.scss";

// imgs

/**
 * @name 물리치료 내원 환자 목록 출력지
 * @author 윤서영
 */
export default function CSMSP011() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { search } = useLocation();

  const [state, setState] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
    hspt_logo: null,
  });

  const [data, setData] = useState([]);
  const [date, setDate] = useState({ from: "", to: "" });

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 페이지 수 계산
  const [no, resultTable] = useMemo(() => {
    const count = 20;
    let tempNo = 1;
    let tempTable = [];
    if (data.length > count) {
      tempNo = Math.floor(data.length / count);
      for (let i = 0; i < tempNo; i++) {
        tempTable.push(data.slice(count * i, count * (i + 1)));
      }
    } else {
      return [tempNo, [data]];
    }
    return [tempNo, tempTable];
  }, [data]);

  // 취소
  const handleClose = () => {
    window.close();
  };

  // 인쇄
  const handlePrint = () => {
    // 프린트 화면으로 전환
    window.print();
    window.close();
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  // 병원정보가져오기
  useEffect(() => {
    (async () => {
      await callApi("/common/selectHspInfo").then(({ resultData }) => {
        setState(prev => ({ ...prev, ...resultData }));
      });
    })();
  }, []);

  useEffect(() => {
    // 로컬스토리지 사용
    if (search) {
      const queryParams = new URLSearchParams(search);
      const data = getLocalStorageItem(queryParams.get("key"));
      setData(data.list);
      setDate(data.date);
    }
  }, [search]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="CSMSP011 dp_full print">
      <div id="printArea">
        {data &&
          data.length > 0 &&
          resultTable.map((table, index) => (
            <div className="print_box">
              <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
              <div className="print_header">
                <div className="print_header_title">
                  <h1>물리치료 내원 환자 목록</h1>
                  <p>{state.hspt_nm}</p>
                </div>
                {state.hspt_logo_lctn && state.hspt_logo_lctn !== "" && (
                  <div className="print_header_logo">
                    <img src={globals.wehagoh_url + state.hspt_logo_lctn} alt="" />
                  </div>
                )}
              </div>
              <div className="print_wrap full_size">
                <div className="print_title">
                  <h3>
                    • 조회기간 : {moment(date.from).format("YYYY-MM-DD")} ~ {moment(date.to).format("YYYY-MM-DD")}
                  </h3>
                </div>
                <div className="print_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col />
                        <col />
                        <col />
                        <col />
                        <col width="300px" />
                      </colgroup>
                      <thead>
                        <tr>
                          <th className="nfont celcnt">치료일자</th>
                          <th className="nfont celcnt">환자번호</th>
                          <th className="nfont celcnt">이름</th>
                          <th className="nfont celcnt">시행자</th>
                          <th className="nfont celcnt">처방내역</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map(list => (
                          <tr key={list.pid + list.mdtr_hope_date + list.prsc_nm + list.rcps_nm}>
                            <td className="cellft">
                              <div className="inbx">{list.mdtr_hope_date}</div>
                            </td>
                            <td className="cellft">
                              <div className="inbx">{list.pid}</div>
                            </td>
                            <td className="cellft">
                              <div className="inbx">{list.pt_nm}</div>
                            </td>
                            <td className="cellft">
                              <div className="inbx">{list.rcps_nm}</div>
                            </td>
                            <td className="cellft">
                              <div className="inbx">{list.prsc_nm}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="print_wrap">
                <div className="print_paging">
                  {index + 1}/{no}
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="print_footer">
        <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
        <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
      </div>
    </div>
  );
}
