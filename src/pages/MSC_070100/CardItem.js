import React from "react";

// util
import PropTypes from "prop-types";

/**
 * 통합검사결과 카드 항목
 * @author khgkjg12 강현구A
 */
export default function CardItem({ items, globalObject }) {
  /* ================================================================================== */
  /* 상수(const) 선언 */
  const { selectedCard, setSelectedCard, disabled } = globalObject;

  /* ================================================================================== */
  /* 함수(function) 선언 */
  const handleClick = item => {
    if (disabled) return;
    setSelectedCard(item);
  };

  const getKey = item => item.rcpn_no + ":" + item.cndt_dy;

  /* ================================================================================== */
  /* render() */
  return (
    <ul className={`${disabled ? "disabled" : ""}`}>
      {items.map(item => (
        <li className="item-wrap" key={getKey(item)}>
          <button
            disabled={disabled}
            className={`item-box ${selectedCard && getKey(selectedCard) === getKey(item) ? "selected" : ""}`}
            style={disabled ? { cursor: "no-drop" } : {}}
            onClick={() => handleClick(item)}
            type="button"
          >
            <div>{`${item.cndt_dy}[${item.mdcr_dr_nm}]`}</div>
            <div>{item.prsc_clsf_nm_list}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}
CardItem.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      cndt_dy: PropTypes.string.isRequired,
      rcpn_no: PropTypes.string.isRequired,
    }),
  ),
  globalObject: PropTypes.shape({
    selectedCard: PropTypes.shape({
      rcpn_no: PropTypes.string.isRequired,
      cndt_dy: PropTypes.string.isRequired,
    }),
    setSelectedCard: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
  }).isRequired,
};
CardItem.defaultProps = {
  items: [],
};
