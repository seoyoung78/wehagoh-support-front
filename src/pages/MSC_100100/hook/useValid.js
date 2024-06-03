import { useCallback, useRef } from "react";
import useMSC100100Store from "../store";

/* LUXInputField, LUXTextArea 에만 적용할 수 있음 */
export function useValid(key) {
  const isValid = useMSC100100Store(state => state.valid.isValid);
  const ref = useRef(null);

  if (ref.current) {
    if (isValid(key)) {
      ref.current?.validationClean && ref.current.validationClean();
      ref.current?.validation && ref.current.validation("clean");
    } else {
      ref.current?.validationError && ref.current.validationError();
      ref.current?.validation && ref.current.validation("error");
    }
  }

  const initializeHandler = useCallback(
    el => {
      ref.current = el;
      if (isValid(key)) {
        ref.current?.validationClean && ref.current.validationClean();
        ref.current?.validation && ref.current.validation("clean");
      } else {
        ref.current?.validationError && ref.current.validationError();
        ref.current?.validation && ref.current.validation("error");
      }
    },
    [isValid, key],
  );

  return [ref, initializeHandler];
}
