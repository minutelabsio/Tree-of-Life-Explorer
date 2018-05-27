<template lang="pug">
.card
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
        h1.has-text-info.is-size-3 {{ gbifEntry.canonicalName }}
        h2.has-text-grey.is-size-5 {{ gbifEntry.vernacularNameList }}
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
const DebugModal = {
  props: ['gbifEntry', 'node']
  , template: `<div class="box"><pre>{{ JSON.stringify(gbifEntry, null, 2) }}</pre><pre>{{ JSON.stringify(node, null, 2) }}</pre></div>`
}

export default {
  name: 'TOLNodeCard'
  , props: ['gbifEntry', 'node']
  , data: () => ({
    showImages: false
    , pin: false
  })
  , methods: {
    showDebugModal(){
      this.$modal.open({
        parent: this
        , component: DebugModal
        , props: {
          gbifEntry: this.gbifEntry
          , node: this.node
        }
        , hasModalCard: false
      })
    }
  }
}
</script>

<style scoped lang="sass">
.card
  max-width: 400px
</style>
