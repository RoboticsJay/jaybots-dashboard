import { Path, SegmentData } from '../types/path';

export const uploadPathAction = () => ({
  type: 'UPLOAD_PATH' as const,
});

export const setStartPathAction = (newVals: Partial<Path['start']>) => ({
  type: 'SET_START_PATH' as const,
  newVals,
});

export const setSegmentPathAction = (i: number, newVals: Partial<SegmentData>) => ({
  type: 'SET_SEGMENT_PATH' as const,
  i,
  newVals,
});

export const clearSegmentsPathAction = () => ({
  type: 'SET_PATH' as const,
  newVals: { segments: [] },
});

export const addSegmentPathAction = () => ({
  type: 'ADD_SEGMENT_PATH' as const,
});
