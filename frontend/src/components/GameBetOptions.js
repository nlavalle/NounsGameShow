import React from "react";

export function GameBetOptions({ gameOptions, onAdd, onRemove, onClose }) {
  return (
    <div>
      <h4>Options for Game Show</h4>
      <ol>
        {gameOptions.map((gameOption, index) => (
          <li key={index} className="flex justify-between items-center mb-2">
            <span>{gameOption.description}</span>
            <div>
              <button className="btn btn-danger"
                onClick={() => onRemove(gameOption.id.toNumber())}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button className="btn btn-primary"
        onClick={() => onAdd("Test")}>
        Add
      </button>
      <button
        className="btn btn-success"
        onClick={onClose}>
        Lock Game Voting
      </button>
    </div>
  );
}
