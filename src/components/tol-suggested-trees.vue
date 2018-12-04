<template lang="pug">
.suggested-trees
  .hero.is-primary
    .hero-body
      .container
        h2.title Welcome!
        p Here's a list of curated trees for you to start from...
  article.suggestion.clickable(v-for="sug in suggestions", @click="suggest(sug.ottIds)")
    .container
      .media
        figure.media-left
          p.image
            img(:src="sug.image")
        .media-content
          .content
            p.title {{ sug.title }}
            p(v-html="sug.desc")
</template>

<script>
const suggestions = [
  {
    title: `Darwin's Finches`
    , image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Darwin%27s_finches_by_Gould.jpg/440px-Darwin%27s_finches_by_Gould.jpg'
    , desc: `Darwin's finches (also known as the Galápagos finches) are a group of about fifteen species of passerine birds. They are well known for their remarkable diversity in beak form and function. They are often classified as the subfamily Geospizinae or tribe Geospizini. &mdash; Wikipedia`
    , ottIds: [
      'ott589951'
      , 'ott589956'
      , 'ott5859950'
      , 'ott589953'
      , 'ott589955'
      , 'ott589959'
      , 'ott419376'
      , 'ott419363'
      , 'ott422530'
      , 'ott419367'
      , 'ott963505'
      , 'ott527328'
      , 'ott589949'
      , 'ott527327'
      , 'ott992256'
      , 'ott589943'
    ]
  }
  , {
    title: 'Peculiar Animals'
    , image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/AxolotlBE.jpg'
    , desc: 'A collection of strange looking animals.'
    , ottIds: [
      'ott984726'
      , 'ott852676'
      , 'ott679701'
      , 'ott292504'
      , 'ott1014156'
      , 'ott71606'
      , 'ott435643'
      , 'ott721280'
      , 'ott3632049'
      , 'ott3652359'
      , 'ott881015'
      , 'ott464697'
      , 'ott496400'
      , 'ott50727'
      , 'ott962377'
    ]
  }
  , {
    title: 'Our "Cousins"'
    , image: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Lightmatter_chimp.jpg'
    , desc: 'Species of Ape near Humans on the tree of life'
    , ottIds: [
      'ott312031'
      , 'ott417957'
      , 'ott351685'
      , 'ott417965'
      , 'ott770315'
      , 'ott770311'
      , 'ott417949'
    ]
  }
  , {
    title: 'Prehistoric Animals that Survived'
    , image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Cheeeeeese_....._%2826732940981%29.jpg/320px-Cheeeeeese_....._%2826732940981%29.jpg'
    , desc: 'A collection of animals that humans have found fossils of, and have survived the trials of natural selection to the present day.'
    , ottIds: [
      'ott73664'
      , 'ott334633'
      , 'ott801615'
      , 'ott257929'
      , 'ott754422'
      , 'ott424193'
      , 'ott511973'
      , 'ott344064'
      , 'ott35890'
      , 'ott1093624'
      , 'ott1084890'
      , 'ott773491'
      , 'ott3594707'
      , 'ott616361'
      , 'ott983579'
      , 'ott962377'
      , 'ott604022'
      , 'ott316994'
      , 'ott904117'
      , 'ott469472'
      , 'ott335582'
      , 'ott397243'
      , 'ott3617970'
    ]
  }
  , {
    title: 'Dinosaurs (and friends)'
    , desc: 'Dinosaurs, their desendants, and near cousins.'
    , image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Palais_de_la_Decouverte_Tyrannosaurus_rex_p1050042.jpg/320px-Palais_de_la_Decouverte_Tyrannosaurus_rex_p1050042.jpg'
    , ottIds: [
      'ott90215'
      , 'ott81461'
      , 'ott195672'
      , 'ott195670'
      , 'ott335582'
      , 'ott639666'
      , 'ott329823'
      , 'ott35888'
      , 'ott35887'
    ]
  }
  , {
    title: 'Eat your veggies'
    , desc: 'Closely related and good for you! Get to know your greens.'
    , image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Broccoli%20and%20cross%20section%20edit.jpg'
    , ottIds: [
      'ott833618'
      , 'ott472637'
      , 'ott309288'
      , 'ott833642'
      , 'ott526294'
      , 'ott181145'
      , 'ott181153'
      , 'ott209048'
      , 'ott505210'
      , 'ott833623'
      , 'ott833629'
      , 'ott833638'
      , 'ott951624'
    ]
  }
]

export default {
  name: 'TOLSuggestedTrees'
  , props: []
  , components: {
  }
  , data: () => ({
    suggestions
  })
  , methods: {
    suggest( ids ){
      this.$emit('suggest', ids)
    }
  }
}
</script>

<style scoped lang="sass">
@import '@/styles/_variables.scss'
.card
  height: 100%
.suggestion
  transition: all .15s linear
  @media screen and (min-width: $tablet)
    &
      padding-top: 0.5rem
      padding-bottom: 0.5rem

  .media-content
    display: flex
    flex-direction: row
    align-items: center
    align-self: stretch
  .image
    width: 256px
    overflow: hidden
    border-radius: 3px
  .title
    transition: all .15s linear
  &:hover
    color: $white
    background: $blue
    .title
      color: $white

@media screen and (max-width: $tablet)
  .suggestion
    .image
      margin: auto
      width: 100%
  .media
    flex-direction: column
    .media-left
      width: 100%
      margin: 0
    .media-content
      padding: 3rem 1.5rem
</style>
