import { useState } from "react";
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
    return turnFromStorage ?? TURNS.X;
  });

  // Null is no winner - null draw
  const [winner, setWinner] = useState(null);

  const checkWinner = (boardCheck) => {
    // check for all win combinations
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

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn(TURNS.X);
    setWinner(null);

    // reset localStorage
    resetGameStorage();
  };

  const checkEndGame = (newBoard) => {
    return newBoard.every((square) => square !== null);
  };

  const updateBoard = (index) => {
    // avoid updating board if there is something already
    // or if there is a winner
    if (board[index] || winner) return;

    // update board
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    // change turn
    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    setTurn(newTurn);

    // save game
    saveGameToStorage({
      board: newBoard,
      turn: newTurn,
    });

    // check for winner
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      confetti();
      setWinner(newWinner);
    } else if (checkEndGame(newBoard)) {
      setWinner(false); // draw
    }
  };

  return (
    <main className="board">
      <button onClick={resetGame}>Reset</button>
      <section className="game">
        {board.map((square, index) => {
          return (
            <Square key={index} index={index} updateBoard={updateBoard}>
              {square}
            </Square>
          );
        })}
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
