<template lang="pug">
  <!-- <div> -->
  div.allContainer
    nuxt
    footer.text-center(v-if="$route.name!='edit-id'")
      p Copyright © 2019 Che-Yu Wu, Monoame Design All rights reserved 
  
  <!-- </div> -->
</template>
<script>
export default {
  // transition (to, from) {
    // return 'page'
    // if (!from) return 'slide-left'
    // return +to.query.page < +from.query.page ? 'slide-right' : 'slide-left'
  // }
}
</script>


<style lang="sass">

// .page-enter-active, .page-leave-active 
//   transition: opacity .1s

// .page-enter, .page-leave-to /* .fade-leave-active below version 2.1.8 */ 
//   opacity: 0

html,body
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
  font-size: 13px
  letter-spacing: 0.1rem
  line-height: 1.65
  -ms-text-size-adjust: 100%
  -webkit-text-size-adjust: 100%
  -moz-osx-font-smoothing: grayscale
  -webkit-font-smoothing: antialiased
  box-sizing: border-box
  padding-bottom: 0
h1,h2,h3,h4,h5,h6
  font-weight: bold
#__nuxt,.allContainer
  min-height: 100vh
footer
  background-color: #eee
  padding-top: 20px
  padding-bottom: 20px
.page
  min-height: 95vh
  padding-top: 60px
*,*:before,*:after
  box-sizing: border-box
  margin: 0

#__nuxt,#__layout
  min-height: 100%  

</style>
