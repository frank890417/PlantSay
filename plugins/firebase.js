import firebase from 'firebase'
// import 'firebase/firestore' //if use firestore

if (!firebase.apps.length) {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBlfsgIgprnK3T7YFhHKNb5AzID2sqsUKI",
    authDomain: "plantsay-c4c14.firebaseapp.com",
    databaseURL: "https://plantsay-c4c14.firebaseio.com",
    projectId: "plantsay-c4c14",
    storageBucket: "plantsay-c4c14.appspot.com",
    messagingSenderId: "557126934256"
  };
  firebase.initializeApp(config);
}

// firebase.firestore().settings({ timestampsInSnapshots: true })

const db = firebase.database()
const storage = firebase.storage() //if use storage

export { storage, db }