const randomSuffix = () => Math.random().toString(36).slice(2, 8);

export const createGameSession = () => {
  const startedAt = Math.floor(Date.now() / 1000);
  return {
    gameId: `game-${startedAt}-${randomSuffix()}`,
    startedAt,
  };
};

export const getGameDurationSeconds = (startedAt) => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, now - startedAt);
};
