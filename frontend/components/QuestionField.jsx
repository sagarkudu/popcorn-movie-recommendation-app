import React from "react";

function QuestionField({
  question,
  value,
  onChange,
  placeholder,
  rows = 2,
  id,
}) {
  return (
    <div className="question">
      <label htmlFor={id}>{question}</label>

      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default QuestionField;
