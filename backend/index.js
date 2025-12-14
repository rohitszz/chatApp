const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io"); 


const app = express();
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const PORT = process.env.PORT || 5000;


const connect = require('./config/database'); 
connect();

const { cloudinaryConnect } = require('./config/cloudinary');
cloudinaryConnect();

app.use(cors(
    {
        origin: ['https://chatapp-frontend-8wgw.onrender.com'],
        credentials: true,
    }
))
 
const userRoutes = require('./routes/userRoutes'); 
const { emit } = require('cluster');

app.use('/api/users', userRoutes);


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['https://chatapp-frontend-8wgw.onrender.com'],
        methods: ["GET", "POST"],
        credentials: true,
    }
})

const onlineUsers = new Map();
const unreads = new Map();

io.on("connection", (socket) => {

    socket.on("new-user", (email) => {

        onlineUsers.set(email, socket.id);

        if (!unreads.has(email)) {
        unreads.set(email, new Map());}

         io.emit("online-users", Array.from(onlineUsers.keys()));

         socket.emit(
    "unread-init",
    Object.fromEntries(unreads.get(email))
  );
 
    });

        socket.on("reset", (data) => {
         if (!unreads.has(data.senderId)) return;
         const myUnreads = unreads.get(data.senderId)
          myUnreads.delete(data.recieverId)
        
          const senderSocket = onlineUsers.get(data.senderId)
          if(senderSocket){
            io.to(senderSocket).emit(
                "unread-update",
                Object.fromEntries(myUnreads)
            )
          }
      })
  
         socket.on("send-message", (data) => {
         const { senderId, recieverId } = data;
         const receiverSocket = onlineUsers.get(data.recieverId);
         if (!unreads.has(recieverId)) {
        unreads.set(recieverId, new Map());}

        const receiverUnread = unreads.get(recieverId);
        
        receiverUnread.set(
            senderId,
            (receiverUnread.get(senderId) || 0) + 1
        )

        if (receiverSocket) {
            io.to(receiverSocket).emit("receive-message", data)
           io.to(receiverSocket).emit(
            "unread-update", 
            Object.fromEntries(receiverUnread)
           )
        }
         
            
    }); 
    

    socket.on("typing", (data) => {
        const receiverSocket = onlineUsers.get(data.recieverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("typing", data);
        }
    }) 

    socket.on("updateUser", (recieverId) => {
        const receiverSocket = onlineUsers.get(recieverId);
        if(receiverSocket){
            io.to(receiverSocket).emit("userUpdated")
        }
    })
  
    socket.on("seen", (data) => {
        const receiverSocket = onlineUsers.get(data.recieverId);
        if(receiverSocket){
            io.to(receiverSocket).emit("markseen", `${data.recieverId} your messages has been seen by${data.senderId} `, data )
        } 
    })  
    
    socket.on("disconnect", () => {
        for (const [email, id] of onlineUsers.entries()) {
            if (id === socket.id) onlineUsers.delete(email);
        }
          io.emit("online-users", Array.from(onlineUsers.keys()));
    });
     
});  

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
            
