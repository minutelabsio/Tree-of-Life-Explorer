<template lang="pug">
.tree-canvas(ref="wrapper")
  .svg(ref="svg")
  .slot(:style="{ transform: `translate3d(${ox}px, 0, 0)` }")
    slot
</template>

<script>
import SVG from 'svg.js'
import Impetus from 'impetus'
import _debounce from 'lodash/debounce'
export default {
  name: 'TreeCanvas'
  , props: ['height']
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

    function getScrollHeight(){
      return document.documentElement.scrollHeight - document.documentElement.offsetHeight
    }

    this.$refs.svg.appendChild(this.svgEl.children[0])
    let impetus = new Impetus({
      source: this.$el
      , boundY: [-getScrollHeight(), 0]
      , update: ( x, y ) => {
        this.setOffset( x, y, true )
      }
    })

    const onResize = _debounce(() => {
      impetus.setBoundY([ -getScrollHeight(), 0 ])
    }, 200)

    const onWheel = ( e ) => {
      let x = this.ox - e.deltaX
      let y = -window.pageYOffset - e.deltaY
      impetus.setValues( x, y )
      this.setOffset( x, y, true )
      return false
    }

    window.addEventListener('wheel', onWheel)

    this.$watch('height', onResize)
    window.addEventListener('resize', onResize)

    this.$once( 'hook:beforeDestroy', () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      impetus.destroy()
    })
  }
  , methods: {

    setOffset( x, y, scroll = false ){
      this.ox = x
      this.oy = y
      this.svg.move(this.ox, 0)
      if ( scroll ){
        window.scrollTo(undefined, -this.oy)
      }
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
