import React from "react";

export function CreateGame({ createGame }) {
  return (
    <div>
      <h4>Create Game</h4>
      <form
        onSubmit={(event) => {
          // This function just calls the transferTokens callback with the
          // form's data.
          event.preventDefault();

          const formData = new FormData(event.target);
          const description = formData.get("description");

          if (description) {
            createGame(description);
          }
        }}
      >
        <div className="form-group">
          <label>Game Description</label>
          <input
            className="form-control"
            type="string"
            step="1"
            name="description"
            placeholder="Fun Game Show"
            required
          />
        </div>
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Create New Game" />
        </div>
      </form>
    </div>
  );
}
