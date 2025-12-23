import React, { useEffect, useRef, useState } from "react";
import { SiDocker } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { MdDelete } from "react-icons/md";

const DashBoard = () => {
  const navigate = useNavigate();
  const [selectUser, setSelectUser] = useState(false);
  const [userProfile, setUserProfile] = useState(false);
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState(false);
  const [seen, setSeen ] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [messageId, setMessageId] = useState(null);

  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const changeHandler = async () => {
    try {
      await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/dashboard/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.log("Error in logout", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);


  const selectUserHandler = async (user) => {
    if (!user) return;
    setSelectUser(true);
    setUserId(user);

   const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/userprofilebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId:user }),
    });
  

    const fetchedData = await res.json();
    setUserData(fetchedData.user);
   
    const dataHandler = {
      senderId:email,
      recieverId:fetchedData.user.email,
    }

   if(userData && userData.email !== fetchedData.email){
    socket.current?.emit("updateUser", userData.email)
   }
   socket.current?.emit("reset", dataHandler);
   socket.current?.emit("seen", dataHandler)
  }; 


  const userProfileHandler = () => {
    setUserProfile(true);
  };

  const deleteMessageHandler = async ( messageId) => {
    try{
    const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/deletemessage", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body : JSON.stringify({
        messageId: messageId,
       })
    })

    setMessages((prev) => 
      prev.filter((msg) => msg._id !== messageId)
    )

    }
    catch(error){
      console.log(error)
    }
    setDeleteMessage(false)
  }


  useEffect(() => {
    const fetchMessages = async () => {
      if (!email || !userData) return;
      try {
        const result = await fetch( 
          "https://chatapp-backend-1rq1.onrender.com/api/users/messages/getmessages",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              senderId: email,
              recieverId: userData.email,
            }),
          }
        );

        const data = await result.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.log("Error loading messages", err);
      }
    };
    fetchMessages();
  }, [email, userData]);

  const markMessagesSeen = async () => {

    try {
         await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/markseen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ senderId: email , recieverId: userData.email }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === email && msg.recieverId === userData.email
            ? { ...msg, seen: true }
            : msg
        )
      );
    }
    catch(error){
      console.log("Error marking messages as seen", error);
    }
  }

   useEffect( () => {
    const markMessagesSeen = async () => {
    if(!userData)return ;
    try {
         await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/markseen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ senderId: userData.email , recieverId: email }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === userData.email && msg.recieverId === email
            ? { ...msg, seen: true }
            : msg
        )
      );
    }
    catch(error){
      console.log("Error marking messages as seen", error);
    }
  }
  markMessagesSeen();
   }, [userData, email])


  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/dashboard", {
          method: "GET",
          credentials: "include",
        });
        const fetcheData = await res.json();
        setData(fetcheData);
        setEmail(fetcheData.email);
      } catch (error) {
        console.log("Error fetching user profile", error);
      }
    };
    getUserProfile();
  }, []);

 


  const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

 
  useEffect(() => {
    if (!email) return;

    if (!socket.current) {
      socket.current = io("https://chatapp-backend-1rq1.onrender.com", {
        transports: ["websocket"],
      });
      console.log("Socket connected");
    }

    socket.current.emit("new-user", email);
    
    const handleMessage = (message) => {
      if (
        userData &&
        ((message.senderId === email && message.recieverId === userData.email) ||
          (message.senderId === userData.email && message.recieverId === email))
      ) {
        setMessages((prev) => [...prev, message]);
        return ;
       
      }

    };

    const handleTyping = (data) => {
      if (userData && data.recieverId === email && data.senderId === userData.email) {
        setIsTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setIsTyping(false), 2000);
      }
      
    };


    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };
    
    const dataHandler = (res, data) => {
      setSeen(true);
    } 

    socket.current.on("unread-init", (data) => {
    setUnreadMessages(data);
     });

     socket.current.on("unread-update", (data) => {
     setUnreadMessages(data);
    });

    const seenHandler = () => {
      markMessagesSeen()
      setSeen(false)
    }

    socket.current.on("markseen", dataHandler)
    socket.current.on("userUpdated", seenHandler)
   
    socket.current.on("receive-message", handleMessage);
    socket.current.on("typing", handleTyping);
    socket.current.on("online-users", handleOnlineUsers);

    return () => {
      socket.current.off("receive-message", handleMessage);
      socket.current.off("typing", handleTyping);
      socket.current.off("online-users", handleOnlineUsers);
      socket.current.off("unread-init");
      socket.current.off("unread-update");
      socket.current.off("markseen", dataHandler)
      socket.current.off("userUpdated", seenHandler)
   

};

  }, [ email , userData, ]);


  const deleteAccount = async() => {
    if(!email)return ;
   const res = await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/deleteaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
         body: JSON.stringify(
          {email: email}
        ),
        credentials: "include"
      })
      if(res.ok){
        navigate("/");
      }

  }

   const fetchMessages = async () => {
      if (!email || !userData) return;
      try {
        const result = await fetch( 
          "https://chatapp-backend-1rq1.onrender.com/api/users/messages/getmessages",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              senderId: email,
              recieverId: userData.email,
            }),
          }
        );

        const data = await result.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.log("Error loading messages", err);
      }
    };
    


  const sendMessage = async () => {
   
    if ((!newMessage.trim() && !imageFile) || !userData){ return; }
    setIsSending(true);
    let imageUrl = null;

    if(imageFile ) {
      const formData = new FormData();
      formData.append("image", imageFile)
    

    const res = await fetch(
      "https://chatapp-backend-1rq1.onrender.com/api/users/upload-image", 
      {
        method: "POST",
        body: formData,
        credentials: "include"
      }
    )

    const resData = await res.json();
    imageUrl = resData.imageUrl;
  }

    const messageData = {
      text: newMessage || "",
      image: imageUrl,
      senderId: email,
      recieverId: userData.email,
      fromSelf: true,
      createdAt: new Date().toISOString(),
    };

    


    socket.current.emit("send-message", messageData);

    await fetch("https://chatapp-backend-1rq1.onrender.com/api/users/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(messageData),
    });
    setTimeout(() => {
      setIsSending(false);
    }, 1000);

      
      fetchMessages();
  
   setNewMessage("");
  setImageFile(null);
  setImagePreview(null);
  document.getElementById("imageUpload").value = "";
  };

  


  return (
    <div className="h-screen w-screen bg-[url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3dLfqC3bYnXc8I-7P9IuWZMxKxSx3B0fxvw&s)] text-white">

      <div className="flex justify-between mx-10 items-center shadow-lg h-[10%]">
        <span className="text-xl font-bold">Welcome to chatApp</span>
        <button className="btn btn-sm btn-outline" onClick={changeHandler}>
          Logout
        </button>
      </div>
      

      <div className="flex items-center justify-center h-[80%] w-[60%] mx-auto mt-6">

        <div className="border-2 h-full w-full">
          {data &&
            data.users.map((user) => {
              const isOnline = user.email !== email && onlineUsers.includes(user.email);
              return (
                <div
                  key={user._id}
                  className="border-2 text-[12.5px] rounded-full m-2 p-2 flex justify-between cursor-pointer"
                  onClick={() => selectUserHandler(user._id)}>

                  <div className="flex justify-center items-center gap-[5px] relative">
                    <img className="h-5 w-5 rounded-full" src={user.profile} alt="profile" />
                    {user.email === email ? "You" : user.username}
                  </div>
                {unreadMessages[user.email] &&  user.email !== email && (
                 <span className="bg-red-500 text-white text-[10px] px-2 rounded-full">
                   {unreadMessages[user.email] }
                       </span>)}


                  <span
                    className={`h-2 w-2 flex items-start justify-start rounded-full ${
                      isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
              );
            })}
        </div>

        {!selectUser && <div className="border-2 h-full w-full flex items-center justify-center">Select a user to chat</div>}
        {selectUser && (
          <div className="border-2 h-full w-full flex flex-col">
            <div className="flex justify-between px-3 h-[2rem]">
              <div className="flex items-center gap-2" onClick={userProfileHandler}>
                <img
                  className="h-5 w-5 rounded-full"
                  src={data && data.users.find((u) => u._id === userId)?.profile}
                  alt="profile"
                />
                <span>{data && data.users.find((u) => u._id === userId)?.username || "YOU"}</span>
              </div>
              <div onClick={() => { setSelectUser(false); setUserProfile(false); setSeen(false)}}>x</div>
            </div>

            <div className="h-[85%] w-full border-2 flex flex-col overflow-y-auto p-2">
              {userData && messages
                .filter(
                  (msg) =>
                    (msg.senderId === email && msg.recieverId === userData?.email) ||
                    (msg.senderId === userData?.email && msg.recieverId === email)
                )
                .map((message, index) => (
                  <div
                    key={index}
                    className={`m-2 p-1.5 rounded-lg w-fit max-w-[100%] ${
                      message.senderId === email
                        ? "bg-blue-500 ml-auto text-[12px]"
                        : "bg-gray-700 mr-auto text-[12px]"
                    }`}
                  >
                     {message.image && (<img src={message.image} alt="chat-img" className="max-w-[200px] rounded-lg mb-1"/> )}
                     {message.text && <span>{message.text}</span>  }
                     

                     <div className="text-[7px] h-[6px] flex flex-row gap-1 justify-end text-gray-300 text-right">
                     
                           {formatTime(message.createdAt)}
                              {message.senderId === email && (
                        <span className="ml-1 text-[7px]">
                       {message.seen || seen ? "✓✓" : "✓"} 
                       
                           </span>
                           
                           )}
                           { message._id !== messageId && message.senderId === email &&
                           <button onClick={() => {setDeleteMessage(true); setTimeout( () => {setDeleteMessage(false); setMessageId(null)}, 2000); setMessageId(message._id) } }>
                            <MdDelete className="text-[10px] " />
                           </button>  }

                           {
                            deleteMessage &&  message.senderId === email && message._id === messageId && 
                            <button onClick={() => deleteMessageHandler(message._id)}>
                               <MdDelete className="text-[10px] text-[red]" /> 
                            </button>
                           }
                           </div>                    
                  </div>
                ))}
                   
              {isTyping && <div className="text-[10px] text-gray-300 ml-2">Typing...</div>}
              <div ref={messagesEndRef} />
               
            </div>

            

            <div className="flex items-center justify-center mx-auto h-[2.6rem]">
          { !imageFile && <input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  socket.current.emit("typing", { senderId: email, recieverId: userData?.email });
                }}
                className="text-white bg-black border-2 px-2 w-[70%] rounded-full"
              /> }
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if(!file)return ;
                  setImageFile(file)
                  setImagePreview(URL.createObjectURL(file))
                }}
              />
             { !imagePreview && <button onClick={() => document.getElementById("imageUpload").click()} className="px-1 text-[15px]">
                📷 
              </button>}
              {
                 imagePreview && 
                 <div className="flex px-2">
                  <img 
                    src={imagePreview}
                    alt="preview"
                    className=" h-5 w-5 mx-1 rounded-lg"/>

                   <button className="text-red-400 text-xs" onClick={() => {setImageFile(null); setImagePreview(null); document.getElementById("imageUpload").value="" }}>
                  Remove
                </button>
                 </div>
              }
        


             <button onClick={(e) => { e.preventDefault(); sendMessage(); }}
             disabled={isSending}
             className={`rounded-full ml-2 px-3 text-[13px] 
             ${isSending ? "opacity-50 cursor-not-allowed" : ""}`}
>
              {isSending ? "Sending..." : "Send"}
              </button>

            </div>
          </div>
        )}

        {selectUser && userProfile && (
          <div className="border-2 h-full w-full flex flex-col">
            <div className="flex border-[1px] justify-between items-center w-full p-2 h-[2rem] ">
              <div>Profile</div>
              <div onClick={() => setUserProfile(false)}>x</div>
            </div>
            <div className="flex mt-2 flex-col pt-10 items-center gap-2 h-[85%] w-full">
              <img
                className="h-[4rem] w-[4rem] rounded-full"
                src={data && data.users.find((u) => u._id === userId)?.profile}
                alt="profile"
              />
              <div className="text-[20px] font-bold flex items-center justify-center">{data && data.users.find((u) => u._id === userId)?.username || "unknownUser"}</div>
              <div className="text-[10px] flex items-center justify-center">Email: {data && data.users.find((u) => u._id === userId)?.email || "unknownUser"}</div>
            </div>
            <button className="rounded-full" onClick={() => setUserProfile(false)}>Back</button>
          </div>
        )}
      </div>
      { !deleteAccountConfirmation &&
      
      <button className="flex items-end justify-end mx-5 gap-5" onClick={ () => setDeleteAccountConfirmation(true)}> Delete Account</button>}
      { deleteAccountConfirmation &&
         (
          <div className="flex items-end justify-end mx-5 gap-5">
            <button onClick={deleteAccount} className="demo flex items-end justify-end mx-4" >ConfirmDeleteAccount </button>
         
           <button onClick={ () => setDeleteAccountConfirmation(false)}>rollBack</button>
          </div>
           )
      } 
    </div>
  );
};

export default DashBoard;
