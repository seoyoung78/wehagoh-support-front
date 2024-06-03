import React, { useEffect, useRef, useState } from "react";
import { LUXDatePicker, LUXButton } from "luna-rocket";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";
import PatientComplete from "components/Common/PatientComplete";
import useMSC010100Store from "./store";
import useNotiStore from "services/utils/zustand/useNotiStore";

const initState = {
  prsc_date: new Date(), // 날짜값
  pid: "",
};

export default function () {
  const selectPatient = useMSC010100Store(state => state.api.selectPatient);
  const [searchState, setSearch] = useState(initState);
  const getCommonCode = useMSC010100Store(state => state.api.getCommonCode);
  const initBtnState = useMSC010100Store(state => state.grid.initBtnState);
  const { noti, resetNoti, checkNoti } = useNotiStore(state => state);

  const completeRef = useRef(null);

  const handleSearch = () => {
    if (!completeRef.current?.getCompleted()) {
      completeRef.current.setCompleted(null, true);
    } else {
      initBtnState();
      selectPatient(searchState);
    }
  };

  const handlePatientComplete = value => {
    initBtnState();
    setSearch(prev => {
      const pid = value || "";
      selectPatient({
        pid,
        prsc_date: prev.prsc_date,
      });
      return { ...prev, pid };
    });
  };

  useEffect(() => {
    getCommonCode().then(() => selectPatient(initState));
  }, [getCommonCode, selectPatient]);

  useEffect(() => {
    if (noti && checkNoti("MSC_010100")) {
      selectPatient(searchState);
      resetNoti();
    }
  }, [noti]);

  return (
    <div className="binder">
      <LUXDatePicker
        dateFormatSeparator="-"
        value={searchState.prsc_date}
        onChange={date => setSearch({ ...searchState, prsc_date: date })}
      />
      <PatientComplete
        ref={completeRef}
        onCompleted={patient => handlePatientComplete(patient ? patient.pid : "")}
        useDobrSearch
      />
      <LUXButton
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
        onClick={handleSearch}
        style={{ width: "27px", height: "27px" }}
      />
    </div>
  );
}
