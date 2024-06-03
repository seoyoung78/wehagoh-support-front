/**
 * @author 강현구A
 * @param {*} bgColor 배경 색상
 * @param {*} txtColor 텍스트 색상
 * @param {*} width 너비
 * @param {*} height 높이
 * @returns 배지 이미지
 */
export default function (text, bgColor, txtColor = "#ffffff", width = 60, height = 18, fontSize = 11) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const radius = height / 2;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = bgColor;

    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.arcTo(width, 0, width, height, radius);
    ctx.arcTo(width, height, 0, height, radius);
    ctx.arcTo(0, height, 0, 0, radius);
    ctx.arcTo(0, 0, width, 0, radius);
    ctx.closePath();
    ctx.fill();

    // 텍스트 렌더링
    ctx.fillStyle = txtColor;
    ctx.font = `600 ${fontSize}px douzone`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  }

  return canvas.toDataURL();
}
