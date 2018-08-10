import * as React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App'
import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyB7RPZDOP5_2PA2FeBW9W5YFnJxrdrvh34",
    authDomain: "technopark-uxtest.firebaseapp.com",
    databaseURL: "https://technopark-uxtest.firebaseio.com",
    storageBucket: "technopark-uxtest.appspot.com",
};
firebase.initializeApp(config);

render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>,
    document.getElementById("react-container")
)
