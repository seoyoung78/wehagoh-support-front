import { ajax } from "common-util";
import { globals } from "global";
import { getCookie } from "services/utils";

export const uploadApi = (url, parameters) => {
  const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
  return ajax
    .post(`${globals.backendUrl_local}${url}?cno=${cno}`, parameters || {}, {
      contextType: "multipart/form-data",
    })
    .then(res => JSON.parse(res))
    .catch(() => {
      throw new Error("업로드 서버 응답 오류");
    });
};

export const downloadApi = fileName => {
  const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
  const signatureUrl = `${globals.common_storage}/download/signature?cno=${cno}&fileName=${fileName}`;

  return ajax.get(signatureUrl).then(res => {
    const { resultData } = JSON.parse(res);

    if (resultData) {
      const { url, auth, date } = resultData;

      return fetch(url, {
        method: "GET",
        headers: {
          Authorization: auth,
          "x-amz-date": date,
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("시그니처 다운로드 서버 응답 오류 : ", response);
          }
          return response.blob();
        })
        .then(blob => blob)
        .catch(error => {
          throw new Error("시그니처 다운로드 서버 응답 오류 : ", error);
        });
    }
  });
};
