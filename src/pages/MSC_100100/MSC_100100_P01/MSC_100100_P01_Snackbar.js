import { LUXSnackbar } from "luna-rocket";
import withPortal from "hoc/withPortal";
import useMSC100100P01Store from "./store";

export default function () {
  const snackbar = useMSC100100P01Store(state => state.snackbar);

  return withPortal(
    <LUXSnackbar
      autoHideDuration={1500}
      open={snackbar.open}
      type={snackbar.type}
      message={snackbar.message}
      onRequestClose={snackbar.close}
    />,
    "snackbar",
  );
}
