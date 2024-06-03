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
 * @name 대장내시경 검사 설명서
 * @author 윤서영
 */
export default function CSMSP006() {
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
    <div>
      <div id="CSAR006 dp_full print">
        <div id="printArea">
          <div className="print_box">
            <div className="print_info">{moment().format("YYYY-MM-DD HH:mm:ss")}</div>
            <div className="print_header">
              <div className="print_header_title">
                <h1>대장내시경 설명서</h1>
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
                <h2>1. 대장내시경 검사란?</h2>
              </div>
              <div className="print_content">
                <div className="explane_box">
                  내시경을 통하여 항문과 직장 및 대장의 내부를 관찰하는 검사입니다. 관찰을 위해 공기를 주입하므로 검사
                  중, 검사 후 복부 팽만감, 불쾌감이 발생할 수 있어 검사 전 미리 진통제와 수면제를 맞고 검사를 시작합니다
                </div>
              </div>
            </div>
            <div className="print_wrap">
              <div className="print_title">
                <h2>2. 대장내시경 검사의 준비</h2>
              </div>
              <div className="print_content">
                <div className="explane_box">
                  ① 대장 내부가 깨끗하게 되어야 정확한 검사를 편하게 받으실 수 있습니다.
                  <br />② 검사 3일 전부터 질긴 채소류, 김 미역 등 해조류, 잡곡 (현미 쌀, 검은 쌀), 씨가 많은 과일 (참외,
                  포도, 토마토, 수박 등)은 절대 드시지 마십시오.
                  <br />③ 항응고제, 아스피린 등을 복용 중인 분은 담당의와 중단 여부를 상의하십시오. (검사 5일 전부터
                  중단해야 합니다)
                  <br />④ 검사 전날 저녁(5시)은 죽이나 미음을 드시고 금식하시고 검사가 끝날 때까지 금식입니다.
                  <br />⑤ 당뇨가 있는 분은 검사 당일 인슐린 주사나 당뇨약은 절대 투여하지 마십시오. 고혈압약을 드시는
                  분은 검사 당일 아침 고혈압약만 드십시오.
                  <br />⑥ 장을 비우는 약을 다 드신 후에도 검사 예정 1시간 전까지는 생수를 충분히 더 드시고 움직이시면
                  장이 깨끗해져서 검사가 더욱 수월해집니다.
                  <br />⑦ 검사 당일은 어지러울 수 있고, 운전하면 안 되므로 보호자와 같이 오십시오.
                  <br />⑧ 분실 우려가 있는 귀중품은 가져오지 마시고, 조직검사를 추가로 시행할 수 있으므로, 추가수납에
                  대해서만 준비하십시오.
                  <br />⑨ 조직검사를 원하지 않으시면, 검사 전에 미리 말씀하여 주십시오.
                </div>
              </div>
            </div>
            <div className="print_wrap">
              <div className="print_content">
                <div className="print_title">
                  <h2>대장내시경 검사가 오전에 예약된 경우</h2>
                </div>
                <div className="explane_box">
                  ■ 콜론라이트로 장세정을 하려면 <br />
                  1. 분말이 들어있는 통에 4L 표시 선까지 생수를 넣고 약을 잘 섞습니다. <br />
                  2. 저녁 식사를 가볍게 한 뒤 2시간 이후부터 1컵씩 10분 간격으로 2L를 복용합니다. <br />
                  3. 검사 당일 아침 5시부터 1컵씩 10분 간격으로 2L를 복용합니다. <br />
                  4. 입안이 짜거나 껄끄러우면 중간중간 약간의 생수로 입가심하셔도 됩니다.
                </div>
              </div>
            </div>
            <div className="print_wrap">
              <div className="print_title">
                <h2>대장내시경 검사가 오후에 예약된 경우</h2>
              </div>
              <div className="print_content">
                <div className="explane_box">
                  ■ 콜론라이트로 장세정을 하려면 <br />
                  1. 분말이 들어있는 통에 4L 표시 선까지 생수를 넣고 약을 잘 섞습니다. <br />
                  2. 검사 전날 저녁 식사 후 밤 12시부터 금식합니다. <br />
                  3. 검사 당일 오전 6시부터 1컵씩 10분 간격으로 4L 복용합니다. <br />
                  4. 입안이 짜거나 껄끄러우면 중간중간 약간의 생수로 입가심하셔도 됩니다.
                </div>
              </div>
            </div>
            <div className="print_wrap full_size">
              <div className="print_title">
                <h2>3. 대장내시경 검사 후 주의사항</h2>
              </div>
              <div className="print_content">
                <div className="explane_box">
                  ① 검사 도중 공기주입으로 인해 검사 후에 복부 팽만과 통증이 발생할 수 있습니다. 이를 해소하기 위해
                  복식호흡을 하면서 복부 마사지하여 가스를 배출하도록 합니다. 따뜻한 물주머니를 복부 위에 두는 것도
                  도움이 됩니다.
                  <br />
                  ② 내시경 기계의 자극으로 검사 후 항문 주위에 불편감과 통증이 발생할 수 있습니다. 대처 방법으로 귀가 후
                  좌욕을 충분히 하도록 합니다(40도의 따뜻한 물에 항문을 15~20분 가량 담금). 심할 경우 진통제를 구매하여
                  1회 정도 먹습니다(예를 들어 타이레놀 등).
                  <br />
                  ③ 검사 후 식사는 바로 할 수 있습니다.
                  <br />
                  ④ 검사 당일 운전, 기계를 다루거나, 사우나, 심한 운동은 하지 마십시오. <br />
                  ⑤ 조직검사 후 대변에 피가 조금 섞일 수 있으나 곧 멈추며, 계속 피가 나오면 병원으로 오시기 바랍니다.
                  검사 시 정확한 진단을 위해 푸른색 색소를 사용하기도 하므로 이런 경우에 대변이 푸른색으로 나올 수
                  있으나 걱정하실 필요는 없습니다.
                  <br />⑥ 검사 결과는 외래진료 예약일에 확인하시면 됩니다
                </div>
              </div>
            </div>
            <div className="print_wrap">
              <div className="print_paging">1/1</div>
            </div>
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
