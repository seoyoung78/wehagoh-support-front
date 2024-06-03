import { LocalDataProvider, GridView } from "realgrid";
import getBadgeSvg from "services/utils/getBadgeSvg";

/**
 * RealGridUtil
 * @description 리얼그리드 종속 서브루틴 모음집.
 * @author khgkjg12 강현구A
 */

/**
 * 리얼그리드 onDataLoadComplated 콜백 append 서브루틴.
 * @author khgkjg12 강현구A
 *
 * @description 리얼그리드 GridBase 객체의 __onDataLoadComplated__ 속성에 하나만 덮어쓰기로 등록하던 기존 방식 대신, __여러 콜백을 계속해서 추가__ 해서 사용할수 있게함.
 * 기존 콜백이 먼저 실행되고 추가된 콜백이 나중에 수행됨.
 * - 주의 : 설정 이후, __onDataLoadComplated 속성을 덮어쓰면 설정이 초기화 된다.__
 *
 * @param {*} gridView 대상 GridView 객체
 * @param {*} onDataLoadComplated 추가할 콜백 함수
 */
export function appendOnDataLoadComplated(gridView, onDataLoadComplated) {
  const prevCallback = gridView.onDataLoadComplated;
  if (prevCallback) {
    gridView.onDataLoadComplated = (grid, getPrevCallback) => {
      if (getPrevCallback) return prevCallback;
      prevCallback(grid);
      onDataLoadComplated(grid);
    };
  } else {
    gridView.onDataLoadComplated = (grid, getPrevCallback) => {
      if (getPrevCallback) return;
      onDataLoadComplated(grid);
    };
  }
}

/**
 * isLastOnDataLoadComplated 이것이 최후의 OnDataLoadComplated 콜백 입니까?
 * @author khgkjg12 강현구A
 * @description {@link appendOnDataLoadComplated}와 {@link removeOnDataLoadComplated}를 통해 추가-삭제된 후, 오직 하나의 콜백만이 남았는지를 반환하는 함수.
 * @param {*} gridView 최후의 콜백인지 확인할 대상 그리드
 * @returns 마지막 남은 콜백 여부.
 */
export function isLastOnDataLoadComplated(gridView) {
  if (gridView.onDataLoadComplated(undefined, true)) {
    return false;
  }
  return true;
}

/**
 * removeOnDataLoadComplated append된 OnDataLoadComplated 콜백들을 뒤에서 하나 제거.
 * @author khgkjg12 강현구A
 * @description {@link appendOnDataLoadComplated}로 추가했던 콜백을 뒤에서부터 제거하고 싶을 때 사용.
 * @param {*} gridView 콜백 제거 대상 그리드
 */
export function removeOnDataLoadComplated(gridView) {
  const prevCallback = gridView.onDataLoadComplated(undefined, true);
  gridView.onDataLoadComplated = prevCallback;
}

/**
 * 리얼그리드 EmptySet 설정 서브루틴
 *
 * @author khgkjg12 강현구A
 *
 * @description 입력받은 리얼그리드 요소에 이미지가 포함된 EmptySet을 설정.
 * - 주의: 설정 이후, __showEmptyMessage, emptyMessage, onDataLoadComplated__ 덮어쓰기 금지. __onDataLoadComplated__ 의 경우 {@link appendOnDataLoadComplated} 활용.
 * - 참고 : [데이터 없는 경우 이미지 넣기. 강재성 주임연구원](http://wiki.duzon.com:8080/pages/viewpage.action?pageId=212636229).
 *
 * @param gridView 설정할 리얼그리드 객체.
 * @param gridElement 설정할 리얼그리드의 HTML Element.
 * @param emptySetMessage emptySet에 포함시킬 메시지.
 */
export function configEmptySet(gridView, gridElement, emptySetMessage) {
  gridView.setDisplayOptions({
    showEmptyMessage: true,
    emptyMessage: "",
  });
  appendOnDataLoadComplated(gridView, grid => {
    if (grid.getItemCount() < 1) {
      const emptyGridElement = gridElement.querySelector(".rg-empty-grid");
      if (emptyGridElement) {
        if (emptyGridElement.firstChild) emptyGridElement.removeChild(emptyGridElement.firstChild);
        if (!emptyGridElement.querySelector(".empty_box")) {
          const emptyHTML = `<div class="empty_box" >
                             <div class="inbx">
                               <div class="empty_img type1"></div>
                               <div class="empty_msg">
                                 <p>${emptySetMessage}</p>
                               </div>
                             </div>
                           </div>`;

          emptyGridElement.insertAdjacentHTML("beforeend", emptyHTML);
        }
      }
    }
  });
}

/**
 * 그리드 사용자 옵션 설정 localstorage에 저장 값 가져오기
 * @param {*} gridView 설정할 리얼그리드 객체
 * @param {*} key 저장할 localstorage key 값
 * @param {*} columns 그리드 컬럼
 * @param {*} option 지정할 옵션 명
 */
export function getUserGridColumnOption(gridView, key, columns, option) {
  try {
    let userOption = JSON.parse(localStorage.getItem(key));
    if (userOption) {
      Object.keys(userOption).map(column => {
        gridView.columnByName(column)[option] = userOption[column][option];
      });
    } else {
      userOption = {};
      columns.map(column => {
        userOption = {
          ...userOption,
          [column.name]: {
            [option]: gridView.columnByName(column.name)[option] ?? true,
          },
        };
      });
      localStorage.setItem(key, JSON.stringify(userOption));
    }
  } catch (error) {
    localStorage.removeItem(key);
    console.error("gridOption localStorage 오류:", error);
  }
}

/**
 * 그리도 사용자 옵션 설정 localstorage에 저장
 * @param {*} key 저장할 localstorage key 값
 * @param {*} columnName 변경할 그리드 컬럼명
 * @param {*} option 변경할 옵션 설정
 * @param {*} value 변경할 값
 */
export function setUserGridColumnOption(key, columnName, option, value) {
  let userOption = JSON.parse(localStorage.getItem(key));
  userOption = {
    ...userOption,
    [columnName]: {
      [option]: value,
    },
  };
  localStorage.setItem(key, JSON.stringify(userOption));
}

export const initializeGrid = (gridContainer, fields, columns, emptyMsg, options = {}) => {
  const gridView = new GridView(gridContainer);

  // 데이터 소스 설정
  const dataProvider = new LocalDataProvider(true);
  gridView.setDataSource(dataProvider);
  dataProvider.setFields(fields);
  dataProvider.setRows([]);

  // 컬럼 설정
  gridView.setColumns(columns);

  // 기본 설정
  const defaultOptions = {
    checkBar: {
      visible: false,
    },
    rowIndicator: {
      visible: false,
    },
    pasteOptions: {
      enabled: false,
    },
    display: {
      fitStyle: "evenFill",
      selectionStyle: "rows",
    },
    stateBar: {
      visible: false,
    },
    footer: {
      visible: false,
    },
    edit: { editable: false },
    copy: { copyDisplayText: true, singleMode: true },
  };

  const finalOptions = { ...defaultOptions, ...options };
  configEmptySet(gridView, gridContainer, emptyMsg);
  gridView.setOptions(finalOptions);

  return { dataProvider, gridView };
};

// 그리드 및 데이터 리소스 해제
export const destroyGrid = (dataProvider, gridView) => {
  dataProvider.clearRows();
  gridView.destroy();
  dataProvider.destroy();
};

// 검사 상태 그리드 이미지 콜백 설정 함수
export const configureGridImageCallback = (gridView, list, showDcLabel = false, showReportCompleted = false) => {
  const fetchImageByCode = (grid, dataCell, list) => {
    const {
      value,
      index: { _itemIndex },
    } = dataCell;

    const matchedItem = list.find(state => state.code === value);

    if (matchedItem) {
      let { name, color } = matchedItem;
      const values = grid.getValues(_itemIndex);

      if (showDcLabel && values.dc_rqst_yn === "Y") {
        name = "D/C요청";
      }

      if (showReportCompleted && values.prsc_prgr_stat_cd === "N" && values.mdtr_rslt_rptg_yn !== "Y") {
        name = "최종완료";
      }

      return getBadgeSvg(name, color);
    }
  };

  const colName = "prsc_prgr_stat_cd";
  const column = gridView.columnByName(colName);
  column.values = list.map(({ code }) => code);
  column.labels = list.map(({ name }) => name);
  column.renderer = {
    type: "image",
    imageCallback: (grid, dataCell) => fetchImageByCode(grid, dataCell, list),
  };
};
