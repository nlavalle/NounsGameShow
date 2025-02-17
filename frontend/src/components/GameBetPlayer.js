import React from "react";

export function GameBetPlayer({ gameOptions, onBet }) {
  return (
    <div>
      <h4>Options for Game Show</h4>
      <ol>
        {gameOptions.map((gameOption, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{gameOption.description}</span>
            <div>
              <button className="btn btn-success"
                onClick={() => onBet(gameOption.id.toNumber())}>
                Bet
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
