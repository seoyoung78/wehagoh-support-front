import { insertElectronicSignature } from "cliniccommon-ui";
import moment from "moment";

export const signApi = async parameters => {
  // 기본 파라미터
  const basicParams = {
    sign_dt: moment().format("YYYY-MM-DD HH:mm:ss"), // 작성일시
    sign_id: document.getElementById("h_portal_id").value, // 작성자 ID
    sign_nm: document.getElementById("h_user_name").value, // 작성자
  };

  let signParams;

  if (Array.isArray(parameters)) {
    // 파라미터가 배열인 경우: 각 항목에 기본 파라미터를 추가
    signParams = parameters.map(item => ({ ...item, ...basicParams }));
  } else {
    // 파라미터가 객체인 경우: 객체에 기본 파라미터를 추가
    signParams = { ...parameters, ...basicParams };
  }

  const result = await insertElectronicSignature(signParams);
  return result;
};
