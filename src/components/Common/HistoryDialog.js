import React, { useEffect, useRef, useState } from "react";

// util
import withPortal from "hoc/withPortal";
import PropTypes from "prop-types";
import { GridView, LocalDataProvider } from "realgrid";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import Message from "components/Common/Message";
import moment from "moment";
import callApi from "services/apis";
import { date } from "common-util/utils";
import getBadgeSvg from "services/utils/getBadgeSvg";
import { downloadApi } from "services/apis/formApi";
import { basicKeys, resultKeys } from "pages/MSC_050000/utils/MSC_050000_NameCodesMapping";
import { findEndoElementAndGetInfo } from "pages/MSC_050000/utils/MSC_050000_Utils";

// common-ui-components
import { LUXButton, LUXDialog, LUXTooltip } from "luna-rocket";

// css

// imgs
import ImgEmptyData from "assets/imgs/img_empty_data_s@3x.png";
import { convertString, getConcatRslt } from "pages/MSC_020000/utils/MSC_020000Utils";

/**
 * @name 이력관리 팝업
 * @author 윤서영
 */
export default function HistoryDialog({ open, prscClsfCd, onClose, exmnInfo, tabId, isGI }) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [info, setInfo] = useState({
    mdcr_date: "",
    cndt_dt: "",
    pid: "",
    pt_nm: "",
    dobr: "",
    age_cd: "",
    prsc_nm: "",
  });

  // 결과기록 내용
  const [resultTxt, setResultTxt] = useState("");

  // 검사결과 이미지
  const [resultImg, setResultImg] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // 내시경 타이틀
  const isEndo = prscClsfCd === "E";

  const isOpnn = prscClsfCd === "F" || prscClsfCd === "R";

  const endoTitle = isEndo ? (tabId === "basic" ? "기초정보" : "결과기록") : isOpnn ? "판독소견" : "";

  const title = () => {
    switch (prscClsfCd) {
      case "L":
        return "진단검사";
      case "F":
        return "기능검사";
      case "R":
        return "영상검사";
      case "E":
        return `내시경검사 ${endoTitle}`;
      case "P":
        return "물리치료";
      default:
        break;
    }
  };

  const grid = useRef();
  const dataProvider = useRef(null);
  const gridView = useRef(null);

  const isInitializedFile = useRef(false);

  const endoList = useRef([]); // 내시경 리스트(기초정보 or 결과기록)
  const obsrOpnnList = useRef([]); // 내시경 관찰 소견 리스트

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleLoad = async () => {
    const param = {
      clsfList: ["CS2001"],
      date: date.getyyyymmdd(new Date()),
    };
    await callApi("/common/selectCommonCode", param).then(({ resultData }) => {
      let column = {};
      try {
        column = gridView.current.columnByName("hstr_stat_cd");
      } catch (error) {
        // console.error(error);
      }

      gridView.current.setColumn({
        ...column,
        values: resultData.map(item => item.cmcd_cd),
        labels: resultData.map(item => item.cmcd_nm),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            if (dataCell.value) {
              for (const hstrState of resultData) {
                if (dataCell.value === hstrState.cmcd_cd) {
                  return getBadgeSvg(hstrState.cmcd_nm, hstrState.cmcd_char_valu1, "#ffffff", 40);
                }
              }
            }
          },
        },
      });
    });
  };

  // 이미지 다운로드
  const handleDownload = list => {
    if (list.length > 0) {
      setIsDownloading(true);
      Promise.all(
        list.map(async item => {
          try {
            if (item) {
              return await downloadApi(item).then(res => res);
            }
          } catch (e) {}
        }),
      )
        .then(resultData => {
          if (isInitializedFile.current) {
            isInitializedFile.current = false;
            setResultImg([]);
          } else {
            setResultImg(resultData);
          }
        })
        .catch(e => {
          console.error(e);
          setResultImg([]);
        })
        .finally(() => setIsDownloading(false));
    } else {
      setResultImg([]);
    }
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const container = grid.current;
    const dataSource = new LocalDataProvider(true);
    const gv = new GridView(container);

    gv.setDataSource(dataSource);

    const dataFields = [
      { fieldName: "hstr_stat_cd", dataType: "text" },
      { fieldName: "last_updt_dt", dataType: "datetime" },
      { fieldName: "last_updt_usid", dataType: "text" },
      { fieldName: "sign_yn", dataType: "text" },
      { fieldName: "resultTxt", dataType: "text" },
      { fieldName: "resultImg", dataType: "text" },
    ];

    // 내시경 일 경우 데이터 필드 추가
    if (isEndo) {
      const fieldsToAdd = [
        { fieldName: basicKeys.endsRcrdSqno, dataType: "text" },
        { fieldName: basicKeys.endsFndtInfoSqno, dataType: "text" },
        { fieldName: resultKeys.endsRsltRcrdSqno, dataType: "text" },
      ];

      dataFields.push(...fieldsToAdd);
    }

    const columns = [
      {
        name: "hstr_stat_cd",
        fieldName: "hstr_stat_cd",
        width: 30,
        header: "상태",
        lookupDisplay: true,
        renderer: {
          type: "shape",
          shape: "ellipse",
          shapeHeight: 10,
          shapeWidth: 10,
        },
      },
      {
        name: "last_updt_dt",
        fieldName: "last_updt_dt",
        width: 80,
        header: "작성일시",
        renderer: { showTooltip: true },
        datetimeFormat: "yyyy-MM-dd HH:mm:ss",
      },
      {
        name: "last_updt_usid",
        fieldName: "last_updt_usid",
        width: 60,
        header: "작성자",
        renderer: { showTooltip: true },
      },
      { name: "sign_yn", fieldName: "sign_yn", width: 40, header: "전자서명여부" },
    ];

    dataSource.setFields(dataFields);
    gv.setColumns(columns);

    gv.setDisplayOptions({
      fitStyle: "even", // 그리드 가로 영역 채우기
      selectionStyle: "rows",
    });

    gv.setRowIndicator({ displayValue: "reverse" });

    gv.footer.visible = false;
    gv.checkBar.visible = false;
    gv.stateBar.visible = false;
    gv.editOptions.editable = false;

    configEmptySet(gv, container, Message.noData);
    dataSource.setRows([]);

    dataProvider.current = dataSource;
    gridView.current = gv;

    handleLoad();

    return () => {
      dataSource.clearRows();
      gv.destroy();
      dataSource.destroy();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setInfo(exmnInfo);
      // 각 검사별 API 적용
      (async () => {
        const parameters = {
          ...exmnInfo,
        };
        try {
          switch (prscClsfCd) {
            case "L":
              return await callApi("/MSC_020300/rtrvExmnRsltHstrList", {
                mslcMap: {
                  spcm_no: parameters.spcm_no,
                  exmn_cd: parameters.exmn_cd,
                },
              }).then(({ resultCode, resultData }) => {
                if (resultCode !== 200) return [];
                return resultData.map(row => {
                  let resultTxt = "[결과]";
                  if (row.txt_rslt_valu)
                    resultTxt += "\n\n" + getConcatRslt(row.exmn_rslt_valu, row.txt_rslt_valu) + "\n";
                  else resultTxt += " " + getConcatRslt(row.exmn_rslt_valu);
                  resultTxt += "\n[하한값] " + (row.rfvl_lwlm_valu ? row.rfvl_lwlm_valu : "");
                  resultTxt += "\n[상한값] " + (row.rfvl_uplm_valu ? row.rfvl_uplm_valu : "");
                  resultTxt += "\n[단위] " + (row.rslt_unit_dvsn ? row.rslt_unit_dvsn : "");
                  return {
                    hstr_stat_cd: row.hstr_stat_cd,
                    last_updt_dt: row.rslt_rgst_dt,
                    last_updt_usid:
                      row.rslt_rgst_usid && convertString(row.rslt_rgst_user_nm) + "(" + row.rslt_rgst_usid + ")",
                    sign_yn: row.dgsg_yn,
                    resultTxt,
                  };
                });
              });
            case "F":
              return await callApi("/MSC_030000/selectHistory", parameters).then(({ resultCode, resultData }) => {
                if (resultCode === 200) {
                  return resultData;
                }
                return [];
              });
            case "R":
              return await callApi("/MSC_040000/selectHistory", parameters).then(({ resultCode, resultData }) => {
                if (resultCode === 200) {
                  return resultData;
                }
                return [];
              });
            case "E":
              parameters.tabId = tabId;
              return await callApi("/MSC_050000/selectHistory", parameters).then(({ resultCode, resultData }) => {
                if (resultCode === 200) {
                  endoList.current = resultData.historyList;
                  obsrOpnnList.current = resultData?.obsrOpnnList || [];
                  return resultData.historyList;
                }
                return [];
              });
            case "P":
              return await callApi("/MSC_060000/selectHistory", parameters).then(({ resultCode, resultData }) => {
                if (resultCode === 200) {
                  return resultData;
                }
                return [];
              });
            default:
              return [];
          }
        } catch (e) {
          console.error(e);
          return [];
        }
      })().then(res => {
        if (res?.length > 0) {
          dataProvider.current.setRows(res);
          gridView.current.setCurrent({ itemIndex: 0 });
        } else {
          dataProvider.current.clearRows();
          setResultTxt("");
          setResultImg([]);
        }
      });
    }
  }, [open, tabId]);

  useEffect(() => {
    gridView.current.onCurrentRowChanged = (grid, oldRow, newRow) => {
      if (newRow !== -1) {
        const values = grid.getValues(newRow);
        if (values.hstr_stat_cd === "3") {
          setResultTxt("");
          setResultImg([]);
        } else if (isEndo && tabId) {
          const resultInfo = findEndoElementAndGetInfo(values, tabId, isGI, endoList.current, obsrOpnnList.current);
          setResultTxt(resultInfo);
        } else {
          setResultTxt(values.resultTxt);

          // 기능검사 이미지
          if (isDownloading) {
            isInitializedFile.current = true;
          }

          // prscClsfCd === "F" && values.resultImg ? handleDownload(values.resultImg.split("|")) : setResultImg([]);
        }
      }
    };
  }, [isDownloading, tabId, isGI, isEndo, prscClsfCd]);

  // useEffect(() => {
  //   if (resultImg.length > 0) {
  //     return () => {
  //       resultImg.map(img => URL.revokeObjectURL(img));
  //     };
  //   }
  // }, [resultImg]);

  /* ================================================================================== */
  /* render() */
  return withPortal(
    <LUXDialog dialogOpen={open} handleOnEscClose={onClose} onRequestClose handleOnRequestClose={onClose}>
      <div className="dialog_content xg roundstyle MSC_history">
        <div className="dialog_data">
          <div className="dialog_data_tit">
            <h1 className="txtcnt">{title()} 이력관리</h1>
            <button type="button" className="LUX_basic_btn btn_clr" onClick={onClose}>
              <span className="sp_lux">닫기</span>
            </button>
          </div>
          <div className="dialog_data_area noline mgt10 ">
            <div className="dialog_data_section">
              <div className="info_box">
                <dl className="info_status">
                  <dt>기록종류</dt>
                  <dd>
                    {isEndo && tabId === "basic"
                      ? "기초정보기록"
                      : prscClsfCd === "P"
                      ? "물리치료기록"
                      : "검사결과기록"}
                  </dd>
                  <dt>진료일자</dt>
                  <dd>{info.mdcr_date}</dd>
                  <dt>검사일자</dt>
                  <dd>{moment(info.cndt_dt).format("YYYY-MM-DD")}</dd>
                  <dt>환자번호</dt>
                  <dd>{info.pid}</dd>
                  <dt>이름</dt>
                  <dd>{info.pt_nm}</dd>
                  <dt>생년월일</dt>
                  <dd>{info.dobr !== "" && moment(info.dobr).format("YYYY-MM-DD")}</dd>
                  <dt>성별/나이</dt>
                  <dd>{info.age_cd}</dd>
                  <dt>검사명</dt>
                  <LUXTooltip label={info.prsc_nm}>
                    <dd>{info.prsc_nm}</dd>
                  </LUXTooltip>
                </dl>
              </div>
            </div>
            <div className="dialog_data_section">
              <div className="his_box">
                <div className="his_list">
                  <div className="basic_headtitle_wrap">
                    <h3 className="title">{`• ${endoTitle || `결과기록`} 이력`}</h3>
                  </div>
                  <div className="grid_box" ref={grid} />
                </div>
                <div className="his_content">
                  {/* {prscClsfCd === "F" && (
                    <div className="his_img">
                      <div className="basic_headtitle_wrap">
                        <h3 className="title">• 검사 결과</h3>
                      </div>
                      <div className="img_box">
                        {isDownloading ? (
                          <div className="contents_empty">
                            <LUXCircularProgress innerText="Loading" size={150} />
                          </div>
                        ) : resultImg.length ? (
                          resultImg.map(img => <img key={img} src={img} alt="" width="100%" />)
                        ) : (
                          <div className="contents_empty">
                            <div>
                              <img src={ImgEmptyData} alt="" />
                              <span>데이터가 존재하지 않습니다.</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )} */}
                  <div className="his_txt">
                    <div className="basic_headtitle_wrap">
                      <h3 className="title">{`• ${endoTitle || `결과기록`} 내용`}</h3>
                    </div>
                    <div className="txt_box">
                      {!resultTxt || resultTxt === "" ? (
                        <div className="contents_empty">
                          <div>
                            <img src={ImgEmptyData} alt="" />
                            <span>데이터가 존재하지 않습니다.</span>
                          </div>
                        </div>
                      ) : (
                        resultTxt
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="dialog_btnbx">
          <LUXButton type="confirm" label="닫기" onClick={onClose} />
        </div>
      </div>
    </LUXDialog>,
    "dialog",
  );
}
HistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  prscClsfCd: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  exmnInfo: PropTypes.shape({
    mdcr_date: PropTypes.string,
    // cndt_dt: PropTypes.string,
    pid: PropTypes.string,
    pt_nm: PropTypes.string,
    dobr: PropTypes.string,
    age_cd: PropTypes.string,
    prsc_nm: PropTypes.string,
    prsc_cd: PropTypes.string,
    prsc_date: PropTypes.string,
    prsc_sqno: PropTypes.string,
  }).isRequired,
  tabId: PropTypes.string,
  isGI: PropTypes.bool,
};
HistoryDialog.defaultProps = {
  open: false,
  prscClsfCd: "",
  onClose: () => {},
  exmnInfo: {
    mdcr_date: "",
    cndt_dt: "",
    pid: "",
    pt_nm: "",
    dobr: "",
    age_cd: "",
    prsc_nm: "",
    prsc_cd: "",
    prsc_date: "",
    prsc_sqno: "",
  },
  tabId: "",
  isGI: true,
};
