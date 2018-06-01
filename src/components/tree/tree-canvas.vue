<template lang="pug">
.tree-canvas
  .svg(ref="svg")
  slot
</template>

<script>
import SVG from 'svg.js'
export default {
  name: 'TreeCanvas'
  , provide(){
    this.svgEl = document.createElement('svg')
    return {
      // provider: this.provider
      svg: SVG(this.svgEl).size('100%', '100%')
    }
  }
  , mounted(){
    this.$refs.svg.appendChild(this.svgEl.children[0])
  }
}
</script>

<style lang="sass">
.svg
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
</style>
