<template lang="pug">
.item
  .card.is-shadowless
    .card-header
      NodeItemMenu(:title='heading')
        b-tooltip(label="See children", type="is-dark")
          a.icon-button.control(@click="$emit('children')")
            b-icon(icon="file-tree")
        b-tooltip(label="Remove from tree", type="is-dark")
          a.remove-button.control(@click="$emit('remove')")
            b-icon(icon="close-network")

  .card(v-if="expanded")
    header.card-header.level
      .level-left
        .buttons.has-addons
          b-dropdown
            button.button.is-white(slot="trigger")
              b-icon(icon="dots-vertical")

            b-dropdown-item Action
            b-dropdown-item Another action
            b-dropdown-item(@click="showDebugModal") Debug info
      .level-right
        .buttons.has-addons
          button.button.is-white
            b-icon(icon="magnify")
          button.button.is-white(@click="pin = !pin")
            b-icon(icon="pin", :class="{ 'has-text-info': pin }")
          button.button.is-white(@click="$emit('close')")
            b-icon.has-text-danger(icon="close")

    .card-content
      .has-text-centered
        h1.has-text-info.is-size-3 {{ node.txnInfo.canonicalName || node.taxon.name }}
        h2.has-text-grey.is-size-5 {{ node.txnInfo.vernacularNameList }}
      .columns.is-centered(v-if="showImages")
        .column.is-narrow
          figure.image.is-48x48
            img(src="//placekitten.com/48/48")
        .column.is-narrow
          figure.image.is-48x48
            img(src="//placekitten.com/48/48")

    footer.card-footer
      a.card-footer-item(@click="showImages = !showImages")
        b-icon(icon="chevron-down")
</template>

<script>
import NodeItemMenu from './node-item-menu'

const DebugModal = {
  props: ['node']
  , template: `<div class="box"><pre>{{ JSON.stringify(node, null, 2) }}</pre></div>`
}

export default {
  name: 'TOLNodeItem'
  , props: ['node']
  , components: {
    NodeItemMenu
  }
  , data: () => ({
    showImages: false
    , pin: false
    , expanded: false
  })
  , computed: {
    heading(){
      return this.node.txnInfo.vernacularNameList ||
        this.node.txnInfo.canonicalName ||
        this.node.taxon.name
    }
  }
  , methods: {
    showDebugModal(){
      this.$modal.open({
        parent: this
        , component: DebugModal
        , props: {
          node: this.node
        }
        , hasModalCard: false
      })
    }
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
.item
  max-width: 400px
.icon-button
  color: $white
  &:hover
    color: lighten($blue, 10)
.remove-button
  color: $white
  &:hover
    color: lighten($red, 10)
</style>
