import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyB7RPZDOP5_2PA2FeBW9W5YFnJxrdrvh34",
    authDomain: "technopark-uxtest.firebaseapp.com",
    databaseURL: "https://technopark-uxtest.firebaseio.com",
    storageBucket: "technopark-uxtest.appspot.com",
};

export const firebaseApp = firebase.initializeApp(config);
export const database = firebase.database();
