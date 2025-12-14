import { useEffect, useState } from "react";
import Login from "./components/Login";
import { NavLink, useNavigate } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import Signup from "./components/Signup";
import DashBoard from "./components/DashBoard";
import Home from "./components/Home";
import { Navigate } from "react-router-dom";
import Otp from "./components/Otp";

function App() { 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [copyEmail, setcopyEmail] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  useEffect( () => {
   
    async function checkLogin(){
      try{
        const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/authVerify", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
        setIsLoggedIn(false);
        return;
      }

        const data = await res.json();
        if(data.loggedIn){
          setIsLoggedIn(data.loggedIn);
          navigate("/dashboard");
        }
      }
      catch(error){
        setIsLoggedIn(false);
        return ;
      }
    }
    checkLogin();
  }, [])

  return (
    <div className="h-screen bg-black border-2 border-[green] w-screen flex justify-center items-center gap-10">

    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}/>
      <Route path="/signup" element={<Signup isSignedUp={isSignedUp} setIsSignedUp={setIsSignedUp} copyEmail={copyEmail} setcopyEmail={setcopyEmail}/>}></Route>
      <Route path="/dashboard" element={(isLoggedIn  || otpVerified)? <DashBoard />: <Navigate to="/" replace /> }/>
      <Route path="/signup/otp" element={ copyEmail !== "" ? <Otp copyEmail={copyEmail} setcopyEmail={setcopyEmail} otpVerified={otpVerified} setOtpVerified={setOtpVerified} /> : <Navigate to="/signup" replace />}/>
    </Routes>
    </div>
  );
}

export default App;
