import { assert } from 'chai'

import * as moment from 'moment'

import { rawToObject } from '../libs/basumada'
import { createBusToBroadcastObject } from '../libs/util'

const testData = `15:32:37\r\n
1111,15:35,0,,15:35(15:32) 岡山駅(Okayama sta.),1184,34.66489,133.91833,始発=15:35 岡山駅(Okayama sta.),行先=県庁前・四御神
8001,,1,,15:30(15:31) 県立美術館(Okayama Prefectural,1329,34.66588,133.93055,始発=15:15 岡山駅(Okayama sta.),行先=岡山駅
1631,,6,,15:25(15:31) 山陽団地西６番,1341,34.75276,134.00520,始発=14:40 表町BC,行先=西・下市　ネ西９
3101,,3,,15:27(15:30) 原東,1343,34.6697,133.95301,始発=15:10 岡山駅(Okayama sta.),行先=片上
1112,,5,,15:25(15:30) 朝日高前,1344,34.66124,133.94119,始発=15:05 四御神車庫,行先=岡山駅
1112,,1,,15:30(15:31) 公会堂前,1345,34.69709,133.96785,始発=15:25 四御神車庫,行先=清水・岡山駅
1282,,2,,15:27(15:29) 植物園口,1352,34.68617,133.92861,始発=14:48 野間,行先=表町BC
1181,,4,,15:27(15:31) 坂辺上,1353,34.84142,134.01010,始発=14:20 表町BC,行先=湯郷・林野駅
1111,,4,,15:27(15:31) 国府市場,1367,34.69190,133.96181,始発=15:00 岡山駅(Okayama sta.),行先=四御神
1622,,4,,15:28(15:32) 白鷺団地,1369,34.72851,133.98694,始発=15:05 桜が丘運動公園口,行先=表町BC
5141,,7,,15:24(15:31) 岡電柳川（東岡山）,1371,34.66821,133.92612,始発=15:15 表町BC,行先=高島団地・東岡山
3102,,10,,15:21(15:31) 香登東,1396,34.7295,134.12304,始発=15:11 片上,行先=岡山駅
1642,,17,,15:15(15:32) 長岡団地,1486,34.67849,133.98450,始発=14:25 桜が丘運動公園口,行先=岡山駅
1631,15:37,0,,15:30(15:30) 中銀本店西,1525,34.6658,133.92959,始発=15:30 表町BC,行先=西・下市　ネ西９
2011,15:29,3,,15:29(15:32) 岡山駅(Okayama sta.),1585,34.66573,133.91888,始発=15:22 表町BC,行先=新道河本・ネ東６
2021,,1,,15:30(15:31) 大原橋,1613,34.71792,133.97054,始発=15:00 表町BC,行先=中・下市　ネ東６
1072,,1,,15:30(15:31) 高屋（ネオ）,1616,34.75641,134.02087,始発=15:22 野間,行先=瀬戸駅・岡山駅
5142,,0,,15:33(15:32) 四御神車庫(東岡山),1618,34.69146,133.98182,始発=15:33 四御神車庫(東岡山),行先=高島団地・表町BC
1632,,1,,15:31(15:32) 新道赤磐市役所入口,1619,34.75335,134.02175,始発=15:21 桜が丘運動公園口,行先=下市・西　表町ＢＣ
1082,,0,,15:32(15:32) 兼基東,4111,34.67509,133.97583,始発=15:30 長岡団地,行先=岡山駅
//LAST
//系統番号,岡山駅の発時間,遅延,運行状態,計画時間（通過時間）停留所名,車両番号,緯度,経度,始発停留所情報,行先情報`

describe('basumada', function() {
  this.timeout(10000)

  it('rawToObject & createBusToBroadcastObject', () =>
    rawToObject('unobus', testData, undefined, moment('2018-07-13'))
      .then(({ buses }) =>
        Promise.all(Object.values(buses).map(bus => createBusToBroadcastObject(bus)))
      )
      .then(buses =>
        assert.sameDeepMembers(buses, [
          {
            run: true,
            license_number: 1184,
            rollsign: '四御神 (県庁前 経由)',
            delay: 0,
            route_num: '1111',
            direction: 71.75366715525718,
            stations: ['2_02'],
            location: {
              latitude: 34.66489,
              lat: 34.66489,
              longitude: 133.91833,
              lon: 133.91833,
              lng: 133.91833,
              long: 133.91833
            },
            stops: {
              first: {
                id: '2_02',
                date: { schedule: '2018-07-13T15:35:00+09:00' }
              },
              passing: {
                id: '2_02',
                date: {
                  schedule: '2018-07-13T15:35:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '4_02',
                date: { schedule: '2018-07-13T15:36:00+09:00' }
              },
              last: {
                id: '248_09',
                date: { schedule: '2018-07-13T16:14:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1329,
            rollsign: '岡山後楽園 (県立美術館 経由)',
            delay: 1,
            route_num: '8001',
            direction: 34.917426313051806,
            stations: ['2_11', '2_08'],
            location: {
              latitude: 34.66588,
              lat: 34.66588,
              longitude: 133.93055,
              lon: 133.93055,
              lng: 133.93055,
              long: 133.93055
            },
            stops: {
              first: {
                id: '2_11',
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              passing: {
                id: '3002_01',
                date: {
                  schedule: '2018-07-13T15:22:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '3001_01',
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              last: {
                id: '2_08',
                date: { schedule: '2018-07-13T15:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1341,
            rollsign: 'ネオ西9 (西・下市 経由)',
            delay: 6,
            route_num: '1631',
            direction: 104.65647581739347,
            stations: ['2_04'],
            location: {
              latitude: 34.75276,
              lat: 34.75276,
              longitude: 134.0052,
              lon: 134.0052,
              lng: 134.0052,
              long: 134.0052
            },
            stops: {
              first: {
                id: '12_04',
                date: { schedule: '2018-07-13T14:40:00+09:00' }
              },
              passing: {
                id: '572_04',
                date: {
                  schedule: '2018-07-13T15:25:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '574_04',
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              last: {
                id: '792_09',
                date: { schedule: '2018-07-13T15:44:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1343,
            rollsign: '片上',
            delay: 3,
            route_num: '3101',
            direction: 59.316747503710985,
            stations: ['2_01'],
            location: {
              latitude: 34.6697,
              lat: 34.6697,
              longitude: 133.95301,
              lon: 133.95301,
              lng: 133.95301,
              long: 133.95301
            },
            stops: {
              first: {
                id: '2_01',
                date: { schedule: '2018-07-13T15:10:00+09:00' }
              },
              passing: {
                id: '24_01',
                date: {
                  schedule: '2018-07-13T15:27:37+09:00',
                  pass: '2018-07-13T15:30:00+09:00'
                }
              },
              next: {
                id: '26_01',
                date: { schedule: '2018-07-13T15:29:00+09:00' }
              },
              last: {
                id: '126_09',
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1344,
            rollsign: '表町BC経由 岡山駅 (清水 経由)',
            delay: 5,
            route_num: '1112',
            direction: 265.38878598057113,
            stations: ['2_09'],
            location: {
              latitude: 34.66124,
              lat: 34.66124,
              longitude: 133.94119,
              lon: 133.94119,
              lng: 133.94119,
              long: 133.94119
            },
            stops: {
              first: {
                id: '248_05',
                date: { schedule: '2018-07-13T15:05:00+09:00' }
              },
              passing: {
                id: '18_05',
                date: {
                  schedule: '2018-07-13T15:25:37+09:00',
                  pass: '2018-07-13T15:30:00+09:00'
                }
              },
              next: {
                id: '16_05',
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T15:38:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1345,
            rollsign: '表町BC経由 岡山駅 (清水 経由)',
            delay: 1,
            route_num: '1112',
            direction: 279.10803184569966,
            stations: ['2_09'],
            location: {
              latitude: 34.69709,
              lat: 34.69709,
              longitude: 133.96785,
              lon: 133.96785,
              lng: 133.96785,
              long: 133.96785
            },
            stops: {
              first: {
                id: '248_05',
                date: { schedule: '2018-07-13T15:25:00+09:00' }
              },
              passing: {
                id: '224_05',
                date: {
                  schedule: '2018-07-13T15:30:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '222_05',
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T15:58:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1352,
            rollsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 2,
            route_num: '1282',
            direction: 185.47935536714698,
            stations: [],
            location: {
              latitude: 34.68617,
              lat: 34.68617,
              longitude: 133.92861,
              lon: 133.92861,
              lng: 133.92861,
              long: 133.92861
            },
            stops: {
              first: {
                id: '778_05',
                date: { schedule: '2018-07-13T14:48:00+09:00' }
              },
              passing: {
                id: '322_05',
                date: {
                  schedule: '2018-07-13T15:27:37+09:00',
                  pass: '2018-07-13T15:29:00+09:00'
                }
              },
              next: {
                id: '320_05',
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '12_06',
                date: { schedule: '2018-07-13T15:46:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1353,
            rollsign: '林野駅 (新道河本 経由)',
            delay: 4,
            route_num: '1181',
            direction: 323.62939620890984,
            stations: ['2_04'],
            location: {
              latitude: 34.84142,
              lat: 34.84142,
              longitude: 134.0101,
              lon: 134.0101,
              lng: 134.0101,
              long: 134.0101
            },
            stops: {
              first: {
                id: '12_04',
                date: { schedule: '2018-07-13T14:20:00+09:00' }
              },
              passing: {
                id: '842_04',
                date: {
                  schedule: '2018-07-13T15:27:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '844_04',
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '936_09',
                date: { schedule: '2018-07-13T16:15:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1367,
            rollsign: '四御神 (県庁前 経由)',
            delay: 4,
            route_num: '1111',
            direction: 357.58060444755955,
            stations: ['2_02'],
            location: {
              latitude: 34.6919,
              lat: 34.6919,
              longitude: 133.96181,
              lon: 133.96181,
              lng: 133.96181,
              long: 133.96181
            },
            stops: {
              first: {
                id: '2_02',
                date: { schedule: '2018-07-13T15:00:00+09:00' }
              },
              passing: {
                id: '214_02',
                date: {
                  schedule: '2018-07-13T15:27:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '216_02',
                date: { schedule: '2018-07-13T15:28:00+09:00' }
              },
              last: {
                id: '248_09',
                date: { schedule: '2018-07-13T15:37:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1369,
            rollsign: '岡山駅前経由表町BC (下市・中 経由)',
            delay: 4,
            route_num: '1622',
            direction: 229.38121190993903,
            stations: [],
            location: {
              latitude: 34.72851,
              lat: 34.72851,
              longitude: 133.98694,
              lon: 133.98694,
              lng: 133.98694,
              long: 133.98694
            },
            stops: {
              first: {
                id: '792_05',
                date: { schedule: '2018-07-13T15:05:00+09:00' }
              },
              passing: {
                id: '552_05',
                date: {
                  schedule: '2018-07-13T15:28:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '344_05',
                date: { schedule: '2018-07-13T15:29:00+09:00' }
              },
              last: {
                id: '12_06',
                date: { schedule: '2018-07-13T16:03:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1371,
            rollsign: '東岡山 (岡山駅 経由)',
            delay: 7,
            route_num: '5141',
            direction: 1.6359302504662878,
            stations: ['2_02'],
            location: {
              latitude: 34.66821,
              lat: 34.66821,
              longitude: 133.92612,
              lon: 133.92612,
              lng: 133.92612,
              long: 133.92612
            },
            stops: {
              first: {
                id: '12_03',
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              passing: {
                id: '9513_03',
                date: {
                  schedule: '2018-07-13T15:24:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '9512_03',
                date: { schedule: '2018-07-13T15:26:00+09:00' }
              },
              last: {
                id: '249_09',
                date: { schedule: '2018-07-13T16:01:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1396,
            rollsign: '表町BC経由 岡山駅',
            delay: 10,
            route_num: '3102',
            direction: 254.09028763058356,
            stations: ['2_09'],
            location: {
              latitude: 34.7295,
              lat: 34.7295,
              longitude: 134.12304,
              lon: 134.12304,
              lng: 134.12304,
              long: 134.12304
            },
            stops: {
              first: {
                id: '126_05',
                date: { schedule: '2018-07-13T15:11:00+09:00' }
              },
              passing: {
                id: '106_05',
                date: {
                  schedule: '2018-07-13T15:21:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '104_05',
                date: { schedule: '2018-07-13T15:24:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T16:28:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1486,
            rollsign: '瀬戸駅 (岡山駅 経由)',
            delay: 17,
            route_num: '1642',
            direction: 243.929197989586,
            stations: ['2_09'],
            location: {
              latitude: 34.67849,
              lat: 34.67849,
              longitude: 133.9845,
              lon: 133.9845,
              lng: 133.9845,
              long: 133.9845
            },
            stops: {
              first: {
                id: '792_05',
                date: { schedule: '2018-07-13T14:25:00+09:00' }
              },
              passing: {
                id: '46_05',
                date: {
                  schedule: '2018-07-13T15:15:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '44_05',
                date: { schedule: '2018-07-13T15:15:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T15:42:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1525,
            rollsign: 'ネオ西9 (西・下市 経由)',
            delay: 0,
            route_num: '1631',
            direction: 240.68331380692808,
            stations: ['2_04'],
            location: {
              latitude: 34.6658,
              lat: 34.6658,
              longitude: 133.92959,
              lon: 133.92959,
              lng: 133.92959,
              long: 133.92959
            },
            stops: {
              first: {
                id: '12_04',
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              passing: {
                id: '10_04',
                date: {
                  schedule: '2018-07-13T15:30:37+09:00',
                  pass: '2018-07-13T15:30:00+09:00'
                }
              },
              next: {
                id: '8_04',
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '792_09',
                date: { schedule: '2018-07-13T16:35:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1585,
            rollsign: 'ネオ東6 (新道河本 経由)',
            delay: 3,
            route_num: '2011',
            direction: 91.12997463852832,
            stations: ['2_04'],
            location: {
              latitude: 34.66573,
              lat: 34.66573,
              longitude: 133.91888,
              lon: 133.91888,
              lng: 133.91888,
              long: 133.91888
            },
            stops: {
              first: {
                id: '12_04',
                date: { schedule: '2018-07-13T15:22:00+09:00' }
              },
              passing: {
                id: '2_04',
                date: {
                  schedule: '2018-07-13T15:29:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '4_02',
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              last: {
                id: '778_09',
                date: { schedule: '2018-07-13T16:22:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1613,
            rollsign: 'ネオ東6 (中・下市 経由)',
            delay: 1,
            route_num: '2021',
            direction: 109.585391134985,
            stations: ['2_04'],
            location: {
              latitude: 34.71792,
              lat: 34.71792,
              longitude: 133.97054,
              lon: 133.97054,
              lng: 133.97054,
              long: 133.97054
            },
            stops: {
              first: {
                id: '12_04',
                date: { schedule: '2018-07-13T15:00:00+09:00' }
              },
              passing: {
                id: '336_04',
                date: {
                  schedule: '2018-07-13T15:30:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '338_04',
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '778_09',
                date: { schedule: '2018-07-13T16:05:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1616,
            rollsign: '瀬戸駅 (岡山駅 経由)',
            delay: 1,
            route_num: '1072',
            direction: 220.75407180544929,
            stations: ['2_09'],
            location: {
              latitude: 34.75641,
              lat: 34.75641,
              longitude: 134.02087,
              lon: 134.02087,
              lng: 134.02087,
              long: 134.02087
            },
            stops: {
              first: {
                id: '778_05',
                date: { schedule: '2018-07-13T15:22:00+09:00' }
              },
              passing: {
                id: '744_05',
                date: {
                  schedule: '2018-07-13T15:30:37+09:00',
                  pass: '2018-07-13T15:31:00+09:00'
                }
              },
              next: {
                id: '742_05',
                date: { schedule: '2018-07-13T15:31:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T16:42:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1618,
            rollsign: '表町BC (高島団地・岡山駅前 経由)',
            delay: 0,
            route_num: '5142',
            direction: 348.29296585842576,
            stations: [],
            location: {
              latitude: 34.69146,
              lat: 34.69146,
              longitude: 133.98182,
              lon: 133.98182,
              lng: 133.98182,
              long: 133.98182
            },
            stops: {
              first: {
                id: '249_05',
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              passing: {
                id: '249_05',
                date: {
                  schedule: '2018-07-13T15:33:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '664_05',
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '12_09',
                date: { schedule: '2018-07-13T16:09:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 1619,
            rollsign: '岡山駅前経由表町BC (下市・西 経由)',
            delay: 1,
            route_num: '1632',
            direction: 272.9081442404258,
            stations: [],
            location: {
              latitude: 34.75335,
              lat: 34.75335,
              longitude: 134.02175,
              lon: 134.02175,
              lng: 134.02175,
              long: 134.02175
            },
            stops: {
              first: {
                id: '792_05',
                date: { schedule: '2018-07-13T15:21:00+09:00' }
              },
              passing: {
                id: '954_05',
                date: {
                  schedule: '2018-07-13T15:31:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '2086_01',
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '12_06',
                date: { schedule: '2018-07-13T16:21:00+09:00' }
              }
            }
          },
          {
            run: true,
            license_number: 4111,
            rollsign: '表町BC経由 岡山駅',
            delay: 0,
            route_num: '1082',
            direction: 243.70108095449774,
            stations: ['2_09'],
            location: {
              latitude: 34.67509,
              lat: 34.67509,
              longitude: 133.97583,
              lon: 133.97583,
              lng: 133.97583,
              long: 133.97583
            },
            stops: {
              first: {
                id: '46_05',
                date: { schedule: '2018-07-13T15:30:00+09:00' }
              },
              passing: {
                id: '40_05',
                date: {
                  schedule: '2018-07-13T15:32:37+09:00',
                  pass: '2018-07-13T15:32:00+09:00'
                }
              },
              next: {
                id: '38_05',
                date: { schedule: '2018-07-13T15:33:00+09:00' }
              },
              last: {
                id: '2_09',
                date: { schedule: '2018-07-13T15:57:00+09:00' }
              }
            }
          }
        ])
      ))
})
