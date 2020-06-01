import React, { useRef, useCallback, useEffect } from 'react';
import './App.css';
import { RecoilRoot, atom, selector, useRecoilState, useRecoilValue } from 'recoil';
import { minmax, HSVtoRGB, RGBtoHSV, toHex } from './utils';

const HState = atom({
  key: 'h',
  default: 0
});
const SState = atom({
  key: 's',
  default: 1
});
const VState = atom({
  key: 'v',
  default: 1
});
const RState = atom({
  key: 'r',
  default: 1
});
const GState = atom({
  key: 'g',
  default: 0
});
const BState = atom({
  key: 'b',
  default: 0
});
const AState = atom({
  key: 'a',
  default: 1
});
const HsvState = selector({
  key: 'hsv',
  get: ({ get }) => {
    const h = get(HState);
    const s = get(SState);
    const v = get(VState);
    return [h, s, v];
  },
  set: ({ get, set }, [h, s, v]) => {
    if (h == null) {
      h = get(HState);
    }
    const { r, g, b } = HSVtoRGB(h, s, v);
    set(HState, h);
    set(SState, s);
    set(VState, v);
    set(RState, r);
    set(GState, g);
    set(BState, b);
  }
});
const RgbState = selector({
  key: 'rgb',
  get: ({ get }) => {
    const r = get(RState);
    const g = get(GState);
    const b = get(BState);
    return [r, g, b];
  },
  set: ({ set }, [r, g, b]) => {
    const { h, s, v } = RGBtoHSV(r, g, b);
    set(HState, h);
    set(SState, s);
    set(VState, v);
    set(RState, r);
    set(GState, g);
    set(BState, b);
  }
});

const HueHexState = selector({
  key: 'HueHexState',
  get: ({ get }) => {
    const h = get(HState);
    const { r, g, b } = HSVtoRGB(h, 1, 1);
    return toHex([r, g, b]);
  }
});

const RgbHexState = selector({
  key: 'rgbHex',
  get: ({ get }) => {
    const r = get(RState);
    const g = get(GState);
    const b = get(BState);
    return toHex([r, g, b]);
  }
});

const RgbaHexState = selector({
  key: 'rgbaHex',
  get: ({ get }) => {
    const hex = get(RgbHexState);
    const a = get(AState);
    const AA = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
    return `${hex}${AA}`;
  }
});

const Field = ({ caption, value, setValue, maxValue }) => {
  return (
    <fieldset>
      <legend>{caption}</legend>
      <input
        type="range"
        min={0}
        max={maxValue}
        value={Math.round(value * maxValue)}
        onChange={e => setValue(Number(e.target.value) / maxValue)}
      />
      <input
        type="number"
        min={0}
        max={maxValue}
        value={Math.round(value * maxValue)}
        onChange={e => setValue(Number(e.target.value) / maxValue)}
      />
    </fieldset>
  );
};

const createField = (caption, recoilState, maxValue) => () => {
  const [value, setValue] = useRecoilState(recoilState);
  return <Field value={value} setValue={setValue} caption={caption} maxValue={maxValue} />;
};

const ASlider = createField('A', AState, 100);

const Preview = () => {
  const rgba = useRecoilValue(RgbaHexState);
  return <div style={{ width: 16, height: 16, background: rgba, border: '1px solid', margin: 'auto' }}></div>;
};
const Hex = () => {
  const rgb = useRecoilValue(RgbHexState);
  return rgb;
};

const HSV = () => {
  const [[h, s, v], setHSV] = useRecoilState(HsvState);
  return (
    <div>
      <Field value={h} setValue={value => setHSV([value, s, v])} caption="H" maxValue={360} />
      <Field value={s} setValue={value => setHSV([h, value, v])} caption="S" maxValue={100} />
      <Field value={v} setValue={value => setHSV([h, s, value])} caption="V" maxValue={100} />
    </div>
  );
};

const RGB = () => {
  const [[r, g, b], setHSV] = useRecoilState(RgbState);
  return (
    <div>
      <Field value={r} setValue={value => setHSV([value, g, b])} caption="R" maxValue={255} />
      <Field value={g} setValue={value => setHSV([r, value, b])} caption="G" maxValue={255} />
      <Field value={b} setValue={value => setHSV([r, g, value])} caption="B" maxValue={255} />
    </div>
  );
};

const whiteOverlay = `linear-gradient(to right, #FFFFFF, #FFFFFF00)`;
const blackOverlay = `linear-gradient(to top, #000000, #00000000)`;

const Canvas = () => {
  const ref = useRef(null);
  const rect = useRef({});
  const color = useRecoilValue(HueHexState);
  const [[h, s, v], setHSV] = useRecoilState(HsvState);
  const handleMouseMove = useCallback(
    e => {
      const { clientX, clientY } = e;
      const { top, left, width, height } = rect.current;
      const v = minmax((clientY - top) / height, 0, 1);
      const s = minmax((clientX - left) / width, 0, 1);
      setHSV([, s, 1 - v]);
    },
    [rect, setHSV]
  );
  const handleMouseUp = useCallback(
    e => {
      window.removeEventListener('mousemove', handleMouseMove);
    },
    [handleMouseMove]
  );
  const handleMouseDown = () => {
    window.addEventListener('mouseup', handleMouseUp, { once: true });
    window.addEventListener('mousemove', handleMouseMove);
  };
  useEffect(() => {
    if (ref.current) {
      rect.current = ref.current.getBoundingClientRect();
    }
  }, [ref]);
  return (
    <div
      ref={ref}
      style={{ position: 'relative', width: 300, height: 200, background: `${blackOverlay},${whiteOverlay},${color}` }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          top: `${(1 - v) * 100}%`,
          left: `${s * 100}%`,
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: '2px solid white',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer'
        }}
      ></div>
    </div>
  );
};
function App() {
  return (
    <RecoilRoot>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>
            <HSV />
            <RGB />
          </div>
          <ASlider />
        </div>
        <div>
          <Canvas />
          <div style={{ display: 'inline-flex' }}>
            <Preview />
            <Hex />
          </div>
        </div>
      </div>
    </RecoilRoot>
  );
}

export default App;
