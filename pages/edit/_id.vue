<template lang="pug">
div
  //navbar(style="position: relative")
  div.page-post-editor( @keyup.enter="saveSeed(focusedSeed)",
                    @keydown.shift.d.prevent="postSettings.showNodeDetail=!postSettings.showNodeDetail",
                     @keydown.shift.p.prevent="postSettings.showPreview=!postSettings.showPreview",
                     @keydown.shift.s.prevent="sortNode",
                     )
    
    h1.logo
      nuxt-link(to="/") Organism v0.0.3
    .seeds#seeds_field(@dblclick="createSeed",
          @mousemove= "mouseMoving",
          @click="handleBgClick",
          @click.right="handleBgClick",
          title="點擊兩下以新增區塊")
      .controls
        .row
          .col-sm-12
            label.mr-3 檢視內容 (shift+d)
              input(type="checkbox" v-model="postSettings.showNodeDetail")
            label.mr-3 預覽文章 (shift+p)
              input(type="checkbox" v-model="postSettings.showPreview")
            label.mr-3 自動繞線 
              input(type="checkbox" v-model="postSettings.showStepLine")
            button.btn.btn-primary.mr-3.btn-save(@click="saveAllNode") 存檔
            button.btn.btn-secondary.mr-3(@click="sortNode") 整理
            label.mr-3 字數統計: {{ allTextLength }}
            
            label(v-if="allTextLength<1000") (短文)
            label(v-else-if="allTextLength<2000") (一般長度)
            label(v-else-if="allTextLength<3000") (中長文)
            label(v-else="allTextLength<3000") (長文)
            label.float-right {{ post.authorName }}
            button.btn.btn-secondary.mr-3.float-right(@click="showUserGuide") 使用說明
              
        
        //- label {{pinning}}
        
      .seed(v-for="seed in seeds",
            :style="getSeedStyle(seed)",
            @mousedown="startDragging(seed,$event)",
            @mouseup="endDragging(seed,$event)",
            @click="focusSeed(seed)"
            :id="'node_'+seed.id",
            :class="{linked: getNextNode(seed)}")
        .delete-btn(@click="deleteSeed(seed) ")
          i.fa.fa-times
        .seed-content

          div.button-group.seed-type-selector.mb-3(v-if="getSeedEditStatus(seed) && seed.type!='start'")
            .btn.btn-light(@click="$set(seed,'type','text')", :class="{active: seed.type=='text' || !seed.type }")
              i.fa.fa-font
            .btn.btn-light(@click="$set(seed,'type','image')", :class="{active: seed.type=='image'}")
              i.fa.fa-image
            .btn.btn-light(@click="$set(seed,'type','link')", :class="{active: seed.type=='link'}")
              i.fa.fa-link
            

            
            //select(v-model="seed.type")
              option(v-for='type in nodeTypes' :value="type") {{type}}
          //- h5 {{seed.title || "New Seed #" + seed.id}}
          div(v-if="seed.type=='image'")
            img(:src="seed.src")
            div(v-if="getSeedEditStatus(seed)")
              input.form-control(v-model="seed.src" placeholder="Picture Link")
              input.form-control(v-model="seed.title" placeholder="Title")
              el-input(type="textarea" v-model="seed.content"  rows=4, placeholder="段落內容")
              span(v-if="postSettings.showNodeDetail") 字數：{{ (seed.content||'').length }}
            //- textarea.form-control(v-model="seed.content" v-if="postSettings.showNodeDetail" rows=2)
          
          div(v-else-if="seed.type=='link'")
            input.title.form-control(v-model="seed.title", placeholder="標題")
            input.form-control(v-model="seed.href" placeholder="Link")

          div(v-else)
            label(v-if="seed.type=='start'") 文章開頭
            el-input.seed-title.mb-3(type="textarea" v-model="seed.title", :placeholder="getTitlePlaceHolder(seed) " autosize)
            //- input.title.form-control(v-model="seed.title", :placeholder="getTitlePlaceHolder(seed) ")
            div(v-if="getSeedEditStatus(seed)"  )
              el-input(type="textarea" v-model="seed.content"  rows=4, placeholder="段落內容")
              span(v-if="postSettings.showNodeDetail") 字數: {{ (seed.content||'').length }}
            .placeholder-line(v-for="num in parseInt((seed.content||'').length/100)" v-else)
        .pin.inlet(@mouseup.prevent="endLinking(seed,$event)", @dblclick="removeLastNodeLink(seed)")
        .pin.outlet(@mousedown.prevent="startLinking(seed,$event)", @dblclick="$set(seed,'nextNodeId',-1);saveSeed(seed)")
      svg.graphs(@click="focusedSeed=null")
        
        polyline(v-for="line in linkLines",
            :points="line.poly"
            stroke-linejoin="round",
            @dblclick="removeLink(line)"
            )
        
    .generate_essay.animated.slideInRight(v-if="postSettings.showPreview" )
      .container-fluid.mt-5.pb-5
        .row
          .col-sm-12
            h5.mb-5 文章預覽
            
              nuxt-link.float-right(v-if = "documentId" ,:to="'/post/'+documentId"  target="_blank") 
                  .btn.btn-dark 前往文章
            el-input.title(type="textarea" v-if="post" v-model="post.title" placeholder="文章標題" style="font-size: 2rem" autosize)

        .close-preview(@click="postSettings.showPreview=false") X
        .row
          .col-sm-12.pt-4.generated-content
            div(v-for="seed in linkedNodeList",
                :class = "['result_section',`seed_${seed.id}_section`]",
                @keyup="saveSeed(seed)")
              div(v-if="seed.type=='image'")
                img(:src="seed.src")
                pre {{ seed.title }}
                el-input( type="textarea" v-model="seed.content" v-if='seed.content' autosize)
                br
              div(v-else-if="seed.type=='link'")
                a(:href="seed.href" target="_blank") {{ seed.title }}
                el-input( type="textarea" v-model="seed.content" v-if='seed.content' autosize)
                b
              div(v-else)
                
                el-input.title(v-model = "seed.title" autosize v-if="seed.title" type="textarea" )
                el-input( type="textarea" v-model="seed.content" v-if='seed.content' autosize)
                br
            
  
</template>

<script>
import $ from 'jquery'
import { db } from '~/plugins/firebase.js'
import navbar from '~/components/navbar'
export default {
  // transition: "page", 
  components: {
    navbar},
  asyncData ({ params }) {
      let seedsRef = db.ref("seeds").orderByChild("documentId").equalTo(params.id)
      return seedsRef.once("value")
            .then((snapshot)=> {
              let seeds= snapshot.val()
              if (seeds===null || Object.keys(seeds).length==0 ){
                  
                seeds=[]
                let newSeedKey = db.ref().child('seeds').push().key;
                let nObj = {
                   "p": {
                      "x": 80,
                      "y": 80
                    },
                    "id": 0,
                    "uid": newSeedKey,
                    "title": "新文章開頭",
                    "type": "start",
                    "dragging": false,
                    "nextNode": null,
                    "documentId": params.id,
                  };
                db.ref("seeds").child(newSeedKey).set(nObj)
                seeds.push(nObj)
              }
              return { 
                  seedsRef,
                  documentId: params.id,
                  seeds: Object.keys(seeds).map(key=>({...seeds[key],uid: key})),
                  mousePos: {x: 0,y: 0},
                  dragging: false,
                  postSettings: {
                    showNodeDetail: true,
                    showPreview: true,
                    showStepLine: true,
                  },
                  post: {},
                  fullScreen: false,
                  focusedSeed: null,
                  pinning: false,
                  nodeTypes: ['start','text','image']
              }
      })
    
  },

  mounted(){
    document.querySelector(".btn-save").focus()
    // console.log(this.seeds)
    this.$forceUpdate()
    let postRef = db.ref("posts").child(this.documentId)
    postRef.on("value",(snapshot)=>{
      this.post=snapshot.val()
      this.postSettings = this.post.postSettings
    })

    let seedsRef = db.ref("seeds").orderByChild("documentId").equalTo(this.documentId)
    seedsRef.on('value',(snapshot)=>{
      let seeds = snapshot.val()
      seeds = Object.keys(seeds).map(key=>({...seeds[key],uid: key}))
      seeds.forEach(seed=>{
        let localSeed = this.seeds.find(s=>s.uid==seed.uid)
        if (localSeed){
            Object.keys(localSeed ).forEach(key=>{
          
          if ( JSON.stringify(seed[key])!= JSON.stringify(localSeed[key])){

            // console.log(( JSON.stringify(seed[key]),JSON.stringify(localSeed[key])))
            // console.log(`Updated Seed${seed.uid} :`+key)
            this.$set( localSeed, key, seed[key] )
  
            
            }
          })
        }
        if (!localSeed){
          this.seeds.push(seed)
        }
        
      })

      this.seeds = seeds.map(s=>this.seeds.find(ss=>ss.uid==s.uid)).filter(s=>s)

      this.$nextTick(()=>{
        this.$set(this,'seeds',this.seeds)
        this.$set(this.seeds,'randomUpdateId', parseInt(Math.random*100000))
      })

    })
    

  },
  methods: {
    showUserGuide(){
      this.$alert(`新增Block: 雙擊背景 / 
        取消連結: 雙擊節點`,"使用說明")
    },
    createSeed(evt){
      if ($(evt.target).attr('id')=='seeds_field'){
        let newSeedKey = db.ref().child('seeds').push().key;
        let nObj = {
            p: {x:evt.x ,y: evt.y},
            title: "",
            id:  Math.max(...this.seeds.map(seed=>seed.id))+1,
            documentId: this.documentId,
            uid: newSeedKey
        };
        db.ref("seeds").child(newSeedKey).set(nObj)
        this.seeds.push(nObj)
        
      }
      // console.log(this.seeds)
    },
    getSeedEditStatus(seed){
      return this.postSettings.showNodeDetail || (this.focusedSeed===seed && !this.pinning && !this.dragging)
    },
    getNextNode(target){
      if (target){
        if (target.nextNodeId==-1){
          return null
        }
        return this.seeds.find(seed=>{
          if (seed && seed.id){
            return target.nextNodeId==seed.id
          }
          return null
        })
      }
    },
    setFocus(seed,evt){
      this.focusedSeed=seed
    },
    startDragging(seed,evt){
      this.setFocus(seed)
      // evt.preventDefault()
      if (evt.target.classList.contains("seed")){
        this.dragging = true
        this.draggingPan = evt
      }
      
    },
    startLinking(seed,evt){
      console.log("link start!")
      this.$set(this,"pinning",true)
      this.pinning=true
      
    },
    mouseMoving(evt){
      this.mousePos.x =evt.x
      this.mousePos.y =evt.y
      if ( this.focusedSeed && this.dragging) {
        this.focusedSeed.p.x = evt.x - this.draggingPan.offsetX
        this.focusedSeed.p.y = evt.y - this.draggingPan.offsetY


        db.ref("seeds").child(this.focusedSeed.uid).child('p').set(this.focusedSeed.p)

      }
    },
    endDragging(seed,evt){
      if (this.focusedSeed){
        this.focusedSeed.dragging = false
      }
      this.pinning=false
      if (this.dragging){
        // this.focusedSeed=null
      }
      this.dragging=false
      // console.log(evt.target)
    },
    endLinking(seed,evt){
      if (seed && this.getNextNode(seed) !== this.focusedSeed && seed!==this.focusedSeed){
        this.focusedSeed.nextNodeId = seed.id
        console.log("link end!")
        this.seeds=this.seeds.slice(0,this.seeds.length)
        this.setFocus(seed)
      }
      

    },
    updatePos(seed){
      console.log(seed)
    },
    removeLink(line){
      this.line.fromNode.nextNodeId=-1
    },
    getSeedStyle(seed){
      if (seed){
        return {
          left: seed.p.x + "px",
          top: seed.p.y+ "px",
          cursor: seed.dragging?"grab":"initial",
          opacity: (this.getNextNode(seed) || seed=== this.focusedSeed)?1:(this.focusedSeed?0.5:0.85),
          'box-shadow': this.focusedSeed===seed?"0px 0px 0px 5px rgba(200,100,100,0.7),0px 0px 45px 0px rgba(0,0,0,0.6)":"0px 0px 5px rgba(0,0,0,0.3),0px 0px 0px 2px rgba(150,150,150,0.6)",
          'z-index':  this.focusedSeed===seed?1000:seed.id
        }
      }
    },
    getSeedHtmlContent(seed){
      let result = `<div class='result_section seed_${seed.id}_section'>`
      if (seed.type=="image"){
        result+= `<img src='${seed.src}' title='${seed.title}' title='${seed.title}'/>`
      }else{
        result+= `<h3>${seed.title}</h3>
              <br>
              <p>${ (seed.content || "").replace(/\n/g,"<br>") || "" }</p>`
      }
      result+="</div>"
      return result
    },
    getPinPositions(seed){
      let seedEl =   document.getElementById("node_"+seed.id)
      if (!seedEl){
        return {
          inlet: {x: 0, y: 0},
          outlet: {x: 0, y: 0}
        }
      }
       let inlet = seedEl.querySelector(".inlet")
       let outlet = seedEl.querySelector(".outlet")

     return {
       inlet: {
         x: seed.p.x + inlet.offsetLeft+5,
         y: seed.p.y + inlet.offsetTop+5,
       },
       outlet: {
         x: seed.p.x + outlet.offsetLeft+5,
         y: seed.p.y + outlet.offsetTop+5,
       }
     }
    },
    sortNode(){
      let last 
      let xrow =0
      
      this.linkedNodeList.forEach(next=>{
        if (last){
          next.p.y =this.getPinPositions(last).outlet.y+30
          next.p.x = last.p.x
          if (next.p.y > window.innerHeight-200){
            xrow++

            next.p.y = next.p.y % (  window.innerHeight-200)
            if (next.p.y<100){next.p.y=100}
            next.p.x+=300
          }
          this.$set(next,"p",next.p)
           db.ref("seeds").child(next.uid).child('p').set(next.p)
          
        }
        last = next
      })
      // this.$nextTick(()=>{
      //   this.saveAllNode()
      // })
    },
    focusSeed(seed){
      let sectionEl = document.querySelector(`.seed_${seed.id}_section`)
      if (sectionEl){
        console.log(sectionEl.offsetTop)
        //偏移到section位置
        $(".generate_essay").scrollTop(sectionEl.offsetTop-20)
        $(".result_section").css({
          'background-color': "transparent"
        })
        $(sectionEl).css({
          'background-color': "rgba(100,100,100,0.15)"
        })
      }
    },

    deleteSeed(targetSeed){

      this.$confirm('確認要刪除節點嗎? 此動作不能回復。', '刪除確認', {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        type: 'danger'
      }).then(() => {
        targetSeed.deleted=true
        db.ref("seeds").child( targetSeed.uid ).remove()
        this.seeds=this.seeds.filter(s=>s!==targetSeed)

        this.seeds.forEach(seed=>{
          if (seed.nextNodeId==targetSeed.id){
            seed.nextNodeId=-1
          }
        })
        
        this.focusedSeed=null

        this.$message({
          type: 'success',
          message: '節點刪除成功!'
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });

      
    },
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
    getSvgLinePoints(p1,p2){
      // console.log(p1,p2)
      if (p1&&p2){

        let line = {p1: p1,p2: p2}
        // if (p2.x<p1.x){
        //   line = {p1: p2,p2: p1}
        // }
        line.poly = line.p1.x+","+line.p1.y + " " +line.p2.x+","+line.p2.y

        //determine line run across blocks or not
        if (this.postSettings.showStepLine && Math.abs(p1.x-p2.x)>20){
        // if (line.p1.y > line.p2.y){
          let xPan = Math.min(Math.abs(line.p1.x-line.p2.x),150)
          let yPan =  Math.min(Math.abs(p1.y-p2.y)/2,20)
          if (line.p2.x-line.p1.x<0){
            xPan*=-1
          }


          let polyPoints = ""
          polyPoints+=line.p1.x +","+line.p1.y+
           " " + line.p1.x +","+(line.p1.y+yPan) 
           + " " + (line.p1.x+xPan) +","+(line.p1.y+yPan) 
           + " " + (line.p1.x+xPan) +","+(line.p2.y -yPan) 
           + " " + (line.p2.x) +","+(line.p2.y -yPan)
           + " " + (line.p2.x) +","+line.p2.y

          line.poly = polyPoints
          // }
        }
        return line
      }
    },
    saveAllNode(){
      this.seeds.forEach((seed)=>{
        if (seed.uid!=0 && seed){
          db.ref("seeds").child(seed.uid).set({
            ...seed,
            updated_at: Date.now(),
          })

        }
      })
      this.$message.success('儲存成功!');
    },
    handleBgClick(evt){
      if (evt.target.classList.contains('seeds')){
        this.focusedSeed=null
        this.pinning=false
        this.dragging=false
      }
    },
    saveSeed(seed){
      if (seed){
        seed.updated_at = Date.now()
        let seedRef = db.ref("seeds/").child(seed.uid)
        seedRef.set(seed)

        let postRef = db.ref("posts/").child(this.documentId).child("updated_at")
        postRef.set(Date.now())

      }
    },
    getTitlePlaceHolder(seed){
      if (!seed.title){
        if (!seed.content){
          return "段落標題"
        }else{
          return (''+seed.content||'').slice(0,20)+'...'
        }
      }
      return ""
    }
  },
  computed:{
    generatedEssay(){
      return this.linkedNodeList.reduce((result,seed)=>result+this.getSeedHtmlContent(seed),"")
    },
    linkLines(){
      let result = []
      
      if (this.pinning){
        let fromPoint= this.getPinPositions(this.focusedSeed).outlet
        result.push(this.getSvgLinePoints(fromPoint,this.mousePos))
      }
      
      let nodesHaveNext = this.seeds.filter(seed=>this.getNextNode(seed))
      nodesHaveNext.forEach(seed=>{
        let lastNode = seed
        let startNode = lastNode && this.getNextNode(lastNode)
        
        let line = this.getSvgLinePoints( 
                      this.getPinPositions(lastNode).outlet, 
                      this.getPinPositions(startNode).inlet)

        result.push(line)
      })
      return result
    },
    removeLastNodeLink(target){
      let upperSeed = this.seeds.find(seed=>seed.nextNodeId==target.id)
      if (upperSeed){
        upperSeed.nextNodeId=-1
      }
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
    
  },
  watch: {
    // monitor editing and save automatically
    "postSettings.showNodeDetail": function(){
      let postRef = db.ref("posts/").child(this.documentId).child("postSettings")
      postRef.set(this.postSettings)
      this.$nextTick(()=>{
        this.seeds=this.seeds.slice(0,this.seeds.length)
      })
    },
    "postSettings.showPreview": function(){
      let postRef = db.ref("posts/").child(this.documentId).child("postSettings")
      postRef.set(this.postSettings)
      this.$nextTick(()=>{
        this.seeds=this.seeds.slice(0,this.seeds.length)
      })
    },
    "postSettings.showStepLine": function(){
      let postRef = db.ref("posts/").child(this.documentId).child("postSettings")
      postRef.set(this.postSettings)
      this.$nextTick(()=>{
        this.seeds=this.seeds.slice(0,this.seeds.length)
      })
    },
    "post.title": function(value){
      console.log(value)
      let postRef = db.ref("posts/").child(this.documentId).child("title")
      postRef.set(value)
    },
    // seeds(){
    //   // this.saveAllNode()
    //    let postRef = db.ref("posts/").child(this.documentId).child("updated_at").set({
    //       updated_at: Date.now(),
    //    })


    // },
    focusedSeed(newSeed,oldSeed){
      if (oldSeed && !oldSeed.deleted){
        if (JSON.stringify(newSeed)!= JSON.stringify(oldSeed)){
          if (oldSeed){
            oldSeed.updated_at = Date.now()
            let postRef = db.ref("seeds/").child(oldSeed.uid).set(oldSeed)
          }
        }

      }
    }
    
  }
}
</script>

<style lang="sass">
h1.logo
  position: fixed
  color: white
  left: 20px
  top: 10px
  font-weight: 600
  z-index: 200
  a
    color: rgba(white,0.3)
img
  max-width: 100%
  width: 250px
  
.page-post-editor
  width: 100%
  height: calc(100vh)
  position: relative
  display: flex
  justify-content: center
  align-items: center
  overflow: hidden
    
  .seeds
    flex: 8
    // overflow: scroll

  #seeds_field
    // overflow: scroll
    
  .generate_essay
    flex: 3
    padding-left: 5px
    padding-right: 0.5px
    .title 
      textarea
        font-weight: bold
        border: none

    .generated-content
      .el-input,.el-textarea
        padding-left: 0
        padding-right: 0
      
      .el-textarea
        border: none
        width: 100%
        margin-top: 10px
        margin-bottom: 10px
        textarea
          border: none
          letter-spacing: 0.5px
          line-height: 1.8
          padding-left: 0
          padding-right: 0
          background-color: transparent

    .title
      
      font-size: 1.5rem
      input
        border: none
        font-weight: bold
        padding-left: 0
        padding-right: 0
        background-color: transparent

      
      
    // padding: 30px 15px
    h1,h2,h3,h4,h5,h6
      // margin-bottom: 30px
    p
      margin-top: 10px
      margin-bottom: 10px
    img
      width: 100%
      margin-bottom: 10px
    height: 100%
    background-color: #fff
    overflow-y: scroll
    position: relative
    z-index: 100
    box-shadow: 0px 0px 20px rgba(black,0.2)
    
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
    background-color: rgba(#333,0.9)
    z-index: 2000
    
  svg.graphs
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
    border-radius: 2px
    background-color: #fff
    // padding: 20px 15px
    box-shadow: 0px 0px 15px rgba(black,0.2)
    // .content
    padding: 10px 10px
    transition: opacity 0.2s,border-color 0.2s
    width: 260px
    .seed-title
      font-size: 1.3rem
      textarea
        font-weight: bold
        letter-spacing: 0.05em
        background-color: transparent
        border: none
        padding: 0px 5px
      .el-textarea
        min-height: 1.4rem

    .delete-btn
      position: absolute
      right: 10px
      top: 10px
      cursor: pointer
      opacity: 0
      transition: 0.5s
      font-weight: 900

    //select type for seed
    .seed-type-selector
      position: absolute
      top: -30px
      left: 0px
      opacity: 0
      pointer-events: none
      transition: 0.1s
      z-index: 15
      box-shadow: 0px 0px 5px rgba(black,0.3)
      .btn
        border: none
        color: white
        background-color: #333
        border-radius: 3px 3px 0px 0px
        // border-color: rgba(white,0.2)
        // opacity: 0.5

        &.active,&:hover
          // border-color: rgba(white,1)
          opacity: 1
          background-color: #fff
          color: black
    &:hover .seed-type-selector
      opacity: 1
      pointer-events: initial


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
      box-shadow: 0px 0px 0px 1px rgba(#888,0.7) ,0px 0px 5px rgba(black,0.2)
      
    &:hover
      // background-color: #eee
      opacity: 1
      border-color: #777
      .delete-btn
        opacity: 1
    .placeholder-line
      height: 6px
      background-color: #ddd
      margin-bottom: 8px

  input.title
    font-size: 1.4rem
    background-color: transparent
    border: none
    border-bottom: 20px
    margin-bottom: 10px
    font-weight: 500
    

</style>
