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
