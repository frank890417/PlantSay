const pkg = require('./package')

module.exports = {
  mode: 'spa',

  /*
  ** Headers of the page
  */
  head: {
    title: "Organism - 碎片世代的知識管理平台",
    description: "Organism是節點版本的文章編輯器，把內容拆成散落的片段進行組合跟寫作，為非線性寫作平台，用節點的方式寫作跟管理知識內容，避免文章很難一路寫到底的問題，把一些骨架跟靈感抓出來之後再湊起來。",
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      {name="google-site-verification" ,content="JVDPbZeedzJZBN4DbLq1rDBoZX_WLbHJOQRvFJMzEZ4"}
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.6.3/css/all.css' }
    ],

  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    "node_modules/firebaseui/dist/firebaseui.css",
    'element-ui/lib/theme-chalk/index.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    "@/plugins/auth.js",
    "@/plugins/elementui.js"
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://bootstrap-vue.js.org/docs/
    'bootstrap-vue/nuxt'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      
    }
  },
  vender:[
    'element-ui'
  ],
  babel:{
    "plugins": [["component", [
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-default"
      },
      'transform-async-to-generator',
      'transform-runtime'
    ]]],
    comments: true
  },
  server: {
    port: 3000, // default: 3000
    host: '0.0.0.0', // default: localhost
  },
  
}
