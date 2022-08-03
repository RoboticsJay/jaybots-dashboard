import React, {
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import fieldImageName from '../assets/field.png';

import BaseView, {
  BaseViewBody,
  BaseViewHeading,
  BaseViewHeadingProps,
  BaseViewProps,
} from './BaseView';
import {
  Stage,
  Layer,
  Image,
  Circle,
  Line,
  Text,
  Group,
  Shape,
} from 'react-konva';

import { RootState } from '../store/reducers';
import useImage from 'use-image';
import {
  addSegmentPathAction,
  setSegmentPathAction,
  setStartPathAction,
  uploadPathAction,
} from '../store/actions/path';
import { headingTypes } from '../store/types';

const mod = (val: number, base: number) => (val + base) % base;
const deg2rad = (deg: number) => mod((deg / 180) * Math.PI, 2 * Math.PI);
const rad2deg = (rad: number) => mod((rad / Math.PI) * 180, 360);

const clamp = (min: number, val: number, max: number) =>
  Math.min(Math.max(min, val), max);

type PathSegmentViewProps = BaseViewProps & BaseViewHeadingProps;

function PathView({ isUnlocked, isDraggable }: PathSegmentViewProps) {
  const dispatch = useDispatch();
  const container = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState(0);
  const {
    path: { start, segments },
    overlay,
  } = useSelector(({ path, telemetry }: RootState) => ({
    path,
    overlay: telemetry[telemetry.length - 1].fieldOverlay,
  }));
  const points = [start].concat(segments);
  const [image] = useImage(fieldImageName);
  useEffect(() => {
    if (container.current)
      new ResizeObserver(([{ contentRect }]) => {
        setCanvasSize(Math.min(contentRect.width, contentRect.height - 24));
      }).observe(container.current);
  }, []);

  const [multiplier, setMultiplier] = useState('');
  const [selected, setSelected] = useState(0);
  const [pickingAngle, setPickingAngle] = useState('');
  const angleSelecter = useRef<HTMLDivElement | null>(null);
  const pickAngle = (name: string) => {
    if (!angleSelecter.current || !container.current) return;
    setPickingAngle(name);
    const rect = container.current.firstElementChild?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
    };
    const pageX = rect.x + canvasSize * (points[selected].x / 144 + 0.5);
    const pageY = rect.y + canvasSize * (-points[selected].y / 144 + 0.5);

    const a = angleSelecter.current;
    a.style.left = pageX - 32 + 'px';
    a.style.top = pageY - 32 + 'px';

    window.addEventListener('mousemove', ({ x, y }) => {
      const angle = rad2deg(Math.atan2(y - pageY, x - pageX));
      a.parentElement?.style.setProperty('--angle', angle.toFixed());
    });
  };

  const movePoint = (i: number, dx = 0, dy = 0) =>
    dispatch(
      i
        ? setSegmentPathAction(i - 1, {
            x: clamp(-72, points[i].x + dx * (+multiplier || 1), 72),
            y: clamp(-72, points[i].y + dy * (+multiplier || 1), 72),
          })
        : setStartPathAction({
            x: clamp(-72, start.x + dx * (+multiplier || 1), 72),
            y: clamp(-72, start.y + dy * (+multiplier || 1), 72),
          }),
    );
  const handleShortcuts: KeyboardEventHandler<HTMLDivElement> = (e) => {
    const key = `${e.nativeEvent.ctrlKey ? '^' : ''}${e.nativeEvent.key}`;
    if (/^[0-9]$/.test(key)) setMultiplier((prev) => prev + key);
    else if (pickingAngle) {
      if (key === 'j') 0;
      else if (key === 'J') 0;
      else if (key === 'k') 0;
      else if (key === 'K') 0;
      else return;
    } else {
      if (key === 'h') movePoint(selected, -4);
      else if (key === 'j') movePoint(selected, 0, -4);
      else if (key === 'k') movePoint(selected, 0, 4);
      else if (key === 'l') movePoint(selected, 4);
      else if (key === 'H') movePoint(selected, -1);
      else if (key === 'J') movePoint(selected, 0, -1);
      else if (key === 'K') movePoint(selected, 0, 1);
      else if (key === 'L') movePoint(selected, 1);
      else if (key === '^j')
        setSelected((prev) => clamp(0, prev - 1, segments.length));
      else if (key === '^k')
        setSelected((prev) => clamp(0, prev + 1, segments.length));
      else if (key === 'a') {
        dispatch(addSegmentPathAction());
        setSelected(points.length);
      } else if (key === 't')
        dispatch(
          selected
            ? setSegmentPathAction(selected - 1, {
                tangent: deg2rad(+multiplier),
              })
            : setStartPathAction({ tangent: deg2rad(+multiplier) }),
        );
      else if (key === 'T') pickAngle('tangent');
      else if (key === 'f')
        dispatch(
          selected
            ? setSegmentPathAction(selected - 1, {
                heading: deg2rad(+multiplier),
              })
            : setStartPathAction({ heading: deg2rad(+multiplier) }),
        );
      else if (key === 'F') pickAngle('heading');
      else if (key === 'i')
        dispatch(
          setSegmentPathAction(selected - 1, {
            headingType:
              headingTypes[
                multiplier
                  ? clamp(0, +multiplier - 1, 3)
                  : (headingTypes.indexOf(segments[selected - 1].headingType) +
                      1) %
                    4
              ],
          }),
        );
      else if (key === 'd')
        dispatch(setSegmentPathAction(selected - 1, { time: +multiplier }));
      else if (key === 's') {
        if (selected)
          dispatch(setSegmentPathAction(selected - 1, { type: 'Spline' }));
      } else if (key === 'S') {
        if (selected)
          dispatch(setSegmentPathAction(selected - 1, { type: 'Line' }));
      } else if (key === 'w') {
        if (selected)
          dispatch(setSegmentPathAction(selected - 1, { type: 'Wait' }));
      } else if (key === 'g')
        setSelected(clamp(0, +multiplier, points.length - 1));
      else if (key === 'G') setSelected(points.length - 1);
      else if (key === 'r') dispatch(uploadPathAction(start, segments));
      else if (key === 'Escape') 0;
      else return;

      setMultiplier('');
    }
    e.preventDefault();
  };

  return (
    <BaseView isUnlocked={isUnlocked}>
      <div className="flex">
        <BaseViewHeading isDraggable={isDraggable}>Draw a Path</BaseViewHeading>
        <span className="text-lg px-4 py-2">{multiplier}</span>
      </div>
      <BaseViewBody
        ref={container}
        className="flex flex-col"
        tabIndex={0}
        onKeyDown={handleShortcuts}
      >
        <Stage
          height={canvasSize}
          width={canvasSize}
          className="m-auto"
          offset={{ x: -canvasSize / 2, y: -canvasSize / 2 }}
        >
          <Layer scale={{ x: canvasSize, y: canvasSize }} rotation={90}>
            <Image
              image={image}
              scale={{
                x: 1 / (image?.width ?? 1),
                y: 1 / (image?.height ?? 1),
              }}
              opacity={0.4}
              offset={{
                x: (image?.width ?? 1) / 2,
                y: (image?.width ?? 1) / 2,
              }}
            />

            {[0, 1].map((dir) =>
              Array(18)
                .fill(0)
                .map((_, i) => [(i - 9) / 18, i % 3 === 0] as const)
                .map(([i, primary]) => (
                  <Line
                    key={i}
                    points={dir ? [i, -1, i, 1] : [-1, i, 1, i]}
                    stroke="rgb(120, 120, 120)"
                    strokeWidth={(primary ? 2 : 1) / canvasSize}
                    lineCap="round"
                    lineJoin="round"
                    dash={[0.01, 0.01]}
                    dashEnabled={!primary}
                  />
                )),
            )}
          </Layer>
          <Layer
            scale={{ x: canvasSize / 144, y: -canvasSize / 144 }}
            hitGraphEnabled={true}
          >
            <Circle
              x={start.x}
              y={start.y}
              radius={2}
              fill={selected === 0 ? 'yellow' : 'green'}
              draggable
              onMouseDown={() => setSelected(0)}
              onDragEnd={({ target }) =>
                dispatch(
                  setStartPathAction({
                    x: Math.round(target.x()),
                    y: Math.round(target.y()),
                  }),
                )
              }
              onDragMove={({ target }) => {
                target.x(clamp(-72, target.x(), 72));
                target.y(clamp(-72, target.y(), 72));
              }}
              onMouseOver={() =>
                container.current?.style.setProperty('cursor', 'pointer')
              }
              onMouseOut={() =>
                container.current?.style.setProperty('cursor', 'default')
              }
            />
            {segments.map((s, i) => (
              <Group
                key={i}
                x={s.x}
                y={s.y}
                draggable
                onMouseDown={() => setSelected(i + 1)}
                onDragEnd={({ target }) =>
                  dispatch(
                    setSegmentPathAction(i, {
                      x: Math.round(target.x()),
                      y: Math.round(target.y()),
                    }),
                  )
                }
                onDragMove={({ target }) => {
                  target.x(clamp(-72, target.x(), 72));
                  target.y(clamp(-72, target.y(), 72));
                }}
                onMouseOver={() =>
                  container.current?.style.setProperty('cursor', 'pointer')
                }
                onMouseOut={() =>
                  container.current?.style.setProperty('cursor', 'default')
                }
              >
                <Circle
                  radius={2}
                  fill={
                    selected === i + 1
                      ? 'yellow'
                      : s.type === 'Spline'
                      ? 'blue'
                      : 'purple'
                  }
                />
                <Text
                  key={i}
                  offset={{ x: 1.3, y: 1.5 }}
                  scaleY={-1}
                  text={(i + 1).toString()}
                  fontSize={4}
                  fill={selected === i + 1 ? 'black' : 'white'}
                  // strokeHitEnabled={false}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
        <div
          className={`${
            pickingAngle ? 'absolute' : 'hidden'
          } top-0 left-0 w-screen h-screen`}
          onClick={(e) => {
            dispatch(
              selected
                ? setSegmentPathAction(selected - 1, {
                    [pickingAngle]: deg2rad(
                      +getComputedStyle(
                        e.target as HTMLElement,
                      ).getPropertyValue('--angle') + 180,
                    ),
                  })
                : setStartPathAction({
                    [pickingAngle]: deg2rad(
                      +getComputedStyle(
                        e.target as HTMLElement,
                      ).getPropertyValue('--angle') + 180,
                    ),
                  }),
            );
            setPickingAngle('');
          }}
          onContextMenu={(e) => {
            setPickingAngle('');
            e.preventDefault();
          }}
        >
          <div
            ref={angleSelecter}
            className="direction-selector absolute w-16 h-16 rounded-full"
          ></div>
        </div>
      </BaseViewBody>
    </BaseView>
  );
}

PathView.propTypes = {
  isDraggable: PropTypes.bool,
  isUnlocked: PropTypes.bool,
};

export default PathView;
