import { ajax } from "common-util/utils";
import { globals } from "global";
import { getCookie } from "services/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";

// PDF 문서 초기화
const initializeDoc = () =>
  new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });

// 캔버스 생성 및 처리
const createCanvases = printBoxes => {
  const canvasPromises = [...printBoxes].map(printBox => html2canvas(printBox));
  return Promise.all(canvasPromises);
};

// PDF 파일 반환
const generatePdfFile = (doc, fileId = "진료지원결과지.pdf") => {
  const blob = doc.output("blob");
  return new File([blob], fileId, { type: "application/pdf" });
};

// 결과지 이미지화
const imageFormData = async printAreaElement => {
  const printBoxes = printAreaElement.querySelectorAll(".print_box");
  const doc = initializeDoc();
  const canvases = await createCanvases(printBoxes);

  canvases.forEach((canvas, i) => {
    const imgData = canvas.toDataURL("image/png");
    if (i > 0) {
      doc.addPage();
    }
    doc.addImage(imgData, "jpeg", 0, 0, 210, 297);
  });

  return generatePdfFile(doc);
};

export const dynamicImageFormData = async printAreaElement => {
  const printBoxes = printAreaElement.querySelectorAll(".print_box");
  const doc = initializeDoc();
  const canvases = await createCanvases(printBoxes);
  let totalPages = 0; // 총 페이지 수를 추적합니다.

  canvases.forEach(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // A4 너비(mm)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297 - 2; // A4 높이(mm) - 여유분 (요소가 중간에서 잘릴 경우 대비)

    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    totalPages += 1; // 첫 페이지 추가

    heightLeft -= pageHeight;

    // 이미지가 페이지보다 클 경우, 여러 페이지에 걸쳐 분할하여 출력
    while (heightLeft > 0) {
      position -= pageHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      totalPages += 1; // 추가 페이지 카운트
    }
  });

  const rawData = generatePdfFile(doc);
  return { totalPages, rawData };
};

// 파일 바이트 변환
const fileToByteArray = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const arrayBuffer = event.target.result;
      const byteArray = new Uint8Array(arrayBuffer);
      resolve(byteArray);
    };

    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });

// 이미지 업로드
const uploadApi = (result, file, formData) =>
  new Promise((resolve, reject) => {
    if (result.resultCode === 200) {
      const resultList = result.resultData[0];
      const { auth, contentType, date, uuidFileName, url } = resultList;
      const headers = { Authorization: auth, "x-amz-date": date, "Content-Type": contentType };
      let body;

      (async () => {
        try {
          const byteArray = await fileToByteArray(file); // 아래 파일 바이트 변환 메서드 참조
          body = byteArray;

          // S3 파일 업로드
          axios
            .put(url, body, { headers })
            .then(({ status }) => {
              if (status === 200) {
                // 메타데이터 저장 및 DB 파일저장 API 호출
                formData.append("uuidFileName", uuidFileName);
                const cno =
                  document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");

                ajax
                  .post(`${globals.backendUrl_local}/file/upload?cno=${cno}`, formData, {
                    contextType: "multipart/form-data",
                    "Company-No": cno,
                  })
                  .then(res => {
                    const { resultData, resultCode } = JSON.parse(res);
                    if (resultCode === 200) {
                      resolve(resultData);
                    } else {
                      reject(new Error("업로드 서버 응답 오류"));
                    }
                  })
                  .catch(e => {
                    reject(e);
                  });
              } else {
                reject(new Error("업로드 서버 응답 오류"));
              }
            })
            .catch(e => {
              reject(e);
            });
        } catch (e) {
          reject(e);
        }
      })();
    } else {
      reject(result);
    }
  });

// 시그니쳐 받아오기
export const signitureApi = file =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("originalFileName", file.name);
    formData.append("size", file.size);
    formData.append("bucketType", "COMPANY"); // bucketType 종류: COMPANY, USER, SERVICE
    formData.append("serviceCode", "clinicsupport"); // 각 서비스 모듈 코드에 맞게 변경해야합니다.
    formData.append("contentType", file.type);

    const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");

    ajax
      .post(`${globals.backendUrl_local}/file/getSigniture?cno=${cno}`, formData, {
        contextType: "multipart/form-data",
        "Company-No": cno,
      })
      .then(res => {
        const result = JSON.parse(res);
        resolve(uploadApi(result, file, formData));
      })
      .catch(e => reject(e));
  });

// 서식 수가 발급
export const issueApi = (parameters, file) =>
  ajax
    .post(
      `${globals.form_url}?cno=${
        document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no")
      }`,
      {
        ...parameters,
        mdfr_stat_cd: "I",
        file_path_id: file,
      },
      {
        contextType: "application/json",
      },
    )
    .then(res => JSON.parse(res));

// 파일 다운로드
export const downloadApi = (uuidFileName, returnBlobUrl = true) => {
  const cno = document.getElementById("h_selected_company_no").value || getCookie("h_selected_company_no");
  const headers = {
    method: "getDownloadSignature",
    service: "objectStorageService",
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const bodies = { cno, FileName: uuidFileName, BucketType: "C" };

  return ajax
    .post(globals.signiture_url, bodies, headers)
    .then(response => {
      const jsonData = JSON.parse(response);

      if (jsonData?.resultList?.length) {
        const resultData = jsonData.resultList[0];

        if (resultData) {
          const { Auth, Date, url } = resultData;

          return fetch(url, {
            method: "GET",
            headers: {
              Authorization: Auth,
              "x-amz-date": Date,
            },
          })
            .then(innerResponse => {
              // fetch 요청의 결과 처리
              if (!innerResponse.ok) {
                throw innerResponse;
              }
              return innerResponse.blob();
            })
            .then(blob =>
              // Blob URL 반환 또는 Blob 자체 반환
              returnBlobUrl ? URL.createObjectURL(blob) : blob,
            );
        }
      }
    })
    .then(blobUrl => blobUrl)
    .catch(error => {
      throw new Error(`시그니처 다운로드 요청 오류: ${error.status} (${error.statusText})`);
    });
};

export const deleteFileApi = async uuidFileName => {
  try {
    if (uuidFileName) {
      const param = {
        serviceCode: "clinicsupport", // 서비스 코드는 각자 서비스 코드 사용해야합니다.
        uuidFileName,
      };
      const url = `${globals.common_storage}/metadata/delete`;
      const options = { contextType: "application/json" };
      await ajax.post(url, param, options);
    }
  } catch (e) {
    console.error(e);
  }
};

export const formApi = (el, parameters) =>
  new Promise((resolve, reject) => {
    imageFormData(el)
      .then(rawData =>
        signitureApi(rawData)
          .then(filekey => resolve(issueApi(parameters, filekey)))
          .catch(e => {
            reject(e);
          }),
      )
      .catch(e => reject(e));
  });
