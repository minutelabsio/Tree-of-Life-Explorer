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

<style lang="scss">
@import '@/styles/_variables.scss';
html {
  height: 100%;
}
body {
  min-height: 100%;
  background: white;
}

#app .main-title {
  position: relative;
  margin: 0;
  margin-right: 1rem;
  font-weight: 700;
  color: $blue;
  text-shadow: 1px 1px 1px lighten($blue, 30);

  font: 0/0 a;
  background: url(~@/assets/logo.png) 0 0 no-repeat;
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
