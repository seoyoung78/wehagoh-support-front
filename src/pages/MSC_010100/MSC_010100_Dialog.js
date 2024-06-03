import { LUXSnackbar } from "luna-rocket";
import withPortal from "hoc/withPortal";
import useMSC010100Store from "./store";

export default function () {
  const snackbar = useMSC010100Store(state => state.snackbar);
  const handleRequestClose = () => {
    snackbar.close();
  };

  return (
    snackbar.isOpen &&
    withPortal(
      <LUXSnackbar
        message={snackbar.message}
        onRequestClose={handleRequestClose}
        open={snackbar.isOpen}
        type={snackbar.type}
      />,
      "dialog",
    )
  );
}
