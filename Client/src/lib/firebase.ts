import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { writable } from "svelte/store";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCqPKzKFJvy9ptHd7aSATBC6f8ShE6yea4",
	authDomain: "getinked-c6243.firebaseapp.com",
	projectId: "getinked-c6243",
	storageBucket: "getinked-c6243.appspot.com",
	messagingSenderId: "112707874647",
	appId: "1:112707874647:web:2d4af08332332c8a6e9812",
	measurementId: "G-QHL08L8KSK",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

/*
 * @returns a store with the current firebase user
 */
function userStore() {
	let unsubscribe: () => void;

	if (!auth || !globalThis.window) {
		console.warn("Auth is not initialized or not in the brower");
		const { subscribe } = writable<User | null>(null);
		return {
			subscribe,
		};
	}

	const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
		onAuthStateChanged(auth, (user) => {
			set(user);
		});

		return () => unsubscribe();
	});

	return {
		subscribe,
	};
}

export const user = userStore();
