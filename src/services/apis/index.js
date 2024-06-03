import { ajax } from "common-util";
import { globals } from "global";
import { getCookie } from "services/utils";

export default function callApi(url, parameters) {
  const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
  return ajax
    .post(`${globals.backendUrl_local}${url}?cno=${cno}`, parameters || {}, {
      contextType: "application/json",
    })
    .then(res => JSON.parse(res));
}
