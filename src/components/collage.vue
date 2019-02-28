<template lang="pug">
.wrap
  .single(v-if="!useCollage")
    img(:src="images[0]")
  .collage(v-if="useCollage")
    .image(v-for="image in images")
      img(:src="image")
</template>

<script>
export default {
  name: 'Collage'
  , props: {
    images: Array
  }
  , data: () => ({

  })
  , computed: {
    useCollage(){
      return this.images.length > 3
    }
  }
  , components: {
  }
  , methods: {
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
.wrap
  line-height: 0
  width: 100%
  height: 100%
  overflow: hidden
  border-radius: 2px

  .single img
    width: 100%

.collage
  height: 200%
  column-count: 2
  column-gap: 0
  column-fill: balance
</style>
