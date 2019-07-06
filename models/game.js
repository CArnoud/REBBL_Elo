exports.parse = (gameObj) => {
    const result = {
        round: gameObj.round,
        match_id: gameObj.match_id,
        team_ids: [
            gameObj.opponents[0].team.id,
            gameObj.opponents[1].team.id
        ]
    };
    result.winner_id = gameObj.winner ? gameObj.winner.team.id : null;
    return result;
};
