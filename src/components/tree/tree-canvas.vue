<template lang="pug">
.tree-canvas(ref="wrapper")
  .svg(ref="svg")
  .slot(:style="{ transform: `translate3d(${left}px, ${top}px, 0)` }")
    slot
</template>

<script>
import PubSub from '@/lib/pubsub'
import SVG from 'svg.js'
import Impetus from 'impetus'
import TWEEN from '@tweenjs/tween.js'
import _debounce from 'lodash/debounce'

// var isTouch = false
// window.addEventListener('touchstart', function firstTouch(){
//   isTouch = true
//   window.removeEventListener('touchstart', firstTouch)
// }, false)

function clamp( v, min, max ){
  return Math.min(Math.max(v, min), max)
}

// Setup the animation loop.
requestAnimationFrame(function animate(time) {
  requestAnimationFrame(animate)
  TWEEN.update(time)
})

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
    , 'panDuration': {
      type: Number
      , default: 1000
    }
  }
  , data: () => ({
    x: 0
    , y: 0
    , elWidth: 0
    , elHeight: 0
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
    let impetus = this.impetus = new Impetus({
      source: this.$el
      , update: ( x, y ) => {
        this.cancelPan()
        this.setOffset( x, y )
      }
    })

    const onResize = _debounce(() => {
      this.onResize()
      impetus.setBoundX( this.xBounds )
      impetus.setBoundY( this.yBounds )
    }, 200)

    const onWheel = ( e ) => {
      if ( !this.$el.contains(e.target) ){ return }
      e.preventDefault()
      let { x, y } = this.getClampedCoords( this.x - e.deltaX, this.y - e.deltaY )
      impetus.setValues( x, y )
      this.cancelPan()
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

    onResize()
  }
  , watch: {
    top: 'fixSVGPosition'
    , left: 'fixSVGPosition'
  }
  , computed: {
    left(){
      return this.x + this.offsetX + this.elWidth * 0.5
    }
    , top(){
      return this.y + this.offsetY + this.elHeight * 0.5
    }
    , xBounds(){
      return [-(this.width + this.elWidth) * 0.5, (this.width + this.elWidth) * 0.5]
    }
    , yBounds(){
      return [-(this.height + this.elHeight) * 0.5, (this.height + this.elHeight) * 0.5]
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
      PubSub.$emit('tree:move')
    }
    , getClampedCoords( x, y ){
      let [minX, maxX] = this.xBounds
      let [minY, maxY] = this.yBounds
      x = clamp(x, minX, maxX)
      y = clamp(y, minY, maxY)
      return { x, y }
    }
    , onResize(){
      this.elWidth = this.$el.offsetWidth
      this.elHeight = this.$el.offsetHeight
    }
    , panTo( x, y, animate = true ){
      let coords = { x: this.x, y: this.y }

      x = -x
      y = -y
      ;({ x, y } = this.getClampedCoords(x, y))

      this.cancelPan()

      if ( !animate ){
        this.impetus.setValues( x, y )
        this.setOffset( x, y )
        return
      }

      this._activeTween = new TWEEN.Tween( coords )
        .to({ x, y }, this.panDuration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
          this.impetus.setValues( coords.x, coords.y )
          this.setOffset( coords.x, coords.y )
        })
        .start()
    }
    , cancelPan(){
      if ( this._activeTween ){
        this._activeTween.stop()
      }
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
