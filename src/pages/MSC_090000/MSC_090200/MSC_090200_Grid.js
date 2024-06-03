const mstFields = [
  { fieldName: "spcm_cd", dataType: "text" },
  { fieldName: "spcm_use_yn", dataType: "text" },
  { fieldName: "spcm_labl_nm", dataType: "text" },
  { fieldName: "spcm_nm", dataType: "text" },
  { fieldName: "spcm_expl", dataType: "text" },
  { fieldName: "ctnr_cd", dataType: "text" },
  { fieldName: "ctnr_labl_nm", dataType: "text" },
  { fieldName: "ctnr_nm", dataType: "text" },
  { fieldName: "ctnr_colr", dataType: "text" },
  { fieldName: "ctnr_use_yn", dataType: "text" },
];

const mstColumns = [
  {
    name: "spcm_cd",
    fieldName: "spcm_cd",
    header: "검체코드",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 40,
  },
  { name: "spcm_use_yn", fieldName: "spcm_use_yn", header: "사용여부", width: 40 },
  {
    name: "spcm_labl_nm",
    fieldName: "spcm_labl_nm",
    header: "검체 라벨명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 80,
  },
  {
    name: "spcm_nm",
    fieldName: "spcm_nm",
    header: "검체명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 80,
  },
  {
    name: "spcm_expl",
    fieldName: "spcm_expl",
    header: "검체설명",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 150,
  },
  {
    name: "ctnr_cd",
    fieldName: "ctnr_cd",
    header: "용기코드",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 40,
    // styleCallback: (grid, dataCell) => {
    //   if (grid.getValue(dataCell.index.itemIndex, "ctnr_use_yn") === "N") {
    //     return { styleName: "line rg-left-column" };
    //   }
    // },
  },
  {
    name: "ctnr_labl_nm",
    fieldName: "ctnr_labl_nm",
    header: "용기라벨명",
    renderer: { showTooltip: true },
    width: 80,
    // styleCallback: (grid, dataCell) => {
    //   if (grid.getValue(dataCell.index.itemIndex, "ctnr_use_yn") === "N") {
    //     return { styleName: "line rg-left-column" };
    //   }
    // },
    styleName: "rg-left-column",
  },
  {
    name: "ctnr_nm",
    fieldName: "ctnr_nm",
    header: "용기명",
    renderer: { showTooltip: true },
    width: 100,
    // styleCallback: (grid, dataCell) => {
    //   if (grid.getValue(dataCell.index.itemIndex, "ctnr_use_yn") === "N") {
    //     return { styleName: "line rg-left-column" };
    //   }
    // },
    styleName: "rg-left-column",
  },
];

const popFields = [
  { fieldName: "value", dataType: "text" },
  { fieldName: "text", dataType: "text" },
  { fieldName: "ctnr_nm", dataType: "text" },
  { fieldName: "ctnr_colr", dataType: "image" },
  { fieldName: "use_yn", dataType: "text" },
];

const popColumns = [
  {
    name: "value",
    fieldName: "value",
    header: "용기코드",
    renderer: { showTooltip: true },
    styleName: "rg-left-column",
    width: 30,
  },
  {
    name: "text",
    fieldName: "text",
    header: "용기라벨명",
    renderer: { showTooltip: true },
    width: 70,
    styleName: "rg-left-column",
  },
  {
    name: "ctnr_nm",
    fieldName: "ctnr_nm",
    header: "용기명",
    renderer: { showTooltip: true },
    width: 100,
    styleName: "rg-left-column",
  },
  {
    name: "ctnr_colr",
    fieldName: "ctnr_colr",
    header: "용기색상",
    width: 30,
    renderer: {
      type: "image",
      imageCallback: (grid, cell) => {
        const canvas = document.createElement("canvas");
        if (cell.value) {
          const width = 16;
          const height = 16;
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = cell.value;
            ctx.fillRect(0, 0, width, height);
          }
        }
        return canvas.toDataURL();
      },
    },
  },
  {
    name: "use_yn",
    fieldName: "use_yn",
    header: "사용여부",
    width: 30,
    editable: false,
    renderer: {
      type: "check",
      trueValues: "Y",
      falseValues: "N",
    },
  },
];

export { mstFields, mstColumns, popFields, popColumns };
