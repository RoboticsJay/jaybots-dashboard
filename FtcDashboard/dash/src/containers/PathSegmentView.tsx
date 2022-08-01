import React, { useState } from 'react';

import BaseView, {
  BaseViewHeading,
  BaseViewBody,
  BaseViewProps,
  BaseViewHeadingProps,
  BaseViewIconButton,
  BaseViewIcons,
} from './BaseView';
import { ReactComponent as AddIcon } from '../assets/icons/add.svg';
import { ReactComponent as SaveIcon } from '../assets/icons/save.svg';
import { ReactComponent as DownloadIcon } from '../assets/icons/file_download.svg';
import { ReactComponent as DeleteIcon } from '../assets/icons/delete.svg';
import PathSegment from '../components/PathSegment';
import { SegmentData, Path } from '../store/types';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  addSegmentPathAction,
  clearSegmentsPathAction,
  setSegmentPathAction,
  setStartPathAction,
  uploadPathAction,
} from '../store/actions/path';
import PointInput from '../components/inputs/PointInput';
import AngleInput from '../components/inputs/AngleInput';
import { RootState } from '../store/reducers';

type PathSegmentViewProps = BaseViewProps & BaseViewHeadingProps;

const exportPath = (
  start: Omit<SegmentData, 'type' | 'time' | 'headingType'>,
  segments: SegmentData[],
) => `---
startPose:
  x: ${start.x}
  y: ${start.y}
  heading: ${start.heading}
startTangent: ${start.tangent}
waypoints:
${segments
  .map(
    (segment) => `- position:
    x: ${segment.x}
    y: ${segment.y}
  interpolationType: "${segment.headingType.toUpperCase()}"
  heading: ${segment.heading}
  tangent: ${segment.tangent}
  type: ${segment.type}`,
  )
  .join('\n')}
resolution: 0.25
version: 1
`;

const PathSegmentView = ({ isDraggable = false, isUnlocked = false }: PathSegmentViewProps) => {
  const dispatch = useDispatch();
  const { start, segments } = useSelector((state: RootState) => ({
    ...state.path,
  }));
  return (
    <BaseView isUnlocked={isUnlocked}>
      <div className="flex">
        <BaseViewHeading isDraggable={isDraggable}>Path Segments</BaseViewHeading>
        <BaseViewIcons>
          <BaseViewIconButton onClick={() => dispatch(clearSegmentsPathAction())}>
            <DeleteIcon className="w-6 h-6" fill="black" />
          </BaseViewIconButton>
          <BaseViewIconButton onClick={() => console.log(exportPath(start, segments))}>
            <DownloadIcon className="w-6 h-6" fill="black" />
          </BaseViewIconButton>
          <BaseViewIconButton onClick={() => dispatch(uploadPathAction())}>
            <SaveIcon className="w-6 h-6" />
          </BaseViewIconButton>
          <BaseViewIconButton onClick={() => dispatch(addSegmentPathAction())}>
            <AddIcon className="w-6 h-6" />
          </BaseViewIconButton>
        </BaseViewIcons>
      </div>
      <BaseViewBody className="flex flex-col">
        <div className="flex-grow">
          <div className="flex self-center gap-2 mb-2">
            <div className="flex-grow self-center">Start at</div>
            <PointInput
              valueX={start.x}
              valueY={start.y}
              onChange={(newVals) => dispatch(setStartPathAction(newVals))}
            />
          </div>
          <div className="flex self-center gap-2 mb-2">
            <div className="flex-grow self-center">Start Tangent:</div>
            <AngleInput
              value={start.tangent}
              name="tangent"
              onChange={(newVals) => dispatch(setStartPathAction(newVals))}
            />
          </div>
          <div className="flex self-center gap-2 mb-2">
            <div className="flex-grow self-center">Start Heading:</div>
            <AngleInput
              value={start.heading}
              name="heading"
              onChange={(newVals) => dispatch(setStartPathAction(newVals))}
            />
          </div>
          <ol className="list-decimal marker:hover:cursor-move pl-4" start={1}>
            {segments.map((segment, i) => (
              <PathSegment
                key={i}
                onChange={(newVals) => dispatch(setSegmentPathAction(i, newVals))}
                data={segment}
              />
            ))}
          </ol>
        </div>
      </BaseViewBody>
    </BaseView>
  );
};

export default PathSegmentView;
