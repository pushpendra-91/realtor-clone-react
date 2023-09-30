import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  function onChange(e) {
    setEmail(e.target.value)
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80" alt="key" className="w-full rounded-2xl" />
        </div>

        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form>
            <input type="email" id="email" value={email} onChange={onChange} placeholder="Email Address" className="mb-6 w-full px-4 py-2 text-xl bg-white text-gray-700 rounded border-gray-300" />
            <div className='flex justify-between whitespace-nowrap text-sm sm:text-lg'>
              <p className='mb-6'>Don't have an account? <Link to="/sign-up" className='text-red-500 hover:text-red-700 ml-1'>Register</Link></p>
              <p><Link to="/sign-in" className='text-blue-500 hover:text-blue-600'>Sign In</Link></p>
            </div>
            <button className='w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-sm hover:bg-blue-700 hover:shadow-lg active:bg-blue-900' type='submit'>Send Reset Password</button>
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
