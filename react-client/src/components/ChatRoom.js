import React, { useEffect, useState } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receivername: '',
        connected: false,
        message: ''
      });
    useEffect(() => {
      console.log(userData);
      console.log(publicChats);
    }, [userData,publicChats]);

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8080/ws-stomp');
        stompClient = over(Sock);
        stompClient.connect({Authorization: "jwt eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqbyIsImV4cCI6MTY1MDU2MTcxNiwiaWF0IjoxNjUwNTQzNzE2fQ.ErODj1NOZc3lrlxwbFRBVFQghIj90atYDCpP5VsUkU8mv0qlLrKI8j6c_gHvCqAsxwspvaQY2ntGGipGF8QG4Q"},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData,"connected": true});
        stompClient.subscribe('/sub/chat/room/' + "efbd0ae0-6dcd-457e-b5ab-ca7cb3a1764b",onMessageReceived,{Authorization: "jwt eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJqbyIsImV4cCI6MTY1MDU2MTcxNiwiaWF0IjoxNjUwNTQzNzE2fQ.ErODj1NOZc3lrlxwbFRBVFQghIj90atYDCpP5VsUkU8mv0qlLrKI8j6c_gHvCqAsxwspvaQY2ntGGipGF8QG4Q"});
        userJoin();
    }

    const userJoin=()=>{
          var chatMessage = {
            type:"ENTER",
            channelId : "efbd0ae0-6dcd-457e-b5ab-ca7cb3a1764b",
            senderName : userData.username,
            message : "Enter" + userData.username,
          };
          stompClient.send("/pub/chat/room", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        console.log(payloadData.type) 
        // eslint-disable-next-line default-case
        switch(payloadData.type){
            case "RENEWAL":
                console.log("1111111111111111")
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            case "CHAT":
                console.log("2222222222222")
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            // case "JOIN":
            //     if(!privateChats.get(payloadData.senderName)){
            //         privateChats.set(payloadData.senderName,[]);
            //         setPrivateChats(new Map(privateChats));
            //     }
            //     break;
            // case "MESSAGE":
            //     publicChats.push(payloadData);
            //     setPublicChats([...publicChats]);
            //     break;
        }
    }
    
    // const onPrivateMessage = (payload)=>{
    //     console.log(payload);
    //     var payloadData = JSON.parse(payload.body);
    //     if(privateChats.get(payloadData.senderName)){
    //         privateChats.get(payloadData.senderName).push(payloadData);
    //         setPrivateChats(new Map(privateChats));
    //     }else{
    //         let list =[];
    //         list.push(payloadData);
    //         privateChats.set(payloadData.senderName,list);
    //         setPrivateChats(new Map(privateChats));
    //     }
    // }

    const onError = (err) => {
        console.log(err);
        
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }
    const sendValue=()=>{
            if (stompClient) {
              var chatMessage = {
                type: "CHAT",
                channelId: "efbd0ae0-6dcd-457e-b5ab-ca7cb3a1764b",
                senderName: userData.senderName,
                message:userData.message
              };
              console.log(chatMessage);
              stompClient.send("/pub/chat/room", {}, JSON.stringify(chatMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        connect();
    }
    return (
    <div className="container">
        {userData.connected?
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
                    ))}
                </ul>
            </div>
            {tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {publicChats.map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendValue}>send</button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <input type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <button type="button" className="send-button" onClick={sendPrivateValue}>send</button>
                </div>
            </div>}
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>}
    </div>
    )
}

export default ChatRoom
