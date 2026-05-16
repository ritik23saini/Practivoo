"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

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
    matchThePairs?: MatchPair[];
    explanation?: string;
    media?: MediaContent;
}

interface SubmissionAnswer {
    question: Question;
    selected: string;
    isCorrect: boolean;
    _id: string;
}

interface Task {
    _id: string;
    topic: string;
    level?: string;
    answers?: SubmissionAnswer[];
    status: string;
    taskResult?: {
        answers: SubmissionAnswer[];
        evaluationStatus: string;
    };
}

export const SubmissionAnswers: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    task: any;
}> = ({ isOpen, onClose, task }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    if (!isOpen || !task) return null;

    // Updated to work with new data structure
    const answers = task.taskResult?.answers || task.answers || [];
    const currentAnswer = answers[currentQuestionIndex];
    const currentQuestion = currentAnswer?.question;

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < answers.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const playAudio = (audioPath: string) => {
        const audio = new Audio(audioPath);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    };

    const getOptionStyle = (option: string) => {
        const isSelected = currentAnswer?.selected === option;
        const isCorrect = currentQuestion?.correctAnswer.includes(option);

        if (isSelected && isCorrect) {
            return "p-2 border-2 border-green-500 bg-green-100 rounded-full text-center font-medium text-green-800";
        } else if (isSelected && !isCorrect) {
            return "p-2 border-2 border-red-500 bg-red-100 rounded-full text-center font-medium text-red-800";
        } else if (isCorrect) {
            return "p-2 border-2 border-green-300 bg-green-50 rounded-full text-center font-medium text-green-700";
        } else {
            return "p-2 border-2 border-gray-300 rounded-full text-center font-medium text-gray-600";
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between py-2 border-b bg-gray-50 flex-shrink-0 px-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-semibold">
                        Submission Review: {task.name ? `${task.name}'s Answers` : task.topic || 'Task Review'}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-black text-2xl leading-none"
                >
                    ×
                </button>
            </div>

            {/* Question Progress Indicators */}
            <div className="p-2 flex-shrink-0 ">
                <div className="flex gap-2 mb-2 flex-wrap">
                    {answers.map((answer: any, index: number) => (
                        <div
                            key={index}
                            className={`w-4 h-4 border-2 cursor-pointer transition-colors rounded ${index === currentQuestionIndex
                                ? 'border-blue-500 bg-blue-500'
                                : answer.isCorrect
                                    ? 'bg-green-500 border-green-500'
                                    : 'bg-red-500 border-red-500'
                                }`}
                            onClick={() => setCurrentQuestionIndex(index)}
                            title={`Question ${index + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}`}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-black">
                            Question {currentQuestionIndex + 1}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded font-medium ${currentAnswer?.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {currentAnswer?.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                        {/* Evaluation Status */}
                        {task.taskResult?.evaluationStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full ${task.taskResult.evaluationStatus === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.taskResult.evaluationStatus === 'completed' ? 'Evaluated' : 'Pending'}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Correct</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Incorrect</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <span className="text-sm text-black bg-blue-50 px-2 py-1 rounded">
                    Type: {currentQuestion?.questiontype || 'Unknown'}
                </span>            </div>
            {/* Navigation Footer */}
            <div className="flex items-center justify-center p-2 flex-shrink-0 ">
                <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                <span className="text-sm whitespace-nowrap text-black">
                    {currentQuestionIndex + 1} of {answers.length}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentQuestionIndex === answers.length - 1}
                    className="flex items-center gap-2 px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            {/* Question Content */}
            <div className="flex-1 overflow-y-auto px-2">
                {currentQuestion ? (
                    <>
                        {/* Question Heading */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {currentQuestion.heading}
                            </h3>
                            {currentQuestion.question && (
                                <p className="text-lg leading-relaxed text-gray-700">
                                    {currentQuestion.question}
                                </p>
                            )}
                        </div>

                        {/* Media Content */}
                        {currentQuestion.media && (
                            <div >
                                {currentQuestion.media.image && (
                                    <div className="mb-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ImageIcon size={16} />
                                            <span className="text-sm text-gray-600">Image:</span>
                                        </div>
                                        <img
                                            src={currentQuestion.media.image}
                                            alt="Question image"
                                            className="max-w-md  max-h-54 object-contain border rounded-lg"
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
                                     {/*    <button
                                            onClick={() => playAudio(currentQuestion.media!.audio!)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <Volume2 size={16} />
                                            Play Audio
                                        </button> */}

                                        <audio controls className="w-full mb-2" src={currentQuestion.media.audio}>
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Options Display */}
                        <div className="mb-4">
                            {currentQuestion.matchThePairs && currentQuestion.matchThePairs.length > 0 ? (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-4">Match The Pairs:</h4>
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
                                    <h4 className="font-medium text-gray-700 mb-2">Options:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {currentQuestion.options?.map((option: string, index: number) => {
                                            const isSelected = currentAnswer?.selected === option;
                                            const isCorrect = currentQuestion?.correctAnswer.includes(option);

                                            return (
                                                <div
                                                    key={index}
                                                    className={`${getOptionStyle(option)} relative`}
                                                >
                                                    {option}
                                                    {isSelected && (
                                                        <span className="absolute -top-2 -right-2 text-xs">
                                                            {isCorrect ? '✓' : '✗'}
                                                        </span>
                                                    )}
                                                    {isCorrect && !isSelected && (
                                                        <span className="absolute -top-2 -right-2 text-xs text-green-600">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Student Answer Summary */}
                        <div className="border-t pt-4 mb-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                <h4 className="font-semibold text-gray-800">Answer Summary:</h4>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-700">Student's Answer:</span>
                                        <div className={`px-2 py-1 gap-2 flex rounded text-sm ${currentAnswer?.isCorrect
                                            ? ' text-green-800'
                                            : ' text-red-800'
                                            }`}>
                                            {currentAnswer?.selected?.map((answer: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className={`inline-block ${currentAnswer?.isCorrect
                                                        ? ' bg-green-200 text-green-800'
                                                        : ' text-red-800 bg-red-200'
                                                        } px-2 py-1 rounded text-sm font-medium`}
                                                >
                                                    {answer}
                                                </span>
                                            ))}

                                        </div>


                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium text-gray-700">Correct Answer(s):</span>
                                        {currentQuestion.correctAnswer?.map((answer: string, index: number) => (
                                            <span
                                                key={index}
                                                className="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-medium"
                                            >
                                                {answer}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Explanation Section */}
                        {currentQuestion.explanation && (
                            <div className="border-t pt-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                    <h5 className="font-medium text-blue-800 mb-2">Explanation:</h5>
                                    <p className="text-blue-700">{currentQuestion.explanation}</p>
                                </div>
                            </div>
                        )}
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
