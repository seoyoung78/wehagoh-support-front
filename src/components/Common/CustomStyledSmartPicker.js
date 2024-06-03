import React, { forwardRef, useImperativeHandle, useRef } from "react";
import LUXSmartPicker from "luna-rocket/LUXSmartPicker";
import PropTypes from "prop-types";

const CustomStyledSmartPicker = forwardRef((props, ref) => {
  const smartPickerRef = useRef(null);
  useImperativeHandle(ref, () => smartPickerRef.current, []);
  return (
    <div className="inbx type_flex">
      <div className="editBox editBox_fullWidth">
        <LUXSmartPicker
          ref={smartPickerRef}
          hintText="선택하세요"
          maxSelectCount={1}
          useSearchField
          type="basic"
          displayType="normal"
          popoverTitleElement={<div>1개 선택가능</div>}
          minPopOverWidth={300}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
        <button
          type="button"
          className="LUX_basic_btn Image basic"
          onClick={() => smartPickerRef.current.handleTouchTap()}
          disabled={props.disabled}
        >
          <svg viewBox="0 0 24 24" className="ico_svg">
            <path d="M21.767,20.571l-4.625-4.625c2.988-3.647,2.453-9.025-1.194-12.013S6.921,1.48,3.933,5.127 C0.945,8.774,1.48,14.152,5.127,17.14c3.146,2.577,7.674,2.577,10.82,0l4.624,4.623c0.335,0.323,0.869,0.314,1.192-0.021 c0.316-0.327,0.316-0.845,0-1.171L21.767,20.571z M10.638,17.386c-3.725,0-6.745-3.019-6.745-6.744s3.02-6.744,6.745-6.744 s6.745,3.019,6.745,6.744c0,3.723-3.017,6.741-6.74,6.744H10.638z M14.015,11.487h-2.529v2.529c0,0.466-0.377,0.843-0.843,0.843 c-0.466,0-0.843-0.377-0.843-0.843v-2.529H7.271c-0.466,0-0.843-0.377-0.843-0.843s0.377-0.843,0.843-0.843H9.8V7.272 c0-0.466,0.377-0.843,0.843-0.843c0.466,0,0.843,0.377,0.843,0.843v2.529h2.529c0.466,0,0.843,0.377,0.843,0.843 S14.481,11.487,14.015,11.487z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default CustomStyledSmartPicker;

CustomStyledSmartPicker.propTypes = {
  disabled: PropTypes.bool,
};

CustomStyledSmartPicker.defaultProps = {
  disabled: false,
};
