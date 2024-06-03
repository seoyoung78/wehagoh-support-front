import { createPortal } from "react-dom";
 
const withPortal = (component, id) => {
  const node = document.getElementById(id);
   
  if(node === null) {
    throw new Error("withPortal: id가" + id + "인 노드를 찾을 수 없습니다.");
  } else {
    return createPortal(component, document.getElementById(id));
  }
}
 
export default withPortal;