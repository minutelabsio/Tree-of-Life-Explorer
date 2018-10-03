<template lang="pug">
.card
  .card-content
    .content
      .media
        .media-content
          .otl-id
            span='OTL Id: {{ leaf.node_id }} '
            a.has-text-small(@click="copyToClipboard(leaf.node_id)") (copy)
          h1.title.has-text-dark {{ scientificName }}
          h4.subtitle(v-if="commonName")
            span.has-text-grey='Commonly known as a '
            span.has-text-success {{ commonName }}

          .tag-list(v-if="!isMRCA")
            .tags.has-addons
              span.tag.is-dark
                | Rank
              a(:href="rankLink", target="_blank").tag.rank-tag
                | {{ txnInfo.rank }}
            .tags.has-addons(v-if="txnInfo.numDescendants")
              span.tag.is-dark
                | Decendants
              span.tag.is-info(:title="txnInfo.numDescendants")
                | {{ txnInfo.numDescendants | shortNumber }}

          b-message(v-if="isMRCA", type="is-info")
            | This is an MRCA node
        .media-right(v-if="txnInfo.pic.length")
          .controls
            b-field(position="is-centered")
              .control
                .button.is-small.is-rounded(@click="prevImage")
                  b-icon(icon="menu-left")
              .control
                .button.is-small.is-rounded(@click="nextImage")
                  b-icon(icon="menu-right")
          .image
            img(:src="txnInfo.pic[currentPic]")
    .links
      .is-size-5.heading Find more information on...
      .columns
        .column(v-for="link in links")
          a(:href="link.url", target="_blank")
            .card.clickable
              .card-image
                figure.image
                  img(:src="link.image")
              .card-content
                .content.has-text-centered {{ link.text }}
</template>

<script>
import _remove from 'lodash/remove'
import { isMRCA } from '@/lib/taxonomy'
import { getTxnSourceId } from '@/lib/otol'

function copyToClipboard( str ) {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

export default {
  name: 'TaxonomyInfoWindow'
  , props: {
    leaf: Object
    , txnInfo: Object
  }
  , data: () => ({
    currentPic: 0
  })
  , computed: {
    commonName(){
      if ( this.isMRCA ){ return '' }
      if ( !this.txnInfo || !this.txnInfo.vernacularNameList ){
        if ( this.otherCommonNames ){
          return this.otherCommonNames[0]
        }
        return ''
      }
      return this.txnInfo.vernacularNameList
    }
    , scientificName(){
      if ( !this.txnInfo ){ return '' }
      return this.txnInfo.canonicalName ||
        this.txnInfo.name ||
        this.leaf.node_id || ''
    }
    , isMRCA(){
      return this.leaf && isMRCA(this.leaf)
    }
    , rankLink(){
      return `https://en.wikipedia.org/wiki/${this.txnInfo.rank}_(biology)`
    }
    , links(){
      let ncbiId = getTxnSourceId( 'ncbi', this.leaf )
      let gbifId = getTxnSourceId( 'gbif', this.leaf )
      return _remove([
        {
          text: `Wikipedia`
          , url: this.isMRCA ? false : `https://en.wikipedia.org/wiki/${this.scientificName}`
          , image: 'https://3c1703fe8d.site.internapcdn.net/newman/gfx/news/hires/2017/58af0228b8aa8.jpg'
        }
        , {
          text: `Open Tree of Life`
          , url: `https://tree.opentreeoflife.org/opentree/argus/opentree@${this.leaf.node_id}`
          , image: 'https://avatars2.githubusercontent.com/u/1752618?s=400&v=4'
        }
        , {
          text: 'NCBI'
          , url: ncbiId ? `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${ncbiId}` : false
          , image: 'https://pbs.twimg.com/profile_images/759051827/26243_367877492480_367794192480_4194340_6124010_n_400x400.jpg'
        }
        , {
          text: 'GBIF'
          , url: gbifId ? `https://www.gbif.org/species/${gbifId}` : false
          , image: 'https://pbs.twimg.com/profile_images/638655521218785280/XCFoWw5r.jpg'
        }
      ], obj => obj.url)
    }
  }
  , components: {
  }
  , methods: {
    nextImage(){
      let len = this.txnInfo.pic.length
      this.currentPic = (this.currentPic + 1) % len
    }
    , prevImage(){
      let len = this.txnInfo.pic.length
      this.currentPic = (this.currentPic - 1 + len) % len
    }
    , copyToClipboard( str ){
      this.$toast.open({
        message: 'copied ID to clipboard'
        , type: 'is-info'
        , position: 'is-top-left'
      })

      copyToClipboard( str )
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/styles/_variables.scss'
.media-right
  position: relative
  width: 256px
  .controls
    position: absolute
    top: 10px
    right: 10px
    z-index: 1
.tag-list
  display: flex
  flex-wrap: wrap
  .tags
    flex-wrap: nowrap
    margin: 0 1em 0 0
  .rank-tag
    background: $purple
    color: lighten($purple, 80)
.otl-id
  font-weight: normal
  font-size: 0.8rem
  line-height: 1.5
  font-family: $family-monospace
.links
  .column
    max-width: 25%
  .card
    height: 100%
</style>
