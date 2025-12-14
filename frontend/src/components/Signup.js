import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import "./home.css"

const Signup = ({isSignedUp, setIsSignedUp, copyEmail, setcopyEmail}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate(); 
  const [wrongCredentials, setWrongCredentials] = useState(false);

  useEffect( () => {
        if(email.length == 0 && password.length == 0 && confirmPassword.length == 0){
          setWrongCredentials(false);
        }
      }, [email, password, confirmPassword] )


  async function changeHandler (e){
    e.preventDefault();
    try{
   const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/signuptoken", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({
        username ,email, password, confirmPassword,
      })
   })

   const data = await res.json();

   if(data.success){
    setIsSignedUp(true);
    setcopyEmail(email);
    navigate("/signup/otp", { state: { token: data.token } });
   }
   else {
    if(email.length !==0 || password.length !==0 || confirmPassword.length !==0 ){setWrongCredentials(true);}
    setIsSignedUp(false);
    navigate("/signup");
   } }
   
  catch(error){
    return error;
  }
    
  } 
  
  return (
    <div className='flex flex-col text-[white]'>
    <button className='demo' onClick={() => navigate("/")}>back</button>
    <h1 className="text-3xl font-bold underline text-center mt-10"> Signup </h1>
    <form className='flex flex-col gap-4  ' onSubmit={changeHandler}>
      <input className='bg-black border-2 rounded-full p-2 mt-2 demo' type='username' onChange={(e) => setUsername(e.target.value)} placeholder="Username"></input>
      <input className='bg-black border-2 rounded-full p-2 mt-2 demo' type='email' onChange={(e) => setEmail(e.target.value)} placeholder="Email"></input>
      <input className='bg-black border-2 rounded-full p-2 mt-2 demo' type='password' onChange={(e) => setPassword(e.target.value)} placeholder="Create Password"></input>
      <input className='bg-black border-2 rounded-full p-2 mt-2 demo' type='password' onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password"></input>
      
        <button type="submit">signup</button>
        
    </form>
      { wrongCredentials && <p className="text-red-500"> Wrong Credentials! Please try again. </p> }
    </div>
  )
}

export default Signup
