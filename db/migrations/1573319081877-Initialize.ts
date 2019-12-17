import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initialize1573319081877 implements MigrationInterface {
  name = 'Initialize1573319081877'

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'CREATE TABLE `country` (`uid` int NOT NULL AUTO_INCREMENT, `priceCode` char(3) NOT NULL, UNIQUE INDEX `IDX_aee88faa81da8ac03cc4177ca3` (`priceCode`), PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `calendar_date` (`uid` int NOT NULL AUTO_INCREMENT, `serviceId` varchar(255) NOT NULL, `date` date NOT NULL, `exceptionType` tinyint NOT NULL, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `frequency` (`uid` int NOT NULL AUTO_INCREMENT, `startTime` date NULL, `endTime` date NULL, `headwaySecs` int NOT NULL, `exactTimes` tinyint NOT NULL DEFAULT 0, `remoteUid` int NULL, `tripUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `route` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `shortName` varchar(255) NULL, `longName` varchar(255) NULL, `description` varchar(255) NULL, `type` tinyint NOT NULL, `url` varchar(255) NULL, `color` char(6) NULL, `textColor` char(6) NULL, `sortOrder` int NULL, `remoteUid` int NULL, `agencyUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `shape` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `location` geometry NOT NULL, `sequence` int NOT NULL, `distTraveled` int NULL, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `level` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `index` int NOT NULL, `name` varchar(255) NOT NULL, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `pathway` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `fromStopId` varchar(255) NOT NULL, `toStopId` varchar(255) NOT NULL, `pathwayMode` tinyint NOT NULL, `isBidirectional` tinyint NOT NULL, `length` int NULL, `traversalTime` int NULL, `stairCount` int NULL, `maxSlope` int NULL, `minWidth` int NULL, `signpostedAs` text NULL, `reversedSignpostedAs` text NULL, `remoteUid` int NULL, `fromUid` int NULL, `toUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `stop_time` (`uid` int NOT NULL AUTO_INCREMENT, `tripId` varchar(255) NOT NULL, `arrivalTime` time NULL, `departureTime` time NULL, `stopId` varchar(255) NOT NULL, `sequence` int NOT NULL, `headsign` varchar(255) NULL, `pickupType` tinyint NULL, `dropOffType` tinyint NULL, `shapeDistTraveled` int NULL, `timepoint` tinyint NULL, `remoteUid` int NULL, `tripUid` int NULL, `stopUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `translation` (`uid` int NOT NULL AUTO_INCREMENT, `transId` varchar(255) NOT NULL, `lang` varchar(255) NOT NULL, `translation` varchar(255) NOT NULL, `remoteUid` int NULL, `stopUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `stop` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `code` varchar(255) NULL, `name` varchar(255) NULL, `description` varchar(255) NULL, `location` geometry NULL, `zoneId` varchar(255) NULL, `url` varchar(255) NULL, `locationType` tinyint NOT NULL DEFAULT 0, `parentStation` varchar(255) NULL, `timezone` varchar(255) NULL, `wheelchairBoarding` tinyint NOT NULL, `levelId` varchar(255) NULL, `platformCode` varchar(255) NULL, `remoteUid` int NULL, `levelUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `trip` (`uid` int NOT NULL AUTO_INCREMENT, `routeId` varchar(255) NOT NULL, `serviceId` varchar(255) NOT NULL, `id` varchar(255) NOT NULL, `headsign` text NULL, `shortName` text NULL, `directionId` tinyint NULL, `blockId` varchar(255) NULL, `shapeId` varchar(255) NULL, `wheelchairSccessible` tinyint NULL, `bikesSllowed` tinyint NULL, `remoteUid` int NULL, `routeUid` int NULL, `calendarUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `calendar` (`uid` int NOT NULL AUTO_INCREMENT, `serviceId` varchar(255) NOT NULL, `monday` int NOT NULL, `tuesday` int NOT NULL, `wednesday` int NOT NULL, `thursday` int NOT NULL, `friday` int NOT NULL, `saturday` int NOT NULL, `sunday` int NOT NULL, `startDate` date NOT NULL, `endDate` date NOT NULL, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `feed_info` (`uid` int NOT NULL AUTO_INCREMENT, `publisherName` varchar(255) NOT NULL, `publisherUrl` varchar(255) NOT NULL, `lang` varchar(255) NOT NULL, `startDate` date NULL, `endDate` date NULL, `version` varchar(255) NULL, `contactEmail` varchar(255) NULL, `contactUrl` varchar(255) NULL, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `transfer` (`uid` int NOT NULL AUTO_INCREMENT, `fromStopId` varchar(255) NOT NULL, `toStopId` varchar(255) NOT NULL, `type` tinyint NOT NULL, `minTransferTime` int NULL, `remoteUid` int NULL, `fromStopUid` int NULL, `toStopUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `remote` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `hash` char(64) NOT NULL, UNIQUE INDEX `IDX_34d4a3daff6e593169dd1ed39c` (`id`), PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `fare_rule` (`uid` int NOT NULL AUTO_INCREMENT, `fareId` varchar(255) NOT NULL, `remoteUid` int NULL, `fareAttributeUid` int NULL, `routeUid` int NULL, `originUid` int NULL, `destinationUid` int NULL, `containUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `fare_attribute` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `paymentMethod` int NOT NULL, `transfers` int NULL, `agencyId` varchar(255) NOT NULL, `transferDuration` int NULL, `remoteUid` int NULL, `countryUid` int NULL, `agencyUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `agency` (`uid` int NOT NULL AUTO_INCREMENT, `id` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `url` text NOT NULL, `timezone` varchar(255) NOT NULL, `lang` varchar(255) NULL DEFAULT null, `phone` varchar(255) NULL DEFAULT null, `fareUrl` text NULL DEFAULT null, `email` varchar(255) NULL DEFAULT null, `remoteUid` int NULL, PRIMARY KEY (`uid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `trip_shapes_shape` (`tripUid` int NOT NULL, `shapeUid` int NOT NULL, INDEX `IDX_4b14065d5be8993042cbabfca5` (`tripUid`), INDEX `IDX_f0004f6e505bea2635716ac0be` (`shapeUid`), PRIMARY KEY (`tripUid`, `shapeUid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'CREATE TABLE `trip_calendar_dates_calendar_date` (`tripUid` int NOT NULL, `calendarDateUid` int NOT NULL, INDEX `IDX_828748f7ccb825ce5626015288` (`tripUid`), INDEX `IDX_fbd0d8cc4d23a2bb0786d6130f` (`calendarDateUid`), PRIMARY KEY (`tripUid`, `calendarDateUid`)) ENGINE=InnoDB'
    )
    await queryRunner.query(
      'ALTER TABLE `calendar_date` ADD CONSTRAINT `FK_962b467eff1e4c515961422c429` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `frequency` ADD CONSTRAINT `FK_76661097ab27a74e702455c7985` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `frequency` ADD CONSTRAINT `FK_2c5d14ea8d1cc4bccbc3be10a62` FOREIGN KEY (`tripUid`) REFERENCES `trip`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `route` ADD CONSTRAINT `FK_62bdd05ebec24fce317d180d700` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `route` ADD CONSTRAINT `FK_1dce1fcdff111d709b08a7a33d4` FOREIGN KEY (`agencyUid`) REFERENCES `agency`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `shape` ADD CONSTRAINT `FK_f65ae51fabe8c540b49c9643922` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `level` ADD CONSTRAINT `FK_58c63190f38cdb00d5e0465bded` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` ADD CONSTRAINT `FK_e5d2f1b9bb31726eaa1b2480563` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` ADD CONSTRAINT `FK_1e0c7edd5a1ce9913bfadf8def6` FOREIGN KEY (`fromUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` ADD CONSTRAINT `FK_a1cf2fbd0f31c134a9dc70a7e81` FOREIGN KEY (`toUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` ADD CONSTRAINT `FK_27e0b74d9b4b4f9582ed4128c87` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` ADD CONSTRAINT `FK_5d44d354892638e7ed464ede59a` FOREIGN KEY (`tripUid`) REFERENCES `trip`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` ADD CONSTRAINT `FK_937be4c06e696f414c6abb8a0e5` FOREIGN KEY (`stopUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `translation` ADD CONSTRAINT `FK_d488ef657d2bca1c03d867ae07c` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `translation` ADD CONSTRAINT `FK_d070ad12f5db713ed286af65fe7` FOREIGN KEY (`stopUid`) REFERENCES `stop`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `stop` ADD CONSTRAINT `FK_5b0b1225829c546128fad2f03b3` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `stop` ADD CONSTRAINT `FK_88ea29f0e038e682988e92de9fc` FOREIGN KEY (`levelUid`) REFERENCES `level`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip` ADD CONSTRAINT `FK_daa2a466ef8c9624b5083107ca9` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip` ADD CONSTRAINT `FK_b3a14972f04167e17caed5dda1e` FOREIGN KEY (`routeUid`) REFERENCES `route`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip` ADD CONSTRAINT `FK_6feeceb99ad462b1335980b2343` FOREIGN KEY (`calendarUid`) REFERENCES `calendar`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `calendar` ADD CONSTRAINT `FK_f715f424a4feab1e0a3b3386d43` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `feed_info` ADD CONSTRAINT `FK_2bd832f368befadcc192e4bbf51` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` ADD CONSTRAINT `FK_1a2140362e3ebf86d6a6ed782ba` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` ADD CONSTRAINT `FK_9da08194ff4d5af7dab785f0179` FOREIGN KEY (`fromStopUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` ADD CONSTRAINT `FK_098920f1f86da47349b8f75bb4f` FOREIGN KEY (`toStopUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_c209479305e78ff074c8dc9bce9` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_381219680b40c601a61aec569ff` FOREIGN KEY (`fareAttributeUid`) REFERENCES `fare_attribute`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_b0499588ecac4cdc670ad3361a6` FOREIGN KEY (`routeUid`) REFERENCES `route`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_88e888653a85046e378a6839e31` FOREIGN KEY (`originUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_7197affda8f48b5993738b9a949` FOREIGN KEY (`destinationUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` ADD CONSTRAINT `FK_6dfbbefeed15e9f75fee73dc87b` FOREIGN KEY (`containUid`) REFERENCES `stop`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` ADD CONSTRAINT `FK_71af04cd300edc2ec9da2aabe67` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` ADD CONSTRAINT `FK_9e5feeb4cb7ac70a0b000ff35dc` FOREIGN KEY (`countryUid`) REFERENCES `country`(`uid`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` ADD CONSTRAINT `FK_8b6b28189b61ec0f01304fd3206` FOREIGN KEY (`agencyUid`) REFERENCES `agency`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `agency` ADD CONSTRAINT `FK_37c8d12a764bf956b945c06b032` FOREIGN KEY (`remoteUid`) REFERENCES `remote`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_shapes_shape` ADD CONSTRAINT `FK_4b14065d5be8993042cbabfca56` FOREIGN KEY (`tripUid`) REFERENCES `trip`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_shapes_shape` ADD CONSTRAINT `FK_f0004f6e505bea2635716ac0be2` FOREIGN KEY (`shapeUid`) REFERENCES `shape`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_calendar_dates_calendar_date` ADD CONSTRAINT `FK_828748f7ccb825ce56260152884` FOREIGN KEY (`tripUid`) REFERENCES `trip`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_calendar_dates_calendar_date` ADD CONSTRAINT `FK_fbd0d8cc4d23a2bb0786d6130f6` FOREIGN KEY (`calendarDateUid`) REFERENCES `calendar_date`(`uid`) ON DELETE CASCADE ON UPDATE NO ACTION'
    )

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('country')
      .values([
        { priceCode: 'AED' },
        { priceCode: 'AFN' },
        { priceCode: 'ALL' },
        { priceCode: 'AMD' },
        { priceCode: 'ANG' },
        { priceCode: 'AOA' },
        { priceCode: 'ARS' },
        { priceCode: 'AUD' },
        { priceCode: 'AWG' },
        { priceCode: 'AZN' },
        { priceCode: 'BAM' },
        { priceCode: 'BBD' },
        { priceCode: 'BDT' },
        { priceCode: 'BGN' },
        { priceCode: 'BHD' },
        { priceCode: 'BIF' },
        { priceCode: 'BMD' },
        { priceCode: 'BND' },
        { priceCode: 'BOB' },
        { priceCode: 'BOV' },
        { priceCode: 'BRL' },
        { priceCode: 'BSD' },
        { priceCode: 'BTN' },
        { priceCode: 'BWP' },
        { priceCode: 'BYN' },
        { priceCode: 'BZD' },
        { priceCode: 'CAD' },
        { priceCode: 'CDF' },
        { priceCode: 'CHE' },
        { priceCode: 'CHF' },
        { priceCode: 'CHW' },
        { priceCode: 'CLF' },
        { priceCode: 'CLP' },
        { priceCode: 'CNY' },
        { priceCode: 'COP' },
        { priceCode: 'COU' },
        { priceCode: 'CRC' },
        { priceCode: 'CUC' },
        { priceCode: 'CUP' },
        { priceCode: 'CVE' },
        { priceCode: 'CZK' },
        { priceCode: 'DJF' },
        { priceCode: 'DKK' },
        { priceCode: 'DOP' },
        { priceCode: 'DZD' },
        { priceCode: 'EGP' },
        { priceCode: 'ERN' },
        { priceCode: 'ETB' },
        { priceCode: 'EUR' },
        { priceCode: 'FJD' },
        { priceCode: 'FKP' },
        { priceCode: 'GBP' },
        { priceCode: 'GEL' },
        { priceCode: 'GHS' },
        { priceCode: 'GIP' },
        { priceCode: 'GMD' },
        { priceCode: 'GNF' },
        { priceCode: 'GTQ' },
        { priceCode: 'GYD' },
        { priceCode: 'HKD' },
        { priceCode: 'HNL' },
        { priceCode: 'HRK' },
        { priceCode: 'HTG' },
        { priceCode: 'HUF' },
        { priceCode: 'IDR' },
        { priceCode: 'ILS' },
        { priceCode: 'INR' },
        { priceCode: 'IQD' },
        { priceCode: 'IRR' },
        { priceCode: 'ISK' },
        { priceCode: 'JMD' },
        { priceCode: 'JOD' },
        { priceCode: 'JPY' },
        { priceCode: 'KES' },
        { priceCode: 'KGS' },
        { priceCode: 'KHR' },
        { priceCode: 'KMF' },
        { priceCode: 'KPW' },
        { priceCode: 'KRW' },
        { priceCode: 'KWD' },
        { priceCode: 'KYD' },
        { priceCode: 'KZT' },
        { priceCode: 'LAK' },
        { priceCode: 'LBP' },
        { priceCode: 'LKR' },
        { priceCode: 'LRD' },
        { priceCode: 'LSL' },
        { priceCode: 'LYD' },
        { priceCode: 'MAD' },
        { priceCode: 'MDL' },
        { priceCode: 'MGA' },
        { priceCode: 'MKD' },
        { priceCode: 'MMK' },
        { priceCode: 'MNT' },
        { priceCode: 'MOP' },
        { priceCode: 'MRU' },
        { priceCode: 'MUR' },
        { priceCode: 'MVR' },
        { priceCode: 'MWK' },
        { priceCode: 'MXN' },
        { priceCode: 'MXV' },
        { priceCode: 'MYR' },
        { priceCode: 'MZN' },
        { priceCode: 'NAD' },
        { priceCode: 'NGN' },
        { priceCode: 'NIO' },
        { priceCode: 'NOK' },
        { priceCode: 'NPR' },
        { priceCode: 'NZD' },
        { priceCode: 'OMR' },
        { priceCode: 'PAB' },
        { priceCode: 'PEN' },
        { priceCode: 'PGK' },
        { priceCode: 'PHP' },
        { priceCode: 'PKR' },
        { priceCode: 'PLN' },
        { priceCode: 'PYG' },
        { priceCode: 'QAR' },
        { priceCode: 'RON' },
        { priceCode: 'RSD' },
        { priceCode: 'RUB' },
        { priceCode: 'RWF' },
        { priceCode: 'SAR' },
        { priceCode: 'SBD' },
        { priceCode: 'SCR' },
        { priceCode: 'SDG' },
        { priceCode: 'SEK' },
        { priceCode: 'SGD' },
        { priceCode: 'SHP' },
        { priceCode: 'SLL' },
        { priceCode: 'SOS' },
        { priceCode: 'SRD' },
        { priceCode: 'SSP' },
        { priceCode: 'STN' },
        { priceCode: 'SVC' },
        { priceCode: 'SYP' },
        { priceCode: 'SZL' },
        { priceCode: 'THB' },
        { priceCode: 'TJS' },
        { priceCode: 'TMT' },
        { priceCode: 'TND' },
        { priceCode: 'TOP' },
        { priceCode: 'TRY' },
        { priceCode: 'TTD' },
        { priceCode: 'TWD' },
        { priceCode: 'TZS' },
        { priceCode: 'UAH' },
        { priceCode: 'UGX' },
        { priceCode: 'USD' },
        { priceCode: 'USN' },
        { priceCode: 'UYI' },
        { priceCode: 'UYU' },
        { priceCode: 'UYW' },
        { priceCode: 'UZS' },
        { priceCode: 'VES' },
        { priceCode: 'VND' },
        { priceCode: 'VUV' },
        { priceCode: 'WST' },
        { priceCode: 'XAF' },
        { priceCode: 'XAG' },
        { priceCode: 'XAU' },
        { priceCode: 'XBA' },
        { priceCode: 'XBB' },
        { priceCode: 'XBC' },
        { priceCode: 'XBD' },
        { priceCode: 'XCD' },
        { priceCode: 'XDR' },
        { priceCode: 'XOF' },
        { priceCode: 'XPD' },
        { priceCode: 'XPF' },
        { priceCode: 'XPT' },
        { priceCode: 'XSU' },
        { priceCode: 'XTS' },
        { priceCode: 'XUA' },
        { priceCode: 'XXX' },
        { priceCode: 'YER' },
        { priceCode: 'ZAR' },
        { priceCode: 'ZMW' },
        { priceCode: 'ZWL' }
      ])
      .execute()
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `trip_calendar_dates_calendar_date` DROP FOREIGN KEY `FK_fbd0d8cc4d23a2bb0786d6130f6`'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_calendar_dates_calendar_date` DROP FOREIGN KEY `FK_828748f7ccb825ce56260152884`'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_shapes_shape` DROP FOREIGN KEY `FK_f0004f6e505bea2635716ac0be2`'
    )
    await queryRunner.query(
      'ALTER TABLE `trip_shapes_shape` DROP FOREIGN KEY `FK_4b14065d5be8993042cbabfca56`'
    )
    await queryRunner.query(
      'ALTER TABLE `agency` DROP FOREIGN KEY `FK_37c8d12a764bf956b945c06b032`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` DROP FOREIGN KEY `FK_8b6b28189b61ec0f01304fd3206`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` DROP FOREIGN KEY `FK_9e5feeb4cb7ac70a0b000ff35dc`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_attribute` DROP FOREIGN KEY `FK_71af04cd300edc2ec9da2aabe67`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_6dfbbefeed15e9f75fee73dc87b`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_7197affda8f48b5993738b9a949`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_88e888653a85046e378a6839e31`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_b0499588ecac4cdc670ad3361a6`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_381219680b40c601a61aec569ff`'
    )
    await queryRunner.query(
      'ALTER TABLE `fare_rule` DROP FOREIGN KEY `FK_c209479305e78ff074c8dc9bce9`'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` DROP FOREIGN KEY `FK_098920f1f86da47349b8f75bb4f`'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` DROP FOREIGN KEY `FK_9da08194ff4d5af7dab785f0179`'
    )
    await queryRunner.query(
      'ALTER TABLE `transfer` DROP FOREIGN KEY `FK_1a2140362e3ebf86d6a6ed782ba`'
    )
    await queryRunner.query(
      'ALTER TABLE `feed_info` DROP FOREIGN KEY `FK_2bd832f368befadcc192e4bbf51`'
    )
    await queryRunner.query(
      'ALTER TABLE `calendar` DROP FOREIGN KEY `FK_f715f424a4feab1e0a3b3386d43`'
    )
    await queryRunner.query('ALTER TABLE `trip` DROP FOREIGN KEY `FK_6feeceb99ad462b1335980b2343`')
    await queryRunner.query('ALTER TABLE `trip` DROP FOREIGN KEY `FK_b3a14972f04167e17caed5dda1e`')
    await queryRunner.query('ALTER TABLE `trip` DROP FOREIGN KEY `FK_daa2a466ef8c9624b5083107ca9`')
    await queryRunner.query('ALTER TABLE `stop` DROP FOREIGN KEY `FK_88ea29f0e038e682988e92de9fc`')
    await queryRunner.query('ALTER TABLE `stop` DROP FOREIGN KEY `FK_5b0b1225829c546128fad2f03b3`')
    await queryRunner.query(
      'ALTER TABLE `translation` DROP FOREIGN KEY `FK_d070ad12f5db713ed286af65fe7`'
    )
    await queryRunner.query(
      'ALTER TABLE `translation` DROP FOREIGN KEY `FK_d488ef657d2bca1c03d867ae07c`'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` DROP FOREIGN KEY `FK_937be4c06e696f414c6abb8a0e5`'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` DROP FOREIGN KEY `FK_5d44d354892638e7ed464ede59a`'
    )
    await queryRunner.query(
      'ALTER TABLE `stop_time` DROP FOREIGN KEY `FK_27e0b74d9b4b4f9582ed4128c87`'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` DROP FOREIGN KEY `FK_a1cf2fbd0f31c134a9dc70a7e81`'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` DROP FOREIGN KEY `FK_1e0c7edd5a1ce9913bfadf8def6`'
    )
    await queryRunner.query(
      'ALTER TABLE `pathway` DROP FOREIGN KEY `FK_e5d2f1b9bb31726eaa1b2480563`'
    )
    await queryRunner.query('ALTER TABLE `level` DROP FOREIGN KEY `FK_58c63190f38cdb00d5e0465bded`')
    await queryRunner.query('ALTER TABLE `shape` DROP FOREIGN KEY `FK_f65ae51fabe8c540b49c9643922`')
    await queryRunner.query('ALTER TABLE `route` DROP FOREIGN KEY `FK_1dce1fcdff111d709b08a7a33d4`')
    await queryRunner.query('ALTER TABLE `route` DROP FOREIGN KEY `FK_62bdd05ebec24fce317d180d700`')
    await queryRunner.query(
      'ALTER TABLE `frequency` DROP FOREIGN KEY `FK_2c5d14ea8d1cc4bccbc3be10a62`'
    )
    await queryRunner.query(
      'ALTER TABLE `frequency` DROP FOREIGN KEY `FK_76661097ab27a74e702455c7985`'
    )
    await queryRunner.query(
      'ALTER TABLE `calendar_date` DROP FOREIGN KEY `FK_962b467eff1e4c515961422c429`'
    )
    await queryRunner.query(
      'DROP INDEX `IDX_fbd0d8cc4d23a2bb0786d6130f` ON `trip_calendar_dates_calendar_date`'
    )
    await queryRunner.query(
      'DROP INDEX `IDX_828748f7ccb825ce5626015288` ON `trip_calendar_dates_calendar_date`'
    )
    await queryRunner.query('DROP TABLE `trip_calendar_dates_calendar_date`')
    await queryRunner.query('DROP INDEX `IDX_f0004f6e505bea2635716ac0be` ON `trip_shapes_shape`')
    await queryRunner.query('DROP INDEX `IDX_4b14065d5be8993042cbabfca5` ON `trip_shapes_shape`')
    await queryRunner.query('DROP TABLE `trip_shapes_shape`')
    await queryRunner.query('DROP TABLE `agency`')
    await queryRunner.query('DROP TABLE `fare_attribute`')
    await queryRunner.query('DROP TABLE `fare_rule`')
    await queryRunner.query('DROP INDEX `IDX_34d4a3daff6e593169dd1ed39c` ON `remote`')
    await queryRunner.query('DROP TABLE `remote`')
    await queryRunner.query('DROP TABLE `transfer`')
    await queryRunner.query('DROP TABLE `feed_info`')
    await queryRunner.query('DROP TABLE `calendar`')
    await queryRunner.query('DROP TABLE `trip`')
    await queryRunner.query('DROP TABLE `stop`')
    await queryRunner.query('DROP TABLE `translation`')
    await queryRunner.query('DROP TABLE `stop_time`')
    await queryRunner.query('DROP TABLE `pathway`')
    await queryRunner.query('DROP TABLE `level`')
    await queryRunner.query('DROP TABLE `shape`')
    await queryRunner.query('DROP TABLE `route`')
    await queryRunner.query('DROP TABLE `frequency`')
    await queryRunner.query('DROP TABLE `calendar_date`')
    await queryRunner.query('DROP INDEX `IDX_aee88faa81da8ac03cc4177ca3` ON `country`')
    await queryRunner.query('DROP TABLE `country`')
  }
}
