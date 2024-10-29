"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getCourseRecommendations } from "@/lib/openai";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatInterfaceProps {
  onPathUpdate: (path: string[]) => void;
  onClose: () => void;
  onInterviewComplete: () => void;
}

const INTERVIEW_QUESTIONS = [
  "What are your long-term career goals?",
  "Which industries or companies are you most interested in working for?",
  "Do you have a preference for specific functional areas, like finance, marketing, operations, or management?",
  "What are your strengths and weaknesses?",
  "Are you interested in any particular emerging fields or skills, such as data analytics, sustainability, or entrepreneurship?"
];

export default function ChatInterface({ onPathUpdate, onClose, onInterviewComplete }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: INTERVIEW_QUESTIONS[0],
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const progress = ((currentQuestion) / INTERVIEW_QUESTIONS.length) * 100;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
        // Move to next question
        const nextQuestion = INTERVIEW_QUESTIONS[currentQuestion + 1];
        setCurrentQuestion(prev => prev + 1);
        setMessages(prev => [...prev, { role: "assistant", content: nextQuestion }]);
        setIsLoading(false);
      } else if (!isComplete) {
        // Final question answered, get course recommendations
        setIsComplete(true);
        onInterviewComplete(); // Notify parent that interview is complete
        const response = await getCourseRecommendations(messages);
        
        if (response) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "Thank you for sharing your background and goals. Based on your responses, here are my course recommendations:\n\n" + response.content,
          }]);

          // Extract course IDs from the response
          const courseIds = response.content.match(/[A-Z]+\d+/g) || [];
          onPathUpdate(courseIds);
        }
      } else {
        // Continue conversation after recommendations
        const response = await getCourseRecommendations([...messages, userMessage]);
        
        if (response) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: response.content,
          }]);

          const courseIds = response.content.match(/[A-Z]+\d+/g) || [];
          onPathUpdate(courseIds);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative h-[600px] flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Course Advisor
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {!isComplete && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {INTERVIEW_QUESTIONS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[80%] rounded-lg p-3
                  ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }
                `}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Please wait..." : "Type your message..."}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}