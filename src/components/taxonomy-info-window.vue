<template lang="pug">
.card
  .card-header
    figure.image
      img(:src="txnInfo.pic[0]", alt="Placeholder image")
  .card-content
    .content
      | test
</template>

<script>
export default {
  name: 'TaxonomyInfoWindow'
  , props: {
    txnInfo: Object
  }
  , data: () => ({

  })
  , computed: {
  }
  , components: {
  }
  , methods: {
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
</style>
