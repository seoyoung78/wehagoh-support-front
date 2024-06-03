import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// util
import callApi from "services/apis";
import moment from "moment";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// common-ui-components
import {
  LUXButton,
  LUXComplexPeriodDatePicker,
  LUXConfirm,
  LUXRadioButton,
  LUXRadioButtonGroup,
  LUXSnackbar,
  LUXTab,
  LUXTabs,
  LUXTextField,
} from "luna-rocket";
import LUXVirtualBox from "luna-rocket/LUXVirtualBox";
import PatientComplete from "components/Common/PatientComplete";
import CardItem from "pages/MSC_070100/CardItem";
import MSC_070100_T01 from "pages/MSC_070100/MSC_070100_T01";
import MSC_070100_T02 from "pages/MSC_070100/MSC_070100_T02";
import MSC_070100_T03 from "pages/MSC_070100/MSC_070100_T03";
import MSC_070100_T04 from "pages/MSC_070100/MSC_070100_T04";
import MSC_070100_T05 from "pages/MSC_070100/MSC_070100_T05";
import PacsButton from "components/Common/PacsButton";
import PatientSummaryBar from "components/Common/PatientSummaryBar";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";

// css
import "assets/style/MSC_070100.scss";

// imgs

/* ================================================================================== */
/* 상수(const) 선언 */
const DEFAULT_FROM = new Date(new Date().setFullYear(new Date().getFullYear() - 3));
const DEFAULT_TO = new Date();
const DEFAULT_KEY = "";

/**
 * 통합검사결과 화면
 *
 * @author khgkjg12 강현구A
 */
function MSC_070100() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [cardSearchCondition, setCardSearchCondition] = useState({
    from: undefined,
    to: undefined,
    pid: undefined,
    keyword: undefined,
  });
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [keyword, setKeyword] = useState(DEFAULT_KEY);
  const [patient, setPatient] = useState(null);

  const [selectedTab, setSelectedTab] = useState("C1");
  const [radio, setRadio] = useState("sortOld");
  const location = useLocation();
  const isNotPopup = location.pathname !== "/CSMSP/MSC_070100";

  const [selectedCard, setSelectedCard] = useState(null);

  const [cardList, setCardList] = useState(null); // 검사 처방 이력 목록

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" }); // 스낵바 상태
  const [confirm, setConfirm] = useState(false); // 컨펌창 상태
  const patientCompleteRef = useRef();
  const patientInfoRef = useRef();

  const [pacsInfo, setPacsInfo] = useState({ pacs_no: null, pacs_co_cd: null }); // 영상검사 pacs_no

  /* ================================================================================== */
  /* 함수(function) 선언 */

  // 조회버튼 클릭 시(검사처방이력, 진단검사누적결과 조회)
  const search = useCallback((pid, dateFrom, dateTo, keyword) => {
    setPacsInfo({ pacs_no: null, pacs_co_cd: null });
    if (!pid || !dateFrom || !dateTo) {
      setCardSearchCondition({
        from: undefined,
        to: undefined,
        pid: undefined,
        keyword: undefined,
      });
      setCardList(null);
      setSelectedCard(null);
      setSnackbar({ open: true, message: Message.MSC_070100_noRequiredError, type: "error" });
      return;
    }
    setCardList(null);
    setSelectedCard(null);
    callApi("/MSC_070100/rtrvCardList", {
      pid,
      date_from: dateFrom,
      date_to: dateTo,
      keyword,
    })
      .then(({ resultCode, resultData }) => {
        setCardSearchCondition({
          pid,
          from: moment(dateFrom).format("YYYY-MM-DD"),
          to: moment(dateTo).format("YYYY-MM-DD"),
          keyword,
        });
        if (resultCode !== 200) {
          setSnackbar({ open: true, message: Message.networkFail, type: "warning" });
          return;
        }
        if (resultData.length < 1) {
          setSnackbar({ open: true, message: Message.noSearch, type: "info" });
          return;
        }
        setCardList(resultData);
        setSelectedCard(resultData[0]);
      })
      .catch(() => {
        setSnackbar({ open: true, message: Message.networkFail, type: "warning" });
      });
  }, []);

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    const storedPid = window.localStorage.getItem("pid");
    if (storedPid && storedPid.length > 0) {
      callApi("/common/rtrvPtBascInfo", { pid: storedPid })
        .then(({ resultCode, resultData }) => {
          if (resultCode !== 200) throw resultCode;
          const nextPatient = {
            pid: storedPid,
            pt_nm: resultData.pt_nm,
          };
          if (isNotPopup)
            patientCompleteRef.current.setKeyword(
              storedPid + " " + resultData.pt_nm + (resultData.nm_dscm_dvcd ? resultData.nm_dscm_dvcd : ""),
              nextPatient,
            );
          setPatient(nextPatient);
          search(storedPid, DEFAULT_FROM, DEFAULT_TO, DEFAULT_KEY);
        })
        .catch(() => {
          setSnackbar({
            open: true,
            message: Message.networkFail,
            type: "warning",
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotPopup, search]);

  useEffect(() => {
    setPacsInfo({ pacs_no: null, pacs_co_cd: null });
    if (selectedCard) {
      setSelectedTab(selectedCard.prsc_clsf_cd_list.split("/")[0]);
    } else {
      setSelectedTab("C1");
    }
  }, [selectedCard]);

  //팝업 전용.
  useEffect(() => {
    if (!isNotPopup && patient?.pid) {
      search(patient?.pid, from, to, null);
    }
  }, [isNotPopup, patient?.pid, from, to, search]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_070100 dp_full">
      <div className="align_box">
        <div className={`align_top ${cardSearchCondition.pid ? "patient_info_wrap" : ""}`}>
          <PatientSummaryBar pageId="MSC_070100" pid={cardSearchCondition.pid} ref={patientInfoRef} />
        </div>
        <div className="align_split">
          <div className="align_left">
            <div className="sec_wrap">
              <dl className="search_list">
                <div className="item">
                  <dt>검사일자</dt>
                  <dd>
                    <LUXComplexPeriodDatePicker
                      datePickerProps={{ dateFormatSeparator: "-" }}
                      valueFrom={from}
                      valueTo={to}
                      onChange={(from, to) => {
                        setFrom(from);
                        setTo(to);
                      }}
                    />
                  </dd>
                </div>
              </dl>
              {isNotPopup && (
                <>
                  <dl className="search_list">
                    <div className="item">
                      <dt>환자조회</dt>
                      <dd>
                        <PatientComplete
                          style={{ width: "100%" }}
                          hintText="환자검색"
                          ref={patientCompleteRef}
                          onCompleted={patient => {
                            setPatient(patient);
                            search(patient?.pid, from, to, keyword);
                          }}
                        />
                      </dd>
                    </div>
                  </dl>
                  <dl className="search_list">
                    <div className="item">
                      <dt>검사조회</dt>
                      <dd>
                        <LUXTextField
                          style={{ width: "100%" }}
                          hintText="검사명 입력하세요."
                          onChange={e => {
                            setKeyword(e.target.value);
                          }}
                          onKeyDown={e => {
                            if (e.keyCode === 13) {
                              search(patient?.pid, from, to, e.target.value);
                            }
                          }}
                        />
                        <LUXButton
                          onClick={() => {
                            if (!patientCompleteRef.current?.getCompleted())
                              patientCompleteRef.current?.setCompleted(null, true);
                            else search(patient?.pid, from, to, keyword);
                          }}
                          className="LUX_basic_btn Image basic"
                          type="icon"
                          icon={
                            <SearchIcon
                              style={{
                                width: "18px",
                                height: "18px",
                              }}
                            />
                          }
                        />
                      </dd>
                    </div>
                  </dl>
                </>
              )}
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="sec_title">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">검사 처방 이력</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="card_container">
                  {cardList && cardList.length > 0 ? (
                    <LUXVirtualBox
                      rootStyle={{ width: "100%", height: 0, flexGrow: 1 }}
                      listComponent={CardItem}
                      itemHeight={35}
                      itemCount={cardList.length}
                      items={cardList}
                      itemBuffer={5}
                      globalObject={{
                        disabled: selectedTab === "ACC",
                        selectedCard,
                        setSelectedCard,
                      }}
                    />
                  ) : (
                    <div className="empty_box">
                      <div className="inbx">
                        <div className="empty_img type1"></div>
                        <div className="empty_msg">
                          <p>{Message.noSearch}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">
                      검사결과
                      {selectedTab !== "ACC" && selectedCard && (
                        <em className="text_color2" style={{ marginLeft: "4px", fontSize: "11px" }}>
                          검사일자: {selectedCard.cndt_dy} [{selectedCard.mdcr_dr_nm}]
                        </em>
                      )}
                    </h3>
                  </div>
                </div>
                <div className="right_box">
                  <PacsButton
                    pid={cardSearchCondition.pid}
                    pacsNo={pacsInfo.pacs_no}
                    pacsCoCd={pacsInfo.pacs_co_cd}
                    visible={selectedTab === "C2"}
                  />
                  {selectedTab === "ACC" && (
                    <LUXRadioButtonGroup
                      name="orderButtonGroup"
                      onChange={(_event, value) => setRadio(value)}
                      defaultSelected={radio}
                    >
                      <LUXRadioButton labelText="과거순" value="sortOld" style={{ marginRight: "10px" }} />
                      <LUXRadioButton labelText="최신순" value="sortRecent" style={{ marginRight: "10px" }} />
                    </LUXRadioButtonGroup>
                  )}
                </div>
              </div>
              <div className="sec_content">
                <LUXTabs
                  style={{ flex: "1 0 auto", display: "flex", flexDirection: "column" }}
                  tabContainerStyle={{ textAlign: "left" }}
                  contentContainerStyle={{ flex: "1 0 auto" }}
                  value={selectedTab}
                  onChange={e => setSelectedTab(e)}
                >
                  <LUXTab label="진단검사" selectedStyle={{ color: "#1c90fb" }} value="C1">
                    <MSC_070100_T01
                      selectedCard={selectedCard}
                      cardSearchCondition={cardSearchCondition}
                      setSnackbar={setSnackbar}
                      patientInfoRef={patientInfoRef}
                    />
                  </LUXTab>
                  <LUXTab label="기능검사" selectedStyle={{ color: "#1c90fb" }} value="C3-F">
                    <MSC_070100_T02
                      selectedCard={selectedCard}
                      cardSearchCondition={cardSearchCondition}
                      setSnackbar={setSnackbar}
                      patientInfoRef={patientInfoRef}
                    />
                  </LUXTab>
                  <LUXTab label="영상검사" selectedStyle={{ color: "#1c90fb" }} value="C2">
                    <MSC_070100_T03
                      selectedCard={selectedCard}
                      cardSearchCondition={cardSearchCondition}
                      setSnackbar={setSnackbar}
                      patientInfoRef={patientInfoRef}
                      handlePacsInfo={pacs => setPacsInfo(pacs)}
                    />
                  </LUXTab>
                  <LUXTab label="내시경검사" selectedStyle={{ color: "#1c90fb" }} value="C3-EN">
                    <MSC_070100_T04
                      selectedCard={selectedCard}
                      cardSearchCondition={cardSearchCondition}
                      setSnackbar={setSnackbar}
                      patientInfoRef={patientInfoRef}
                    />
                  </LUXTab>
                  <LUXTab label="진단검사 누적결과조회" selectedStyle={{ color: "#1c90fb" }} value="ACC">
                    <MSC_070100_T05
                      open={selectedTab === "ACC"}
                      cardSearchCondition={cardSearchCondition}
                      sort={radio}
                      setSnackbar={setSnackbar}
                    />
                  </LUXTab>
                </LUXTabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {withPortal(
        <LUXSnackbar
          open={snackbar.open}
          message={snackbar.message}
          type={snackbar.type}
          onRequestClose={() => setSnackbar({ ...snackbar, open: false })}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXConfirm
          open={confirm}
          message="앱이 설치되어 있지 않습니다. 스토어로 이동하시겠습니까?"
          confirmButton={() => {
            window.location.href = "itms-apps://itunes.apple.com/app/complete-anatomy/id1141323850";
          }}
          cancelButton={() => setConfirm(false)}
          onClose={() => setConfirm(false)}
        />,
        "dialog",
      )}
    </div>
  );
}

export default WithWrapper(MSC_070100);
