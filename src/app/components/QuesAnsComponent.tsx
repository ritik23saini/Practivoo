import { Question } from "../admin/questions/create/page";
import CompleteTheSentences from "./Questypes/CompleteTheSentences";
import Fillinthegaps from "./Questypes/Fillinthegaps";
import FindTheMistakes from "./Questypes/FindTheMistakes";
import MatchThepairs from "./Questypes/MatchThepairs";
import MCQquestion from "./Questypes/MCQQuestion";
import WordOrderexercise from "./Questypes/WordOrderexercise";

import React from "react";

export interface QuesAnsComponentsProps {
  current: Question;
  activeIndex: number;
  updateCurrent: (data: Partial<Question>) => void;
  updateOption: (index: number, value: string) => void;
  setAsCorrectAnswer: (index: number) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
  activeQuesType: string;

  // Media handling
  handleMediaUpload: (file: File, type: "image" | "audio", index: number) => void;
  clearMedia: (type: "image" | "audio", index: number) => void;

  // Preview handling
  preview: { image?: string; audio?: string };
  showPreview: (file: File, type: "image" | "audio") => void;
  handlePairUpload?: (file: File, pairValue: string, questionIndex: number, pairIndex: number) => void;
}

export const QuesAnsComponents = (props: QuesAnsComponentsProps) => {
  const { activeQuesType, ...rest } = props;

  switch (activeQuesType) {
    case "MCQs":
      return <MCQquestion {...rest} />;
    case "Fill in the gaps":
      return <Fillinthegaps {...rest} />;
    case "Match The Pairs":
      return <MatchThepairs {...rest} />;
    case "Word Order exercise":
      return <WordOrderexercise {...rest} />;
    case "Find the Mistakes":
      return <FindTheMistakes {...rest} />;
    case "Complete The Sentence":
      return <CompleteTheSentences {...rest} />;
    default:
      return <p>Please select a question type</p>;
  }
};