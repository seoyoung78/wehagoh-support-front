import MSC050200T01 from "pages/CSMSP/CSMSP007/CSMSP007_T01";
import MSC050200T02Gsit from "pages/CSMSP/CSMSP007/CSMSP007_T02_Gsit";
import MSC050200T02Coln from "pages/CSMSP/CSMSP007/CSMSP007_T02_Coln";

export const createDynamicBasicPage = (
  exmnInfo,
  entityMap,
  listMap,
  hspt,
  patient,
  sign,
  isPending,
  fndtPrsnSign,
  isPrintable,
) =>
  function (siteCd = exmnInfo.mdtr_site_cd, index = 0) {
    return (
      <MSC050200T01
        key={siteCd + index}
        mdtrSiteCd={siteCd}
        basicList={listMap}
        basicEntries={entityMap}
        hspt={hspt}
        patient={patient}
        sign={sign}
        isPending={isPending}
        fndtPrsnSign={fndtPrsnSign}
        isPrintable={isPrintable}
        exmnInfo={exmnInfo}
      />
    );
  };

export const createDynamicResultPage = (exmnInfo, entityMap, listMap, hspt, patient, sign) =>
  function () {
    if (exmnInfo.mdtr_site_cd === "C") {
      // 대장기록지
      return (
        <MSC050200T02Coln
          resultEntries={entityMap}
          resultList={listMap}
          hspt={hspt}
          patient={patient}
          sign={sign}
          exmnInfo={exmnInfo}
        />
      );
    }

    // 위장기록지
    return (
      <MSC050200T02Gsit
        resultEntries={entityMap}
        resultList={listMap}
        hspt={hspt}
        patient={patient}
        sign={sign}
        exmnInfo={exmnInfo}
      />
    );
  };
