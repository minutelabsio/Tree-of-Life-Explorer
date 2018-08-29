<template lang="pug">
.leaf-menu(:class="{ active: active }", @mouseleave="onMouseLeave", @mouseenter="onMouseEnter")
  .toolbar.primary
    .background-image(:style="{backgroundImage: backgroundStyle}")
    .toolbar-item.item-title
      .toolbar-text.names
        b-tooltip.common-name(v-if="commonName", :label="commonName | titleCase", type="is-dark", :active="commonName.length > truncateLength")
          | {{ commonName | titleCase | truncate(truncateLength) }}
        b-tooltip.scientific-name(:label="scientificName | titleCase", type="is-dark", :active="scientificName.length > truncateLength")
          | {{ scientificName | titleCase | truncate(truncateLength) }}
    .toolbar-right.menu-button-container
      a.toolbar-control(@click="show()")
        b-icon(icon="arrow-up-bold-circle")
  .toolbar.secondary
    .toolbar-item
      slot
    .toolbar-right.menu-button-container
      a.toolbar-control(@click="hide()")
        b-icon(icon="close-circle")
</template>

<script>
export default {
  name: 'LeafViewMenu'
  , props: {
    commonName: String
    , scientificName: String
    , image: String
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
      if ( !this.image ){ return '' }
      return `url(${this.image})`
    }
  }
  , components: {

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
.leaf-menu
  position: relative
  width: 100%
.background-image
  position: absolute
  top: 0
  left: 0
  right: 48px
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
  &:hover, .active &
    border-color: $purple
  background: $white
  transition: transform .3s ease-in-out
.primary
  background: $grey-darker
  transform: rotateX(0deg) translateZ($menuHeight/2)
  .active &
    transform: rotateX(90deg) translateZ($menuHeight/2)
.secondary
  background: $grey-darker
  position: absolute
  top: 0
  left: 0
  transform: rotateX(-90deg) translateZ($menuHeight/2)
  .active &
    transform: rotateX(0deg) translateZ($menuHeight/2)
.menu-button-container
  transition: background 0.15s ease-in-out
  background: darken($purple, 8)
  box-shadow: inset 1px 0px 0px 0px darken($purple, 20)
  &:hover
    background: darken($purple, 4)

  .icon
    color: darken($purple, 30)
    text-shadow: 0.5px 0.5px 1px lighten($purple, 20)

.toolbar-control
  color: $white-ter
  // &:hover
  //   color: $primary
.secondary .toolbar-control
  color: $grey-light
  &:hover
    color: $white
.toolbar-text.names
  padding: 0 0 0 1em
  height: 100%
  display: flex
  flex-direction: column
  flex-wrap: nowrap
  justify-content: center
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
