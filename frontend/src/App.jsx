import React, { useState } from "react";

import Brand from "../components/Brand";
import QuestionForm from "../components/QuestionForm";
import MovieResult from "../components/MovieResult";

import "./styles.css";

const initialAnswers = {
  favorite: "",
  era: "",
  mood: "",
};

function App() {
  const [answers, setAnswers] = useState(initialAnswers);

  const [movie, setMovie] = useState(null);

  function handleAnswerChange(id, value) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [id]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setMovie(data.movie);
    } catch (error) {
      console.error(error);
    }
  }

  function handleGoAgain() {
    setMovie(null);
  }

  return (
    <>
      <main className="page">
        <section className="app-shell" aria-label="PopChoice movie preferences">
          {!movie ? (
            <>
              <Brand />

              <QuestionForm
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <MovieResult movie={movie} onGoAgain={handleGoAgain} />
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <span>Made with</span>
          <span className="footer-heart">❤️</span>
          <span>by</span>

          <a
            className="footer-link"
            href="https://www.linkedin.com/in/sagarkudu/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sagar Kudu
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
