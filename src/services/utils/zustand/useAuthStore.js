import callApi from "services/apis";
import create from "zustand";

const useAuthstore = create((set, get) => ({
  useAuth: [],
  selectUserAuth: async () => {
    await callApi("/common/selectUserAuth").then(({ resultCode, resultData }) => {
      if (resultCode === 200) {
        set(() => ({ useAuth: resultData }));
      }
    });
  },
  /**
   *
   * @param {*서식 분류 일련번호} mdfrSqno
   * @param {*조회 권한 타입 설정 : read(조회), update(수정), print(출력), issue(발급)} type
   * @returns
   */
  getAuth: (mdfrSqno, type = "issue") => {
    const auth = get().useAuth.find(list => list.mdfr_clsf_sqno === mdfrSqno && list[type] === "Y");
    return !!auth;
  },
}));

export default useAuthstore;
