<template>
  <div id="app">
    <slot/>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html {
  height: 100%;
}
body {
  min-height: 100%;
}
</style>
