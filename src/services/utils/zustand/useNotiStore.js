import create from "zustand";

const useNotiStore = create((set, get) => ({
  noti: null,
  setNoti: data => set(() => ({ noti: data })),
  resetNoti: () => set(() => ({ noti: null })),
  checkNoti: pageId => {
    if (get().noti) {
      switch (get().noti.mc) {
        // 응급환자 설정 및 해제
        case "CMD011":
        case "CMD012":
        case "CHO001":
        case "CHO002":
        case "CNU001":
        case "CNU002":
        case "CCM001":
        case "CCM002":
          return true;
        case "CMD002": // 진료지원Main 처방DC
        case "CMD004": // 진료지원Main 검사처방
          if (pageId === "MSC_010100") return true;
          return false;
        case "CP0003": // 영상검사 최종보고
        case "CP0006": // 영상검사 영상수신
          if (pageId === "MSC_040200") return true;
          return false;
        default:
          return false;
      }
    }
    return false;
  },
}));

export default useNotiStore;
