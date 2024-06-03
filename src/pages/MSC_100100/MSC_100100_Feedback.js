import withPortal from "hoc/withPortal";
import { LUXConfirm, LUXFCircularProgress, LUXSnackbar } from "luna-rocket";
import useMSC100100Store from "./store";

export default function () {
  const snackbar = useMSC100100Store(state => state.snackbar);
  const loading = useMSC100100Store(state => state.loading);
  const confirm = useMSC100100Store(state => state.confirm);

  return (
    <>
      {withPortal(
        <LUXSnackbar
          autoHideDuration={1500}
          open={snackbar.open}
          type={snackbar.type}
          message={snackbar.message}
          onRequestClose={snackbar.close}
        />,
        "snackbar",
      )}
      {withPortal(
        <LUXFCircularProgress
          visible={loading.visible}
          innerText={loading.innerText}
          dimmedStyle={{ background: "#fff", opacity: 0 }}
        />,
        "dialog",
      )}
      {withPortal(
        <LUXConfirm
          open={confirm.open}
          title={confirm.title}
          message={confirm.message}
          useIcon={!!confirm.useIconType}
          useIconType={confirm.useIconType}
          cancelButton={confirm.cancelEventHandler}
          confirmButton={confirm.confirmEventHandler}
          onClose={confirm.closeEventHandler}
        />,
        "dialog",
      )}
    </>
  );
}
