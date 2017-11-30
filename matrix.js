'use strict'

// ==============================
// Utilities
const cl = console.log
const asum = (xs) => xs.reduce((acc, x) => acc + x)
const round_to_half = (x) => {
  return Math.round(Math.round(x * 10) / 5) / 2
}

// ==============================
// https://en.wikipedia.org/wiki/Lab_color_space#Reverse_transformation
const f_1 = (t) => {
  const gamma = 6 / 29
  if (t > gamma)
    return Math.pow(t, 3)
  else
    return Math.pow(gamma, 2) * 3 * (t - 4 / 29)
}

const Lab_to_XYZ = (l, a, b, d_white) => {
  // Under Illuminant D65 with normalization Y = 100, the values are
  let Xn = 95.047
  let Yn = 100
  let Zn = 108.883

  if (d_white == 50) {
    // Values for illuminant D50 are
    Xn = 96.6797
    Yn = 100
    Zn = 82.5188
  }
  let X = Xn * f_1((l + 16) / 116 + a / 500)
  let Y = Yn * f_1((l + 16) / 116)
  let Z = Zn * f_1((l + 16) / 116 - b / 200)
    // cl('X,Y,Z: ', X, Y, Z)
  return [X, Y, Z]

}

// ==============================
// https://en.wikipedia.org/wiki/SRGB
const gamma_sRGB = (c) => {
  if (c <= 0.0031308)
    return 12.92 * c
  else
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

const XYZ_to_sRGB = (xyz) => {
  let xyz_n = xyz.map(x => x / 100)

  let A = [
    3.2406255, -1.5372080, -0.4986286,
    -0.9689307, 1.8757561, 0.0415175,
    0.0557101, -0.2040211, 1.0569959,
  ]

  let rgb_lin = matmul(A, xyz_n, 3, 3, 1)
  let rgb = rgb_lin.map(x => Math.round(255 * gamma_sRGB(x)))
    .map(x => x > 0 ? x : 0)
    .map(x => x < 256 ? x : 255)
  return rgb
}

// const XYZn_to_sRGB = (Xn, Yn, Zn) => {
//   Rlin = Xn * 3.2406255 + Yn * -1.5372080 + Zn * -0.4986286
//   Glin = Xn * -0.9689307 + Yn * 1.8757561 + Zn * 0.0415175
//   Blin = Xn * 0.0557101 + Yn * -0.2040211 + Zn * 1.0569959
//   R = Math.round(255 * gamma_sRGB(Rlin))
//   G = Math.round(255 * gamma_sRGB(Glin))
//   B = Math.round(255 * gamma_sRGB(Blin))
//   return [R, G, B]
// }

// ==============================
const Lab_to_SRGB = (l, a, b, d_white) => {
  let xyz = Lab_to_XYZ(l, a, b, d_white)
  return XYZ_to_sRGB(xyz)
}

// ==============================
// (l, a, b, d_white = 65) => [[int, int, int](rgb), float (Gost)]
const Lab_to_Gost = (l, a, b, d_white = 65) => {
  let lab = [l,a,b,d_white].map(x=> x*1.0)
  let rgb = Lab_to_SRGB.apply(null, lab)
  cl('rgb', rgb)
  let g = rgb[1] / asum(rgb)
  let c = round_to_half(10.7460 - 25.39 * g)
  return [rgb, c]
}

// ==============================
function matmul(A, B, m, l, n) {
  var C = new Array(m * n);
  var i = 0;
  var j = 0;
  var k = 0;

  for (i = 0; i < m; i++) {
    for (j = 0; j < n; j++) {
      var total = 0;

      for (k = 0; k < l; k++) {
        total += A[i * l + k] * B[k * n + j];
      }

      C[i * n + j] = total;
    }
  }
  return C;
}


// ==============================
const formHandler = () => {
  const form = document.querySelector("#f1");
  const circle = document.querySelector("#circle");
  const res = document.querySelector("#gost");

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    return run()

  })

  form.addEventListener("change", (event) => {
    return run()
  })

  const run = (event) => {
    const l = form.elements.L.value
    const a = form.elements.a.value
    const b = form.elements.b.value
    const d_white = form.elements.dwhite.value || 65

    cl(l, a, b, d_white)

    const got = Lab_to_Gost(l, a, b, d_white)
    const rgb = got[0]
    const gost = got[1]
    cl(got)
    cl(rgb)
    cl(gost)
    const thergb = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    circle.style.background = thergb
    res.innerHTML = gost

    return false
  }

}

if (typeof module !== 'undefined') {
  module.exports.matmul = matmul
  module.exports.Lab_to_XYZ = Lab_to_XYZ
  module.exports.XYZ_to_sRGB = XYZ_to_sRGB
  module.exports.Lab_to_SRGB = Lab_to_SRGB
  module.exports.Lab_to_Gost = Lab_to_Gost
  module.exports.asum = asum
  module.exports.cl = cl
  module.exports.round_to_half = round_to_half
}
