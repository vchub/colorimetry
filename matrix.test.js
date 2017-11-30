const Lab_to_XYZ = require('./matrix').Lab_to_XYZ
const XYZ_to_sRGB = require('./matrix').XYZ_to_sRGB
const Lab_to_SRGB = require('./matrix').Lab_to_SRGB
const Lab_to_Gost = require('./matrix').Lab_to_Gost
const asum = require('./matrix').asum
const cl = require('./matrix').cl
const matmul = require('./matrix').matmul
const round_to_half = require('./matrix').round_to_half
const around = (xs) => xs.map((x) => Math.round(x))

test('Lab_to_XYZ', () => {
  // converter: https://nixsensor.com/free-color-converter/
  // for D65 2 degree
  let lab = [90, 0, 60]
  let got = Lab_to_XYZ.apply(null, lab)
  exp = around([72.52, 76.30, 25.18])
  expect(around(got)).toEqual(exp)

  expect(around(Lab_to_XYZ.apply(null, [20, 10, 30])))
    .toEqual(around([3.43, 2.99, 0.31]))

  expect(around(Lab_to_XYZ.apply(null, [40, -60, -40])))
    .toEqual(around([4.54, 11.25, 34.65]))
})

test('XYZ_to_sRGB', () => {
  // converter: https://nixsensor.com/free-color-converter/
  expect(XYZ_to_sRGB([4.54, 11.25, 34.65]))
    .toEqual([0, 118, 159])

  expect(around(XYZ_to_sRGB([70, 70, 20])))
    .toEqual([255, 210, 92])
})

test('Lab_to_SRGB', () => {
  // converter: https://nixsensor.com/free-color-converter/
  expect(Lab_to_SRGB.apply(null, [90, 0, 60, 65]))
    .toEqual([255, 223, 108])
  expect(Lab_to_SRGB.apply(null, [70, -20, 60]))
    .toEqual([168, 179, 52])
})

test('Lab to Gost', () => {
  let lab = [52.47, 18.98, 52.89, 65]
  let got = Lab_to_Gost.apply(null, lab)
  expect(got[0]).toEqual([175, 111, 27])
  expect(got[1]).toEqual(1.5)

  lab = [25.01, 35.35, 28.23]
  got = Lab_to_Gost.apply(null, lab)
  expect(got[0]).toEqual([112, 30, 18])
  expect(got[1]).toEqual(6)

  got = Lab_to_Gost(25.01, 35.35, 28.23)
  expect(got[0]).toEqual([112, 30, 18])
  expect(got[1]).toEqual(6)
})


test('asum, round_to_half', () => {
  expect(asum([1, 2, 3])).toEqual(6)
  expect(asum([1, -2, 3])).toEqual(2)

  expect(round_to_half(1.1)).toEqual(1)
  expect(round_to_half(1.5)).toEqual(1.5)
  expect(round_to_half(1.8)).toEqual(2)
  expect(round_to_half(4.4)).toEqual(4.5)
  expect(round_to_half(4.24)).toEqual(4)
  expect(round_to_half(4.25)).toEqual(4.5)
  expect(round_to_half(4.501)).toEqual(4.5)
})

test('matmul', () => {
  let A = [
    1, 0,
    0, 1
  ]
  let B = [
    1, 0,
    0, 1
  ]
  got = matmul(A, B, 2, 2, 2)
  exp = [
    1, 0,
    0, 1
  ]
  expect(got).toEqual(exp)

  A = [
    1, -1,
    0, 1
  ]
  B = [
    1, 1,
    0, 1
  ]
  got = matmul(A, B, 2, 2, 2)
  exp = [
    1, 0,
    0, 1
  ]
  expect(got).toEqual(exp)

  A = [
    1, -1,
    0, 1
  ]
  B = [1, 1]
  got = matmul(A, B, 2, 2, 1)
  exp = [0, 1]
  expect(got).toEqual(exp)
})
