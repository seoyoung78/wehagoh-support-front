import React, { useEffect, useState } from "react";

// util
import moment from "moment";
import callApi from "services/apis";
import { globals } from "global";

// common-ui-components
import { LUXButton } from "luna-rocket";

// css
import "assets/style/print.scss";

// imgs

/**
 * @name 위내시경검사설명서
 * @author 윤서영
 */
export default function CSMSP005() {
  /* ================================================================================== */
  /* 상태(state) 선언 */
  const [state, setState] = useState({
    hspt_nm: "",
    hspt_logo_lctn: "",
    hspt_logo: null,
  });

  /* ================================================================================== */
  /* 함수(function) 선언 */

  const handleClose = () => {
    window.close();
  };

  const handlePrint = () => {
    window.print();
    window.close();
  };

  /* ================================================================================== */
  /* Hook(useEffect) */
  // 병원정보가져오기
  useEffect(() => {
    (async () => {
      await callApi("/common/selectHspInfo").then(({ resultData }) => {
        setState(resultData);
      });
    })();
  }, []);

  /* ================================================================================== */
  /* render() */
  return (
    <div className="CSAR005 dp_full print">
      <div id="printArea">
        <div className="print_box">
          <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
          <div className="print_header">
            <div className="print_header_title">
              <h1>위내시경 설명서</h1>
              <p>{state.hspt_nm}</p>
            </div>
            {state.hspt_logo_lctn && state.hspt_logo_lctn !== "" && (
              <div className="print_header_logo">
                <img src={globals.wehagoh_url + state.hspt_logo_lctn} alt="" />
              </div>
            )}
          </div>
          <div className="print_wrap">
            <div className="print_title">
              <h2>1. 위내시경 검사란?</h2>
            </div>
            <div className="print_content">
              <div className="explane_box">
                위내시경 검사는 내시경을 통해 식도, 위, 십이지장 점막을 직접 눈으로 관찰하여 염증, 궤양, 용종, 암 등의
                질환을 진단하는 검사입니다.
              </div>
            </div>
          </div>
          <div className="print_wrap">
            <div className="print_title">
              <h2>2. 위내시경 검사 과정</h2>
            </div>
            <div className="print_content">
              <div className="explane_box">
                ① 검사 전 가스 제거제를 복용하고 검사대에 누운 뒤 목 마취를 위해 국소마취제를 구강 내에 뿌립니다.
                <br />
                ② 혀와 목에 힘을 빼고 코와 배로 천천히 깊게 숨을 쉬면서 기침을 참고 지시에 따르면, 쉽게 내시경 삽입이
                가능합니다.
                <br />③ 검사자가 내시경으로 점막을 관찰하는 동안 환자는 천천히 심호흡하면서 구역, 구토를 참고 입 안에
                고인 침을 삼키지 말고 자연스럽게 흘리면 됩니다.
              </div>
            </div>
          </div>
          <div className="print_wrap">
            <div className="print_title">
              <h2>3. 위내시경 검사 전 주의사항</h2>
            </div>
            <div className="print_content">
              <div className="explane_box">
                ① 검사 전날 저녁 식사는 소화되기 쉬운 음식물을 드시고 밤 9시부터 아무것도 드시지 마십시오
                <br />
                <div className="indent">
                  ▶ 술, 담배, 물도 안 됩니다. (단, 혈압약은 물 반 컵 정도로 검사 당일 아침에 꼭 드십시오)
                </div>
                <div className="indent">
                  ▶ 아스피린, 혈전용해제, 항응고제를 드시는 분은 담당 주치의에게 약 복용 여부를 꼭 확인 후 5일 전 복용을
                  중지하십시오.
                </div>
                ② 당뇨병이 있는 분은 검사 당일 아침에 인슐린 주사를 맞지 마시고 당뇨약도 드시지 마십시오.
                <br />③ 도난, 분실의 염려가 있는 귀중품을 갖고 오지 마십시오.
                <br />④ 검사 도중 조직검사나 기타 검사를 시행하였을 때 추가수납이 있습니다.
                <br />⑤ 수면 내시경 검사 당일에는 운전하면 안 되고, 환자 안전을 위해 보호자가 동반해야 합니다.
                <br />⑥ 검사 전에는 의치를 빼 주십시오.
                <br />⑦ 조직검사가 필요한 병변이 관찰되면 조직검사를 시행할 수 있습니다. 이때 출혈이 발생하나 대부분
                문제가 없습니다. 하지만 출혈이 멈추지 않으면 내시경 지혈술을 시행할 수도 있습니다.
              </div>
            </div>
          </div>
          <div className="print_wrap full_size">
            <div className="print_title">
              <h2>4. 위내시경 검사 후 주의사항</h2>
            </div>
            <div className="print_content">
              <div className="explane_box">
                ① 검사 후 목 마취로 인해 이물감이 느껴지지만 한 시간이 지나면 가라앉습니다.
                <br />② 물이나 음식물은 목 마취가 완전히 풀린 후 (검사 1~2시간 후) 드십시오.
                <br />③ 검사 후 2~3일 정도는 목이 불편할 수 있습니다.
                <br />④ 검사 후 출혈(혈변, 검은색 변)이 발생하면 담당 진료의에게 알려주십시오.
                <br />⑤ 검사 당일 너무 뜨겁거나 자극적인 음식은 피하시고 특히 술과 담배는 삼가십시오.
                <br />⑥ 수면 내시경 검사 당일에 운동하거나, 기계를 다루거나, 중요한 결정을 내리는 일은 시행하여서는 안
                됩니다. 또한, 사우나 및 심한 운동은 하지 마십시오.
                <br />⑦ 조직검사 결과는 1주일 정도 소요됩니다. 검사 결과는 외래진료 예약일에 확인하시면 됩니다.
              </div>
            </div>
          </div>
          <div className="print_wrap">
            <div className="print_paging">1/1</div>
          </div>
        </div>
      </div>
      <div className="print_footer">
        <LUXButton label="닫기" useRenewalStyle type="confirm" onClick={handleClose} />
        <LUXButton label="출력" useRenewalStyle type="confirm" onClick={handlePrint} blue />
      </div>
    </div>
  );
}
