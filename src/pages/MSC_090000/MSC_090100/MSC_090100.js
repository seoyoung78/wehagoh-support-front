import React, { useEffect, useRef, useState } from "react";

// Util
import callApi from "services/apis";
import { date, lodash } from "common-util/utils";
import withPortal from "hoc/withPortal";
import Message from "components/Common/Message";
import moment from "moment";
import { configEmptySet } from "services/utils/grid/RealGridUtil";
import WithWrapper from "cliniccommon-ui/lib/utils/hoc/WithWrapper";

// LUX 컴포넌트
import {
  LUXSelectField,
  LUXSmartComplete,
  LUXButton,
  LUXRadioButtonGroup,
  LUXRadioButton,
  LUXTextField,
  LUXNumberField,
  LUXTooltip,
  LUXCheckBox,
  LUXSnackbar,
  LUXConfirm,
  LUXAlert,
  LUXInputField,
} from "luna-rocket";

// OBT TreeView 컴포넌트
import { OBTTreeView } from "luna-orbit";

// 리얼그리드
import { GridView, LocalDataProvider } from "realgrid";
import { prscColumns, prscField, setColumns, setField } from "./MSC_090100_Grid";

// 스타일 & 이미지
import "assets/style/MSC_090100.scss";
import openFolder from "assets/imgs/ic_folder_open.png";
import closeFolder from "assets/imgs/ic_folder_close.png";
import iconMaximize from "assets/imgs/ic_maximize.png";
import iconMinimize from "assets/imgs/ic_minimize.png";
import SearchIcon from "luna-rocket/LUXSVGIcon/Duzon/BlankSize/Search";

import { ErrorLogInfo } from "cliniccommon-ui";
import MSC_090100_P02 from "./MSC_090100_P02/MSC_090100_P02";
import MSC_090100_P01 from "./MSC_090100_P01/MSC_090100_P01";

// 검사목록 자동완성 검색 레이아웃
const dataInfo = {
  columnWidths: ["100%"],
  itemInfo: [
    {
      key: "search_path_text",
      column: 0,
    },
    {
      key: "code",
      column: 1,
      isKeyValue: true,
    },
    {
      key: "text",
      column: 2,
    },
  ],
};

// 검사 SET 목록 검색 레이아웃
const exmnDataInfo = {
  columnWidths: ["15%", "85%"],
  itemInfo: [
    {
      key: "exmn_cd",
      column: 0,
      isKeyValue: true,
    },
    {
      key: "exmn_nm",
      column: 1,
    },
  ],
};

// 검색 유형
const ddlSearchType = [
  { value: "1", text: "기본" },
  { value: "2", text: "신규" },
];

// 검사정보
const defaultFormInfo = {
  prsc_cd: "", // 처방코드
  prsc_nm: "", // 처방명
  suga_hnm: "", // 한글명
  insn_edi_cd: "", // EDI 코드
  prsc_clsf_cd: "", // 처방분류 코드
  prsc_clsf_nm: "", // 처방분류 명칭
  suga_clsf_no: "", // 한글분류
  apdy: "", // 시작일
  endy: "", // 종료일
  grp_sngl_dvcd: "", // S/G
  suga_enm: "", // 영문명
  exmn_rslt_yn: null, // 신규코드 여부

  // 검사 기본 설정
  slip_cd: "", // 검사구분코드
  slip_nm: "", // 검사구분명칭
  exrm_dept_sqno: "", // 검사실 코드
  prsc_nots: "", // 메모

  // 영상검사 설정
  mdlt_dvcd: "", // Modality 코드
  phtg_site_dvnm: "", // 촬영부위 코드
  onsd_btsd_dvnm: "", // 편측양측 코드
  cnmd_use_yn: "", // 조영제사용유무

  // 진단검사 설정
  spcm_cd_1: "", // 검체종류
  entd_exmn_yn: "N", // 위탁여부
  ents_exmn_inst_nm: "", // 위탁기관 명칭
  spcm_need_vol_1: "", // 검체용량
  spcm_dosg_unit_1: "", // 검체용량단위
  fix_vol_dvsn: "", // 정량표시 코드
  exmn_need_time: "", // 검사소요시간
  exmn_rslt_tycd: "", // 결과유형 코드
  exmn_rslt_uncd: "", // 단위 코드
  dcpr_nodg: "", // 유효숫자 코드

  // 기능검사 설정
  wrcn_need_yn: "", // 동의서필요여부
  wrcn_cd: "", // 동의서코드

  // 내시경검사 설정
  mdtr_site_cd: "", // 치료부위코드

  // 물리치료 설정
  exmn_rslt_rptg_yn: "", // 검사결과보고여부

  setList: [], // 검사 set 목록
  formState: "",
  exmn_clsf_cd: "",
  prsc_psbl_yn: "N",
};

function MSC_090100() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [treeList, setTreeList] = useState([]); // treeview 데이터
  const [exmnInfo, setExmnInfo] = useState(lodash.cloneDeep(defaultFormInfo));
  const [originInfo, setOriginInfo] = useState(lodash.cloneDeep(defaultFormInfo));
  
  const [state, setState] = useState({
    searchCondition: "1", //조회조건

    treeKeyword: "", // 검사목록 검색 상태값
    setKeyword: "", // 검사 SET 정보 상태값

    // tree 선택한 노드
    selectedItem: "",

    isSet: false, // 검사 SET 조회 상태

    isDisabled: true, // 폼 패널 내부 입력 상태
    isMemoImgFlag: true, // 메모 이미지 flag
    isSpcmInputDisabled: true, // 상/하한치 입력 상태

    isUnitOpen: false, // 단위설정 다이얼로그 상태

    prscIndex: -1,
  });
  // 참고치설정, CVR 설정 상태
  const [refCvr, setRefCvr] = useState({
    isRefCvrOpen: false,
    refCvrType: "",
    refReadOnly: false,
    prscCd: "",
  });
  const [completed, setCompleted] = useState(null);

  const [searchList, setSearchList] = useState([]);

  // 기본 드롭다운리스트 목록
  const [common, setCommon] = useState({
    needTimeList: [{ value: "", text: "선택하세요" }], // 검사소요기간(CS1001)
    rsltTypeList: [{ value: "", text: "" }], // 결과유형(CS1002)
    rsltUncdList: [{ value: "", text: "선택하세요" }], // 단위(CS1003)
    dcprNodgList: [{ value: "", text: "선택하세요" }], // 유효숫자(CS1004)
    mdltDvcdList: [{ value: "", text: "선택하세요" }], // Modality(CS1005)
    fixVolList: [{ value: "", text: "선택하세요" }], // 검체용량(CS1007)
    volUncdList: [{ value: "", text: "단위" }], // 검체용량단위(CS1014)
    spcmList: [{ value: "", text: "선택하세요", ctnr_nm: "" }], // 검체종류
    exrmDeptList: [{ value: "", text: "선택하세요" }], // 검사실(CA1008)
    mdtrSiteList: [{ value: "", text: "선택하세요" }], // 치료부위(CR1004)
    wrcnList: [{ value: "", text: "선택하세요" }], // 기능검사동의서(CS8001)
  });

  // 처방목록 그리드
  const prscGrid = useRef(null);
  const prscDataProvider = useRef(null);
  const prscGridView = useRef(null);

  // 검사 SET 그리드
  const setGrid = useRef(null);
  const setDataProvider = useRef(null);
  const setGridView = useRef(null);

  const textAreaRef = useRef(); // 메모

  const [snack, setSnack] = useState({ open: false, message: "", type: "info" }); // 스낵바 상태
  const [alert, setAlert] = useState({ open: false, title: "", message: "", type: "info" }); // 알럿창 상태
  // 컴펌창 상태
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancle: () => {},
  });

  /* ================================================================================== */
  /* 함수(function) 선언 */
  // 요소를 트리뷰로 변환하는 함수
  const onMapItem = e => {
    const { list } = e;
    const icon = {
      normal: {
        open: openFolder,
        close: closeFolder,
      },
    };

    e.item = {
      key: list.code,
      parentKey: list.parent_code,
      labelText: list.text,
      lwrn_yn: list.lwrn_yn,
      imageUrl: icon,
      tooltip: {
        labelText: list.text,
      },
    };
  };

  // 검사 별 검사실 필터
  const handleExmnClsfCd = slipCd => {
    const regex = /[0-9]/g;

    switch (slipCd.replace(new RegExp(regex), "")) {
      case "F":
        return "F";
      case "L":
      case "P":
        return "L";
      case "RE":
      case "RF":
      case "RG":
      case "RU":
      case "U":
        return "R";
      case "EN":
        return "E";
      case "PT":
        return "P";
      default:
        break;
    }
  };

  // 검사정보, 검사 기본 설정, 영상검사 설정 조희
  const handleForm = async index => {
    const parameter = {
      prsc_cd: prscGridView.current.getValue(index, "prsc_cd"),
      date: date.getyyyymmdd(new Date()),
    };
    await callApi("/MSC_090100/selectForm", parameter).then(({ resultData }) => {
      setState(prev => ({
        ...prev,
        isSpcmInputDisabled:
          !resultData.spcm_cd_1 ||
          resultData.spcm_cd_1 === "" ||
          !resultData.exmn_rslt_tycd ||
          resultData.exmn_rslt_tycd === "",
        prscIndex: -1,
        isMemoImgFlag: true,
        isDisabled: false,
      }));

      const exmn_clsf_cd = handleExmnClsfCd(resultData.slip_cd);
      setOriginInfo(lodash.cloneDeep({ ...resultData, formState: "", exmn_clsf_cd }));
      setExmnInfo(lodash.cloneDeep({ ...resultData, formState: "", exmn_clsf_cd }));
      setDataProvider.current.clearRows();
      setDataProvider.current.setRows(resultData.setList);
    });
  };

  // 트리 선택 했을 때
  const handleSelect = async (item, prscCd, search) => {
    const parameters = {
      search_type: search || state.searchCondition,
      slip_cd: item.code,
      date: new Date(),
    };

    await callApi("/MSC_090100/selectPrscList", parameters).then(({ resultData }) => {
      prscDataProvider.current.setRows(resultData);
      prscGridView.current.clearCurrent();
      prscGridView.current.activateAllColumnFilters("set_yn", false);

      setState({
        ...state,
        isDisabled: resultData.length === 0 || prscCd === -1,
        isMemoImgFlag: true,
        selectedItem: item.code,
        treeKeyword: prscCd && prscCd !== -1 && !search ? item.text : "",
        searchCondition: search || state.searchCondition,
        prscIndex: -1,
        isSet: item.check !== undefined ? item.check : false,
      });

      if (resultData.length > 0 && prscCd !== -1) {
        // 처방명의 n번째 선택 및 이동
        const index = prscGridView.current.searchItem({
          fields: ["prsc_cd"],
          values: [prscCd],
        });

        if (index < 0) {
          prscGridView.current.setCurrent({ itemIndex: 0 });
        }

        // 이동 및 포커스
      } else {
        setOriginInfo(lodash.cloneDeep(defaultFormInfo));
        setExmnInfo(lodash.cloneDeep(defaultFormInfo));
      }
    });
  };

  // 저장 로직
  const onSave = async type => {
    let newInfo = { ...exmnInfo };
    newInfo.setList.map((list, index) => {
      list.sort_seq = index + 1;
      return list;
    });
    if (newInfo.exmn_clsf_cd === "L") {
      newInfo.uprn_slip_clsf_cd = treeList.find(list => list.code === state.selectedItem).parent_code;
      newInfo.del_yn = "N";
    }

    const { resultCode } = await callApi("/MSC_090100/save", newInfo).catch(() =>
      setSnack({ open: true, message: Message.saveFail, type: "error" }),
    );

    if (resultCode === 200) {
      setOriginInfo(exmnInfo);
      setSnack({ open: true, message: Message.save, type: "success" });
      if (type) {
        return true;
      }
      return handleSelect(
        { code: exmnInfo.slip_cd },
        exmnInfo.prsc_cd,
        exmnInfo.formState === "Added" || exmnInfo.exmn_rslt_yn === "Y" ? "2" : "1",
      );
    }

    if (resultCode === 401) {
      setAlert({
        open: true,
        title: "검사 저장 오류",
        message: `[${exmnInfo.prsc_cd}]는 ${Message.MSC_090100_duplPrsc}`,
        type: "warning",
      });
    } else {
      setSnack({ open: true, message: Message.saveFail, type: "error" });
    }
    return false;
  };

  //  Null, undefined 체크
  const isNullish = function (value) {
    return (value ?? true) === true;
  };

  // 문자열 빈값 체크
  const isEmpty = function (value) {
    return isNullish(value) ? true : value === "";
  };

  // 저장 버튼 클릭
  const handleSave = type => {
    // 처방코드 입력 확인
    if (isEmpty(exmnInfo.prsc_cd)) {
      setSnack({
        open: true,
        message: `처방코드가 ${Message.MSC_090100_emptyData}`,
        type: "warning",
      });
      return false;
    }
    // 처방명 입력 확인
    if (isEmpty(exmnInfo.prsc_nm)) {
      setSnack({
        open: true,
        message: `처방명이 ${Message.MSC_090100_emptyData}`,
        type: "warning",
      });
      return false;
    }
    // 검사실 선택 확인
    if (isEmpty(exmnInfo.exrm_dept_sqno)) {
      setSnack({
        open: true,
        message: `검사실이 ${Message.MSC_090100_noSelect}`,
        type: "warning",
      });
      return false;
    }
    // 영상검사 Modality 확인
    if (exmnInfo.prsc_clsf_cd === "C2" && isEmpty(exmnInfo.mdlt_dvcd)) {
      setSnack({
        open: true,
        message: `Modality가 ${Message.MSC_090100_noSelect}`,
        type: "warning",
      });
      return false;
    }
    // 진단검사 검체종류 확인
    if (exmnInfo.prsc_clsf_cd === "C1" && isEmpty(exmnInfo.spcm_cd_1)) {
      setSnack({
        open: true,
        message: `검체종류가 ${Message.MSC_090100_noSelect}`,
        type: "warning",
      });
      return false;
    }
    // 기능검사 동의서 확인
    if (
      exmnInfo.exmn_clsf_cd === "F" &&
      exmnInfo.wrcn_need_yn === "Y" &&
      (!exmnInfo.wrcn_cd || exmnInfo.wrcn_cd === "")
    ) {
      setSnack({
        open: true,
        message: `동의서가 ${Message.MSC_090100_noSelect}`,
        type: "warning",
      });
      return false;
    }

    if (type) {
      // 처방코드 중복 체크
      return onSave(type).then(res => res);
    }

    setConfirm({
      open: true,
      title: "설정 저장",
      message: Message.saveConfirm,
      onConfirm: onSave,
      onCancle: () => {},
    });
  };

  // 수정 여부 확인
  const handleCompare = ({ item }, prscCd) => {
    if (item.lwrn_yn === "N") {
      if (lodash.isEqual(exmnInfo, originInfo)) {
        setCompleted(item);
        handleSelect(item, prscCd);
      } else {
        setConfirm({
          open: true,
          title: "설정 미저장",
          message: Message.changeConfirm,
          onConfirm: () => {
            const res = handleSave(true);
            if (res) {
              if (item.itemIndex === undefined) {
                setCompleted(item);
                handleSelect(item, prscCd);
              } else {
                prscGridView.current.setCurrent({ itemIndex: item.itemIndex });
              }
            }
          },
          onCancle: () => {
            setOriginInfo(exmnInfo);
            if (item.check !== undefined) {
              setState(prev => ({ ...prev, isSet: item.check }));
              if (item.check) {
                prscGridView.current.activateColumnFilters("set_yn", item.check.toString(), true);
              } else {
                prscGridView.current.activateAllColumnFilters("set_yn", false);
              }
            }
            if (item.itemIndex === undefined) {
              setCompleted(item);
              handleSelect(item, prscCd);
            }
          },
        });
      }
    }
  };

  // 검사 목록 autocomplete (onSearch)
  const handleSearchPrsc = async e => {
    const parameters = {
      search_type: state.searchCondition,
      keyword: e,
      date: date.getyyyymmdd(new Date()),
    };
    const { resultData } = await callApi("/MSC_090100/selectSearchList", parameters);
    setSearchList(resultData);
    return resultData;
  };

  // 검사 목록 autocomplete (onChange)
  const handleChange = e => {
    if (e.type !== "change") {
      const { value } = e.target;
      const item = searchList.find(list => list.code === value);
      if (item) {
        item.code = item.parent_code;
        handleCompare({ item }, value);
      }
    } else {
      setCompleted(null);
      setState({ ...state, treeKeyword: e.target.value });
    }
  };

  // 검사 SET 정보 aotucomplete (onSearch)
  const handleExmnSearch = async e => {
    const parameters = {
      keyword: e,
      prsc_cd: exmnInfo.prsc_cd,
      slip_cd: exmnInfo.slip_cd,
    };
    const { resultData } = await callApi("/MSC_090100/selectExmnList", parameters);
    setSearchList(resultData);
    return resultData;
  };

  // 검사 SET 정보 aotucomplete (onChange)
  const handleExmnChange = e => {
    if (e.type !== "change") {
      const { value } = e.target;
      const item = searchList.find(list => list.exmn_cd === value);
      if (item) {
        // 중복 체크
        const find = exmnInfo.setList.find(old => old.exmn_cd === item.exmn_cd);
        const index = exmnInfo.setList.findIndex(old => old.exmn_cd === item.exmn_cd);
        let newList = lodash.cloneDeep(exmnInfo.setList);

        if (index > -1) {
          if (find.use_yn === "Y") {
            setAlert({ open: true, title: "중복 처방", message: Message.duplicate, type: "warning" });
          } else {
            newList[index].sort_seq = exmnInfo.setList.filter(list => list.use_yn === "Y").length + 1;
            newList[index].use_yn = "Y";
          }
        } else {
          item.prsc_cd = exmnInfo.prsc_cd;
          item.use_yn = "Y";
          item.sort_seq = exmnInfo.setList.filter(list => list.use_yn === "Y").length + 1;
          newList = newList.concat(item);
        }
        newList.sort((a, b) => b.use_yn.localeCompare(a.use_yn) || a.sort_seq - b.sort_seq);

        setExmnInfo({ ...exmnInfo, setList: newList });
        setDataProvider.current.setRows(newList);
        setState({ ...state, setKeyword: "" });
      }
    } else {
      setState({ ...state, setKeyword: e.target.value });
    }
  };

  // 검체종류 변경
  const handleSpcmChange = value => {
    if (value === "") {
      setState({ ...state, isSpcmInputDisabled: true });
    }
    setExmnInfo({ ...exmnInfo, spcm_cd_1: value });
  };

  // 신규 버튼 클릭
  const handleNew = () => {
    const item = treeList.find(list => list.code === state.selectedItem);

    const initForm = {
      ...defaultFormInfo,
      exmn_rslt_yn: "Y",
      slip_cd: item.code,
      slip_nm: item.text,
      prsc_clsf_cd: item.prsc_clsf_cd,
      prsc_clsf_nm: item.prsc_clsf_nm,
      exmn_rslt_tycd: item.exmn_rslt_tycd,
      grp_sngl_dvcd: "S",
      formState: "Added",
      spcm_cd_1: "",
      exmn_clsf_cd: handleExmnClsfCd(item.code),
    };

    setState({ ...state, isDisabled: false, isSpcmInputDisabled: true });
    setOriginInfo(initForm);
    setExmnInfo(initForm);
    prscGridView.current.clearCurrent();
    setDataProvider.current.clearRows();
  };

  // 취소 버튼 클릭
  const handleCancle = () => {
    setConfirm({
      open: true,
      title: "취소",
      message: Message.cancelConfirm,
      onConfirm: () => {
        setState({ ...state, isSpcmInputDisabled: true });
        setExmnInfo(lodash.cloneDeep(originInfo));
        setDataProvider.current.setRows(originInfo.setList);
        setGridView.current.clearCurrent();
        setSnack({ open: true, message: Message.cancelSuccess, type: "success" });
      },
      onCancle: () => {},
    });
  };

  // 삭제
  const handleDelete = () => {
    setConfirm({
      open: true,
      title: "검사설정 삭제",
      message: Message.MSC_090100_delete,
      onConfirm: async () => {
        await callApi("/MSC_090100/delete", { ...exmnInfo })
          .then(({ resultCode }) => {
            if (resultCode === 200) {
              prscGridView.current.clearCurrent();
              handleSelect({ code: state.selectedItem }, -1);
              setSnack({ open: true, message: Message.deleteSuccess, type: "success" });
            } else if (resultCode === 401) {
              setAlert({
                open: true,
                title: "검사 삭제 오류",
                message: "하위 검사 SET으로 등록된 검사는 삭제할 수 없습니다.",
                type: "warning",
              });
            } else {
              setSnack({ open: true, message: Message.deleteFail, type: "error" });
            }
          })
          .catch(e => {
            setSnack({ open: true, message: Message.deleteFail, type: "error" });
          });
      },
      onCancle: () => {},
    });
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    // 초기 데이터 조회
    Promise.all([
      callApi("/common/selectCommonCode", {
        clsfList: ["CR1004", "CS1001", "CS1002", "CS1003", "CS1004", "CS1005", "CS1007", "CS1014", "CS8001"],
        date: date.getyyyymmdd(new Date()),
      }),
      callApi("/MSC_090100/selectTreeList"),
      callApi("/common/selectDeptCode", { isSet: true }),
      callApi("/MSC_090100/selectCommonData"),
    ])
      .then(result => {
        // 검사소요시간
        const needTimeList = common.needTimeList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1001")
          .map(list => needTimeList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 결과유형
        const rsltTypeList = [];
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1002")
          .map(list => rsltTypeList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 단위
        const rsltUncdList = common.rsltUncdList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1003")
          .map(list => rsltUncdList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 유효숫자
        const dcprNodgList = common.dcprNodgList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1004")
          .map(list => dcprNodgList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // Modality
        const mdltDvcdList = common.mdltDvcdList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1005")
          .map(list => mdltDvcdList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 검체옹량
        const fixVolList = common.fixVolList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1007")
          .map(list => fixVolList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 치료부위
        const mdtrSiteList = common.mdtrSiteList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CR1004")
          .map(list => mdtrSiteList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        // 검체용량단위
        const volUncdList = common.volUncdList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS1014")
          .map(list => volUncdList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        const wrcnList = common.wrcnList.concat();
        result[0].resultData
          .filter(list => list.cmcd_clsf_cd === "CS8001")
          .map(list => wrcnList.push({ value: list.cmcd_cd, text: list.cmcd_nm }));

        setCommon({
          ...common,
          needTimeList,
          rsltTypeList,
          rsltUncdList,
          dcprNodgList,
          mdltDvcdList,
          fixVolList,
          volUncdList,
          spcmList: common.spcmList.concat(result[3].resultData),
          exrmDeptList: common.exrmDeptList.concat(result[2].resultData),
          mdtrSiteList,
          wrcnList,
        });

        setTreeList(result[1].resultData);
      })
      .catch(() => ErrorLogInfo());

    // 처방 목록 그리드
    const prscContainer = prscGrid.current;
    const prscDataSource = new LocalDataProvider(true);
    const prscGv = new GridView(prscContainer);

    prscGv.setDataSource(prscDataSource);
    prscDataSource.setFields(prscField);
    prscGv.setColumns(prscColumns);

    prscGv.setEditOptions({ movable: false, readOnly: true, deletable: false, editable: false });
    prscGv.setDisplayOptions({
      fitStyle: "evenFill",
      columnMovable: false,
      selectionStyle: "singleRow",
    });
    prscGv.checkBar.visible = false; // 체크박스 X
    prscGv.footer.visible = false; // 푸터 X
    prscGv.stateBar.visible = false; // 상태바 X
    prscGv.sortingOptions.enabled = false; // 정렬 x
    prscGv.setFilteringOptions({ enabled: false });
    prscGv.setColumnFilters("set_yn", [{ name: "true", criteria: "value = 't'" }]);
    prscGv.pasteOptions.enabled = false;
    prscGv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    configEmptySet(prscGv, prscContainer, Message.noData);
    prscDataSource.setRows([]);

    prscDataProvider.current = prscDataSource;
    prscGridView.current = prscGv;

    // 검사 SET 정보 그리드
    const setContainer = setGrid.current;
    const setDataSource = new LocalDataProvider(true);
    const setGv = new GridView(setContainer);

    setGv.setDataSource(setDataSource);
    setDataSource.setFields(setField);
    setGv.setColumns(setColumns);
    setGv.setEditOptions({ movable: true, deletable: true, editable: false });
    setGv.setDataSource(setDataSource);
    setGv.setDisplayOptions({
      showEmptyMessage: true,
      fitStyle: "evenFill",
      columnMovable: false,
      selectionStyle: "rows",
    });
    setGv.checkBar.visible = false; // 체크박스 X
    setGv.footer.visible = false; // 푸터 X
    setGv.stateBar.visible = false; // 상태바 X
    setGv.sortingOptions.enabled = false; // 정렬 x
    setGv.pasteOptions.enabled = false;
    setGv.setCopyOptions({ copyDisplayText: true, singleMode: true });

    // use_yn = "Y" 보이도록 필터 적용
    setGv.setFilteringOptions({ enabled: false });
    setGv.setColumnFilters("use_yn", [{ name: "Y", criteria: "value = 'Y'" }]);
    setGv.activateAllColumnFilters("use_yn", true);

    configEmptySet(setGv, setContainer, Message.noData);
    setDataSource.setRows([]);

    setDataProvider.current = setDataSource;
    setGridView.current = setGv;

    return () => {
      prscDataProvider.current.clearRows();
      prscGridView.current.destroy();
      prscDataProvider.current.destroy();

      setDataProvider.current.clearRows();
      setGridView.current.destroy();
      setDataProvider.current.destroy();

      prscGridView.current = null;
      prscDataProvider.current = null;
      setGridView.current = null;
      setDataProvider.current = null;
    };
  }, []);

  useEffect(() => {
    prscGridView.current.onCurrentChanging = (grid, oldIndex, newIndex) => {
      if (lodash.isEqual(exmnInfo, originInfo)) {
        oldIndex.itemIndex !== -1 && setState(prev => ({ ...prev, treeKeyword: "" }));
        newIndex.itemIndex !== -1 && handleForm(newIndex.itemIndex);
      } else {
        setState(prev => ({ ...prev, prscIndex: newIndex.itemIndex }));
        const prscCd = grid.getValue(newIndex.itemIndex, "prsc_cd");
        newIndex.itemIndex !== -1 && handleCompare({ item: { lwrn_yn: "N", itemIndex: newIndex.itemIndex }, prscCd });
        return false;
      }
    };

    if (lodash.isEqual(exmnInfo, originInfo) && state.prscIndex !== -1) {
      prscGridView.current.setCurrent({ itemIndex: state.prscIndex });
    }
  }, [exmnInfo, originInfo, common.spcmList]);

  useEffect(() => {
    // 검사 SET 정보 셀 삭제 버튼
    setGridView.current.onCellItemClicked = (grid, index, clickData) => {
      if (clickData.type === "icon") {
        if (clickData.column === "delete") {
          let newList = exmnInfo.setList.concat();

          const click = grid.getValues(index.itemIndex);
          if (click.exmn_set_sqno) {
            const findIndex = exmnInfo.setList.findIndex(list => list.exmn_cd === click.exmn_cd);
            newList[findIndex].use_yn = "N";
          } else {
            newList = exmnInfo.setList.filter(list => list.exmn_cd !== click.exmn_cd);
          }

          newList.map(list => {
            if (list.use_yn === "Y" && list.sort_seq > click.sort_seq) {
              list.sort_seq -= 1;
            }
          });
          newList.sort((a, b) => b.use_yn.localeCompare(a.use_yn) || a.sort_seq - b.sort_seq);

          setExmnInfo({ ...exmnInfo, setList: newList });
          setDataProvider.current.setRows(newList);
        } else if (clickData.column === "ref") {
          setRefCvr({
            isRefCvrOpen: true,
            refCvrType: "R",
            refReadOnly: true,
            prscCd: grid.getValue(index.itemIndex, "exmn_cd"),
          });
        }
      }
    };

    // 드래그 앤 드롭 이동
    setGridView.current.dataDropOptions.callback = (grid, items, target, targetIndex) => {
      const moveList = lodash.cloneDeep(exmnInfo.setList).filter((list, index) => items.includes(index));
      const frontList = lodash.cloneDeep(exmnInfo.setList).filter((list, index) => {
        if (items[0] < targetIndex) {
          return index <= targetIndex && !items.includes(index);
        }
        return index < targetIndex;
      });
      const backList = lodash.cloneDeep(exmnInfo.setList).filter((list, index) => {
        if (items[0] < targetIndex) {
          return index > targetIndex;
        }
        return index >= targetIndex && !items.includes(index);
      });

      const newList = frontList.concat(moveList.concat(backList));
      setGridView.current.setSelection({
        style: "rows",
        startItem: frontList.length,
        endItem: frontList.length + moveList.length - 1,
      });

      setExmnInfo({ ...exmnInfo, setList: newList });
      setDataProvider.current.setRows(newList);
    };
  }, [exmnInfo.setList]);

  // 검사 SET 조회 체크 후
  useEffect(() => {
    if (lodash.isEqual(exmnInfo, originInfo)) {
      prscGridView.current.onFilteringChanged = grid => {
        grid.clearCurrent();

        if (grid.getItemCount() === 0) {
          setState(prev => ({
            ...prev,
            isDisabled: true,
            isMemoImgFlag: true,
            isSpcmInputDisabled: true,
          }));
          setOriginInfo(lodash.cloneDeep({ ...defaultFormInfo, exmn_clsf_cd: "L" }));
          setExmnInfo(lodash.cloneDeep({ ...defaultFormInfo, exmn_clsf_cd: "L" }));
        } else {
          grid.setCurrent({ itemIndex: 0 });
        }
      };
    }
  }, [state.isSet, exmnInfo, originInfo]);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="MSC_090100 dp_full">
      <div className="align_box">
        <div className="align_top">
          <div className="left_box">
            <h2 className="menu_title">검사 환경설정</h2>
          </div>
        </div>
        <div className="align_split">
          <div className="align_left">
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 조회</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="search_box">
                  <div className="LUX_basic_select">
                    <LUXSelectField
                      checkObjectList
                      selectFieldData={ddlSearchType}
                      defaultData={state.searchCondition}
                      listAutoHeight
                      handleChoiceData={value => {
                        setState({
                          ...state,
                          searchCondition: value,
                          selectedItem: "",
                          isDisabled: true,
                        });
                        setExmnInfo(lodash.cloneDeep(defaultFormInfo));
                        setOriginInfo(lodash.cloneDeep(defaultFormInfo));
                        prscDataProvider.current.clearRows();
                        setDataProvider.current.clearRows();
                      }}
                      style={{ width: "100px" }}
                    />
                  </div>
                  <div className="LUX_basic_text" style={{ width: "100%" }}>
                    <LUXSmartComplete
                      value={state.treeKeyword}
                      onChange={handleChange}
                      onSearch={handleSearchPrsc}
                      dataInfo={dataInfo}
                      hintText="검사코드, 검사명, 분류명으로 검색하세요."
                      maxDataCount={999}
                      delayTime={200}
                      onEnterKeyDown={() => {
                        setState({
                          ...state,
                          selectedItem: "",
                          isDisabled: true,
                        });
                        setExmnInfo(lodash.cloneDeep(defaultFormInfo));
                        setOriginInfo(lodash.cloneDeep(defaultFormInfo));
                        prscDataProvider.current.clearRows();
                        setDataProvider.current.clearRows();
                      }}
                    />
                  </div>
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
                    onClick={() => {
                      if (!completed) {
                        setState({
                          ...state,
                          selectedItem: "",
                          isDisabled: true,
                          treeKeyword: "",
                        });
                        setExmnInfo(lodash.cloneDeep(defaultFormInfo));
                        setOriginInfo(lodash.cloneDeep(defaultFormInfo));
                        prscDataProvider.current.clearRows();
                        setDataProvider.current.clearRows();
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="sec_wrap" style={{ height: "330px" }}>
              <div className="sec_content">
                <OBTTreeView
                  key="MSC_090000_TREE"
                  list={
                    state.searchCondition === "1"
                      ? treeList
                      : treeList.filter(
                          list =>
                            (list.parent_code === "EX" && handleExmnClsfCd(list.code) === "L") ||
                            handleExmnClsfCd(list.parent_code) === "L",
                        )
                  }
                  labelText="검사 목록"
                  emptyDataMsg={Message.noData}
                  type={OBTTreeView.Type.default}
                  onMapItem={onMapItem}
                  selectedItem={state.selectedItem}
                  onAfterSelectChange={handleCompare}
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
            <div className="sec_wrap full_size">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 목록</h3>
                  </div>
                </div>
                {exmnInfo.exmn_clsf_cd === "L" && (
                  <div className="right_box">
                    <LUXCheckBox
                      labelText="검사 SET 조회"
                      checked={state.isSet}
                      onCheck={(e, checked) => {
                        if (!lodash.isEqual(exmnInfo, originInfo)) {
                          handleCompare({ item: { lwrn_yn: "N", itemIndex: 0, check: checked } });
                        } else {
                          setState({ ...state, isSet: checked });
                          if (checked) {
                            prscGridView.current.activateColumnFilters("set_yn", checked.toString(), true);
                          } else {
                            prscGridView.current.activateAllColumnFilters("set_yn", false);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="sec_content" ref={prscGrid} />
            </div>
          </div>
          <div className="align_right">
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사정보</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="LUX_basic_tbl">
                  <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                    <colgroup>
                      <col style={{ width: "120px" }} />
                      <col />
                      <col style={{ width: "120px" }} />
                      <col />
                      <col style={{ width: "120px" }} />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row" className="nfont celcnt ">
                          처방코드 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            {state.isDisabled ||
                            !exmnInfo.exmn_rslt_yn ||
                            exmnInfo.exmn_rslt_yn !== "Y" ||
                            exmnInfo.formState !== "Added" ? (
                              <LUXTooltip label={exmnInfo.prsc_cd || ""}>
                                <div className="ellipsis">{exmnInfo.prsc_cd}</div>
                              </LUXTooltip>
                            ) : (
                              <LUXInputField
                                value={exmnInfo.prsc_cd}
                                onChange={(e, value) => setExmnInfo({ ...exmnInfo, prsc_cd: value.toUpperCase() })}
                                englishText
                                numberText
                                fullWidth
                                maxLength={15}
                              />
                            )}
                          </div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          EDI 코드
                        </th>
                        <td className="cellft">
                          <div className="inbx">{exmnInfo.insn_edi_cd}</div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          S/G
                        </th>
                        <td className="cellft">
                          <div className="inbx type_flex">
                            <LUXRadioButtonGroup name="S/G" defaultSelected={exmnInfo.grp_sngl_dvcd}>
                              <LUXRadioButton value="S" labelText="[S]싱글코드" disabled />
                              <LUXRadioButton value="G" labelText="[G]그룹코드" disabled />
                            </LUXRadioButtonGroup>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt ">
                          처방명 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            {state.isDisabled ||
                            !exmnInfo.exmn_rslt_yn ||
                            exmnInfo.exmn_rslt_yn !== "Y" ||
                            exmnInfo.formState !== "Added" ? (
                              <LUXTooltip label={exmnInfo.prsc_nm || ""}>
                                <div className="ellipsis">{exmnInfo.prsc_nm}</div>
                              </LUXTooltip>
                            ) : (
                              <LUXTextField
                                defaultValue={exmnInfo.prsc_nm}
                                maxLength={500}
                                fullWidth
                                onChange={e => setExmnInfo({ ...exmnInfo, prsc_nm: e.target.value })}
                              />
                            )}
                          </div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          처방분류
                        </th>
                        <td className="cellft">
                          <div className="inbx">{exmnInfo.prsc_clsf_nm}</div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          적용기간
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            {exmnInfo.apdy && exmnInfo.endy && (
                              <>
                                {moment(exmnInfo.apdy).format("YYYY-MM-DD")} ~{" "}
                                {moment(exmnInfo.endy).format("YYYY-MM-DD")}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          한글명
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTooltip label={exmnInfo.suga_hnm || ""}>
                              <div className="ellipsis">{exmnInfo.suga_hnm}</div>
                            </LUXTooltip>
                          </div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          한글분류
                        </th>
                        <td className="cellft">
                          <div className="inbx">{exmnInfo.suga_clsf_no}</div>
                        </td>
                        <th scope="row" className="nfont celcnt">
                          영문명
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXTooltip label={exmnInfo.suga_enm || ""} position="left">
                              <div className="ellipsis">{exmnInfo.suga_enm}</div>
                            </LUXTooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="sec_wrap">
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 기본 설정</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="LUX_basic_tbl">
                  <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                    <colgroup>
                      <col style={{ width: "120px" }} />
                      <col />
                      <col style={{ width: "120px" }} />
                      <col />
                      <col style={{ width: "120px" }} />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          검사구분
                        </th>
                        <td className="cellft">
                          <div className="inbx">{exmnInfo.slip_nm}</div>
                        </td>
                        <th scope="row" className="nfont celcnt ">
                          검사실 <span className="sp_lux red_bullet" />
                        </th>
                        <td className="cellft">
                          <div className="inbx">
                            <LUXSelectField
                              checkObjectList
                              selectFieldData={common.exrmDeptList.filter(
                                list => list.value === "" || list.exrm_clsf_cd === exmnInfo.exmn_clsf_cd,
                              )}
                              defaultData={!exmnInfo.exrm_dept_sqno ? "" : exmnInfo.exrm_dept_sqno}
                              handleChoiceData={value => setExmnInfo({ ...exmnInfo, exrm_dept_sqno: value })}
                              disabled={state.isDisabled}
                              listAutoHeight
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="nfont celcnt">
                          메모
                        </th>
                        <td colSpan="5" className="textarea">
                          <div className="inbx">
                            <textarea
                              ref={textAreaRef}
                              disabled={state.isDisabled}
                              className={
                                state.isMemoImgFlag && state.isDisabled
                                  ? "min_memo_disable"
                                  : state.isMemoImgFlag && !state.isDisabled
                                  ? "min_memo"
                                  : "max_memo"
                              }
                              type="text"
                              placeholder="메모를 입력하세요."
                              value={exmnInfo.prsc_nots ?? ""}
                              onChange={e => {
                                if (!state.isDisabled) {
                                  if (e.target.value.length >= 500) {
                                    e.cancel = true;
                                  } else {
                                    setExmnInfo({ ...exmnInfo, prsc_nots: e.target.value });
                                  }
                                }
                              }}
                              onBlur={() => {
                                if (!state.isDisabled) {
                                  setState({ ...state, isMemoImgFlag: true });
                                }
                              }}
                              onFocus={() => {
                                if (!state.isDisabled) {
                                  setState({ ...state, isMemoImgFlag: false });
                                }
                              }}
                            />
                            {!state.isDisabled === true ? (
                              <img src={state.isMemoImgFlag ? iconMaximize : iconMinimize} alt="" />
                            ) : (
                              ""
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 진단검사 설정 */}
            {exmnInfo.exmn_clsf_cd === "L" && (
              <div className="sec_wrap">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">진단검사 설정</h3>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            검체종류
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                selectFieldData={common.spcmList}
                                defaultData={!exmnInfo.spcm_cd_1 ? "" : exmnInfo.spcm_cd_1}
                                handleChoiceData={value => handleSpcmChange(value)}
                                disabled={state.isDisabled}
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            검체용기
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXTextField
                                defaultValue={
                                  !exmnInfo.spcm_cd_1
                                    ? ""
                                    : common.spcmList.find(list => list.value === exmnInfo.spcm_cd_1)?.ctnr_nm
                                }
                                fullWidth
                                disabled
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            검체용량
                          </th>
                          <td className="cellft">
                            <div className="inbx type_flex">
                              <div className="editBox">
                                <LUXNumberField
                                  value={!exmnInfo.spcm_need_vol_1 ? "" : exmnInfo.spcm_need_vol_1}
                                  onChange={(e, value) =>
                                    setExmnInfo({
                                      ...exmnInfo,
                                      spcm_need_vol_1: Number.isNaN(value) === true ? "" : value,
                                    })
                                  }
                                  maxLength={11}
                                  decimal
                                  decimalLength={1}
                                  disabled={state.isDisabled || !exmnInfo.spcm_cd_1 || exmnInfo.spcm_cd_1 === ""}
                                  style={{ width: "60px" }}
                                />
                                <LUXSelectField
                                  checkObjectList
                                  listAutoHeight
                                  selectFieldData={common.volUncdList}
                                  defaultData={!exmnInfo.spcm_dosg_unit_1 ? "" : exmnInfo.spcm_dosg_unit_1}
                                  handleChoiceData={value => setExmnInfo({ ...exmnInfo, spcm_dosg_unit_1: value })}
                                  disabled={state.isDisabled || !exmnInfo.spcm_cd_1 || exmnInfo.spcm_cd_1 === ""}
                                  style={{ width: "100px" }}
                                />
                                <LUXSelectField
                                  checkObjectList
                                  listAutoHeight
                                  selectFieldData={common.fixVolList}
                                  defaultData={!exmnInfo.fix_vol_dvsn ? "" : exmnInfo.fix_vol_dvsn}
                                  handleChoiceData={value => setExmnInfo({ ...exmnInfo, fix_vol_dvsn: value })}
                                  disabled={state.isDisabled || !exmnInfo.spcm_cd_1 || exmnInfo.spcm_cd_1 === ""}
                                  style={{ width: "100px" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            위탁여부
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXRadioButtonGroup name="OutsourcingStatus" defaultSelected={exmnInfo.entd_exmn_yn}>
                                <LUXRadioButton value="Y" labelText="예" disabled />
                                <LUXRadioButton value="N" labelText="아니요" disabled />
                              </LUXRadioButtonGroup>
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            위탁기관
                          </th>
                          <td className="cellft">
                            <div className="inbx">{exmnInfo.ents_exmn_inst_nm}</div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            검사소요기간
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                selectFieldData={common.needTimeList}
                                defaultData={!exmnInfo.exmn_need_time ? "" : exmnInfo.exmn_need_time}
                                handleChoiceData={value => setExmnInfo({ ...exmnInfo, exmn_need_time: value })}
                                disabled={state.isDisabled}
                                listAutoHeight
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            결과유형
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                listAutoHeight
                                selectFieldData={common.rsltTypeList}
                                defaultData={!exmnInfo.exmn_rslt_tycd ? "선택하세요" : exmnInfo.exmn_rslt_tycd}
                                handleChoiceData={value => {
                                  setState({
                                    ...state,
                                    isSpcmInputDisabled:
                                      !exmnInfo.spcm_cd_1 ||
                                      exmnInfo.spcm_cd_1 === "" ||
                                      exmnInfo.formState === "Added",
                                  });
                                  setExmnInfo({ ...exmnInfo, exmn_rslt_tycd: value });
                                }}
                                disabled={state.isDisabled}
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            단위
                          </th>
                          <td className="cellft">
                            <div className="inbx type_flex">
                              <div>
                                {!exmnInfo.exmn_rslt_uncd
                                  ? ""
                                  : common.rsltUncdList.find(list => list.value === exmnInfo.exmn_rslt_uncd)?.text}
                              </div>
                              <LUXButton
                                label="단위 설정"
                                onClick={() => setState({ ...state, isUnitOpen: true })}
                                disabled={state.isSpcmInputDisabled}
                                style={{ marginLeft: "auto" }}
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            유효숫자
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                selectFieldData={common.dcprNodgList}
                                defaultData={!exmnInfo.dcpr_nodg ? "" : exmnInfo.dcpr_nodg}
                                handleChoiceData={value => setExmnInfo({ ...exmnInfo, dcpr_nodg: value })}
                                disabled={state.isDisabled}
                                listAutoHeight
                              />
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            참고치
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXButton
                                label="참고치 설정"
                                // type="small"
                                onClick={() =>
                                  setRefCvr({
                                    isRefCvrOpen: true,
                                    refCvrType: "R",
                                    refReadOnly: false,
                                    prscCd: exmnInfo.prsc_cd,
                                  })
                                }
                                style={{ width: "100%" }}
                                disabled={state.isSpcmInputDisabled}
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            CVR
                          </th>
                          <td className="cellft" colSpan="3">
                            <div className="inbx">
                              <LUXButton
                                label="CVR 설정"
                                // type="small"
                                onClick={() =>
                                  setRefCvr({
                                    isRefCvrOpen: true,
                                    refCvrType: "C",
                                    refReadOnly: false,
                                    prscCd: exmnInfo.prsc_cd,
                                  })
                                }
                                style={{ width: "214px" }}
                                disabled={state.isSpcmInputDisabled}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 기능검사 설정 */}
            {exmnInfo.exmn_clsf_cd === "F" && (
              <div className="sec_wrap">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">기능검사 설정</h3>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            동의서 필요 유무
                          </th>
                          <td className="cellft" colSpan={5}>
                            <div className="inbx ">
                              <div className="editBox">
                                <LUXCheckBox
                                  labelText="동의서 필요"
                                  checked={!(!exmnInfo.wrcn_need_yn || exmnInfo.wrcn_need_yn === "N")}
                                  onCheck={(e, checked) =>
                                    setExmnInfo({
                                      ...exmnInfo,
                                      wrcn_need_yn: checked ? "Y" : originInfo.wrcn_need_yn === null ? null : "N",
                                      wrcn_cd: !checked ? null : exmnInfo.wrcn_cd,
                                    })
                                  }
                                />
                                <LUXSelectField
                                  checkObjectList
                                  selectFieldData={common.wrcnList}
                                  defaultData={!exmnInfo.wrcn_cd ? "" : exmnInfo.wrcn_cd}
                                  handleChoiceData={value => setExmnInfo({ ...exmnInfo, wrcn_cd: value })}
                                  disabled={state.isDisabled || exmnInfo.wrcn_need_yn !== "Y"}
                                  listAutoHeight
                                  styple={{ width: "200px !important" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 내시경검사 설정 */}
            {exmnInfo.exmn_clsf_cd === "E" && (
              <div className="sec_wrap">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">내시경검사 설정</h3>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont celcnt ">
                            치료부위 <span className="sp_lux red_bullet" />
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                selectFieldData={common.mdtrSiteList}
                                defaultData={!exmnInfo.mdtr_site_cd ? "" : exmnInfo.mdtr_site_cd}
                                handleChoiceData={value => setExmnInfo({ ...exmnInfo, mdtr_site_cd: value })}
                                disabled={state.isDisabled}
                                listAutoHeight
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 영상검사 설정 */}
            {exmnInfo.exmn_clsf_cd === "R" && (
              <div className="sec_wrap">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">영상검사 설정</h3>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont celcnt ">
                            Modality <span className="sp_lux red_bullet" />
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXSelectField
                                checkObjectList
                                selectFieldData={common.mdltDvcdList}
                                defaultData={!exmnInfo.mdlt_dvcd ? "" : exmnInfo.mdlt_dvcd}
                                handleChoiceData={value => setExmnInfo({ ...exmnInfo, mdlt_dvcd: value })}
                                disabled={state.isDisabled}
                                listAutoHeight
                              />
                            </div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            촬영부위
                          </th>
                          <td className="cellft">
                            <div className="inbx">{exmnInfo.phtg_site_dvnm}</div>
                          </td>
                          <th scope="row" className="nfont celcnt">
                            편측양측
                          </th>
                          <td className="cellft">
                            <div className="inbx">{exmnInfo.onsd_btsd_dvnm}</div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            조영제 사용 유무
                          </th>
                          <td className="cellft" colSpan={5}>
                            <div className="inbx">
                              <LUXCheckBox
                                labelText="조영제 사용"
                                checked={
                                  !(
                                    !exmnInfo.cnmd_use_yn ||
                                    exmnInfo.cnmd_use_yn === "" ||
                                    exmnInfo.cnmd_use_yn === "N"
                                  )
                                }
                                onCheck={(e, checked) =>
                                  setExmnInfo({
                                    ...exmnInfo,
                                    cnmd_use_yn: checked ? "Y" : originInfo.cnmd_use_yn === null ? null : "N",
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 물리치료 설정 */}
            {exmnInfo.exmn_clsf_cd === "P" && (
              <div className="sec_wrap">
                <div className="sec_header">
                  <div className="left_box">
                    <div className="sec_title">
                      <svg viewBox="0 0 24 24" className="ico_svg">
                        <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                      </svg>
                      <h3 className="title">물리치료 설정</h3>
                    </div>
                  </div>
                </div>
                <div className="sec_content">
                  <div className="LUX_basic_tbl">
                    <table className="tblarea2 tblarea2_v2 tblarea2_v3">
                      <colgroup>
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                        <col style={{ width: "120px" }} />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <th scope="row" className="nfont celcnt">
                            치료결과 보고 여부
                          </th>
                          <td className="cellft">
                            <div className="inbx">
                              <LUXCheckBox
                                labelText="치료결과 보고필요"
                                checked={!(!exmnInfo.exmn_rslt_rptg_yn || exmnInfo.exmn_rslt_rptg_yn === "N")}
                                onCheck={(e, checked) =>
                                  setExmnInfo({
                                    ...exmnInfo,
                                    exmn_rslt_rptg_yn: checked
                                      ? "Y"
                                      : originInfo.exmn_rslt_rptg_yn === null
                                      ? null
                                      : "N",
                                  })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 진단검사의 경우 */}
            <div className={`sec_wrap full_size add_footer ${exmnInfo.exmn_clsf_cd === "L" ? "" : "none"}`}>
              <div className="sec_header">
                <div className="left_box">
                  <div className="sec_title">
                    <svg viewBox="0 0 24 24" className="ico_svg">
                      <path d="M18.923,22H5.077c-0.85,0-1.538-0.688-1.538-1.538V3.538C3.538,2.688,4.227,2,5.077,2h13.846 c0.85,0,1.538,0.688,1.538,1.538v16.923C20.462,21.312,19.773,22,18.923,22z M7.385,15.846c-0.424,0-0.769,0.346-0.769,0.769 s0.346,0.769,0.769,0.769H12c0.424,0,0.769-0.346,0.769-0.769S12.424,15.846,12,15.846H7.385z M7.385,11.24 c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231c0.424,0,0.769-0.346,0.769-0.769 c0-0.424-0.346-0.769-0.769-0.769H7.385z M7.385,6.624c-0.424,0-0.769,0.346-0.769,0.769c0,0.424,0.346,0.769,0.769,0.769h9.231 c0.424,0,0.769-0.346,0.769-0.769c0-0.424-0.346-0.769-0.769-0.769H7.385z" />
                    </svg>
                    <h3 className="title">검사 SET 정보</h3>
                  </div>
                </div>
              </div>
              <div className="sec_content">
                <div className="grid_box" ref={setGrid} />
                <LUXSmartComplete
                  value={state.isDisabled || exmnInfo.exmn_rslt_yn === "Y" ? "" : state.setKeyword}
                  onChange={handleExmnChange}
                  onSearch={handleExmnSearch}
                  dataInfo={exmnDataInfo}
                  hintText="검사코드, 검사명으로 검색하세요."
                  disabled={exmnInfo.exmn_rslt_yn === "Y" || state.isDisabled}
                  maxDataCount={999}
                  delayTime={200}
                />
              </div>
            </div>

            <div className="sec_wrap bg_none">
              <div className="sec_footer">
                <div className="option_box">
                  {handleExmnClsfCd(state.selectedItem) === "L" && (
                    <LUXButton
                      label="신규"
                      blue={
                        !(
                          state.selectedItem === "" ||
                          treeList.find(list => list.code === state.selectedItem)?.lwrn_yn === "Y"
                        )
                      }
                      onClick={handleNew}
                      disabled={
                        state.selectedItem === "" ||
                        treeList.find(list => list.code === state.selectedItem)?.lwrn_yn === "Y"
                      }
                    />
                  )}
                  <LUXButton
                    label="취소"
                    onClick={handleCancle}
                    disabled={state.isDisabled || lodash.isEqual(exmnInfo, originInfo)}
                  />
                  {handleExmnClsfCd(state.selectedItem) === "L" && (
                    <LUXButton
                      label="삭제"
                      onClick={handleDelete}
                      disabled={state.isDisabled || exmnInfo.exmn_rslt_yn !== "Y" || exmnInfo.formState === "Added"}
                    />
                  )}
                  <LUXButton
                    label="저장"
                    onClick={() => handleSave(false)}
                    blue={!(state.isDisabled || lodash.isEqual(exmnInfo, originInfo))}
                    disabled={state.isDisabled || lodash.isEqual(exmnInfo, originInfo)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 참고치/CVR 설정 */}
      <MSC_090100_P01
        open={refCvr.isRefCvrOpen}
        type={refCvr.refCvrType}
        prscCd={refCvr.prscCd}
        onClose={() => setRefCvr({ ...refCvr, isRefCvrOpen: false })}
        readOnly={refCvr.refReadOnly}
      />

      {/* 단위 설정 */}
      <MSC_090100_P02
        open={state.isUnitOpen}
        prscCd={exmnInfo.prsc_cd}
        onClose={() => setState({ ...state, isUnitOpen: false })}
        onSave={uncd => {
          setExmnInfo({ ...exmnInfo, exmn_rslt_uncd: uncd });
          setOriginInfo({ ...originInfo, exmn_rslt_uncd: uncd });
          setState({ ...state, isUnitOpen: false });
        }}
      />

      {withPortal(
        <LUXSnackbar
          open={snack.open}
          message={snack.message}
          type={snack.type}
          onRequestClose={() => setSnack({ ...snack, open: false })}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXConfirm
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          useIcon
          useIconType={confirm.type}
          confirmButton={() => {
            confirm.onConfirm();
            setConfirm({ ...confirm, open: false });
          }}
          cancelButton={() => {
            confirm.onCancle();
            setConfirm({ ...confirm, open: false });
          }}
          onClose={() => {
            setConfirm({ ...confirm, open: false });
          }}
        />,
        "dialog",
      )}
      {withPortal(
        <LUXAlert
          open={alert.open}
          title={alert.title}
          message={alert.message}
          useIcon
          useIconType={alert.type}
          confirmButton={() => setAlert({ ...alert, open: false })}
          onClose={() => setAlert({ ...alert, open: false })}
        />,
        "dialog",
      )}
    </div>
  );
}

export default WithWrapper(MSC_090100);
