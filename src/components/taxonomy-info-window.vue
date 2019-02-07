<template lang="pug">
.card
  .card-content
    .content
      .columns
        .column.is-half
          .otl-id
            span='OTL Id: {{ leaf.node_id }} '
            a.has-text-small(@click="copyToClipboard(leaf.node_id)") (copy)
          h1.title.has-text-dark {{ scientificName }}
          h4.subtitle(v-if="commonName")
            span.has-text-grey='Commonly known as a '
            span.has-text-success {{ commonName }}

          .tag-list(v-if="!isMRCA")
            .tags.has-addons(v-if="txnInfo.rank")
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
        .column.is-half(v-if="txnInfo.thumbnail && txnInfo.thumbnail.length")
          swiper.info-window-swiper(:options="swiperOptions")
            swiper-slide(v-for="img in txnInfo.thumbnail", :key="img")
              .image-slide
                img(:src="img")
            .swiper-button-prev(v-if="!isTouch", slot="button-prev")
              b-icon(icon="chevron-left")
            .swiper-button-next(v-if="!isTouch", slot="button-next")
              b-icon(icon="chevron-right")
            .swiper-pagination(slot="pagination")
    .links
      .is-size-5.heading Find more information on...
      .columns.is-mobile.is-multiline
        .column.is-one-quarter-tablet.is-half-mobile(v-for="link in links")
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
import { copyToClipboard } from '@/lib/utils'

export default {
  name: 'TaxonomyInfoWindow'
  , props: {
    leaf: Object
    , txnInfo: Object
  }
  , data: () => ({
    currentPic: 0
    , swiperOptions: {
      navigation: {
        nextEl: '.swiper-button-next'
        , prevEl: '.swiper-button-prev'
      }
      , pagination: {
        el: '.swiper-pagination'
      }
    }
    , isTouch: ('ontouchstart' in document.documentElement)
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
      let len = this.txnInfo.thumbnail.length
      this.currentPic = (this.currentPic + 1) % len
    }
    , prevImage(){
      let len = this.txnInfo.thumbnail.length
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
.swiper-container
  border-radius: 3px
  background: $black
  .swiper-button-next,
  .swiper-button-prev
    height: 38px
    top: auto
    bottom: 0
    width: 38px
    margin-top: 0
    transition: background-color 0.3s ease
    background: transparentize($black, 0.4)
    border-radius: 3px
    color: white
    text-align: center
    line-height: 45px
    &:hover
      background: transparentize($blue, 0.4)
.swiper-button-prev
  left: 0
.swiper-button-next
  right: 0
.image-slide
  text-align: center
  max-height: 400px
  img
    width: 100%
    max-width: none
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
  .card
    height: 100%
</style>
