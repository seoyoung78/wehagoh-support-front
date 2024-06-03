import { date } from "common-util/utils";
import callApi from "services/apis";

export const getImageBadgeDataApi = async (requestLists, validCode = "") => {
  try {
    const params = {
      ...requestLists,
      date: date.getyyyymmdd(new Date()),
    };
    const { resultData } = await callApi("/common/selectCommonCode", params);
    const updatedStateList = resultData.map(value => ({
      code: value.cmcd_cd,
      name: value.cmcd_nm,
      color: value.cmcd_cd === validCode ? value.cmcd_char_valu2 : value.cmcd_char_valu1,
      count: 0,
    }));
    return updatedStateList;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
