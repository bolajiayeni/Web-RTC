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

// setting up media sources

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  remoteStream = new MediaStream();

  // moving video and audio from stream to p2p
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  //taking  tracks from remote stream
  pc.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  webcamVideo.srcObject = localStream;
  remoteVideo.srcObject = remoteStream;

  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

//Creating an offer i.e a video call stream
callButton.onclick = async () => {
  //firestore collection
  const callDoc = firestore.collection("calls").doc();
  const offerCandidates = callDoc.collection("offerCandidates");
  const answerCandidates = callDoc.collection("answerCandidates");

  callInput.value = callDoc.id;

  // Get ICE candidates for caller and sace to db

  pc.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  // create offer

  const offerDescription = await pc.createOffer();

  await pc.setLocalDescription(offerDescription);

  const offer = {
    sdp: offerDescription.sdp,
    type: offerDescription.type,
  };

  await callDoc.set({ offer });

  // lsiten for remote stream answer
  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!pc.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);

      pc.setRemoteDescription(answerDescription);
    }
  });

  // Adding candidate to peer connection when answered
  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        pc.addIceCandidate(candidate);
      }
    });
  });

  hangupButton.disabled = false;
};

answerButton.onclick = async () => {
  const callId = callInput.value;
  const callDoc = firestore.collection("calls").doc(callId);
  const answerCandidates = callDoc.collection("answerCandidates");
  const offerCandidates = callDoc.collection("offerCandidates");

  pc.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  const callData = (await callDoc.get()).data();

  const offerDescription = callData.offer;
  await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);

  const answer = {
    sdp: answerDescription.sdp,
    type: answerDescription.type,
  };

  await callDoc.update({ answer });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      console.log(change);
      if (change.type === "added") {
        let data = change.doc.data();
        pc.addIceCandidate(new RTCIceCandidate(data));
      }
    });
  });
};
