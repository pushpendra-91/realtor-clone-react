import React, { useState } from 'react';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth'
import { db } from '../firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: "",
    password: "",
  });
  const { name, email, password } = formData;
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      updateProfile(auth.currentUser, {
        displayName: name
      })
      const user = userCredential.user
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();
      await setDoc(doc(db, "users", user.uid), formDataCopy);
      // toast.success("SignUp Success!");
      navigate("/");
      console.log("user: ", user)
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error)
    }
  }

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80" alt="key" className="w-full rounded-2xl" />
        </div>

        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input type="text" id="name" value={name} onChange={onChange} placeholder="Full Name" className="mb-6 w-full px-4 py-2 text-xl bg-white text-gray-700 rounded border-gray-300" />

            <input type="email" id="email" value={email} onChange={onChange} placeholder="Email Address" className="mb-6 w-full px-4 py-2 text-xl bg-white text-gray-700 rounded border-gray-300" />

            <div className='relative mb-6'>
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={onChange} placeholder="Password" className="w-full px-4 py-2 text-xl bg-white text-gray-700 rounded border-gray-300" />

              {showPassword ? (
                <AiFillEyeInvisible className="absolute right-3 top-3 text-xl cursor-pointer" onClick={() => setShowPassword((prevState) => !prevState)} />
              ) : (
                <AiFillEye className='absolute right-3 top-3 text-xl cursor-pointer' onClick={() => setShowPassword((prevState) => !prevState)} />
              )}
            </div>
            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='mb-6'>Have an account? <Link to="/sign-in" className='text-red-500 hover:text-red-700 ml-1'>Sign Up</Link></p>
              <p><Link to="/forgot-password" className='text-blue-500 hover:text-blue-600'>Forgot Password?</Link></p>
            </div>
            <button className='w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-sm hover:bg-blue-700 hover:shadow-lg active:bg-blue-900' type='submit'>Sign Up</button>
            <div className='flex items-center my-4 before:border-t before:flex-1  before:before-gray-300 after:border-t after:flex-1 after:border-gray-300'>
              <p className='text-center font-semibold mx-4'>OR
              </p>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  )
}
