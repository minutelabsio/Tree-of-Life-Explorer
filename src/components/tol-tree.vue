<template lang="pug">
.columns
  .column.is-narrow(v-for="leaf in leafs")
    .box {{ leaf.node.lineage.length }} parents
    TOLNodeCard(:gbif-entry="leaf.gbifEntry", :node="leaf.node", @close="$emit( 'remove', leaf )")
</template>

<script>
import TOLNodeCard from '@/components/tol-node-card'

export default {
  name: 'TOLTree'
  , props: ['leafs']
  , components: {
    TOLNodeCard
  }
  , data: () => ({

  })
  , methods: {

  }
}
</script>

<style scoped lang="sass">

</style>
