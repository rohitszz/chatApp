import React, { useEffect } from 'react'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./home.css"

const Login = ({isLoggedIn, setIsLoggedIn}) => {
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const navigate = useNavigate();
        const [wrongCredentials, setWrongCredentials] = useState(false);

    useEffect( () => {
      if(email.length === 0 && password.length ===0){
        setWrongCredentials(false);
      }
    }, [email, password])     

    async function changeHandler (e){ 
    e.preventDefault(); 
    try{ 
   const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      credentials: "include", 
      body: JSON.stringify({
        email, password,
      })
     })
       const data = await res.json();
          
   if(data.success){
    setIsLoggedIn(true);
    navigate("/dashboard");
   }
   else {
    if(email.length !==0 || password.length !==0 ){setWrongCredentials(true);}
    setIsLoggedIn(false);
    navigate("/login");
   }
   }
  catch(error){
    return error;
  }
    
  }
        
        return (
          <div className='text-[white]'>
            <button className='demo' onClick={() => navigate("/")}>back</button>
            <h1 className="text-3xl font-bold underline text-center mt-10">Login </h1>
            <div>
           
              <form className='flex flex-col gap-4' onSubmit={changeHandler}>
                <input className='bg-black text-white border-2 rounded-full mt-5 p-2 demo  w-[17rem]' type='email' placeholder="Email" onChange={(e) => setEmail(e.target.value) }></input>
                <input className='bg-black text-white border-2 rounded-full mt-5 p-2 demo w-[17rem]' type='password' placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
                
                  <button className='demo' type="submit">Login</button>
                 
              </form>
              { wrongCredentials && <p className="text-red-500"> Wrong Credentials! Please try again. </p> }
            </div>
          </div>
        );
}

export default Login
