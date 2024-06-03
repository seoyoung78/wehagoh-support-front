import { globals } from "global";
import { setLocalStorageItem } from "./localStorage";

export const wrcnOpen = (wrcnCode = "", data = "") => {
  const key = setLocalStorageItem(data);
  const conditionUrl = wrcnCode === "EMR_V_T0038" ? "&isIssue=true" : "";
  const url = `${globals.wrcn_url}${conditionUrl}&key=${key}&popupCode=${wrcnCode}`;

  const intWidth = 1000;
  const intHeight = window.screen.height - 200;
  const intLeft = window.screen.width / 2 - intWidth / 2;
  const intTop = window.screen.height / 2 - intHeight / 2 - 40;
  const popOption = "width=" + intWidth + ",height=" + intHeight + ",left=" + intLeft + ",top=" + intTop;

  window.open(url, "_blank", popOption);
};
