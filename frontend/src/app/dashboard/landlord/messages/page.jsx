"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LandlordMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== "landlord")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get("/messages/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(response.data);
      await api.patch(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/messages/conversations/${selectedConversation._id}/messages`, {
        text: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const searchUsers = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const response = await api.get(`/users/profile?email=${searchEmail}`);
      setSearchResults([response.data]);
    } catch (error) {
      console.error("Error searching user:", error);
      toast.error("User not found");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const startConversation = async (participantId, propertyId = null) => {
    try {
      const response = await api.post("/messages/conversations", {
        participantId,
        propertyId
      });
      setSelectedConversation(response.data);
      setShowNewConversation(false);
      setSearchEmail("");
      setSearchResults([]);
      fetchConversations();
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <button
          onClick={() => setShowNewConversation(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          + New Message
        </button>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Start New Conversation</h2>
              <button onClick={() => setShowNewConversation(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter User Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
                <button
                  onClick={searchUsers}
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">User Found:</h3>
                {searchResults.map((result) => (
                  <div key={result._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium">{result.firstName} {result.lastName}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                      <p className="text-xs text-gray-400 capitalize">Role: {result.role}</p>
                    </div>
                    <button
                      onClick={() => startConversation(result._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">💬</div>
              <p>No conversations yet</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Start a new conversation →
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherParticipant = conv.participants?.find(p => p._id !== user._id);
              return (
                <div
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                    selectedConversation?._id === conv._id ? "bg-gray-50 dark:bg-gray-700" : ""
                  }`}
                >
                  <p className="font-medium">
                    {otherParticipant?.firstName} {otherParticipant?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Messages Area */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                {(() => {
                  const otherParticipant = selectedConversation.participants?.find(p => p._id !== user._id);
                  return (
                    <>
                      <h3 className="font-semibold">
                        {otherParticipant?.firstName} {otherParticipant?.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{otherParticipant?.email}</p>
                    </>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender?._id === user._id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender?._id === user._id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <p>Select a conversation to start messaging</p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
