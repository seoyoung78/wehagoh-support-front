import TableTypeDgns from "./table/TableType_dgns";
import TableTypeFnct from "./table/TableType_fnct";
import TableTypeGssp from "./table/TableType_gssp";
import TableTypeClns from "./table/TableType_clns";
import TableTypeRhbt from "./table/TableType_rhbt";
import useMSC100100P01Store from "./store";

export default function () {
  const selectedOpnnKey = useMSC100100P01Store(state => state.opnn.selectedOpnnKey) ?? "";
  const tableType = useMSC100100P01Store(state => state.opnn.tableType);

  return (
    <div className="dialgo_seaction">
      <p className="section_title">• 검사 소견 내용</p>
      {tableType === "F" || tableType === "R" ? (
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
