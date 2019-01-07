<template lang="pug">
div.mb-5
  .row
    .col-sm-6

      h2 Organism 測試版 0.0.2
    .col-sm-6
      nuxt-link.navbar-link.mr-5(to="/") 首頁
      nuxt-link.navbar-link.mr-5(to="/about") 關於
  .row
    .col-sm-12
      hr
</template>

<script>
export default {

}
</script>

<style lang="sass">
.navbar
  display: flex
  width: 100%

.navbar-nav
  width: 200px
</style>
