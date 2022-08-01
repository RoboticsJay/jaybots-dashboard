import React, { createRef, MouseEventHandler, useState } from 'react';
import { SegmentData } from '../../store/types';

const mod = (val: number, base: number) => (val + base) % base;
const deg2rad = (deg: number) => mod((deg / 180) * Math.PI, 2 * Math.PI);
const rad2deg = (rad: number) => mod((rad / Math.PI) * 180, 360);

export default function AngleInput({
  value,
  name,
  onChange,
}: {
  value: number;
  name: string;
  onChange: (_: Partial<SegmentData>) => void;
}) {
  const [isPickingAngle, setIsPickingAngle] = useState(false);
  const angleSelecter = createRef<HTMLDivElement>();
  const pickAngle: MouseEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    e.persist();
    setIsPickingAngle(true);

    if (!angleSelecter.current) return;
    const a = angleSelecter.current;

    a.style.left = e.pageX - 32 + 'px';
    a.style.top = e.pageY - 32 + 'px';

    window.addEventListener('mousemove', ({ x, y }) => {
      const angle = rad2deg(Math.atan2(y - e.pageY, x - e.pageX));
      a.parentElement?.style.setProperty('--angle', angle.toFixed());
    });
  };

  return (
    <>
      <input
        type="number"
        name={name}
        step={15}
        value={rad2deg(value).toFixed()}
        onChange={(e) => onChange({ [name]: deg2rad(+e.target.value) })}
        className="w-16 h-8 p-2"
        title={`${name} in degrees`}
        onContextMenu={pickAngle}
      />
      <div
        className={`${isPickingAngle ? 'absolute' : 'hidden'} top-0 left-0 w-screen h-screen`}
        onClick={(e) => {
          onChange({
            [name]: deg2rad(
              +getComputedStyle(e.target as HTMLElement).getPropertyValue('--angle') + 90,
            ),
          });
          setIsPickingAngle(false);
        }}
        onContextMenu={(e) => {
          setIsPickingAngle(false);
          e.preventDefault();
        }}
      >
        <div
          ref={angleSelecter}
          className="direction-selector absolute w-16 h-16 rounded-full"
        ></div>
      </div>
    </>
  );
}
