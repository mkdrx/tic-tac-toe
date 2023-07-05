import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

import { Square } from "./components/Square";
import { TURNS, WINNER_COMBOS } from "../constants";
import { WinnerModal } from "./components/WinnerModal";
import { saveGameToStorage, resetGameStorage } from "./storage";

function App() {
  const [board, setBoard] = useState(() => {
    const boardFromStorage = window.localStorage.getItem("board");
    return boardFromStorage
      ? JSON.parse(boardFromStorage)
      : Array(9).fill(null);
  });
  const [turn, setTurn] = useState(() => {
    const turnFromStorage = window.localStorage.getItem("turn");
    return turnFromStorage === TURNS.X || turnFromStorage === TURNS.O
      ? turnFromStorage
      : TURNS.X;
  });

  // Null is no winner - draw
  const [winner, setWinner] = useState(null);

  // Local storage difficulty checker
  let storedDifficulty;
  const difficultyInLocalStorage = window.localStorage.getItem("difficulty");
  if (
    difficultyInLocalStorage === "Easy" ||
    difficultyInLocalStorage === "Hard"
  ) {
    storedDifficulty = difficultyInLocalStorage;
  }

  const [difficulty, setDifficulty] = useState(storedDifficulty || "");
  const [isDifficultySelected, setIsDifficultySelected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (turn === TURNS.O) {
        makeMove();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [turn]);

  useEffect(() => {
    localStorage.setItem("difficulty", difficulty);
    setIsDifficultySelected(!!difficulty);
  }, [difficulty]);

  const checkWinner = (boardCheck) => {
    // Check for all win combinations
    for (const combo of WINNER_COMBOS) {
      const [a, b, c] = combo;
      if (
        boardCheck[a] &&
        boardCheck[a] === boardCheck[b] &&
        boardCheck[a] === boardCheck[c]
      ) {
        return boardCheck[a];
      }
    }
    // if there is no winner
    return null;
  };

  // Reset game - reset local storage
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn(TURNS.X);
    setWinner(null);
    resetGameStorage();
  };

  const checkEndGame = (newBoard) => {
    return newBoard.every((square) => square !== null);
  };

  const updateBoard = (index) => {
    // Avoid updating board if there is something already
    // or if there is a winner
    if (board[index] || winner || !isDifficultySelected) return;

    // Update board
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    // Change turn
    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    setTurn(newTurn);

    // Save game
    saveGameToStorage({
      board: newBoard,
      turn: newTurn,
    });

    // Check for winner
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      confetti();
      setWinner(newWinner);
    } else if (checkEndGame(newBoard)) {
      setWinner(false); // draw
    }
  };

  const makeMove = () => {
    if (difficulty === "Easy") {
      makeEasyMove();
    } else if (difficulty === "Hard") {
      makeHardMove();
    }
  };

  // Difficulties moves
  const makeEasyMove = () => {
    const emptyIndices = board.reduce(
      (indices, square, index) =>
        square === null ? [...indices, index] : indices,
      []
    );
    const randomIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    updateBoard(randomIndex);
  };

  const makeHardMove = () => {
    const machineTurn = TURNS.O;
    const playerTurn = TURNS.X;

    // Check for winning move
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = machineTurn;
        if (checkWinner(newBoard) === machineTurn) {
          updateBoard(i);
          return;
        }
        newBoard[i] = null;
      }
    }

    // Check for blocking move
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = playerTurn;
        if (checkWinner(newBoard) === playerTurn) {
          updateBoard(i);
          return;
        }
        newBoard[i] = null;
      }
    }
    // Choose a random move if neither
    makeEasyMove();
  };

  return (
    <main className="board">
      <div className="difficulty">
        <button
          className={difficulty === "Easy" ? "active" : ""}
          style={{ backgroundColor: difficulty === "Easy" ? "#228B22" : "" }}
          onClick={() => {
            setDifficulty("Easy");
          }}
        >
          EASY
        </button>
        <button
          className={difficulty === "Hard" ? "active" : ""}
          style={{ backgroundColor: difficulty === "Hard" ? "#DC143C" : "" }}
          onClick={() => {
            setDifficulty("Hard");
          }}
        >
          HARD
        </button>
      </div>

      {!isDifficultySelected && (
        <div className="select-difficulty">SELECT DIFFICULTY</div>
      )}

      {isDifficultySelected && difficulty !== null && (
        <p>
          LEVEL:
          <span
            className="diff"
            style={{
              color:
                difficulty === "Easy"
                  ? "#228B22"
                  : difficulty === "Hard"
                  ? "#DC143C"
                  : "",
            }}
          >
            {difficulty}
          </span>
        </p>
      )}
      <button onClick={resetGame}>RESET</button>
      <section className="game">
        {board.map((square, index) => (
          <Square
            key={index}
            index={index}
            updateBoard={updateBoard}
            disabled={
              square !== null || (turn === TURNS.O && difficulty === "Hard")
            }
          >
            {square}
          </Square>
        ))}
      </section>
      <section className="turn">
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>
      <WinnerModal resetGame={resetGame} winner={winner} />
    </main>
  );
}

export default App;
