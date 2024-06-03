import React, { useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "./Header";
import Snb from "./Snb";
import { LUXFCircularProgress } from "luna-rocket";
import Message from "components/Common/Message";
import useLoadingStore from "../../services/utils/zustand/useLoadingStore";
import useAuthstore from "services/utils/zustand/useAuthStore";
import useNotiStore from "services/utils/zustand/useNotiStore";

function SinglePage({ children }) {
  const [isLnb, setIsLnb] = useState(true);
  const [containerClass, setContainerClass] = useState("container");
  const { pathname } = useLocation();
  const { loading, message } = useLoadingStore(state => state);
  const { selectUserAuth } = useAuthstore(state => state);
  const { setNoti } = useNotiStore(state => state);

  const isLnbOnClikck = () => {
    setIsLnb(!isLnb);
  };

  useLayoutEffect(() => {
    if (pathname.includes("/CSMSP")) {
      setContainerClass("container auto_height");
      document.querySelector("body").classList.add("is_windowopen");
      setIsLnb(false);

      //오른쪽마우스 막기
      document.oncontextmenu = function (event) {
        if (event) {
          event.preventDefault();
        } else {
          event.keyCode = 0;
          event.returnValue = false;
        }
      };

      // 새로고침 방지 (F5, Ctrl+R, Ctrl+N)
      document.onkeydown = function (event) {
        if (
          event.keyCode === 116 ||
          event.keyCode === 8 ||
          (event.ctrlKey === true && event.keyCode === 80) ||
          (event.ctrlKey === true && event.keyCode === 82) ||
          (event.ctrlKey === true && event.keyCode === 78) ||
          event.metaKey
        ) {
          event.cancelBubble = true;
          event.returnValue = false;
          return false;
        }
      };
    } else {
      selectUserAuth();
      window.getNoti = data => {
        setNoti(data);
      };
    }
    return () => {
      document.querySelector("body").classList.remove("is_windowopen");
      setContainerClass("container");
    };
  }, []);

  return (
    <div className={`container_wrap ${isLnb ? "snb_show" : "snb_hide"}`}>
      <Header isLnbOnClikck={isLnbOnClikck} />
      <Snb />
      <div className={containerClass}>{children}</div>
      <LUXFCircularProgress
        visible={loading}
        innerText={Message.loading}
        dimmedStyle={{ background: "#fff" }}
        guideText={message}
      />
    </div>
  );
}

export default SinglePage;
