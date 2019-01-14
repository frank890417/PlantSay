<template lang="pug">
.page.page-index
    navbar
    .container.pt-5
        .row
            .col-sm-4.leftbar
                
                div(v-if="!user")
                    h5.text-center.mb-3 登入以編輯文章
                        //- button.btn.btn-primary.float-right(@click="login") 登入
                    #firebaseui-auth-container
                div(v-else)
                    h4 Hello {{user.displayName}}
                    br
                    button.btn.btn-primary(@click="logout") 登出
                
                h4.mt-5 2019/1/14  
                h5 v0.0.4
                ol
                    li 加入節點標題、文章標題多行功能
                    li 加入簡易操作說明
                    li 加入上下節點取消連結功能
                    li 優化編輯介面 - 節點種類改為hover時顯示
                    li 改為只能看到自己新增與示範用的文章
                    li 加入全組選取同步拖曳功能
            .col-sm-8

                ul.list-group
                    li.list-group-item(v-for="(post,pid) in myposts")
                        nuxt-link(:to="'/post/'+post.uid"  v-if="post", title="前往文章") 
                            h5 {{post.title || "新文章"}}
                        label {{ post.authorName }} | {{ new Date(post.updated_at).toLocaleString() }}
                        .btn.btn-dark.float-right(@click="deletePost(post.uid)" v-if="user && post.authorId == user.uid") 刪除
                        nuxt-link.float-right(:to="'/edit/'+post.uid" v-if="post && user" ) 
                            .btn.btn-primary.mr-2 編輯
                    button.mt-3.new-post.btn.btn-primary(@click="addPost", v-if="user") 新增文章

</template>

<script>
import { db } from '~/plugins/firebase.js'
import firebase  from 'firebase'
import firebaseui  from 'firebaseui'
import {mapState} from 'vuex'
import navbar from '~/components/navbar'
// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());
let uiConfig = {
            // signInSuccessUrl: '/',
            signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            //   firebase.auth.GithubAuthProvider.PROVIDER_ID,
            //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
            //   firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
            ],
            // tosUrl and privacyPolicyUrl accept either url string or a callback
            // function.
            // Terms of service url/callback.
            // tosUrl: '/',
            // Privacy policy url/callback.
            privacyPolicyUrl: function() {
            window.location.assign('<your-privacy-policy-url>');
            }
        }

export default {
    // transition: "page",
    components: {
        navbar
    },
    asyncData ({ params }) {
        return db.ref("posts").once("value")
            .then((snapshot)=> {
                return { posts: snapshot.val() }
        })
    },
    created(){
        return db.ref("posts").on("value",(snapshot)=>{
            this.posts=snapshot.val()
        })
    },
    mounted(){
         let _this = this
        firebase.auth().onAuthStateChanged((user)=> {
            if (user) {
                console.log(user)
                _this.$store.commit("setUser",user)
        // User is signed in.
        // var displayName = user.displayName;
        // var email = user.email;
        // var emailVerified = user.emailVerified;
        // var photoURL = user.photoURL;
        // var uid = user.uid;
        // var phoneNumber = user.phoneNumber;
        // var providerData = user.providerData;
        // window.user = user
        // user.getIdToken().then(function(accessToken) {
        //   document.getElementById('sign-in-status').textContent = 'Signed in';
        //   document.getElementById('sign-in').textContent = 'Sign out';
        //   document.getElementById('account-details').textContent = JSON.stringify({
        //     displayName: displayName,
        //     email: email,
        //     emailVerified: emailVerified,
        //     phoneNumber: phoneNumber,
        //     photoURL: photoURL,
        //     uid: uid,
        //     accessToken: accessToken,
        //     providerData: providerData
        //   }, null, '  ');
        // });
        } else {
            // User is signed out.
            // document.getElementById('sign-in-status').textContent = 'Signed out';
            // document.getElementById('sign-in').textContent = 'Sign in';
            // document.getElementById('account-details').textContent = 'null';

            if (!this.user){
                ui.start('#firebaseui-auth-container', uiConfig);
            }
        }
        }, function(error) {
            console.log(error);
        });
    },
    methods:{
        addPost(){
            let newPostKey = db.ref().child('posts').push().key;
            db.ref("posts").child(newPostKey).set({
                title: "新文章",
                created_at: Date.now(),
                updated_at: Date.now(),
                authorId: this.user.uid,
                authorName: this.user.displayName,
                postSettings: {
                    showNodeDetail: true,
                    showPreview: true,
                    showStepLine: true
                }
            })
        },
        logout(){
            firebase.auth().signOut().then(() =>{
                // Sign-out successful.
                this.$store.commit("setUser",null)
                this.$nextTick(()=>{
                    this.login()
                })
            }, function(error) {
            // An error happened.
            });
        },
        login(){
            if (!this.user){
                ui.start('#firebaseui-auth-container', uiConfig);
                
            }
        },
        deletePost(pid){
            if(this.posts[pid].authorId==this.user.uid){
                this.$confirm('確認要刪除文章嗎? 此動作不能回復。', '刪除確認', {
                    confirmButtonText: '確認',
                    cancelButtonText: '取消',
                    type: 'danger'
                }).then(() => {
                    // let seedsRef = db.ref("seeds").orderByChild("documentId").equalTo(pid)
                    db.ref("posts").child( pid).remove()
                    this.$message({
                        type: 'success',
                        message: '文章已删除'
                    });          
                
                }).catch(() => {
                    this.$message({
                    type: 'info',
                    message: '已取消删除'
                    });          
                });

            }

            
            
        },
    },
    computed:{
        ...mapState(['user']),
        myposts(){
            if (this.posts){
                let convertedArray = Object.keys(this.posts).map(key=>
                    ({ ...this.posts[key] , uid: key })
                )

                if (this.user ){
                    if (this.user.uid=="cJk2H1jRw5Rr7Pfrxf6H3Bzyn642"){
                        return convertedArray
                    }else{
                        return convertedArray.filter(post=>post.authorId==this.user.uid || post.authorId=="cJk2H1jRw5Rr7Pfrxf6H3Bzyn642")
                    }
                }else{
                    return convertedArray.filter(post=>post.authorId=="cJk2H1jRw5Rr7Pfrxf6H3Bzyn642")
                }

            }else{
                return []
            }
        }
    }
}
</script>

<style lang="sass">
.page-index
    // background-color: #333
    //.leftbar
        color: white
    ol
        padding-left: 15px
    .container
        // max-width: 1400px
    .list-group-item
        // background-color: #eee
        margin-bottom: 5px
        border-radius: 2px
        box-shadow: 0px 0px 5px rgba(black,0.1)
        transition: 0.5s
        &:hover
            // transform: translateY(-1px)
            background-color: #fff
    .btn.new-post
        width: 100%
        font-size: 1.3rem
        max-height: initial
        padding: 15px

</style>
