<template lang="pug">
.tree-canvas(ref="wrapper")
  .svg(ref="svg")
  .slot(:style="{ transform: `translate3d(${ox}px, ${oy}px, 0)` }")
    slot
</template>

<script>
import SVG from 'svg.js'
import Impetus from 'impetus'
export default {
  name: 'TreeCanvas'
  , data: () => ({
    ox: 0
    , oy: 0
  })
  , provide(){
    this.svgEl = document.createElement('svg')
    this.svg = SVG(this.svgEl).size('100%', '100%').group()
    return {
      // provider: this.provider
      svg: this.svg
    }
  }
  , mounted(){
    this.$refs.svg.appendChild(this.svgEl.children[0])

    let impetus = new Impetus({
      source: this.$refs.wrapper
      , update: ( x, y ) => {
        this.setOffset( x, 0 )
      }
    })

    this.$once( 'hook:beforeDestroy', () => impetus.destroy() )
  }
  , methods: {

    setOffset( x, y ){
      this.ox = x
      this.oy = y
      this.svg.move(this.ox, this.oy)
      this.$emit('move', { x, y })
    }
  }
}
</script>

<style lang="sass">
.slot
  position: relative
  height: 100%
.svg
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
</style>
