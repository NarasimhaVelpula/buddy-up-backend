const PORT = process.env.PORT || 5000
console.log(PORT)
const io=require('socket.io')(PORT, {
    cors: {
      origin: '*',
    }})
io.on('connection',socket=>{
    console.log("connected")
    const id=socket.handshake.query.id
    socket.join(id)
    socket.on('send-message',({recipients,text})=>{
        recipients.forEach(recipient=>{
            socket.broadcast.to(recipient).emit('receive-message',{
                recipients,text,sender:id
            })
        })
    })
})