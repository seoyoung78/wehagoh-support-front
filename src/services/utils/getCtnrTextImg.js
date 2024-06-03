/**
 * @name getCtnrTextImg 용기텍스트이미지생성기
 * @param {*} label 용기 label
 * @param {*} color 라벨 색상
 * @param {*} width Cell 너비
 * @param {*} height Cell높이 default 16
 * @param {*} fontHeight font 크기 default 12
 * @returns 용기 텍스트 이미지
 * @author 강현구A
 */
export default function (label, color, width, height = 16, fontHeight = 12) {
  const canvas = document.createElement("canvas");
  canvas.width = width; //canvas의 너비
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    if (color !== "" && color !== null) {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = "#000000";
    }
    ctx.font = `normal ${fontHeight}px NotoSansCJKkr`;
    ctx.arc(width - (width - 12), height / 2, 2.5, 0, 2 * Math.PI);
    ctx.textBaseline = "top";
    ctx.textAlign = "start";
    ctx.fillText(label, width - (width - 18), (height - fontHeight) / 2 + 1);
    ctx.fill();
  }
  return canvas.toDataURL();
}
