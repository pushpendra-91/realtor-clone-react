import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router';


export default function OAuth() {
    const navigate = useNavigate();
    const onGoogleClick = async () => {
        try {
            const auth = getAuth()
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user;
            // check for user 
            const docRef = doc(db, "users", user.uid)
            const docSnap = await getDoc(docRef)
            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    name: user.displayName,
                    email: user.email,
                    timeStamp: serverTimestamp(),
                });
            }
            navigate("/");
        } catch (error) {
            toast.error("Couldn't able to Authorize")
        }
    }
    return (
        <button type='button' className='flex items-center justify-center w-full bg-red-700 text-white py-3 px-7 uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded' onClick={onGoogleClick}>
            <FcGoogle className='text-2x1 bg-white rounded-full mr-2' />
            Continue with Google
        </button>
    )
}
