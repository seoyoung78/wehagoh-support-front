export default class UrlSchemeCaller {
  windowState = "focus";
 
  constructor() {
    this.init();
  }
 
  init() {
    window.addEventListener("focus", () => {
      this.windowState = "focus";
    });
 
    window.addEventListener("blur", () => {
      this.windowState = "blur";
    });
  }
 
  call(urlScheme, notInstalledCallback) {
    window.location.href = urlScheme;
 
    setTimeout(() => {
      if (this.windowState === "focus") {
        // 앱이 설치되어 있지 않은 상태
        notInstalledCallback();
      }
    }, 10000);
  }
}