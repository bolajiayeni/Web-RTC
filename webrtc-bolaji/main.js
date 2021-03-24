// stylesheet
import "./style.css";

// importing firebase into our main js file

import firebase from "firebase/app";
import "firebase/firestore";

// initializing the app with our firebase config

const firebaseConfig = {
  apiKey: "AIzaSyBACs9kt6DpwyEsDJeWqsTRB9P5kBHN53s",
  authDomain: "webrtc-bolaji.firebaseapp.com",
  databaseURL: "https://webrtc-bolaji-default-rtdb.firebaseio.com",
  projectId: "webrtc-bolaji",
  storageBucket: "webrtc-bolaji.appspot.com",
  messagingSenderId: "996072064437",
  appId: "1:996072064437:web:1d4e92de61ec740a7d85fc",
  measurementId: "G-DRK1EDYBCC",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

// Google stun servers

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Global state varriables
let pc = new RTCPeerConnection(servers);

// Your webcam
let localStream = null;

// Receiving webcam
let remoteStream = null;

// DOM constants

// The start webcam button, yeah you have to start the webcam first*
const webcamButton = document.getElementById("webcamButton");

// localStream video
const webcamVideo = document.getElementById("webcamVideo");

// to start your calls with
const callButton = document.getElementById("callButton");

// input field to enter your call ID: generated string that adds you to a call. gonna probably be useful
const callInput = document.getElementById("callInput");

// button to basically answer a call which you entered a call ID for

// TODO: use css to optimize how the call and reject button will look. please improve ui/ux
const answerButton = document.getElementById("answerButton");

//remoteStream Video
const remoteVideo = document.getElementById("remoteVideo");

// hangup button, for yunno hanging up lol
const hangupButton = document.getElementById("hangupButton");
