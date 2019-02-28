<template lang="pug">
.leaf-menu()
  .flap-title(v-if="flapStyle && commonName")
    b-tooltip.common-name(:label="commonName | titleCase", type="is-dark", :active="commonName.length > (truncateLength + 5)")
      .text {{ commonName | titleCase }}
  .flap-title.flap-title-bottom(v-if="flapStyle")
    b-tooltip.scientific-name(:label="scientificName | titleCase", type="is-dark", :active="scientificName.length > (truncateLength + 5) || shortScientificName.length < scientificName.length")
      .text {{ shortScientificName }}
  .toolbar.primary
    .button-overlay
      slot
    .background-image(:class="{ darken: !flapStyle }")
      Collage(:images="images")
    .toolbar-item(v-if="!flapStyle")
      .toolbar-text.names.item-title
        b-tooltip.common-name(v-if="commonName", :label="commonName | titleCase", type="is-dark", :active="commonName.length > truncateLength")
          | {{ commonName | titleCase | truncate(truncateLength) }}
        b-tooltip.scientific-name(:label="scientificName | titleCase", type="is-dark", :active="scientificName.length > truncateLength || shortScientificName.length < scientificName.length")
          | {{ shortScientificName | truncate(truncateLength) }}
</template>

<script>
import Collage from '@/components/collage'

export default {
  name: 'LeafViewMenu'
  , props: {
    commonName: String
    , flapStyle: Boolean
    , scientificName: String
    , shortScientificName: String
    , images: Array
    , truncateLength: {
      type: Number
      , default: 10
    }
  }
  , data: () => ({

  })
  , computed: {
    backgroundStyle(){
      if ( !this.images || !this.images.length ){ return '' }
      return `url(${this.images[0]})`
    }
  }
  , components: {
    Collage
  }
  , methods: {

  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
$menuHeight: 74px
$menuBackgroundColor: $blue
$lighterGrey: lighten($grey, 12)
.leaf-menu
  position: relative
  width: 100%
.flap-title
  position: absolute
  top: -1.4em
  left: 10px
  right: 10px
  border-radius: 3px 3px 0 0
  background: $white
  // border: 1px solid desaturate(lighten($blue, 20), 50)
  color: $lighterGrey
  .scientific-name,
  .common-name
    display: block
    width: 100%
  .text
    padding: 0 0.5em
    white-space: nowrap
    text-align: center
    text-overflow: ellipsis
    overflow: hidden
.flap-title-bottom
  top: auto
  bottom: -1.4em
  border-radius: 0 0 3px 3px
.background-image
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: -1
  background-position: center top
  background-size: cover
  background-repeat: no-repeat
  &.darken
    filter: saturate(0.8) brightness(0.65)
.primary, .secondary
  height: $menuHeight
  // border: 1px solid $grey-light
  border-radius: 3px
  border-color: $blue
  background: $white
  transition: transform .3s ease-in-out
  backface-visibility: hidden;
  transform-style: preserve-3d;
  &:hover
    cursor: pointer
.primary
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.2)
  background: $grey-darker
  transform: translateZ(-$menuHeight/2) rotateX(0deg) translateZ($menuHeight/2)
  .active &
    transform: translateZ(-$menuHeight/2) rotateX(90deg) translateZ($menuHeight/2)
.secondary
  background: $grey-darker
  position: absolute
  top: 0
  left: 0
  transform: translateZ(-$menuHeight/2) rotateX(-90deg) translateZ($menuHeight/2)
  .active &
    transform: translateZ(-$menuHeight/2) rotateX(0deg) translateZ($menuHeight/2)
.button-overlay
  position: absolute
  z-index: 2
  width: 100%
  height: 100%
  display: flex
  align-items: stretch
  > *
    flex-grow: 1
    display: flex
    align-items: center
    justify-content: center
    background: rgba(0, 0, 0, 0.5)
    transition: background 0.3s ease
    &:hover
      background: transparentize($blue, 0.2)
    &:first-child
      border-radius: 2px 0 0 2px
      border-right: 1px solid rgba(255, 255, 255, 0.6)
    &:last-child
      border-radius: 0 2px 2px 0

  // &:hover
  //   color: $primary
// legacy...
.toolbar .vertical-buttons .toolbar-control
  padding: 5px 5px
  transition: background 0.15s ease-in-out
  background: darken($menuBackgroundColor, 8)
  box-shadow: inset 1px 0px 0px 0px darken($menuBackgroundColor, 18)
  border-top: 1px solid darken($menuBackgroundColor, 2)
  border-bottom: 1px solid darken($menuBackgroundColor, 18)

  &:first-child
    border-top: none
    border-radius: 0 2px 0 0
  &:last-child
    border-radius: 0 0 2px 0

  &:hover
    background: darken($menuBackgroundColor, 4)
  &:active
    background: darken($menuBackgroundColor, 2)
  .icon
    color: darken($menuBackgroundColor, 30)
    text-shadow: 0.5px 0.5px 1px lighten($menuBackgroundColor, 18)

.secondary .toolbar-control
  color: $grey-light
  &:hover
    color: $white
.toolbar > .toolbar-item .toolbar-text.names
  padding: 0 0 0 1em
  height: 100%
  display: flex
  flex-direction: column
  flex-wrap: nowrap
  justify-content: center
  word-break: break-all
  hyphens: auto
  .common-name,
  .scientific-name
    display: block
    color: $white-ter
    text-shadow: 0 0 6px $black-bis
    &:after
      text-shadow: none
  .common-name
    font-weight: 500
  .scientific-name
    font-style: italic
</style>
