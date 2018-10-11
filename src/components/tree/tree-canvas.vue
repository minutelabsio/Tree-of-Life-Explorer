<template lang="pug">
.tree-canvas(ref="wrapper")
  .svg(ref="svg")
  .slot(:style="{ transform: `translate3d(${left}px, ${top}px, 0)` }")
    slot
</template>

<script>
import SVG from 'svg.js'
import Impetus from 'impetus'
import _debounce from 'lodash/debounce'

// var isTouch = false
// window.addEventListener('touchstart', function firstTouch(){
//   isTouch = true
//   window.removeEventListener('touchstart', firstTouch)
// }, false)

function clamp( v, min, max ){
  return Math.min(Math.max(v, min), max)
}

export default {
  name: 'TreeCanvas'
  , props: {
    'width': {
      type: Number
      , default: 0
    }
    , 'height': {
      type: Number
      , default: 0
    }
    , 'offsetX': {
      type: Number
      , default: 0
    }
    , 'offsetY': {
      type: Number
      , default: 0
    }
  }
  , data: () => ({
    x: 0
    , y: 0
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

    // function getScrollHeight(){
    //   return document.documentElement.scrollHeight - document.documentElement.offsetHeight
    // }

    this.$refs.svg.appendChild(this.svgEl.children[0])
    let impetus = new Impetus({
      source: this.$el
      , boundX: this.xBounds
      , boundY: this.yBounds
      , update: ( x, y ) => {
        this.setOffset( x, y )
      }
    })

    const onResize = _debounce(() => {
      impetus.setBoundX( this.xBounds )
      impetus.setBoundY( this.yBounds )
    }, 200)

    const onWheel = ( e ) => {
      if ( !this.$el.contains(e.target) ){ return }
      e.preventDefault()
      let [minX, maxX] = this.xBounds
      let [minY, maxY] = this.yBounds
      let x = clamp(this.x - e.deltaX, minX, maxX)
      let y = clamp(this.y - e.deltaY, minY, maxY)
      impetus.setValues( x, y )
      this.setOffset( x, y )
      return false
    }

    const preventDefault = e => e.stopPropagation()

    window.addEventListener('wheel', onWheel, false)
    window.addEventListener('touchmove', preventDefault, {passive: false})

    this.$watch('width', onResize)
    this.$watch('height', onResize)
    window.addEventListener('resize', onResize)

    this.$once( 'hook:beforeDestroy', () => {
      window.removeEventListener('touchmove', preventDefault)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      impetus.destroy()
    })
  }
  , watch: {
    offsetX: 'fixSVGPosition'
    , offsetY: 'fixSVGPosition'
  }
  , computed: {
    left(){
      return this.x + this.offsetX
    }
    , top(){
      return this.y + this.offsetY
    }
    , xBounds(){
      return [-this.width * 0.5, this.width * 0.5]
    }
    , yBounds(){
      return [-this.height, 0]
    }
  }
  , methods: {
    fixSVGPosition(){
      let x = this.left
      let y = this.top
      this.svg.move(x, y)
    }
    , setOffset( x2, y2 ){
      this.x = x2
      this.y = y2
      this.fixSVGPosition()
    }
  }
}
</script>

<style lang="sass">
.tree-canvas
  position: relative
  width: 100%
  height: 100%
.slot
  position: relative
.svg
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  z-index: 0
  cursor: move
</style>
