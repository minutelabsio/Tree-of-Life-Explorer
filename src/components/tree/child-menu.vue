<template lang="pug">
.child-menu.dropdown(:style="{ transform: `translate(${x}px, ${y}px)`}", :class="{ 'is-active': active }")
  .dropdown-menu
    .dropdown-content
      b-loading(:is-full-page="false", :active="loading")
      .dropdown-item.heading.has-text-info Children
      .dropdown-divider
      a.dropdown-item(v-if="children.length", v-for="child in children", @click="$emit('select', child)")
        | {{ child.taxon ? child.taxon.name : child.node_id }}
      .dropdown-item(v-if="!loading && !children.length")
        | None
</template>

<script>
import { getSubtree } from '@/lib/otol'

export default {
  name: 'ChildMenu'
  , props: {
    'leaf': Object
    , 'x': Number
    , 'y': Number
  }
  , data: () => ({
    children: []
    , loading: false
    , active: false
  })
  , watch: {
    leaf(){
      this.children = []
      this.loading = true

      if ( !this.leaf ){
        this.active = false
        return
      }

      this.active = true

      getSubtree( this.leaf.node_id ).then( children => {
        this.children = this.children.concat(children)
        this.loading = false
      }).catch( e => console.error(e) )
    }
  }
}
</script>

<style lang="scss" scoped>
.child-menu {
  position: absolute;
  top: 0;
  left: 0;
  .dropdown-menu {
    position: relative;
    top: 20px;
    left: -50%;
  }
}
</style>
