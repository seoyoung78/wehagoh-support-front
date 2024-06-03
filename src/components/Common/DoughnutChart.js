import React, { useEffect, useState } from "react";

// util

// common-ui-components
import ReactEcharts from "echarts-for-react";

// css

// imgs

/**
 * @name 도넛 차트
 * @author 윤서영
 * @note
 * * 2023-10-12 강현구A 수정 : 카운트 정보를 전달하기 위해 상태별로 분류된 데이터 레퍼런스를 직접 전달하는 것 대신, 각 상태별 데이터 카운트(countMap)을 전달하는 방식 방식 추가
 */
export default function DoughnutChart(props) {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const { isDashBoard = false, arrStates = [], countMap } = props;
  const [themeOption, setThemeOption] = useState("Default");
  const [legendItemCount, setLegndItemCount] = useState("Four"); // 표시할 레전드 갯수에 따라 테마 변경
  // 차트 테마 설정
  const [objChartTheme, setObjChartTheme] = useState({
    Default: {
      arrChartColor: [],
      isToolTipShow: true,
      objOuterDoughnutChartOpt: { borderColor: "transparent", borderWidth: 2 },
      isChartAnimationUse: true,
      isLegendSelectedModeUse: true,
      isSeriesSilentUse: false,
    },
    Empty: {
      arrChartColor: ["#FFF", "#F0F0F0", "#F0F0F0", "#F0F0F0", "#F0F0F0", "#F0F0F0"], // empty 차트 컬러 배열
      isToolTipShow: false,
      objOuterDoughnutChartOpt: {},
      isChartAnimationUse: false,
      isLegendSelectedModeUse: false,
      isSeriesSilentUse: true,
    },
  }); // objChartTheme End

  const objLegendPosition = {
    // 범례 아이템 갯수에 따른 범례(Legend) 위치 설정
    Three: { strLegendTopMargin: "20%" },
    Four: { strLegendTopMargin: "10%" },
    Five: { strLegendTopMargin: "8%" },
  }; // objLegendPosition End

  const [objLegendSize, setObjLegendSize] = useState({
    // 개별 페이지 크기의 legend(가로 )
    stateName: {
      fontSize: 13,
      width: 40,
      height: 35, // 가로줄 간격 조정은 이곳에서
      padding: [0, 0, 0, 10], // icon에 padding을 넣으면 동그라미 모양도 같이 늘어나므로 간격을 이곳에 넣습니다
    }, // stateName End
    rightListBlack: {
      fontSize: 13,
      width: 85,
      align: "right",
      fontWeight: "bold",
    }, // rightListBlack End
    rightListGray: {
      fontSize: 13,
      width: 45,
      align: "right",
      color: "#7B7B7B",
    }, // rightListGray End
  });

  const [arrChartValueData, setArrChartValueData] = useState([]);
  const [arrStateCode, setArrStateCode] = useState([]);

  const [inputData, setInputData] = useState([]);
  const [finalOption, setFinalOption] = useState({});

  /* ================================================================================== */
  /* 함수(function) 선언 */

  /**
   * @description 차트 범례 텍스트 배열 재조정을 위한 함수
   */
  const reAllocationChartLegendText = () => {
    if (arrStates.length > 0) {
      return Array.from(
        arrStates.filter(list => list.code !== "0"),
        list => list.name,
      );
    }
  };

  /**
   * @description 차트 컬러 배열 재조정을 위한 함수
   */
  const reAllocationChartColorTheme = () => {
    // 차트 컬러 배열 재정렬
    setObjChartTheme({
      ...objChartTheme,
      Default: { ...objChartTheme.Default, arrChartColor: Array.from(arrStates, list => list.color) },
    });
  };

  /**
   * @description 객체 안의 모든 상태값의 길이가이 0인 경우를 체크하는 함수
   */
  const isStateZeroLength = () => {
    //countMap을 정의했다면,
    if (countMap) {
      return countMap["0"] < 1;
    }
    if (arrStates.find(stat => stat.code === "0").count === 0) {
      return true;
    }
    return false;
  };

  const isDuplicate = array => {
    const isDuplicated = array.some(x => array.indexOf(x) !== array.lastIndexOf(x)); // array.some End
    return isDuplicated;
  };

  /**
   * @description 차트의 범례의 퍼센트에 들어갈 배열 데이터 정의하는 함수
   */
  const calculateChartLegendValue = () => {
    let arrValueTmpData = [];
    let arrReturnData = [];
    let numSum = 0;

    //countMap을 정의했다면
    if (countMap) {
      for (const stateCode of arrStateCode) {
        arrValueTmpData.push(countMap[stateCode]);
      }
    } else {
      arrStates.map(stat => arrValueTmpData.push(stat.count));
    }

    if (arrValueTmpData[0] > 0) {
      for (let loop = 1; loop < arrValueTmpData.length; loop++) {
        arrReturnData.push(Math.floor((arrValueTmpData[loop] / arrValueTmpData[0]) * 100));
        numSum += Math.floor((arrValueTmpData[loop] / arrValueTmpData[0]) * 100);
      } // for End

      const maxValue = arrReturnData.indexOf(Math.max.apply(null, arrReturnData));

      const isDuplicated = isDuplicate(arrReturnData); // 배열안에 중복된 퍼센테이지가 있는지 체크

      if (!isDuplicated) {
        if (numSum === 98) {
          arrReturnData[maxValue] = arrReturnData[maxValue] + 2;
        } else if (numSum === 99) {
          arrReturnData[maxValue] = arrReturnData[maxValue] + 1;
        } else if (numSum === 101) {
          arrReturnData[maxValue] = arrReturnData[maxValue] - 1;
        } else if (numSum === 102) {
          arrReturnData[maxValue] = arrReturnData[maxValue] - 2;
        }
      }
    } else {
      arrValueTmpData.map(list => arrReturnData.push(0));
    }
    return arrReturnData;
  };

  /**
   * @description 차트에 들어갈 배열 데이터 정의하는 함수
   */
  const setChartInputData = () => {
    try {
      // 차트에 들어갈 배열 데이터 정의
      const arrChartInputData = [];
      // 차트 데이터 아이템이 4개인 경우
      if (countMap) {
        for (let idx = 0; idx < arrStateCode.length; idx++) {
          arrChartInputData.push({
            value: countMap[arrStateCode[idx]],
            name: arrStates[idx].name,
          });
        }
      } else {
        arrStates.map(stat =>
          arrChartInputData.push({
            value: stat.count,
            name: stat.name,
          }),
        );
      }

      setArrChartValueData(() => calculateChartLegendValue());
      let itemCount = legendItemCount;

      // 차트 아이템 갯수에 따라 레전드 Top 영역 마진 조정
      if (arrStateCode?.length === 4) {
        itemCount = "Three";
      } else if (arrStateCode?.length === 6) {
        itemCount = "Five";
      } 
      setLegndItemCount(itemCount);

      // 모든 값이 0일 경우 차트 empty 테마 적용
      if (isStateZeroLength()) {
        setThemeOption("Empty");
      } else {
        setThemeOption("Default");
      }

      setInputData(arrChartInputData);
    } catch (e) {
      setThemeOption("Empty");
    }
  };

  /**
   * @description 차트 옵션 정의 함수
   */
  const setFinalChartOption = arrChartData =>
    // DoughnutChart Option
    ({
      tooltip: objChartTheme[themeOption].isToolTipShow
        ? {
            trigger: "item",
            formatter: item => `<p>${item.marker} ${item.name} : ${item.value}건</p>`,
          }
        : {
            trigger: "none",
          },
      color: objChartTheme[themeOption].arrChartColor, //
      animation: objChartTheme[themeOption].isChartAnimationUse, // 차트 애니메이션 사용 여부
      // silent: true, // 마우스 오버시 표현 사용 여부
      // 오른쪽 상태 리스트 표현
      legend: {
        orient: "vertical",
        top: objLegendPosition[legendItemCount].strLegendTopMargin, //
        left: "45%",
        selectedMode: objChartTheme[themeOption].isLegendSelectedModeUse, // 범례에서 마우스 클릭 막기
        data: reAllocationChartLegendText(),
        icon: "none",
        itemGap: 5,
        textStyle: {
          rich: {
            icon1: {
              width: 7,
              height: 7,
              backgroundColor: objChartTheme["Default"].arrChartColor[1],
              borderRadius: 50,
            }, // icon1 End
            icon2: {
              width: 7,
              height: 7,
              backgroundColor: objChartTheme["Default"].arrChartColor[2],
              borderRadius: 50,
            }, // icon2 End
            icon3: {
              width: 7,
              height: 7,
              backgroundColor: objChartTheme["Default"].arrChartColor[3],
              borderRadius: 50,
            }, // icon3 End
            icon4: {
              width: 7,
              height: 7,
              backgroundColor: objChartTheme["Default"].arrChartColor[4],
              borderRadius: 50,
            }, // icon4 End
            icon5: {
              width: 7,
              height: 7,
              backgroundColor: objChartTheme["Default"].arrChartColor[5],
              borderRadius: 50,
            },
            hr: {
              width: "100%",
              height: 1,
              opacity: 1,
              backgroundColor: "#E6E6E6",
            }, // icon5 End
            ...objLegendSize,
          }, // rich End
        }, // textStyle End
        formatter: stateName => {
          if (arrStates?.length !== 0) {
            let value = arrChartData.find(item => item.name === stateName)?.value; // 각 상태 건수 num

            //undefined 0 처리
            if (!value) value = 0;

            let iconNumber = 0;
            if (stateName === arrChartData[1].name) iconNumber = 1;
            else if (stateName === arrChartData[2].name) iconNumber = 2;
            else if (stateName === arrChartData[3].name) iconNumber = 3;
            else if (stateName === arrChartData[4].name) iconNumber = 4;
            else if (stateName === arrChartData[5].name) iconNumber = 5;

            let tmpText = "\n{hr|}";
            if (iconNumber === arrStates.length - 1) tmpText = "";

            if (!!arrChartValueData) {
              // 변수로 하나하나 선언하지 않고, 한꺼번에 묶어야 align 적용 됩니다.
              return `{icon${iconNumber}|}{stateName|${stateName?.toString()}}{rightListBlack|${value?.toString()}건}{rightListGray|${
                arrChartValueData[iconNumber - 1]
              }%}${tmpText}`;
            }
            return `{icon${iconNumber}|}{stateName|${stateName?.toString()}}{rightListBlack|${value?.toString()}건}{rightListGray|0%}${tmpText}`;
            // if End
          } // if End
        }, // formatter End
      }, // legend End
      series: [
        // '전체' 텍스트 세팅 (inner)
        {
          color: ["#ffffff"],
          name: "chartAllDataSumNaming",
          type: "pie",
          radius: ["0%", "1%"],
          silent: true, // 해당 series만 적용되는 silent
          label: {
            color: ["#8c8c8c"],
            position: "center",
            fontSize: 12,
            formatter: "전체",
          },
          data: [""],
          left: "-50%",
          top: "5%",
          height: "80%",
        }, // '전체' 텍스트 세팅 (inner) End
        // []건 텍스트 세팅 (inner)
        {
          name: "진단검사 대기환자 현황",
          type: "pie",
          radius: ["0%", "30%"],
          left: "-50%",
          top: "8%",
          silent: true, // 해당 series만 적용되는 silent
          avoidLabelOverlap: false,
          label: {
            color: ["#000000"],
            position: "center",
            fontSize: 12,
            formatter(stateNum) {
              let result = "{DoughnutChartCenterBlack|" + stateNum.data.value + "건}";
              if (stateNum.data.value === undefined || stateNum.data.value === null) return "";
              return `${result}`;
            }, // formatter End
            textStyle: {
              color: "gray",
              rich: {
                DoughnutChartCenterBlack: {
                  color: "#000000",
                  fontSize: 18,
                  fontWeight: "bold",
                }, // DoughnutChartCenterBlack End
              }, // rich End
            }, // textStyle End
          }, // label End
          labelLine: {
            normal: { show: false },
          }, // labelLine End
          data: arrChartData.filter(item => item.name === arrStates[0].name),
        }, // // series 도넛 Inner Design End
        // 실제 도넛 차트 디자인 설정 (outer)
        {
          name: "outerChartDesign",
          type: "pie",
          radius: ["40%", "78%"],
          left: "-50%",
          itemStyle: objChartTheme[themeOption].objOuterDoughnutChartOpt,
          silent: objChartTheme[themeOption].isSeriesSilentUse,
          label: {
            color: "black",
            position: "inner",
            formatter: "{c}",
            normal: {
              show: true,
              position: "inner",
              color: "white",
              fontSize: 12,
              formatter(stateNum) {
                if (stateNum.data.value === 0) return "";
                return `${stateNum.data.value}건`;
              }, // formatter End
            }, // normal End
            emphasis: {
              show: true,
              label: { show: true },
            }, // emphasis End
          }, // label End
          labelLine: {
            normal: { show: false },
          }, // labelLine End
          data: arrChartData.filter(item => item.name !== arrStates[0].name),
        }, // series 도넛 Outer Design End
      ], // series End
    });

  /* ================================================================================== */
  /* Hook(useEffect) */
  useEffect(() => {
    isDashBoard
      ? setObjLegendSize({
          // 대시보드(PAN) 페이지 크기의 legend(가로 짧음)
          stateName: {
            fontSize: 13,
            width: 10,
            height: 35, // 가로줄 간격 조정은 이곳에서
            padding: [0, 0, 0, 10], // icon에 padding을 넣으면 동그라미 모양도 같이 늘어나므로 간격을 이곳에 넣습니다
          }, // stateName End
          rightListBlack: {
            fontSize: 13,
            width: 85,
            align: "right",
            fontWeight: "bold",
          }, // rightListBlack End
          rightListGray: {
            fontSize: 13,
            width: 45,
            align: "right",
            color: "#7B7B7B",
          }, // rightListGray End
        })
      : setObjLegendSize({
          // 개별 페이지 크기의 legend(가로 )
          stateName: {
            fontSize: 13,
            width: 10,
            height: 35, // 가로줄 간격 조정은 이곳에서
            padding: [0, 0, 0, 10], // icon에 padding을 넣으면 동그라미 모양도 같이 늘어나므로 간격을 이곳에 넣습니다
          }, // stateName End
          rightListBlack: {
            fontSize: 13,
            width: 85,
            align: "right",
            fontWeight: "bold",
          }, // rightListBlack End
          rightListGray: {
            fontSize: 13,
            width: 45,
            align: "right",
            color: "#7B7B7B",
          }, // rightListGray End
        }); // objLegendPosition End
  }, [isDashBoard]);

  useEffect(() => {
    if (arrStates.length > 0) {
      setArrStateCode(arrStates.map(item => item.code));
    }
  }, [arrStates, countMap]);

  useEffect(() => {
    if (arrStateCode.length > 0) {
      reAllocationChartColorTheme();
    }
  }, [arrStateCode]);

  useEffect(() => {
    setChartInputData();
  }, [objChartTheme]);

  useEffect(() => {
    if (inputData.length > 0) {
      setFinalOption(() => setFinalChartOption(inputData));
    }
  }, [inputData, legendItemCount]);

  /* ================================================================================== */
  /* render() */
  return <ReactEcharts style={{ width: "100%", height: "100%" }} option={finalOption} notMerge />;
}
