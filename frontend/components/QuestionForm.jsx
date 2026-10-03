import React from "react";

import QuestionField from "./QuestionField";
import { questions } from "../data/questions";

function QuestionForm({ answers, onAnswerChange, onSubmit }) {
  return (
    <form className="question-form" onSubmit={onSubmit}>
      {questions.map((item) => (
        <QuestionField
          key={item.id}
          id={item.id}
          question={item.question}
          placeholder={item.placeholder}
          rows={item.rows}
          value={answers[item.id]}
          onChange={(value) => onAnswerChange(item.id, value)}
        />
      ))}

      <button className="go-button" type="submit">
        Let’s Go
      </button>
    </form>
  );
}

export default QuestionForm;
