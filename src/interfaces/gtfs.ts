class GTFS {
  static get FileNames() {
    return Object.values(this.StaticFileNames)
  }

  static get RequiredFileNames() {
    return [
      this.StaticFileNames.Agency,
      this.StaticFileNames.Stops,
      this.StaticFileNames.Routes,
      this.StaticFileNames.Trips,
      this.StaticFileNames.StopTimes,
    ]
  }
}

namespace GTFS {
  export enum StaticFileNames {
    Agency = 'agency.txt',
    Attributions = 'attributions.txt',
    Stops = 'stops.txt',
    Routes = 'routes.txt',
    Trips = 'trips.txt',
    StopTimes = 'stop_times.txt',
    Calendar = 'calendar.txt',
    CalendarDates = 'calendar_dates.txt',
    FareAttributes = 'fare_attributes.txt',
    FareRules = 'fare_rules.txt',
    Shapes = 'shapes.txt',
    Frequencies = 'frequencies.txt',
    Transfers = 'transfers.txt',
    Pathways = 'pathways.txt',
    Levels = 'levels.txt',
    FeedInfo = 'feed_info.txt',
    Translations = 'translations.txt',
  }
}

export default GTFS
