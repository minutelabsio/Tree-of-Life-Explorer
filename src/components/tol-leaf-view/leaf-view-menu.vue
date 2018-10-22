<template lang="pug">
.leaf-menu(:class="{ active: active }", @mouseleave="onMouseLeave", @mouseenter="onMouseEnter")
  .toolbar.primary(@click="$emit('click')")
    .background-image
      Collage(:images="images")
    .toolbar-item.item-title
      .toolbar-text.names
        b-tooltip.common-name(v-if="commonName", :label="commonName | titleCase", type="is-dark", :active="commonName.length > truncateLength")
          | {{ commonName | titleCase | truncate(truncateLength) }}
        b-tooltip.scientific-name(:label="scientificName | titleCase", type="is-dark", :active="scientificName.length > truncateLength || shortScientificName.length < scientificName.length")
          | {{ shortScientificName | truncate(truncateLength) }}
    .toolbar-right
      .vertical-buttons
        .toolbar-control(@click.stop="show()")
          b-icon(icon="menu-up")
        .toolbar-control(@click.stop="")
          slot(name="front-button")
  .toolbar.secondary
    .toolbar-item
      slot
    a.toolbar-right.menu-button-container(@click="hide()")
      .toolbar-control
        b-icon(icon="menu-down")
</template>

<script>
import Collage from '@/components/collage'

export default {
  name: 'LeafViewMenu'
  , props: {
    commonName: String
    , scientificName: String
    , shortScientificName: String
    , images: Array
    , truncateLength: {
      type: Number
      , default: 10
    }
    , interactionHideDelay: {
      type: Number
      , default: 3000
    }
  }
  , data: () => ({
    active: false
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
    show(){
      this.active = true
    }
    , hide(){
      this.active = false
    }
    , startTimer(){
      this.timer = setTimeout(() => this.hide(), this.interactionHideDelay)
    }
    , clearTimer(){
      clearTimeout( this.timer )
    }
    , onMouseLeave( e ){
      this.startTimer()
    }
    , onMouseEnter( e ){
      this.clearTimer()
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
$menuHeight: 74px
$menuBackgroundColor: $blue
.leaf-menu
  position: relative
  width: 100%
.background-image
  position: absolute
  top: 0
  left: 0
  right: 34px
  bottom: 0
  z-index: -1
  background-position: center top
  background-size: cover
  background-repeat: no-repeat
  filter: saturate(0.8) brightness(0.65)
.primary, .secondary
  height: $menuHeight
  border: 1px solid $grey-light
  border-radius: 3px
  border-color: $blue
  background: $white
  transition: transform .3s ease-in-out
  backface-visibility: hidden;
  transform-style: preserve-3d;
  &:hover
    cursor: pointer
.primary
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
.toolbar .vertical-buttons .toolbar-control
  padding: 5px 5px
  transition: background 0.15s ease-in-out
  background: darken($menuBackgroundColor, 8)
  box-shadow: inset 1px 0px 0px 0px darken($menuBackgroundColor, 18)
  border-top: 1px solid darken($menuBackgroundColor, 2)
  border-bottom: 1px solid darken($menuBackgroundColor, 18)

  &:first-child
    border-top: none

  &:hover
    background: darken($menuBackgroundColor, 4)
  &:active
    background: darken($menuBackgroundColor, 2)
  .icon
    color: darken($menuBackgroundColor, 30)
    text-shadow: 0.5px 0.5px 1px lighten($menuBackgroundColor, 18)

.toolbar-control
  color: $white-ter
  // &:hover
  //   color: $primary
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
