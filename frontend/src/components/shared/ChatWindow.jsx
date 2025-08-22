import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../api/axios';
import { Send, Paperclip } from 'lucide-react';
import { uploadFile } from '../../api/uploadService';
import toast from 'react-hot-toast';

const ChatWindow = ({ team }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useSocket();
    const { user } = useAuthStore();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch message history when component mounts or team changes
        if (team) {
            axiosInstance.get(`/api/chats/${team._id}/messages`).then(res => {
                setMessages(res.data);
            });
        }
    }, [team]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newMessage', (message) => {
            // Add new message only if it belongs to the currently viewed team
            if (message.team === team._id) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => socket.off('newMessage');
    }, [socket, team]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket) return;
        socket.emit('sendMessage', { teamId: team._id, content: newMessage, contentType: 'text' });
        setNewMessage('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size cannot exceed 5MB.");
            return;
        }

        const toastId = toast.loading("Uploading file...");
        try {
            const uploadedFile = await uploadFile(file);
            socket.emit('sendMessage', {
                teamId: team._id,
                contentType: file.type.startsWith('image/') ? 'image' : 'file',
                fileInfo: { ...uploadedFile, name: file.name }
            });
            toast.success("File sent!", { id: toastId });
        } catch (error) {
            toast.error("File upload failed.", { id: toastId });
        }
    }

    return (
        <>
            <div className="p-4 border-b border-black/10">
                <h3 className="font-semibold">{team.name}</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map(msg => (
                    <div key={msg._id} className={`flex items-end gap-2 mb-4 ${msg.sender._id === user._id ? 'justify-end' : ''}`}>
                        <img src={msg.sender.profilePicture?.url || `https://ui-avatars.com/api/?name=${msg.sender.name}`} alt={msg.sender.name} className={`w-8 h-8 rounded-full object-cover ${msg.sender._id === user._id ? 'order-2' : 'order-1'}`} />
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender._id === user._id ? 'order-1 bg-pran-red text-white rounded-br-none' : 'order-2 bg-gray-light text-gray-dark rounded-bl-none'}`}>
                            {msg.contentType === 'text' && <p className="text-sm">{msg.content}</p>}
                            {msg.contentType === 'image' && <img src={msg.fileInfo.url} alt="sent" className="rounded-md max-w-full h-auto" />}
                            {msg.contentType === 'file' && <a href={msg.fileInfo.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline"><Paperclip className="w-4 h-4" />{msg.fileInfo.name}</a>}
                            <div className="flex gap-2">
                                {msg.sender._id !== user._id && (
                                    <p className="text-xs font-medium text-gray-medium mt-2 flex">{msg.sender.name}</p>
                                )}
                                <p className={`text-xs mt-2 ${msg.sender._id === user._id ? 'text-white/70' : 'text-gray-medium'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>

                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-black/10 flex items-center gap-2">
                <input type="file" id="chat-file-upload" className="sr-only" onChange={handleFileUpload} />
                <label htmlFor="chat-file-upload" className="p-2 rounded-full hover:bg-gray-light cursor-pointer"><Paperclip className="w-5 h-5 text-gray-medium" /></label>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm" />
                <button type="submit" className="p-2 rounded-full bg-pran-red text-white"><Send className="w-5 h-5" /></button>
            </form>
        </>
    );
};

export default ChatWindow;