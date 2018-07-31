import * as req from 'supertest'

import { assert } from 'chai'

import app from '../app'

describe('companies', () => {
  it('list', () =>
    req(app)
      .get('/v1')
      .expect(200)
      .then(({ body }) =>
        assert.sameMembers(body, ['tutujibus', 'unobus', 'ryobibus', 'shimodenbus'])
      ))

  describe('stops', () => {
    it('404', () =>
      req(app)
        .get('/v1/null/stops')
        .expect(404))

    describe('schedule', () => {
      it('404', () =>
        req(app)
          .get('/v1/null/stops/null/schedule')
          .expect(404))
    })
  })
})

describe('unobus', function() {
  this.timeout(5000)

  describe('stops', () => {
    it('/', () =>
      req(app)
        .get('/v1/unobus/stops')
        .expect(200)
        .then(({ body }) =>
          assert.deepEqual(body, [
            '2_01',
            '2_02',
            '2_04',
            '2_08',
            '2_09',
            '2_11',
            '3_03',
            '4_01',
            '4_02',
            '4_03',
            '5_01',
            '6_01',
            '6_03',
            '6_04',
            '6_05',
            '6_06',
            '7_03',
            '7_04',
            '7_05',
            '8_01',
            '8_02',
            '8_03',
            '8_04',
            '8_05',
            '8_06',
            '10_01',
            '10_02',
            '10_03',
            '10_04',
            '10_05',
            '12_01',
            '12_02',
            '12_03',
            '12_04',
            '12_05',
            '12_06',
            '12_09',
            '14_01',
            '15_05',
            '16_01',
            '16_05',
            '18_01',
            '18_05',
            '20_01',
            '20_02',
            '20_05',
            '22_01',
            '22_02',
            '22_05',
            '24_01',
            '24_05',
            '26_01',
            '26_05',
            '28_01',
            '28_05',
            '30_01',
            '30_05',
            '32_01',
            '32_05',
            '34_01',
            '34_05',
            '36_01',
            '36_05',
            '38_01',
            '38_05',
            '40_01',
            '40_05',
            '42_01',
            '42_05',
            '44_01',
            '44_05',
            '46_01',
            '46_05',
            '46_09',
            '48_01',
            '48_05',
            '3002_01',
            '3002_02',
            '50_01',
            '50_05',
            '52_05',
            '54_01',
            '54_05',
            '56_01',
            '56_05',
            '58_01',
            '58_05',
            '60_05',
            '62_01',
            '62_05',
            '64_01',
            '64_05',
            '66_01',
            '66_05',
            '68_01',
            '68_05',
            '70_01',
            '70_05',
            '72_01',
            '72_05',
            '74_01',
            '74_05',
            '76_01',
            '76_05',
            '78_01',
            '78_05',
            '80_01',
            '80_05',
            '82_01',
            '82_05',
            '84_01',
            '84_05',
            '86_01',
            '86_05',
            '88_01',
            '88_05',
            '90_01',
            '90_05',
            '92_01',
            '92_05',
            '94_01',
            '94_05',
            '96_01',
            '96_05',
            '96_09',
            '98_01',
            '98_05',
            '100_01',
            '100_05',
            '102_01',
            '102_05',
            '104_01',
            '104_05',
            '106_01',
            '106_05',
            '108_01',
            '108_05',
            '110_01',
            '110_05',
            '112_01',
            '112_05',
            '114_01',
            '114_05',
            '116_01',
            '116_05',
            '118_01',
            '118_05',
            '120_01',
            '120_05',
            '122_01',
            '122_05',
            '124_01',
            '124_05',
            '126_05',
            '126_09',
            '3001_01',
            '192_01',
            '192_05',
            '194_01',
            '194_05',
            '196_05',
            '196_09',
            '200_02',
            '200_05',
            '202_02',
            '202_05',
            '204_02',
            '204_05',
            '206_02',
            '206_05',
            '208_02',
            '208_05',
            '210_02',
            '210_05',
            '212_02',
            '212_05',
            '214_02',
            '214_05',
            '216_02',
            '216_05',
            '218_02',
            '218_05',
            '220_02',
            '220_05',
            '222_02',
            '222_05',
            '224_02',
            '224_05',
            '226_02',
            '226_05',
            '228_02',
            '228_05',
            '230_02',
            '230_05',
            '232_02',
            '232_05',
            '234_02',
            '234_05',
            '236_02',
            '236_05',
            '238_02',
            '238_05',
            '240_02',
            '240_05',
            '242_02',
            '242_05',
            '244_02',
            '244_05',
            '246_02',
            '246_05',
            '248_05',
            '248_09',
            '249_05',
            '249_09',
            '306_03',
            '306_04',
            '306_05',
            '310_04',
            '311_04',
            '312_04',
            '312_05',
            '314_04',
            '314_05',
            '316_04',
            '316_05',
            '318_04',
            '318_05',
            '319_04',
            '319_05',
            '320_04',
            '320_05',
            '322_04',
            '322_05',
            '324_04',
            '324_05',
            '326_04',
            '326_05',
            '328_04',
            '328_05',
            '330_04',
            '330_05',
            '332_04',
            '332_05',
            '334_04',
            '334_05',
            '336_04',
            '336_05',
            '338_04',
            '338_05',
            '340_04',
            '340_05',
            '342_04',
            '342_05',
            '343_04',
            '343_05',
            '344_04',
            '344_05',
            '348_04',
            '348_05',
            '350_04',
            '350_05',
            '351_04',
            '351_05',
            '352_04',
            '352_05',
            '353_04',
            '353_05',
            '514_05',
            '516_05',
            '552_04',
            '552_05',
            '560_04',
            '560_05',
            '562_04',
            '562_05',
            '564_04',
            '564_05',
            '566_04',
            '566_05',
            '568_04',
            '568_05',
            '570_04',
            '570_05',
            '572_04',
            '572_05',
            '574_04',
            '574_05',
            '586_04',
            '586_05',
            '588_04',
            '588_05',
            '590_04',
            '590_05',
            '600_03',
            '600_05',
            '602_03',
            '602_05',
            '604_03',
            '604_05',
            '618_03',
            '618_05',
            '620_03',
            '620_05',
            '622_03',
            '622_05',
            '624_03',
            '624_05',
            '626_03',
            '626_05',
            '628_03',
            '628_05',
            '630_03',
            '630_05',
            '632_03',
            '632_05',
            '634_03',
            '634_05',
            '636_03',
            '636_05',
            '638_03',
            '638_05',
            '640_03',
            '640_05',
            '642_03',
            '642_05',
            '644_03',
            '644_05',
            '646_03',
            '646_05',
            '648_03',
            '648_05',
            '650_03',
            '650_05',
            '652_03',
            '652_05',
            '658_03',
            '658_05',
            '660_03',
            '660_05',
            '662_03',
            '662_05',
            '664_03',
            '664_05',
            '670_03',
            '670_05',
            '672_03',
            '672_05',
            '674_03',
            '674_05',
            '676_03',
            '676_05',
            '678_03',
            '678_05',
            '680_03',
            '680_05',
            '682_03',
            '682_05',
            '684_03',
            '684_05',
            '686_03',
            '686_05',
            '688_03',
            '688_05',
            '690_03',
            '690_05',
            '700_01',
            '702_01',
            '702_05',
            '704_01',
            '704_05',
            '706_01',
            '706_05',
            '708_01',
            '708_05',
            '710_01',
            '710_05',
            '712_01',
            '712_05',
            '714_01',
            '714_05',
            '716_01',
            '716_05',
            '718_01',
            '718_05',
            '720_01',
            '720_05',
            '722_01',
            '722_05',
            '724_01',
            '724_05',
            '724_09',
            '726_01',
            '726_05',
            '728_01',
            '728_05',
            '730_01',
            '730_05',
            '732_01',
            '732_05',
            '734_01',
            '734_05',
            '736_01',
            '736_05',
            '738_04',
            '740_01',
            '740_05',
            '742_01',
            '742_05',
            '744_01',
            '744_05',
            '746_01',
            '746_05',
            '748_01',
            '748_05',
            '750_01',
            '750_05',
            '752_05',
            '752_06',
            '754_05',
            '754_06',
            '756_05',
            '756_06',
            '758_05',
            '758_06',
            '760_05',
            '760_06',
            '762_05',
            '762_06',
            '764_05',
            '764_06',
            '766_05',
            '766_06',
            '768_05',
            '768_06',
            '770_05',
            '770_06',
            '772_05',
            '772_06',
            '774_05',
            '774_06',
            '776_05',
            '776_06',
            '778_05',
            '778_09',
            '780_05',
            '780_06',
            '782_05',
            '782_06',
            '784_05',
            '784_06',
            '786_05',
            '786_06',
            '788_05',
            '788_06',
            '790_05',
            '790_06',
            '792_05',
            '792_09',
            '800_04',
            '800_05',
            '802_04',
            '802_05',
            '804_04',
            '804_05',
            '806_04',
            '806_05',
            '808_04',
            '808_05',
            '810_04',
            '810_05',
            '812_04',
            '812_05',
            '814_04',
            '814_05',
            '816_04',
            '818_04',
            '818_05',
            '820_04',
            '820_05',
            '822_04',
            '822_05',
            '824_04',
            '824_05',
            '826_04',
            '826_05',
            '828_04',
            '828_05',
            '830_04',
            '830_05',
            '832_04',
            '832_05',
            '834_04',
            '834_05',
            '836_04',
            '836_05',
            '838_04',
            '838_05',
            '840_04',
            '840_05',
            '842_04',
            '842_05',
            '844_04',
            '844_05',
            '846_04',
            '846_05',
            '848_04',
            '848_05',
            '850_04',
            '850_05',
            '852_04',
            '852_05',
            '854_04',
            '854_05',
            '856_04',
            '856_05',
            '858_04',
            '858_05',
            '860_04',
            '860_05',
            '862_04',
            '862_05',
            '864_04',
            '864_05',
            '866_04',
            '866_05',
            '868_04',
            '868_05',
            '870_04',
            '870_05',
            '872_04',
            '872_05',
            '874_04',
            '874_05',
            '876_04',
            '876_05',
            '878_04',
            '878_05',
            '880_04',
            '880_05',
            '882_04',
            '882_05',
            '884_04',
            '884_05',
            '886_04',
            '886_05',
            '888_04',
            '888_05',
            '890_04',
            '890_05',
            '892_04',
            '892_05',
            '894_04',
            '894_05',
            '896_04',
            '896_05',
            '898_04',
            '898_05',
            '900_04',
            '900_05',
            '902_04',
            '902_05',
            '904_04',
            '904_05',
            '906_04',
            '906_05',
            '908_04',
            '908_05',
            '910_04',
            '910_05',
            '912_04',
            '912_05',
            '914_04',
            '914_05',
            '916_04',
            '916_05',
            '918_04',
            '918_05',
            '920_04',
            '920_05',
            '922_04',
            '922_05',
            '924_04',
            '924_05',
            '926_04',
            '926_05',
            '928_04',
            '928_05',
            '930_04',
            '930_05',
            '932_04',
            '932_05',
            '934_04',
            '934_05',
            '936_05',
            '936_09',
            '946_04',
            '946_05',
            '948_04',
            '948_05',
            '950_04',
            '950_05',
            '952_04',
            '952_05',
            '954_04',
            '954_05',
            '956_04',
            '956_05',
            '958_04',
            '958_05',
            '960_04',
            '960_05',
            '962_04',
            '962_05',
            '1576_04',
            '1576_05',
            '1578_04',
            '1578_05',
            '1580_04',
            '1580_05',
            '1582_04',
            '1582_05',
            '1584_04',
            '1584_05',
            '2086_01',
            '2086_02',
            '9512_03',
            '9513_03'
          ])
        ))

    it('404', () =>
      req(app)
        .get('/v1/unobus/stops/null')
        .expect(404))

    describe('schedule', () => {
      it('404', () =>
        req(app)
          .get('/v1/unobus/stops/null/schedule')
          .expect(404))
    })

    describe('Okayama Station', () => {
      it('info', () =>
        req(app)
          .get('/v1/unobus/stops/2_01')
          .expect(200)
          .then(({ body }) =>
            assert.deepEqual(body, {
              id: '2_01',
              name: {
                ja: '岡山駅',
                'ja-Hira': 'おかやまえき',
                'ja-Kana': 'オカヤマエキ',
                en: 'Okayama Station'
              },
              location: {
                latitude: 34.6650806666667,
                lat: 34.6650806666667,
                longitude: 133.918666571428,
                lon: 133.918666571428,
                lng: 133.918666571428,
                long: 133.918666571428
              }
            })
          ))

      it('schedule', () =>
        req(app)
          .get('/v1/unobus/stops/2_01/schedule/2018-07-08')
          .expect(200)
          .then(({ body }) =>
            assert.sameDeepMembers(body, [
              { route: { id: '3101' }, time: '07:00:00' },
              { route: { id: '3107' }, time: '07:15:00' },
              { route: { id: '1061' }, time: '07:55:00' },
              { route: { id: '3101' }, time: '08:25:00' },
              { route: { id: '1061' }, time: '08:55:00' },
              { route: { id: '3107' }, time: '09:28:00' },
              { route: { id: '1061' }, time: '09:50:00' },
              { route: { id: '1061' }, time: '10:10:00' },
              { route: { id: '3101' }, time: '10:30:00' },
              { route: { id: '2001' }, time: '10:50:00' },
              { route: { id: '1061' }, time: '11:20:00' },
              { route: { id: '3107' }, time: '11:50:00' },
              { route: { id: '3101' }, time: '12:45:00' },
              { route: { id: '1061' }, time: '13:00:00' },
              { route: { id: '1061' }, time: '13:30:00' },
              { route: { id: '2001' }, time: '14:00:00' },
              { route: { id: '1061' }, time: '14:25:00' },
              { route: { id: '3101' }, time: '14:40:00' },
              { route: { id: '1061' }, time: '15:10:00' },
              { route: { id: '3107' }, time: '15:30:00' },
              { route: { id: '1641' }, time: '16:05:00' },
              { route: { id: '1061' }, time: '16:25:00' },
              { route: { id: '2001' }, time: '16:50:00' },
              { route: { id: '1641' }, time: '17:15:00' },
              { route: { id: '1061' }, time: '17:40:00' },
              { route: { id: '3101' }, time: '18:15:00' },
              { route: { id: '2001' }, time: '18:40:00' },
              { route: { id: '3107' }, time: '19:00:00' },
              { route: { id: '3107' }, time: '19:30:00' },
              { route: { id: '1061' }, time: '20:20:00' },
              { route: { id: '3107' }, time: '20:50:00' },
              { route: { id: '3107' }, time: '21:30:00' },
              { route: { id: '1041' }, time: '22:05:00' }
            ])
          ))
    })
  })

  describe('route', () => {
    describe('schedule', () => {
      it('1041', () =>
        req(app)
          .get('/v1/unobus/route/1041/2018-07-08')
          .expect(200)
          .then(({ body }) =>
            assert.deepEqual(body, [
              [
                '2_01',
                '4_01',
                '5_01',
                '6_01',
                '8_01',
                '10_01',
                '12_01',
                '14_01',
                '16_01',
                '18_01',
                '20_01',
                '22_01',
                '24_01',
                '26_01',
                '28_01',
                '30_01',
                '32_01',
                '34_01',
                '36_01',
                '38_01',
                '40_01',
                '42_01',
                '44_01',
                '46_01',
                '48_01',
                '50_01',
                '54_01',
                '56_01',
                '58_01',
                '62_01',
                '64_01',
                '66_01',
                '68_01',
                '70_01',
                '72_01',
                '74_01',
                '76_01',
                '78_01',
                '80_01',
                '82_01',
                '84_01',
                '86_01',
                '88_01',
                '90_01',
                '92_01',
                '94_01',
                '96_01'
              ]
            ])
          ))

      it('404', () =>
        req(app)
          .get('/v1/unobus/route/0000/2018-07-08')
          .expect(404))
    })

    describe('geojson', () => {
      it('1041', () =>
        req(app)
          .get('/v1/unobus/route/1041')
          .expect(200)
          .then(({ body }) =>
            assert.deepEqual(body, {
              type: 'FeatureCollection',
              features: {
                id: '1041',
                type: 'Feature',
                properties: { shape_id: '1041' },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [133.918666571428, 34.6650806666667],
                    [133.918397814614, 34.664688828413],
                    [133.918196648608, 34.6647661581233],
                    [133.918808190945, 34.6656285584571],
                    [133.921335428571, 34.665671],
                    [133.923902, 34.665708],
                    [133.927512, 34.665765],
                    [133.928981428571, 34.665801],
                    [133.930511607023, 34.6657655987568],
                    [133.930528, 34.662845],
                    [133.930513937056, 34.6618196897913],
                    [133.930064957559, 34.6617596203974],
                    [133.930042, 34.661572],
                    [133.930037902003, 34.6613564031807],
                    [133.930372479384, 34.6613531363968],
                    [133.930414111001, 34.66235846492],
                    [133.931, 34.662347],
                    [133.934469, 34.662238],
                    [133.935525118315, 34.6622099786607],
                    [133.936346224801, 34.6623005663129],
                    [133.936672169914, 34.6622811638784],
                    [133.939076480773, 34.6618385045735],
                    [133.939847671923, 34.661669939007],
                    [133.940294900763, 34.6615546402242],
                    [133.941031578009, 34.661298445093],
                    [133.942239, 34.661932],
                    [133.943681251968, 34.6627738709459],
                    [133.944497428571, 34.664004],
                    [133.945912264557, 34.6660250988972],
                    [133.946313663368, 34.6665242549092],
                    [133.946746199085, 34.6669181024167],
                    [133.947251285714, 34.667335],
                    [133.948015117743, 34.6677910936167],
                    [133.948795173307, 34.6681284838336],
                    [133.951189, 34.669042],
                    [133.953569506672, 34.669931800314],
                    [133.954295684591, 34.6702629902378],
                    [133.954844, 34.670595],
                    [133.95586003447, 34.6713027225606],
                    [133.957466638979, 34.6725306781749],
                    [133.957638999432, 34.6726624463064],
                    [133.9586, 34.67312],
                    [133.959332638996, 34.6731809747241],
                    [133.961970714286, 34.673317],
                    [133.965313285714, 34.673467],
                    [133.967611142857, 34.673589],
                    [133.970319857143, 34.673727],
                    [133.971370041869, 34.6737744969358],
                    [133.972001295177, 34.6738306748985],
                    [133.972583451925, 34.6739568515262],
                    [133.973070330898, 34.6740980254836],
                    [133.974215571429, 34.674553],
                    [133.975548886472, 34.6750973011078],
                    [133.976768142857, 34.675549],
                    [133.979705285714, 34.676726],
                    [133.982549, 34.677817],
                    [133.984795, 34.678726],
                    [133.988071571429, 34.680016],
                    [133.988669240412, 34.6802685472339],
                    [133.991009857143, 34.681605],
                    [133.995097, 34.684046],
                    [133.995545451446, 34.684269020469],
                    [134.000316, 34.687076],
                    [134.003975, 34.68923],
                    [134.006656, 34.690801],
                    [134.011327, 34.69354],
                    [134.014325077239, 34.695280114758],
                    [134.01678, 34.696752],
                    [134.01904782529, 34.6980607090194],
                    [134.019774591818, 34.6984697321887],
                    [134.020686888133, 34.6988672250444],
                    [134.021662142857, 34.699237],
                    [134.025137839884, 34.7003846899783],
                    [134.025416, 34.700525],
                    [134.025831948357, 34.7006204626515],
                    [134.030316019157, 34.7020900011365],
                    [134.031424714286, 34.70249],
                    [134.033091872352, 34.7030082723607],
                    [134.033610935854, 34.7031060869167],
                    [134.034299332019, 34.7031951887363],
                    [134.035254571429, 34.703186],
                    [134.038522, 34.702968],
                    [134.040315061559, 34.7028354970987],
                    [134.041080539082, 34.7028537545513],
                    [134.041726019244, 34.7029393443694],
                    [134.042325084724, 34.7030787276446],
                    [134.04278572494, 34.7032219040157],
                    [134.043031714286, 34.703363],
                    [134.043333945182, 34.7034697696171],
                    [134.04656122563, 34.704959792773],
                    [134.047096501427, 34.7051879360989],
                    [134.047338, 34.705336],
                    [134.047701513999, 34.7054634391784],
                    [134.048174398924, 34.7056739702479],
                    [134.049115738874, 34.7060153703043],
                    [134.049949787826, 34.7061749404126],
                    [134.050888211773, 34.706154320438],
                    [134.051764428571, 34.706103],
                    [134.052245525938, 34.7060258403985],
                    [134.053744531239, 34.7058885403563],
                    [134.054784178734, 34.7057756503155],
                    [134.055315955854, 34.7057165503014],
                    [134.055846333504, 34.7056521702761],
                    [134.057436768696, 34.7054942502591],
                    [134.058227785241, 34.7054343096095],
                    [134.060956571429, 34.7053310000001],
                    [134.063114309072, 34.7052293661914],
                    [134.064923162275, 34.7051564467763],
                    [134.065949982387, 34.7051685260373],
                    [134.066402225118, 34.7051976266532],
                    [134.066860428571, 34.705277],
                    [134.067276041265, 34.7052948702338],
                    [134.068457614021, 34.7055545302704],
                    [134.069392188105, 34.705852330383],
                    [134.070262973824, 34.7061766804323],
                    [134.071712428571, 34.706634],
                    [134.072493637864, 34.706827246589],
                    [134.073207689454, 34.7069248553547],
                    [134.073869493037, 34.707094420829],
                    [134.074723954016, 34.7072809114756],
                    [134.077835083667, 34.7081367455467],
                    [134.078135285714, 34.708275],
                    [134.078445926928, 34.7083727976954],
                    [134.079305283416, 34.7087241288924],
                    [134.080943530121, 34.7094508825136],
                    [134.081744927613, 34.7097924878238],
                    [134.082248483173, 34.7100203395832],
                    [134.08254, 34.710165],
                    [134.083268772202, 34.710452428112],
                    [134.084647893906, 34.7110659041787],
                    [134.085553081741, 34.7114869795024],
                    [134.086313428971, 34.7118561084686],
                    [134.087272843661, 34.7124143992667],
                    [134.087665845648, 34.712762869195],
                    [134.089034239175, 34.7142916929308],
                    [134.089117428571, 34.714388],
                    [134.089499309948, 34.7145865072399],
                    [134.089862341036, 34.7147040330624],
                    [134.090228754398, 34.7147569091401],
                    [134.090503854931, 34.7147504138592],
                    [134.090876095685, 34.7146700995384],
                    [134.094945165151, 34.7136216593249],
                    [134.095512940282, 34.7136173204887],
                    [134.095529265682, 34.7139284641904],
                    [134.095615679703, 34.7141207144554],
                    [134.096177, 34.714869]
                  ]
                }
              }
            })
          ))

      it('404', () =>
        req(app)
          .get('/v1/unobus/route/0000')
          .expect(404))
    })
  })
})
