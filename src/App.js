import { Route, Routes, HashRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";

import { ElecronicSignatureProvider, ErrorLogProvider } from "cliniccommon-ui";

import SinglePage from "components/Layout/SinglePage";

import { getCookie } from "services/utils";

import locale from "services/locale";

import MSC_010100 from "pages/MSC_010100";
import MSC_020100 from "pages/MSC_020000/MSC_020100/MSC_020100";
import MSC_020200 from "pages/MSC_020000/MSC_020200/MSC_020200";
import MSC_020300 from "pages/MSC_020000/MSC_020300/MSC_020300";
import MSC_030100 from "pages/MSC_030000/MSC_030100";
import MSC_030200 from "pages/MSC_030000/MSC_030200";
import MSC_040100 from "pages/MSC_040000/MSC_040100/MSC_040100";
import MSC_040200 from "pages/MSC_040000/MSC_040200/MSC_040200";
import MSC_050100 from "pages/MSC_050000/MSC_050100";
import MSC_050200 from "pages/MSC_050000/MSC_050200/MSC_050200";
import MSC_060100 from "pages/MSC_060000/MSC_060100/MSC_060100";
import MSC_060200 from "pages/MSC_060000/MSC_060200/MSC_060200";
import MSC_070100 from "pages/MSC_070100/MSC_070100";
import MSC_080100 from "pages/MSC_080100";
import MSC_090100 from "pages/MSC_090000/MSC_090100/MSC_090100";
import MSC_090200 from "pages/MSC_090000/MSC_090200/MSC_090200";
import MSC_100000 from "pages/MSC_100100/MSC_100100";

import CSMSP001 from "pages/CSMSP/CSMSP001";
import CSMSP002 from "pages/CSMSP/CSMSP002";
import CSMSP003 from "pages/CSMSP/CSMSP003";
import CSMSP005 from "pages/CSMSP/CSMSP005";
import CSMSP006 from "pages/CSMSP/CSMSP006";
import CSMSP007 from "pages/CSMSP/CSMSP007/CSMSP007";
import CSMSP010 from "pages/CSMSP/CSMSP010";
import CSMSP011 from "pages/CSMSP/CSMSP011";
import CSMSP012 from "pages/CSMSP/CSMSP012";

import "assets/style/index.scss";

// 다국어 처리를 위한 쿠키값 추출
const targetLang = getCookie("locale") || "ko";

function App() {
  return (
    <IntlProvider locale={targetLang} messages={locale[targetLang]}>
      <ErrorLogProvider index="clinicsupport_data">
        <ElecronicSignatureProvider module="clinicsupport">
          <HashRouter>
            <SinglePage>
              <Routes>
                {/* 진료지원PAN */}
                <Route path="/" element={<MSC_010100 />} />
                <Route path="/MSC_010100" element={<MSC_010100 />} />

                {/* 진단검사 */}
                <Route path="/MSC_020100" element={<MSC_020100 />} />
                <Route path="/MSC_020200" element={<MSC_020200 />} />
                <Route path="/MSC_020300" element={<MSC_020300 />} />

                {/* 기능검사 */}
                <Route path="/MSC_030100" element={<MSC_030100 />} />
                <Route path="/MSC_030200" element={<MSC_030200 />} />

                {/* 영상검사 */}
                <Route path="/MSC_040100" element={<MSC_040100 />} />
                <Route path="/MSC_040200" element={<MSC_040200 />} />

                {/* 내시경검사 */}
                <Route path="/MSC_050100" element={<MSC_050100 />} />
                <Route path="/MSC_050200" element={<MSC_050200 />} />

                {/* 재활물리치료 */}
                <Route path="/MSC_060100" element={<MSC_060100 />} />
                <Route path="/MSC_060200" element={<MSC_060200 />} />

                {/* 통합검사결과 */}
                <Route path="/MSC_070100" element={<MSC_070100 />} />
                {/* 통합검사결과 팝업 */}
                <Route path="/CSMSP/MSC_070100" element={<MSC_070100 />} />

                {/* 검사실별 환자조회 */}
                <Route path="/MSC_080100" element={<MSC_080100 />} />
                {/* 검사 환경설정 */}
                <Route path="/MSC_090100" element={<MSC_090100 />} />
                <Route path="/MSC_090200" element={<MSC_090200 />} />

                {/* 검사소견관리 */}
                <Route path="/MSC_100100" element={<MSC_100000 />} />

                {/* 출력지 */}
                <Route path="/CSMSP001" element={<CSMSP001 />} />
                <Route path="/CSMSP002" element={<CSMSP002 />} />
                <Route path="/CSMSP003" element={<CSMSP003 />} />
                <Route path="/CSMSP005" element={<CSMSP005 />} />
                <Route path="/CSMSP006" element={<CSMSP006 />} />
                <Route path="/CSMSP007" element={<CSMSP007 />} />
                <Route path="/CSMSP010" element={<CSMSP010 />} />
                <Route path="/CSMSP011" element={<CSMSP011 />} />
                <Route path="/CSMSP012" element={<CSMSP012 />} />
              </Routes>
            </SinglePage>
          </HashRouter>
        </ElecronicSignatureProvider>
      </ErrorLogProvider>
    </IntlProvider>
  );
}

export default App;
