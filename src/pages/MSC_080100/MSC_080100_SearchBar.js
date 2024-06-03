import React, { useEffect, useRef, useState } from "react";
import { LUXComplexPeriodDatePicker, LUXButton } from "luna-rocket";
import LUXMSelectField from "luna-rocket/LUXMSelectField";
import PatientComplete from "components/Common/PatientComplete";
import moment from "moment";
import useMSC080100Store from "./store";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";
import useNotiStore from "services/utils/zustand/useNotiStore";

const initState = {
  pid: "",
  cmcdValue: [],
  cmcdData: [],
  date: { from: new Date(), to: new Date() },
};

export default function () {
  const [searchState, setSearch] = useState(initState);
  const clearRows = useMSC080100Store(state => state.grid.clearRows);
  const selectPatient = useMSC080100Store(state => state.api.selectPatient);
  const selectDeptCode = useMSC080100Store(state => state.api.selectDeptCode);
  const deptCode = useMSC080100Store(state => state.api.deptCode);
  const snackbar = useMSC080100Store(state => state.snackbar);

  const completeRef = useRef(null);

  const { noti, resetNoti, checkNoti } = useNotiStore(state => state);

  const handleSearch = () => {
    if (!completeRef.current?.getCompleted()) {
      completeRef.current.setCompleted(null, true);
    } else if (searchState.cmcdValue.length > 0) {
      selectPatient({
        pid: searchState.pid,
        hope_exrm_cd: searchState.cmcdData,
        prsc_date_from: moment(searchState.date.from).format("YYYY-MM-DD"),
        prsc_date_to: moment(searchState.date.to).format("YYYY-MM-DD"),
      });
    } else {
      snackbar.networkFail();
      clearRows();
    }
  };

  const handleSelectSuggest = value => {
    const pid = value || "";

    setSearch(prev => {
      if (prev.cmcdValue.length > 0) {
        selectPatient({
          pid,
          hope_exrm_cd: prev.cmcdData,
          prsc_date_from: moment(prev.date.from).format("YYYY-MM-DD"),
          prsc_date_to: moment(prev.date.to).format("YYYY-MM-DD"),
        });
      } else {
        clearRows();
      }
      return { ...prev, pid };
    });
  };

  useEffect(() => {
    selectDeptCode().then(({ resultData }) => {
      if (resultData.length !== 0) {
        setSearch({
          ...searchState,
          cmcdValue: resultData.map(item => item.text),
          cmcdData: resultData.map(item => item.value),
        });
        return selectPatient({
          pid: "",
          hope_exrm_cd: resultData.map(({ value }) => value),
          prsc_date_from: moment(new Date()).format("YYYY-MM-DD"),
          prsc_date_to: moment(new Date()).format("YYYY-MM-DD"),
        });
      }
    });
  }, [selectDeptCode, selectPatient]);

  useEffect(() => {
    if (noti && checkNoti()) {
      handleSearch();
      resetNoti();
    }
  }, [noti]);

  return (
    <div className="sec_wrap">
      <div className="sec_content">
        <dl className="search_list">
          <div className="item">
            <dt>검사예정일자</dt>
            <dd>
              <LUXComplexPeriodDatePicker
                datePickerProps={{ dateFormatSeparator: "-" }}
                valueFrom={searchState.date.from}
                valueTo={searchState.date.to}
                onChange={(dateFrom, dateTo) => setSearch({ ...searchState, date: { from: dateFrom, to: dateTo } })}
              />
            </dd>
          </div>
          <div className="item">
            <dt>검사실</dt>
            <dd>
              <LUXMSelectField
                data={deptCode.map(el => {
                  el.checked = !!searchState.cmcdValue.some(text => el.text === text);
                  el.name = el.text;
                  return { name: el.name, checked: el.checked, value: el.value };
                })}
                onChange={value => {
                  const checkdData = value.filter(x => x.checked);
                  setSearch({
                    ...searchState,
                    cmcdValue: checkdData.map(v => v.name),
                    cmcdData: checkdData.map(v => v.value),
                  });
                }}
                placeholder="검사실을 입력해 주십시오."
                placeholderStyle={{ background: "rgb(254, 244, 244)" }}
                ulStyle={{ maxHeight: "400px" }}
              />
            </dd>
          </div>
          <div className="item">
            <dt>환자조회</dt>
            <dd>
              <div style={{ width: "200px" }}>
                <PatientComplete
                  ref={completeRef}
                  onCompleted={patient => handleSelectSuggest(patient ? patient.pid : "")}
                  useIcon
                />
              </div>
            </dd>
          </div>
          <div className="item summit">
            <LUXButton
              type="icon"
              icon={
                <SearchIcon
                  style={{
                    width: "18px",
                    height: "18px",
                  }}
                />
              }
              onClick={handleSearch}
              className="LUX_basic_btn Image basic"
            />
          </div>
        </dl>
      </div>
    </div>
  );
}
