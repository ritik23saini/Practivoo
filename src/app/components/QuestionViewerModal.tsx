
"use client";
import { ArrowLeft, ChevronLeft, ChevronRight, ImageIcon, Volume2 } from "lucide-react";
import React, { useState, } from "react";

interface MediaContent {
    image?: string;
    audio?: string;
}

interface MatchPair {
    key: string;
    value: string;
}
interface Question {
    _id: string;
    heading: string;
    question: string;
    options: string[];
    correctAnswer: string[];
    questiontype: string;
    matchThePairs?: MatchPair[];
    explanation?: string;
    type?: string;
    media?: MediaContent;

}

export interface Task {
    _id: string;
    topic: string;
    level?: string;
    questions?: Question[];
    status: string;
}


export const QuestionViewerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}> = ({ isOpen, onClose, task }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [viewAnswers, setViewAnswers] = useState(false);

    if (!isOpen || !task) return null;

    const questions = task.questions || [];
    const currentQuestion = questions[currentQuestionIndex];

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const playAudio = (audioPath: string) => {
        const audio = new Audio(audioPath);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    };
    return (
        <div className="text-md flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-2 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="font-semibold">Topic: {task.topic}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-black text-xl leading-none"
                >
                    ×
                </button>
            </div>

            {/* Question Progress Indicators */}
            <div className="mt-2 flex-shrink-0">
                <div className="flex gap-2 mb-2 flex-wrap">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`w-4 h-4 border-1 cursor-pointer transition-colors rounded ${index === currentQuestionIndex
                                && 'border-blue-500 bg-blue-500'

                                }`}
                            onClick={() => setCurrentQuestionIndex(index)}
                            style={{ aspectRatio: '1' }}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-black">
                        Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm text-black bg-blue-50 px-2 py-1 rounded">
                        Type: {currentQuestion?.questiontype || 'Unknown'}
                    </span>
                </div>
            </div>


            {/* Navigation  */}
            <div className="flex items-center gap-5 justify-center mt-2 flex-shrink-0">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />

                </button>

                <span className="text-sm whitespace-nowrap text-black">
                    {currentQuestionIndex + 1} of {questions.length}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >

                    <ChevronRight size={20} />
                </button>
            </div>
            {/* Question Content */}
            <div className="flex-1 overflow-y-auto">
                {currentQuestion ? (
                    <>
                        <div className="mb-2 font-bold">
                            {currentQuestion.question && (
                                <p className="text-md leading-relaxed text-gray-700">
                                    {currentQuestion.question}
                                </p>
                            )}
                        </div>


                        {/* image or audio  */}

                        {currentQuestion.media && (
                            <div>
                                {currentQuestion.media.image && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ImageIcon size={16} />
                                            <span className="text-sm text-gray-600">Image:</span>
                                        </div>
                                        <img
                                            src={currentQuestion.media.image}
                                            alt="Question image"
                                            className="max-w-md max-h-54 object-contain border rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                {currentQuestion.media.audio && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Volume2 size={16} />
                                            <span className="text-sm text-gray-600">Audio:</span>
                                        </div>
                                        <audio controls className="w-full mb-2" src={currentQuestion.media.audio}>
                                            Your browser does not support the audio element.
                                        </audio>


                                    </div>
                                )}
                            </div>
                        )}
                        <div className="mb-4">
                            {/* ✅ Conditional rendering based on question type */}
                            {currentQuestion.matchThePairs && currentQuestion.matchThePairs.length > 0 ? (
                                <div>
                                    <h4 className="font-medium text-gray-700">Match The Pairs:</h4>
                                    <div className="space-y-4">
                                        {/* Headers */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <h5 className="font-medium text-gray-700">Column A (Questions):</h5>
                                            <h5 className="font-medium text-gray-700">Column B (Options):</h5>
                                        </div>

                                        {/* Pairs - Each row contains one item from Column A and Column B */}
                                        {currentQuestion.matchThePairs.map((pair: MatchPair, index: number) => (
                                            <div key={`pair-${index}`} className="grid grid-cols-2 gap-4 items-center">
                                                {/* Left side - Key (Image) */}
                                                <div className="p-3 border-2 border-blue-300 rounded-lg bg-blue-50">
                                                    {pair.key.includes('https') ? (
                                                        <img
                                                            src={pair.key}>

                                                        </img>) :
                                                        <p>{pair.key}</p>
                                                    }
                                                </div>

                                                {/* Right side - Value */}
                                                <div className="p-3 border-2 border-green-300 rounded-lg bg-green-50 font-medium">
                                                    {pair.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentQuestion.options?.map((option, index) => (
                                            <button
                                                key={index}
                                                className="p-2 border-2 text-sm border-gray-300 rounded-full text-center font-medium hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Answer Section */}
                        <div className="border-t pt-4">
                            <div className="flex justify-end mb-3">
                                <button
                                    onClick={() => setViewAnswers(!viewAnswers)}
                                    className="text-blue-600 hover:text-blue-700 underline font-medium"
                                >
                                    {viewAnswers ? 'Hide Answer' : 'View Answer'}
                                </button>
                            </div>

                            {viewAnswers && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                    <h4 className="font-semibold text-green-800 mb-2">Correct Answer(s):</h4>
                                    <div className="space-y-2">
                                        {currentQuestion.correctAnswer?.filter(ans => ans.trim() !== '').map((ans, index) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-2"
                                            >
                                                {ans}
                                            </span>
                                        ))}
                                        {(!currentQuestion.correctAnswer || currentQuestion.correctAnswer.every(ans => ans.trim() === '')) && (
                                            <span className="text-gray-500 italic">No answer provided</span>
                                        )}
                                    </div>
                                    {currentQuestion.explanation && (
                                        <div className="mt-3 pt-3 border-t border-green-300">
                                            <h5 className=" text-green-800 font-semibold">Explanation:</h5>
                                            <p className="text-green-700">{currentQuestion.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500 flex-1 flex items-center justify-center">
                        No question available
                    </div>
                )}
            </div>


        </div>
    );
};