import { Cause } from './cause'
import { EntitySelector } from './entity_selector'
import { TimeRange } from './time_range'
import { TranslatedString } from './translated_string'

export interface Alert {
  active_period?: TimeRange
  informed_entity: EntitySelector
  cause?: Cause
  effect?: Effect
  url?: TranslatedString
  header_text: TranslatedString
  description_text: TranslatedString
}
