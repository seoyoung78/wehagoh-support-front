import TableTypeDgns from "./table/TableType_dgns";
import TableTypeFnct from "./table/TableType_fnct";
import TableTypeGssp from "./table/TableType_gssp";
import TableTypeClns from "./table/TableType_clns";
import useMSC100100Store from "./store";
import TableTypeRhbt from "./table/TableType_rhbt";

export default function () {
  const selectedOpnnKey = useMSC100100Store(state => state.opnn.selectedOpnnKey) ?? "";
  const tableType = useMSC100100Store(state => state.opnn.tableType);

  return (
    <div className="sec_content">
      {tableType === "L" ? (
        <TableTypeDgns key={selectedOpnnKey} />
      ) : tableType === "F" || tableType === "R" ? (
        <TableTypeFnct key={selectedOpnnKey} />
      ) : tableType === "S" ? (
        <TableTypeGssp key={selectedOpnnKey} />
      ) : tableType === "C" ? (
        <TableTypeClns key={selectedOpnnKey} />
      ) : tableType === "P" ? (
        <TableTypeRhbt key={selectedOpnnKey} />
      ) : (
        <TableTypeDgns key={selectedOpnnKey} />
      )}
    </div>
  );
}
