"use client"

import React, { useState, useEffect } from 'react';

interface ChatQuestion {
  question: string;
  type: 'text' | 'choice';
  choices?: string[];
}

const SimpleChatInterface = () => {
  const [currentQuestion, setCurrentQuestion] = useState<ChatQuestion | null>(null);
  const [input, setInput] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [awaitingChoice, setAwaitingChoice] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Array<{ question: string, answer: string }>>([]);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  // Chat flow configuration
  const chatFlow: ChatQuestion[] = [
    {
      question: "Hi! What is the business owner's details - name, phone number? What is the name of your business? Can you describe your business briefly?",
      type: "text"
    },
    {
      question: "What is the name of your business? Can you describe your business briefly?",
      type: "text"
    },
    {
      question: "What is your business address with street, suite number (if applicable), city, zip",
      type: "text"
    },
    {
      question: "What is business phone number and business email address?",
      type: "text"
    },
    // {
    //   question: "What is the seating / bed capacity?",
    //   type: "text"
    // },
    // {
    //   question: "What is the square footage of the premises?",
    //   type: "text"
    // },
    // {
    //   question: "What are the operating hours?",
    //   type: "text"
    // },
    // {
    //   question: "What is the entity type (LP / LLP / LLC / Corporation)?",
    //   type: "text"
    // }
  ];

  // Calculate progress (0-100)
  const progress = Math.min((currentStep / chatFlow.length) * 100, 100);

  const handleNextQuestion = () => {
    if (currentStep < chatFlow.length - 1) {
      const nextQuestion = chatFlow[currentStep];
      setCurrentQuestion(nextQuestion);
      setAwaitingChoice(nextQuestion.type === 'choice');
      setCurrentStep(prev => prev + 1);
      setIsLastQuestion(false);
    } else if (currentStep === chatFlow.length - 1) {
      const lastQuestion = chatFlow[currentStep];
      setCurrentQuestion(lastQuestion);
      setIsLastQuestion(true);
      setCurrentStep(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!currentQuestion) {
      handleNextQuestion();
    }
  }, [currentQuestion]);

  // const handleChoiceSelect = async (choice: string) => {
  //   if (awaitingChoice) {

  //     // Send to backend
  //     try {
  //       const response = await fetch('/api/send-chat-qna', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           question: currentQuestion?.question,
  //           answer: input,
  //         })
  //       })

  //       console.log("Response:", response.json().then(data => console.log(data)));


  //     } catch (error) {
  //       console.error('Error sending message:', error)
  //     }

  //     setAwaitingChoice(false);
  //     setTimeout(handleNextQuestion, 500);
  //   }
  // };

  const handleSend = async () => {
    if (!input.trim() || awaitingChoice) return;

    console.log("Current answer:", input);

    setAnswers(prev => [...prev, {
      question: currentQuestion?.question || '',
      answer: input
    }]);

    setInput('');
    setTimeout(handleNextQuestion, 500);
  };

  const handleFinalSubmit = async () => {
    try {
      // Send all collected answers

      const combinedText = answers
        .map(qa => qa.answer)
        .join('\n\n');


      const response = await fetch('/api/send-chat-qna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: combinedText
        })
      });

      console.log("Final submission response:", await response.json());
      // console.log("Response:", response.json().then(data => console.log(data)));

      window.location.href = '/';
    } catch (error) {
      console.error('Error sending final submission:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full h-1 bg-gray-100 rounded-full">
          <div
            className="h-1 bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question display */}
      {currentQuestion && (
        <div className="mb-8">
          <h2 className="text-2xl font-normal text-gray-900 mb-8">
            {currentQuestion.question}
          </h2>

          {currentQuestion.type === 'text' && (
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSend()}
                placeholder="Answer here..."
                className="w-full px-4 py-3 text-lg border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              />
              {/* <button
              onClick={handleSend}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-7-7m0 0l-7 7m7-7v18" />
              </svg>
            </button> */}
              {isLastQuestion ? (
                <button
                  onClick={handleFinalSubmit}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Submit All Answers
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-7-7m0 0l-7 7m7-7v18" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleChatInterface;