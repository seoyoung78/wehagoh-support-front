import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";

// util
import PropTypes from "prop-types";
import { GridFitStyle, GridView, LocalDataProvider, ValueType } from "realgrid";
import getBadgeSvg from "services/utils/getBadgeSvg";
import Message from "components/Common/Message";
import callApi from "services/apis";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import withPortal from "hoc/withPortal";

// common-ui-components
import { LUXButton, LUXDialog, LUXSnackbar } from "luna-rocket";
import PatientComplete from "components/Common/PatientComplete";

//imgs
import icEmrg from "assets/imgs/ic_emergency_small.png";
import { useManagedPromise } from "pages/MSC_020000/utils/MSC_020000Utils";

/**
 * @param prscClsfCd (필수)처방 분류코드
 * @param onAdjust (선택)확인버튼을 누르거나 더블클릭을 눌렀을 때의 콜백. 선택된 항목이 콜백 인자로 반환된다.
 * @param stateList (선택)상태코드-이름-색상 맵 리스트. 기본값 []
 * @param hopeExrmDeptSqnoList (선택)희망 검사실 목록. 기본값 []
 * @param endoYn (선택)내시경 여부, "Y"는 내시경 나머지 내시경 아님.
 * @param uncmplYn (선택)미완료 여부, "Y"는 미완료 나머지 미시행.
 * @param style 커스텀 스타일 적용.
 * @name UnactgUncmplDialog 미시행, 미완료 조회 팝업(다이얼로그)
 * @author 강현구A
 */
const UnactgUncmplDialog = forwardRef(
  ({ hopeExrmDeptSqnoList, prscClsfCd, onAdjust, stateList, uncmplYn, endoYn, style }, ref) => {
    //alias 처리 로직
    const gridViewRef = useRef();
    const realGridElem = useRef();
    const patientCompleteRef = useRef();
    const [snackbar, setSnackbar] = useState({
      open: false,
      type: "info",
      message: "",
    });
    const [patient, setPatient] = useState(null);
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    const [diabled, setDisabled] = useState(true);

    //state, ref end
    //function start
    const handleAdjust = () => {
      const gridView = gridViewRef.current;
      const { itemIndex } = gridView.getCurrent();
      if (itemIndex > -1) {
        setOpen(false);
        onAdjust({
          ...gridView.getValues(itemIndex),
          pt_nm: gridView.getValue(itemIndex, "pt_dscm_nm"),
        });
      }
    };

    const handleCancel = () => {
      setOpen(false);
    };

    const [searchMP] = useManagedPromise(
      async () => {
        const { resultCode, resultData } = await callApi("/common/rtrvUnactgUncmplList", {
          hope_exrm_dept_sqno_list: hopeExrmDeptSqnoList,
          prsc_clsf_cd: prscClsfCd,
          uncmpl_yn: uncmplYn,
          endo_flag: endoYn,
        });
        if (resultCode !== 200) throw new Error(resultCode);
        return resultData;
      },
      resultData => {
        setCount(resultData.length);
        if (open) {
          const gridView = gridViewRef.current;
          gridView.getDataSource().setRows(
            resultData.reduce((acc, elem) => {
              if (!patient || (patient && elem.pid === patient.pid))
                acc.push({
                  ...elem,
                  dobr: elem.dobr ? elem.dobr.slice(0, 4) + "-" + elem.dobr.slice(4, 6) + "-" + elem.dobr.slice(6) : "",
                });
              return acc;
            }, []),
          );
          if (gridView.getItemCount() < 1) {
            setSnackbar({
              open: true,
              message: Message.noSearch,
              type: "info",
            });
            setDisabled(true);
            return;
          }
          gridView.setCurrent({ itemIndex: 0 });
          setDisabled(false);
        }
      },
      () => {
        setSnackbar({
          open: true,
          message: Message.networkFail,
          type: "warning",
        });
      },
    );

    //function end
    //useEffect start
    useEffect(() => {
      const dataProvider = new LocalDataProvider(false);
      const gridView = new GridView(realGridElem.current);
      gridViewRef.current = gridView;
      gridView.setDataSource(dataProvider);
      dataProvider.setFields([
        {
          fieldName: "pid",
          dataType: ValueType.TEXT,
        },
        {
          fieldName: "pt_nm",
          dataType: ValueType.TEXT,
        },
        { fieldName: "nm_dscm_dvcd", dateType: ValueType.TEXT },
        {
          fieldName: "pt_dscm_nm",
          dataType: ValueType.TEXT,
          valueCallback: (ds, rowId, fieldName, fields, values) =>
            values[fields.indexOf("pt_nm")] + (values[fields.indexOf("nm_dscm_dvcd")] || ""),
        },
        { fieldName: "sex_labl", dateType: ValueType.TEXT },
        { fieldName: "age_labl", dateType: ValueType.TEXT },
        { fieldName: "sex_age", dateType: ValueType.TEXT },
        {
          fieldName: "mdcr_date",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "dobr",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "rcpn_dt",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "exmn_hope_dt",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "mdcr_user_nm",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "prsc_prgr_stat_cd",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "prsc_prgr_stat_nm",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "hope_exrm_cd",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "exmn_hope_date",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "rcpn_sqno",
          dateType: ValueType.TEXT,
        },
        {
          fieldName: "prsc_sqno",
          dataType: ValueType.TEXT,
        },
        {
          fieldName: "prsc_date",
          dataType: ValueType.TEXT,
        },
        {
          fieldName: "emrg_pt_yn",
          dateType: ValueType.TEXT,
        },
      ]);
      gridView.setDisplayOptions({
        selectionStyle: "rows",
        fitStyle: GridFitStyle.EVEN,
      });
      gridView.pasteOptions.enabled = false;
      gridView.setCopyOptions({ copyDisplayText: true, singleMode: true });
      configEmptySet(gridView, realGridElem.current, Message.noSearch);
      gridView.footer.visible = false;
      gridView.checkBar.visible = false;
      gridView.stateBar.visible = false;
      return () => {
        dataProvider.destroy();
        gridView.destroy();
      };
    }, []);

    useEffect(() => {
      const gridView = gridViewRef.current;
      gridView.setColumns([
        ...(uncmplYn === "Y"
          ? [
              {
                fieldName: "exmn_hope_date",
                name: "exmn_hope_date",
                header: "검사일자",
                width: 50,
              },
              {
                fieldName: "mdcr_date",
                name: "mdcr_date",
                header: "진료일자",
                width: 68,
              },
            ]
          : [
              {
                fieldName: "mdcr_date",
                name: "mdcr_date",
                header: "진료일자",
                width: 68,
              },
              {
                fieldName: "rcpn_dt",
                name: "rcpn_dt",
                header: "접수일시",
                width: 68,
                renderer: {
                  type: "text",
                  showTooltip: true,
                },
              },
              { name: "exmn_hope_date", visible: false },
            ]),
        {
          fieldName: "pt_dscm_nm",
          name: "pt_dscm_nm",
          header: "이름",
          width: 55,
          renderer: {
            type: "icon",
            iconLocation: "left",
            iconCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_pt_yn") && icEmrg,
          },
          styleCallback: (grid, cell) => grid.getValue(cell.index.itemIndex, "emrg_pt_yn") && "rg-emergency-pt",
        },
        {
          fieldName: "sex_age",
          name: "sex_age",
          header: "성별/나이",
          width: 45,
        },
        {
          fieldName: "dobr",
          name: "dobr",
          header: "생년월일",
          width: 70,
          renderer: {
            type: "text",
            showTooltip: true,
          },
        },
        {
          name: "mdcr_user_nm",
          fieldName: "mdcr_user_nm",
          header: "진료의",
          width: 60,
          editable: false,
          renderer: {
            type: "text",
            showTooltip: true,
          },
        },
        {
          header: "상태",
          name: "prsc_prgr_stat_cd",
          fieldName: "prsc_prgr_stat_cd",
          lookupDisplay: true,
          editable: false,
          width: 50,
          fillWidth: 0,
        },
      ]);

      gridView.setDisplayOptions({
        selectionStyle: "rows",
        fitStyle: GridFitStyle.EVEN,
      });
      configEmptySet(gridView, realGridElem.current, Message.noSearch);
      gridView.footer.visible = false;
      gridView.checkBar.visible = false;
      gridView.stateBar.visible = false;
      gridView.setColumn({
        ...gridView.columnByName("prsc_prgr_stat_cd"),
        values: stateList.map(item => item.code),
        labels: stateList.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            for (const patientState of stateList) {
              if (dataCell.value === patientState.code) {
                return getBadgeSvg(patientState.name, patientState.color);
              }
            }
          },
        },
      });
      gridView.onCellDblClicked = (grid, clickData) => {
        if (clickData.cellType === "data") {
          setOpen(false);
          onAdjust({ ...grid.getValues(clickData.itemIndex), pt_nm: grid.getValue(clickData.itemIndex, "pt_dscm_nm") });
        }
      };
    }, [onAdjust, stateList, uncmplYn]);

    useEffect(() => {
      if (open) {
        searchMP();
      } else {
        gridViewRef.current?.clearCurrent();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, patient, hopeExrmDeptSqnoList, prscClsfCd, endoYn, uncmplYn]);
    //useEffect end

    useImperativeHandle(
      ref,
      () => ({
        search: searchMP,
      }),
      [],
    );

    return (
      <>
        <LUXButton
          label={`${uncmplYn === "Y" ? "미완료" : "미시행"} ${count} >`}
          onClick={() => {
            patientCompleteRef.current.setKeyword("", null);
            setPatient(null);
            setOpen(true);
          }}
          disabled={count < 1}
          type="small"
          style={style}
        />
        {withPortal(
          <LUXDialog
            onRequestClose
            handleOnReqeustClose={handleCancel}
            handleOnEscClose={handleCancel}
            dialogOpen={open}
          >
            <div className="dialog_content md">
              <div className="dialog_data">
                <div className="dialog_data_tit">
                  <h1 className="txtcnt">{`${uncmplYn === "Y" ? "미완료" : "미시행"} ${
                    prscClsfCd === "F1" ? "물리치료" : "검사"
                  } 조회`}</h1>
                  <button type="button" className="LUX_basic_btn btn_clr" onClick={handleCancel}>
                    <span className="sp_lux">닫기</span>
                  </button>
                </div>
                <div className="dialog_data_area noline mgt10">
                  <div className="dialgo_data_section">
                    <div className="unactguncmpldialog-title">
                      <div className="unactguncmpldialog-title-label">
                        {(() => {
                          switch (prscClsfCd) {
                            case "C1":
                              return "진단검사";
                            case "C2":
                              return "영상검사";
                            case "C3":
                              return endoYn === "Y" ? "내시경검사" : "기능검사";
                            case "F1":
                              return "물리치료";
                            default:
                          }
                        })()}
                        <span>{` ${uncmplYn === "Y" ? "결과" : "접수"} 현황 ${count}`}</span>
                      </div>
                      <div className="unactguncmpldialog-complete">
                        <PatientComplete onCompleted={data => setPatient(data)} ref={patientCompleteRef} useIcon />
                      </div>
                    </div>
                  </div>
                  <div className="dialgo_data_section">
                    <div className="unactguncmpldialog-grid" ref={realGridElem} />
                  </div>
                </div>
              </div>
              <div className="dialog_btnbx">
                <LUXButton label="취소" useRenewalStyle type="confirm" onClick={handleCancel} />
                <LUXButton
                  label="확인"
                  useRenewalStyle
                  type="confirm"
                  onClick={handleAdjust}
                  blue={!diabled}
                  disabled={diabled}
                />
              </div>
            </div>
          </LUXDialog>,
          "dialog",
        )}
        {withPortal(
          <LUXSnackbar
            message={snackbar.message}
            onRequestClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            open={snackbar.open}
            type={snackbar.type}
          />,
          "snackbar",
        )}
      </>
    );
  },
);
UnactgUncmplDialog.propTypes = {
  hopeExrmDeptSqnoList: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  prscClsfCd: PropTypes.string.isRequired,
  onAdjust: PropTypes.func,
  stateList: PropTypes.arrayOf(PropTypes.object),
  uncmplYn: PropTypes.string,
  endoYn: PropTypes.string,
  style: PropTypes.shape({}),
};
UnactgUncmplDialog.defaultProps = {
  hopeExrmDeptSqnoList: [],
  onAdjust: () => {},
  stateList: [],
  uncmplYn: "N",
  endoYn: "N",
  style: undefined,
};
export default UnactgUncmplDialog;
