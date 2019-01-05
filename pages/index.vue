<template lang="pug">
.page
    .container.pt-5
        .row
            .col-sm-12
                h3.mb-5 PlantSay測試版 文章一覽
                hr
        .row
            .col-sm-3
                div(v-if="!user")
                    #firebaseui-auth-container
                    //- button.btn.btn-primary(@click="login") 登入
                div(v-else)
                    h5 Hello {{user.displayName}}
                    button.btn.btn-primary(@click="logout") 登出
            .col-sm-9 
                ul.list-group
                    li.list-group-item(v-for="(post,pid) in posts")
                        nuxt-link(:to="'/edit/'+pid" v-if="post") 
                            h4 {{post.title}}
                        label {{ post.authorName }}
                        nuxt-link.float-right(:to="'/post/'+pid" v-if="post") 
                            .btn.btn-dark 前往文章
                        //- .btn.btn-danger.float-right 刪除文章
                    button.form-control.btn.btn-primary(@click="addPost", v-if="user") 新增文章
            
</template>

<script>
import { db } from '~/plugins/firebase.js'
import firebase  from 'firebase'
import firebaseui  from 'firebaseui'
import {mapState} from 'vuex'
// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());
let uiConfig = {
            signInSuccessUrl: '/',
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
            tosUrl: '/',
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
        }
    },
    computed:{
        ...mapState(['user'])
    }
}
</script>

<style lang="sass">

</style>
