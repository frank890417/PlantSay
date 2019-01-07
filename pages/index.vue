<template lang="pug">
.page
    .container.pt-5
        .row
            .col-sm-12
                h2.mb-5 PlantSay測試版 文章一覽
                //- hr
        .row
            .col-sm-3
                div(v-if="!user")
                    #firebaseui-auth-container
                    button.btn.btn-primary(@click="login") 登入
                div(v-else)
                    h4 Hello {{user.displayName}}
                    br
                    button.btn.btn-primary(@click="logout") 登出
            .col-sm-9 

                ul.list-group
                    li.list-group-item(v-for="(post,pid) in posts")
                        nuxt-link(:to="'/edit/'+pid" v-if="post") 
                            h4 {{post.title || "新文章"}}
                        label {{ post.authorName }} | {{ Date(post.created_at).toLocaleString() }}
                        .btn.btn-dark.float-right(@click="deletePost(pid)") 刪除
                        nuxt-link.float-right(:to="'/post/'+pid" v-if="post" target="_blank") 
                            .btn.btn-light.mr-2 前往文章
                    button.form-control.btn.btn-primary(@click="addPost", v-if="user") 新增文章

                div.mt-5.mb-3
                    h6 2019/1/6 v0.0.02
                    ol
                        li 修正無法正確刪除問題 
                        li 修正文章無標題時無法點進去
                        li 加上文章刪除、節點刪除提示
                        li 讓右側預覽文章也能即時編輯，並反應回節點
                        li 加上文章時間紀錄
                        li 新增畫面即時同步功能(socket.io)
                        li 新增自動即時儲存節點功能
            
</template>

<script>
import { db } from '~/plugins/firebase.js'
import firebase  from 'firebase'
import firebaseui  from 'firebaseui'
import {mapState} from 'vuex'
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
        }
        }, function(error) {
            console.log(error);
        });
        if (!this.user){
            ui.start('#firebaseui-auth-container', uiConfig);
        }
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
            ui.start('#firebaseui-auth-container', uiConfig);
        },
        deletePost(pid){

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

            
        },
    },
    computed:{
        ...mapState(['user'])
    }
}
</script>

<style lang="sass">

</style>
