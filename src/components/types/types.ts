export type SignItem = "" | "x" | "o";
export type PlayerSign = "" | "x" | "o";
export type GameType = "LOCAL" | "BOT_EASY" | "BOT_MEDIUM";
export type PossiblePosition = { row: number; col: number };
export type CellTypes = {
  cell: SignItem;
  onPress: () => void;
};
