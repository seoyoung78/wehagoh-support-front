import React, { useState } from "react";

export default function Snb() {
  const [snbList, setSnbList] = useState(
    new Map([
      ["MSC_010100", { title: "진료지원 Main", userGroup: false }],
      [
        "MSC_02",
        {
          title: "진단검사",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "진단검사 접수", code: "0100" },
            { name: "진단검사 위탁의뢰", code: "0200" },
            { name: "진단검사 결과", code: "0300" },
          ],
        },
      ],
      [
        "MSC_03",
        {
          title: "기능검사",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "기능검사 접수", code: "0100" },
            { name: "기능검사 결과", code: "0200" },
          ],
        },
      ],
      [
        "MSC_04",
        {
          title: "영상검사",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "영상검사 접수", code: "0100" },
            { name: "영상검사 판독", code: "0200" },
          ],
        },
      ],
      [
        "MSC_05",
        {
          title: "내시경검사",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "내시경검사 접수", code: "0100" },
            { name: "내시경검사 결과", code: "0200" },
          ],
        },
      ],
      [
        "MSC_06",
        {
          title: "재활물리치료",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "물리치료 현황", code: "0100" },
            { name: "물리치료 대장", code: "0200" },
          ],
        },
      ],
      ["MSC_070100", { title: "통합검사결과", userGroup: false }],
      ["MSC_080100", { title: "검사실별 환자조회", userGroup: false }],
      [
        "MSC_09",
        {
          title: "검사 환경설정",
          userGroup: true,
          folded: false,
          groupList: [
            { name: "검사 환경설정", code: "0100" },
            { name: "검체코드관리", code: "0200" },
          ],
        },
      ],
      ["MSC_100100", { title: "검사 소견관리", userGroup: false }],
    ]),
  );

  const toggleFold = key => {
    const updateList = new Map(snbList); // 기존의 배열을 복사하여 새로운 Map 생성
    const snb = updateList.get(key);

    updateList.set(key, { ...snb, folded: !snb.folded });

    setSnbList(updateList);
  };

  return (
    <div className="LUX_basic_snb snb_v2 snb_weh">
      <div className="LUX_basic_snbin">
        {Array.from(snbList).map(([key, value]) =>
          value.userGroup ? (
            <div key={key} className={`snb_group user_group ${value.folded ? "fold" : ""}`}>
              <div className="title_area">
                <a className="title" onClick={() => toggleFold(key)} style={{ cursor: "pointer" }}>
                  {value.title}
                  <i className="sp_lux">닫기</i>
                </a>
              </div>
              <div className="snb_group_list">
                {value.groupList.map(({ name, code }) => (
                  <div key={`${name}${code}`} className="group_box depth1 noFolder">
                    <a href={`#/${key}${code}`} className="text">
                      <i className="sp_snb" />
                      <em>{`${name}`}</em>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div key={key} className="snb_group">
              <div className="title_area">
                <a href={`#/${key}`} className="title">
                  {value.title}
                </a>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
