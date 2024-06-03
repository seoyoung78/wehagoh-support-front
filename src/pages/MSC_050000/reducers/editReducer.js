// 액션 타입 정의
const INITIALIZE_STATES = "INITIALIZE_STATES";
const SINGLE_DATA = "SINGLE_DATA";
const UPDATE_DETAILS_SET = "UPDATE_DETAILS_SET";

// 액션 생성자 함수
const createAction = (type, payload) => ({
  type,
  payload,
});

// 상태 업데이트를 위한 공통 함수
const dispatchAction = (dispatch, actionType, payload) => {
  const action = createAction(actionType, payload);
  dispatch(action);
};

/**
 * 초기 상태를 설정하는 액션을 디스패치한다.
 * 사용자 인터페이스의 초기 상태를 설정하거나, 애플리케이션을 초기 상태로 리셋할 때 사용된다.
 *
 * @param {function} dispatch - useReducer 훅에서 제공된 dispatch 함수.
 * @param {Object} stateData - 초기화할 상태 데이터.
 */
export const dispatchInitialStates = (dispatch, stateData) => {
  dispatchAction(dispatch, INITIALIZE_STATES, stateData);
};

/**
 * 상태 업데이트 액션을 디스패치하는 고차 함수이다.
 * 반환된 함수는 상태 업데이트를 위한 액션을 디스패치할 때 사용된다.
 *
 * @param {Function} dispatch - useReducer 훅에서 제공된 dispatch 함수.
 * @returns {Function} payload를 매개변수로 받아 상태 업데이트 액션을 디스패치하는 함수.
 */
export const dispatchUpdateStates = dispatch => payload => {
  dispatchAction(dispatch, UPDATE_DETAILS_SET, payload);
};

/**
 * 고차 함수로서, dispatch 함수를 받아 특정 ID와 값을 가지는 action을 dispatch하는 함수 반환.
 * @param {Function} dispatch - useReducer 훅에서 제공된 dispatch 함수.
 * @returns {Function} 특정 ID와 값을 payload로 가지는 action을 dispatch하는 함수
 */
export const handleDataChange = dispatch => (id, value) => {
  dispatch({
    type: SINGLE_DATA,
    field: id,
    payload: value,
  });
};

// 리듀서
export const editReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE_STATES:
      return {
        ...state,
        initialized: true,
        ...action.payload,
      };
    case SINGLE_DATA:
      return {
        ...state,
        [action.field]: action.payload,
      };
    case UPDATE_DETAILS_SET:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};
