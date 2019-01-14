<template lang="pug">
nav.navbar.navbar-expand-md.navbar-dark.fixed-top.bg-dark
  .container
    nuxt-link.navbar-brand(to='/') Organism 測試版 0.0.3
    button.navbar-toggler(type='button', data-toggle='collapse', data-target='#navbarCollapse', aria-controls='navbarCollapse', aria-expanded='false', aria-label='Toggle navigation')
      span.navbar-toggler-icon
    #navbarCollapse.collapse.navbar-collapse
      ul.navbar-nav.mr-auto
        li.nav-item.active
          nuxt-link.nav-link(to='/' , :class="{active: $route.name=='index'}") 首頁
        li.nav-item
          nuxt-link.nav-link(to='/about'  :class="{active: $route.name=='about'}") 關於
        li.nav-item
          nuxt-link.nav-link(to='/'  :class="{active: $route.name=='index'}") 文章列表
      //form.form-inline.mt-2.mt-md-0
        input.form-control.mr-sm-2(type='text', placeholder='Search', aria-label='Search')
        button.btn.btn-outline-success.my-2.my-sm-0(type='submit') Search

</template>

<script>
export default {

}
</script>

<style lang="sass">
.navbar
  display: flex
  width: 100%
  font-size: 15px
  padding: 0px 10px
  .navbar-brand
    font-size: 1.8rem
    font-weight: bold
  .navbar-nav
    width: 200px
  &.navbar-dark.bg-dark
    // background-color: #333
</style>
