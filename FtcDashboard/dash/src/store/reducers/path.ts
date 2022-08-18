/* eslint-disable no-fallthrough */
import { Path, SegmentData } from '../types';
import {
  addSegmentPathAction,
  setSegmentPathAction,
  setStartPathAction,
  uploadPathAction,
  setPathAction,
} from '../actions/path';

const initialState: Path = {
  start: {
    x: 0,
    y: 0,
    tangent: 0,
    heading: 0,
  }, // as Omit<SegmentData, 'type' | 'time' | 'headingType'>,
  segments: [] as SegmentData[],
};

const pathReducer = (
  state = initialState,
  action:
    | ReturnType<typeof uploadPathAction>
    | ReturnType<typeof setStartPathAction>
    | ReturnType<typeof setSegmentPathAction>
    | ReturnType<typeof setPathAction>
    | ReturnType<typeof addSegmentPathAction>,
) => {
  if (action.type === 'SET_PATH') Object.assign(state, action.newVals);
  if (action.type === 'ADD_SEGMENT_PATH')
    state.segments.push({
      type: 'Spline',
      x: 0,
      y: 0,
      tangent: 0,
      time: 0,
      heading: 0,
      headingType: 'Tangent',
    });
  if (action.type === 'SET_START_PATH')
    Object.assign(state.start, action.newVals);
  if (action.type === 'SET_SEGMENT_PATH')
    Object.assign(state.segments[action.i], action.newVals);
  // case 'UPLOAD_PATH':

  return state;
};

export default pathReducer;
