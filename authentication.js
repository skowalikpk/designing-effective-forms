import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBn94tvMrl9YCoj2nPbrpJ4iNF_ggKbgyY",
  authDomain: "tpf-lab04-fcdc6.firebaseapp.com",
  projectId: "tpf-lab04-fcdc6",
  storageBucket: "tpf-lab04-fcdc6.appspot.com",
  messagingSenderId: "152084352234",
  appId: "1:152084352234:web:5a527c6d4660dcbfde5b93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInButton = document.querySelector("#signInButton");
const signOutButton = document.querySelector("#signOutButton");

const userSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Signed in as:", user.displayName);
  } catch (error) {
    console.error("Sign-in error:", error.code, error.message);
  }
}

const userSignOut = async () => {
  try {
    await signOut(auth);
    alert("You have been signed out!");
  } catch (error) {
    console.error("Sign-out error:", error.code, error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    alert(`You are authenticated as ${user.displayName}`);
    console.log(user);
  } else {
    console.log("No user signed in.");
  }
});

signInButton.addEventListener("click", userSignIn);
signOutButton.addEventListener("click", userSignOut);

onAuthStateChanged(auth, (user) => {
  if (user) {
      alert("You are authenticated with Google");
      console.log(user);

      const nameInput = document.querySelector("#name");
      const emailInput = document.querySelector("#exampleInputEmail1");

      if (nameInput) nameInput.value = user.displayName || "";
      if (emailInput) emailInput.value = user.email || "";

  } else {
      console.log("User is signed out.");
  }
});
