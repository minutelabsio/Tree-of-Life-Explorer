import { getGbifId } from '@/lib/otol'
import { getById } from '@/lib/gbif'

export function getTaxonomyInfo( node ){
  return getById( getGbifId( node ) )
}
