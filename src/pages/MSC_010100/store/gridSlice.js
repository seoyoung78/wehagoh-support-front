import getBadgeSvg from "services/utils/getBadgeSvg";

const defaultExmnBtn = [
  {
    name: "전체",
    color: "#FFFFFF",
    code: "0",
    count: 0,
  },
  {
    name: "검사대기",
    color: "#F0C325",
    code: "B",
    count: 0,
  },
  {
    name: "진행중",
    color: "#46A3F0",
    code: "C",
    count: 0,
  },
  {
    name: "검사완료",
    color: "#20C997",
    code: "E",
    count: 0,
  },
  {
    name: "중간보고",
    color: "#B79FCF",
    code: "M",
    count: 0,
  },
  {
    name: "보고완료",
    color: "#919191",
    code: "N",
    count: 0,
  },
];
const imgnExmnBtn = [
  {
    name: "전체",
    color: "#FFFFFF",
    code: "0",
    count: 0,
  },
  {
    name: "검사대기",
    color: "#F0C325",
    code: "B",
    count: 0,
  },
  {
    name: "진행중",
    color: "#46A3F0",
    code: "C",
    count: 0,
  },
  {
    name: "판독중",
    color: "#B79FCF",
    code: "M",
    count: 0,
  },
  {
    name: "판독완료",
    color: "#919191",
    code: "O",
    count: 0,
  },
];

const defaultExmnState = {
  btnSet: defaultExmnBtn,
  btnCmcdList: ["0", "B", "C", "E", "M", "N"],
  button: "0",
  realgrid: {
    provider: null,
    gridView: null,
  },
  data: [],
};

const imgnExmnState = {
  btnSet: imgnExmnBtn,
  btnCmcdList: ["0", "B", "C", "E", "M", "O"],
  button: "0",
  realgrid: {
    provider: null,
    gridView: null,
  },
  data: [],
};

export const gridSlice = (set, get) => ({
  exmnState: {
    L: defaultExmnState,
    F: defaultExmnState,
    R: imgnExmnState,
    E: defaultExmnState,
  },
  initGrid: (key, provider, gridView) => {
    set(state => ({
      ...state,
      grid: {
        ...state.grid,
        exmnState: {
          ...state.grid.exmnState,
          [key]: {
            ...state.grid.exmnState[key],
            realgrid: {
              provider,
              gridView,
            },
          },
        },
      },
    }));
  },
  setBtnState: (key, value) => {
    Promise.resolve(
      set(state => ({
        ...state,
        grid: {
          ...state.grid,
          exmnState: {
            ...state.grid.exmnState,
            [key]: {
              ...state.grid.exmnState[key],
              button: value,
            },
          },
        },
      })),
    ).then(() => get().grid.setRows());
  },
  setRows: () => {
    Object.values(get().grid?.exmnState).forEach(exmnState => {
      exmnState.realgrid.provider?.setRows(
        (exmnState.data ?? []).filter(
          item => exmnState.button === 0 || exmnState.button === "0" || item.prsc_prgr_stat_cd === exmnState.button,
        ),
      );
      exmnState.realgrid.gridView?.setColumn({
        ...exmnState.realgrid.gridView.columnByName("prsc_prgr_stat_cd"),
        filterIconVisible: false,
        values: exmnState.btnSet.map(item => item.code),
        labels: exmnState.btnSet.map(item => item.name),
        renderer: {
          type: "image",
          imageCallback: (grid, dataCell) => {
            const codeObj = exmnState.btnSet.find(item => item.code === dataCell.value);
            return getBadgeSvg(codeObj?.name ?? "진행중", codeObj?.color ?? "#46A3F0");
          },
        },
      });
    });
  },
  initBtnState: () => {
    set(state => ({
      ...state,
      grid: {
        ...state.grid,
        exmnState: Object.entries(state.grid.exmnState).reduce((acc, [key, value]) => {
          acc[key] = {
            ...value,
            button: "0",
          };
          return acc;
        }, {}),
      },
    }));
  },
});
