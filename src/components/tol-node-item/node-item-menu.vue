<template lang="pug">
.item-menu(:class="{ active: active }")
  .toolbar.primary
    .toolbar-item.item-title
      .text {{ title | capitalize | truncate(24) }}
    .toolbar-right
      a.control(@click="show()")
        b-icon(icon="menu-up")
  .toolbar.secondary
    .toolbar-item
      slot
    .toolbar-right
      a.control(@click="hide()")
        b-icon(icon="close")
</template>

<script>
export default {
  name: 'NodeItemMenu'
  , props: {
    title: String
  }
  , data: () => ({
    active: false
  })
  , components: {

  }
  , methods: {
    show(){
      this.active = true
    }
    , hide(){
      this.active = false
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
.item-menu
  position: relative
  width: 100%
.primary, .secondary
  border: 1px solid $grey-light
  border-radius: 3px
  &:hover, .active &
    border-color: $purple
  background: $white
  transition: transform .3s ease-in-out
.primary
  transform: rotateX(0deg) translateZ(20px)
  .active &
    transform: rotateX(90deg) translateZ(20px)
.secondary
  background: $grey-darker
  position: absolute
  top: 0
  left: 0
  transform: rotateX(-90deg) translateZ(20px)
  .active &
    transform: rotateX(0deg) translateZ(20px)
.close-button
  color: $grey-light
  transition: color .2s linear
  &:hover
    color: $red
.control
  color: $grey
  &:hover
    color: $primary

.secondary .control
  color: $grey-light
  &:hover
    color: $white
</style>
