/**
 * runOnExceedPage 페이지를 넘어가면 수행.
 *
 * @author khgkjg12 강현구A
 *
 * 현재 랜더링된 화면을 기준으로 1 페이지부터 차례로 페이지의 자식 컴포넌트들이 페이지 영역을 넘어가는지 체크하고, 넘어가면 onExceed를 수행하고 종료.
 * onExceed에서 자식 컴포넌트들의 크기를 조정하는 로직을 수행하면 된다.
 * 자식 엘리먼트의 크기가 바뀌는 이벤트에 useEffect를 통해 이 메소드를 트리거 해주면 된다.
 *
 * @param {*} elem 페이지들의 부모 엘리먼트.
 * @param {*} onExceed onExceed(i) 페이지에서 페딩을 제외한 영역을 자식 엘리먼트들의 높이 합이 넘어갔을때 수행. 파라미터로 넘어간 페이지번호를 이용해, 자식 컴포넌트의 크기를 조정한는 로직을 수행하면 된다.
 */
export default function runOnExceedPage(elem, padding, onExceed) {
  const pages = elem.childNodes;
  for (let i = 0; i < pages.length; i++) {
    let innerHeight = 0;
    const children = pages[i].childNodes;
    for (const child of children) {
      innerHeight += child.scrollHeight;
    }
    if (innerHeight + padding > pages[i].offsetHeight) {
      onExceed(i);
      return;
    }
  }
}
