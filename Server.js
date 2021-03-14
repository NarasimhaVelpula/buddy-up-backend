const PORT = process.env.PORT || 5000
console.log(PORT)
const io=require('socket.io')(PORT, {
    cors: {
      origin: '*',
    }})
const waitingMessages={}
const activeUsers={}
io.on('connection',socket=>{
    
    const id=socket.handshake.query.id
    console.log(id+"---connected")
    socket.join(id)
    activeUsers[id]=true
    io.emit("Get-Contacts",{contacts:activeUsers})
    if(waitingMessages[id]!==undefined){
        console.log("sending waiting messages")
        let messages=waitingMessages[id]
        while(messages.length!=0){
            message=messages.pop()
            console.log(message)
            io.emit('receive-message',message)
        }
        delete waitingMessages[id]
    }
    
    socket.on('send-message',({recipients,text})=>{
        recipients.forEach(recipient=>{
           
            if(activeUsers[recipient])
            {
                socket.broadcast.to(recipient).emit('receive-message',{
                    recipients,text,sender:id
                
                })
            }
            else{
                if(waitingMessages[recipient]===undefined){
                    waitingMessages[recipient]=[{recipients,text,sender:id}]
                }
                else{
                    waitingMessages[recipient].push({recipients,text,sender:id})
                }

            }
            
        })
    })
    socket.on('disconnect',()=>{
       activeUsers[id]=false
       console.log(id+"---disconnected")
        console.log(activeUsers)
        socket.broadcast.emit("Get-Contacts",{contacts:activeUsers})
    })
})