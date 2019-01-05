<template lang="pug">
div.page-post.pt-5
  .container
    .row
      .col-sm-12
        h1.mb-5 {{post.title}}
        .generate_essay(v-html="generatedEssay")

</template>

<script>
import $ from 'jquery'
import { db } from '~/plugins/firebase.js'
export default {
  asyncData ({ params }) {
      
      let seedsRef = db.ref("seeds").orderByChild("documentId").equalTo(params.id)
      let postRef = db.ref("posts").child(params.id)
      let p1 = seedsRef.once("value")
            .then((snapshot)=> {
              return snapshot.val()
            })
              
      let p2 = postRef.once("value")
            .then((snapshot)=> {
              return snapshot.val()
            })


      return Promise.all([p1,p2]).then(function(values){
        let seeds=values[0]

        return { 
            seedsRef,
            documentId: params.id,
            seeds: Object.values(seeds),
            mousePos: {x: 0,y: 0},
            postSettings: {
              showNodeDetail: true,
              showPreview: true,
              showStepLine: true,
            },
            post: values[1],
            fullScreen: false,
            focusedSeed: null,
            pinning: false
        }
      })
    
  },

  mounted(){
    // console.log(this.seeds)
    this.$forceUpdate()


  },
    
  methods: {
    getNextNode(target){
      if (target){
        return this.seeds.find(seed=>{
          if (seed){
            return seed.id==target.nextNodeId
          }
          return false
        })
      }
    },
    getSeedHtmlContent(seed){
      let result = `<div class='result_section seed_${seed.id}_section'>`
      if (seed.type=="image"){
        result+= `<img src='${seed.src}' title='${seed.title}' title='${seed.title}'/>`
      }else{
        result+= `<h3 class='mt-3 mb-4'>${seed.title}</h3>
              <p>${ (seed.content || "").replace(/\n/g,"<br>") || "" }</p>`
      }
      result+="</div>"
      return result
    },
  },
  computed:{
    generatedEssay(){
      return this.linkedNodeList.reduce((result,seed)=>result+this.getSeedHtmlContent(seed),"")
    },
    
    allTextLength(){
      return this.linkedNodeList.reduce((total,seed)=>{
        return total+(seed.content || "").length
      },0)
    },
    //get array of linked nodes from start
    linkedNodeList(){
      let startNode = this.seeds.find(seed=>seed.type=="start")

      let result = []
      while(startNode){
        if (startNode){
          result.push(startNode)
        }
        startNode=this.getNextNode(startNode)
        if (result.indexOf(startNode)!=-1){
          break
          console.log("Link Cycle!!")
        }
      }
      return result
    }
    
  }
}
</script>

<style lang="sass">
.page-post
  height: 100%
  font-size: 15px
h1.logo
  position: fixed
  color: white
  left: 10px
  top: 10px
  
  z-index: 200
img
  max-width: 100%
  width: 250px
  
  
.seeds
  flex: 8
  
.generate_essay
  // flex: 3
  // padding: 30px 15px
  h1,h2,h3,h4,h5,h6
    // margin-bottom: 30px
  p
    margin-top: 10px
    margin-bottom: 10px
    line-height: 1.8
    letter-spacing: 0.5px

  img
    width: 100%
    margin-bottom: 10px
  height: 100%
  background-color: #fff
  
.result_section
  padding: 5px
  position: relative
    
.close-preview
  position: absolute
  // left: -50px
  left: 0
  // width: 50px
  padding: 5px
  font-size: 12px
  background-color: #f24
  top: 0
  cursor: pointer
  &:hover
    background-color: #f46

    
.seeds,.generate_essay
  // border: 1px solid #000
  height: 100%
  position: relative
  
.controls
  position: absolute
  width: 100%
  bottom: 0
  padding: 10px 20px
  color: white
  
svg.links
  position: absolute
  width: 100%
  height: 100%
  background-color: #222
  z-index: -1
  stroke: #aaa
  stroke-width: 3px
  polyline
    fill: none
    

.seed
  position: absolute
  // border: solid 1px #ccc
  border-radius: 3px
  background-color: #fff
  // padding: 20px 15px
  box-shadow: 0px 0px 15px rgba(black,0.2)
  // .content
  padding: 10px 10px
  transition: opacity 0.2s,border-color 0.2s
  width: 260px
  
  .seed-content
    // pointer-events: noneimg
    user-drag: none
    user-select: none
  .pin
    position: absolute
    width: 10px
    height: 10px
    border-radius: 50%
    background-color: #555
    left: 50%
    cursor: pointer
    &:hover
      background-color: #f24
  .inlet
    top: -5px
  .outlet
    bottom: -5px
  &.linked
    // border: solid 4px #bbb
    box-shadow: 0px 0px 0px 6px rgba(#888,0.7) ,0px 0px 10px rgba(black,0.2)
    
  &:hover
    // background-color: #eee
    opacity: 1
    border-color: #777
  .placeholder-line
    height: 6px
    background-color: #ddd
    margin-bottom: 8px

input.title
  font-size: 1.5rem
  background-color: transparent
  border: none
  border-bottom: 20px
  margin-bottom: 10px
  font-weight: 500
  

</style>
