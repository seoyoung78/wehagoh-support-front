import { LUXConfirm } from "luna-rocket";
import withPortal from "hoc/withPortal";
import useMSC100100P01Store from "./store";

/* 팝업창 위에 confirm 이 나타나야 하므로 분리함 */
export default function () {
  const confirm = useMSC100100P01Store(state => state.confirm);
  return withPortal(
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
  );
}
