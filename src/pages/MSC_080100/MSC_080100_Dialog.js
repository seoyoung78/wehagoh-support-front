import { LUXFCircularProgress, LUXSnackbar } from "luna-rocket";
import withPortal from "hoc/withPortal";
import useMSC080100Store from "./store";

export default function () {
  const snackbar = useMSC080100Store(state => state.snackbar);
  const loading = useMSC080100Store(state => state.loading);

  return (
    <>
      {snackbar.isOpen &&
        withPortal(
          <LUXSnackbar
            autoHideDuration={1500}
            message={snackbar.message}
            onRequestClose={snackbar.close}
            open={snackbar.isOpen}
            type={snackbar.type}
          />,
          "snackbar",
        )}
      {loading.visible &&
        withPortal(
          <LUXFCircularProgress
            visible={loading.visible}
            innerText={loading.innerText}
            dimmedStyle={{ background: "#fff", opacity: 0 }}
          />,
          "dialog",
        )}
    </>
  );
}
