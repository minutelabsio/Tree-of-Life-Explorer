<template>
  <div id="app">
    <slot/>
    <router-view/>
    <v-tour name="TOLTour" :steps="TourSteps" :callbacks="TourCallbacks"></v-tour>
  </div>
</template>

<script>
import PubSub from '@/lib/pubsub'
import router from './router'
import _throttle from 'lodash/throttle'

const txnCats = 'ott563159'
const TourTree = [
  'ott532117'
  , 'ott563166'
  , 'ott770315'
  , txnCats
]

const TourSteps = [
  {
    target: '[data-v-tour="start"]'
    , content: `Welcome to the MinuteLabs.io Tree of Life Explorer! Let's show you around...`
    , onEnter(){
      // console.log('start')
    }
    , params: {
      // placement: 'top'
    }
  }
  , {
    target: '[data-v-tour="start"]'
    , content: `Below is a tree that shows the connections between different species.`
    , onEnter({ type }){
      if ( type !== 'next' ){ return }
      router.replace({ query: { ids: TourTree } })
    }
  }
  , {
    target: `.tol-leaf[data-ott="${txnCats}"]`
    , content: 'This is a "clade node". It can represent any <a href="https://en.wikipedia.org/wiki/Taxonomic_rank" target="_blank">taxonomic rank</a> (species, family, genus, ...). In this case, it represents the Cat <em>Family</em>.'
    , onEnter(){
      PubSub.$emit('tree:pan-to', txnCats)
    }
  }
  , {
    target: `.tol-leaf[data-ott="${txnCats}"]`
    , content: 'The node shows the common name (if it has one), followed by the scientific name.'
    , onEnter(){
      PubSub.$emit('tree:pan-to', txnCats)
    }
  }
  , {
    target: `.tol-leaf[data-ott="${txnCats}"] .vertical-buttons .toolbar-control:last-child`
    , content: `This button will show the descendants (children) of this clade. There are a bunch for Cats!`
    , params: {
      placement: 'left'
    }
  }
  , {
    target: `.tol-leaf[data-ott="${txnCats}"] .vertical-buttons .toolbar-control:first-child`
    , content: `This button will flip the card to give you more options to remove the node, or even cut the tree at this node.`
    , params: {
      placement: 'top'
    }
  }
  , {
    target: `.svg-node[data-ott="${txnCats}"]`
    , content: `This icon shows how many ancestors are between the Cat Family clade and the next node shown up the tree.`
  }
  , {
    target: '.button-compact-view'
    , content: `Use this button to see a compact overview of the tree.`
  }
  , {
    target: '.top-nav .top-controls'
    , content: `There are more controls to manipulate the tree up here.`
  }
  , {
    target: '.top-nav .search-box'
    , content: `This will allow you to find clades and add them to the tree. You can search by their common name, or (if you know it) scientific name.<br/>Go ahead and give it a try by typing in something like "Blue Whale" or "Platypus"`
  }
]

const TourCallbacks = {
  onStart(){
    this.execStepCallbacks( 0, 'start' )
  }
  , execStepCallbacks( step, type ){
    let currentStep = this.currentStep

    if ( currentStep && currentStep.onLeave ){
      currentStep.onLeave({ type })
    }

    if ( step < 0 ){ return }

    currentStep = this.currentStep = TourSteps[ step ]
    let fn = currentStep.onEnter
    if ( fn ){
      fn({ type })
    }
  }
  , onPreviousStep( current ){
    this.execStepCallbacks( current - 1, 'back' )
  }
  , onNextStep( current ){
    this.execStepCallbacks( current + 1, 'next' )
  }
  , onStop(){
    this.execStepCallbacks( -1, 'stop' )
  }
}

export default {
  name: 'App'
  , data: () => ({
    TourSteps
    , TourCallbacks
  })
  , mounted() {
    PubSub.$on('tree:move', _throttle(() => {
      let tour = this.$tours['TOLTour']
      let step = tour.$children[0]
      if (!step) { return }
      step.createStep()
    }, 500))

    PubSub.$on('tour:start', () => {
      this.$tours['TOLTour'].start()
    })
  }
}
</script>

<style lang="scss">
@import '@/styles/_variables.scss';
html {
  height: 100%;
}
body {
  min-height: 100%;
  background: white;
}

#app .v-step {
  $step-color: saturate(lighten($yellow, 30), 20);
  $text-color: $blue;
  z-index: 1000;
  background: $step-color;
  color: darken($blue, 20);
  a {
    color: $text-color;
    text-decoration: underline;
  }
  .v-step__button {
    color: $text-color;
    border-color: $text-color;

    &:hover {
      background-color: $text-color;
      color: $step-color;
    }
  }
  &[x-placement^=bottom] .v-step__arrow {
    border-bottom-color: $step-color;
  }
  &[x-placement^=top] .v-step__arrow {
    border-top-color: $step-color;
  }
  &[x-placement^=left] .v-step__arrow {
    border-left-color: $step-color;
  }
  &[x-placement^=right] .v-step__arrow {
    border-right-color: $step-color;
  }
}

#app .main-title {
  position: relative;
  margin: 0;
  margin-right: 1rem;
  font-weight: 700;
  color: $blue;
  text-shadow: 1px 1px 1px lighten($blue, 30);

  font: 0/0 a;
  background: url(~@/assets/logo-horizontal.png) 0 0 no-repeat;
  background-size: 100%;
  width: 150px;
  height: 150px * (45/166);

  @media screen and (min-width: 820px){
    width: 250px;
    height: 250px * (45/166);
  }

  /* padding-left: 2rem; */
  /* &:before {
    content: 'The';
    position: absolute;
    top: 3px;
    left: 0;
    font-size: 1rem;
  } */
}

#app .content .main-title {
  margin-bottom: 1em;
}
</style>
