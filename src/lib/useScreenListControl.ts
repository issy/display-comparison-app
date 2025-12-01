import {useMemo, useReducer, type Reducer} from "react";

type DisplayInfo = {
  diagonalSize: number;
  aspectRatio: [x: number, y: number];
  colour: string; // TODO: Figure out how to store colour values
};

type State = {
  displays: Array<DisplayInfo>;
};

const initialState: State = {
  displays: [
    {
      diagonalSize: 27,
      aspectRatio: [16, 9],
      colour: 'red'
    }
  ]
};

type Action =
    | { type: 'ADD_DISPLAY', payload: DisplayInfo }
    | { type: 'REMOVE_DISPLAY', payload: number }
    | { type: 'UPDATE_DISPLAY_INFO', payload: { index: number, data: DisplayInfo } }
    | { type: 'RESET' }

const reducer: Reducer<State, Action> = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_DISPLAY':
      return {
        displays: [...state.displays, action.payload]
      };
    case 'REMOVE_DISPLAY':
      return {displays: state.displays.toSpliced(action.payload)};
    case 'UPDATE_DISPLAY_INFO':
      if (action.payload.index >= 0 && state.displays.length > action.payload.index) {
        return {
          displays: state.displays.toSpliced(action.payload.index, 1, action.payload.data)
        }
      }
      break
    case 'RESET':
      return initialState
  }
  return state;
};

const getRandomColour = (currentColours: Array<DisplayInfo['colour']>): DisplayInfo['colour'] => {
  return 'red';
};

const useScreenListControl = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return useMemo(() => ({
    state,
    addDisplay() {
      dispatch({
        type: 'ADD_DISPLAY',
        payload: {
          diagonalSize: 27,
          aspectRatio: [16, 9],
          colour: getRandomColour(state.displays.map(({colour}) => colour))
        }
      })
    },
    removeDisplay(index: number) {
      dispatch({type: 'REMOVE_DISPLAY', payload: index})
    },
    updateDisplayInfo(index: number, data: DisplayInfo) {
      dispatch({type: 'UPDATE_DISPLAY_INFO', payload: {index, data}})
    },
    reset() {
      dispatch({type: 'RESET'})
    }
  }), [state])
};

export default useScreenListControl;
