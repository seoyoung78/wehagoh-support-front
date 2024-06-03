import React, { Component, useState } from "react";
import LUXSubHeader from "luna-rocket/LUXSubHeader";
import { useNavigate } from "react-router-dom";

const title = {
  title: `진료지원`,
  url: "#",
};

const menu = [
  {
    title: "진료지원 PAN",
    url: `/CSMS2000`,
  },
  // {
  //   title: "진단검사",
  //   subTitle: [
  //     {
  //       title: "진단검사 접수",
  //       url: `/MSC_020100`,
  //     },
  //     {
  //       title: "진단검사 위탁의뢰",
  //       url: `/MSC_020200`,
  //     },
  //     {
  //       title: "진단검사 결과",
  //       url: `/MSC_020300`,
  //     },
  //   ],
  // },
  // {
  //   title: "기능검사",
  //   subTitle: [
  //     {
  //       title: "기능검사 접수",
  //       url: `/MSC_030100`,
  //     },
  //     {
  //       title: "기능검사 결과",
  //       url: `/MSC_030200`,
  //     },
  //   ],
  // },
  // {
  //   title: "영상검사",
  //   url: "/CSMSR100",
  // },
  // {
  //   title: "내시경검사",
  //   subTitle: [
  //     {
  //       title: "내시경검사 접수",
  //       url: `/MSC_050100`,
  //     },
  //     {
  //       title: "내시경검사 결과",
  //       url: `/MSC_050200`,
  //     },
  //   ],
  // },
  // {
  //   title: "재활물리치료",
  //   subTitle: [
  //     {
  //       title: "물리치료 현황",
  //       url: `/CSMSH100`,
  //     },
  //     {
  //       title: "물리치료 대장",
  //       url: `/CSMSH200`,
  //     },
  //   ],
  // },
  // {
  //   title: "통합검사결과",
  //   url: `/MSC_070100`,
  // },
  // {
  //   title: "검사실별 환자조회",
  //   url: `/CSMS3000`,
  // },
  // {
  //   title: "검사정보설정",
  //   subTitle: [
  //     {
  //       title: "검사정보설정",
  //       url: `/CSMS4000`,
  //     },
  //     {
  //       title: "검사소견관리",
  //       url: `/CSMS4100`,
  //     },
  //   ],
  // },
];

export default function Header(props) {
  const [state, setState] = useState("");
  const navigate = useNavigate();

  const handleTouchTap = (event, value, object) => {
    let { title, url, subTitle } = object;

    if (!url) {
      title = subTitle[0].title;
      url = subTitle[0].url;
    }
    setState(title);
    navigate(`${url}`);
  };

  return (
    <LUXSubHeader
      title={title}
      menu={[]}
      onTouchTap={handleTouchTap}
      isBlockButton={state}
      theme="blue"
      isVisibleHamburgerButton
      enableSelection
      handleClickHamburger={props.isLnbOnClikck}
    />
  );
}

Header.propTypes = {};
