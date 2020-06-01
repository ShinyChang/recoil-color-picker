export const HSVtoRGB = (h, s, v) => {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r,
    g,
    b
  };
};

export const RGBtoHSV = (r, g, b) => {
  let rr, gg, bb, h, s, v, diff, diffc;
  v = Math.max(r, g, b);
  diff = v - Math.min(r, g, b);
  diffc = c => (v - c) / 6 / diff + 1 / 2;
  if (diff === 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = 1 / 3 + rr - bb;
    } else if (b === v) {
      h = 2 / 3 + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return {
    h,
    s,
    v
  };
};

export const minmax = (value, min, max) => Math.max(Math.min(value, max), min);
export const toHex = arr =>
  `#${arr
    .map(v =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()
    )
    .join('')}`;
