import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ImageBackground, Alert } from "react-native";
import Cell from "./src/components/Cell";
import {
  GameType,
  PossiblePosition,
  SignItem,
} from "./src/components/types/types";
import background from "./assets/background.jpeg";

const emptyMap: SignItem[][] = [
  ["", "", ""], // 1st row
  ["", "", ""], // 2nd row
  ["", "", ""], // 3rd row
];

const copyArray = (original: SignItem[][]) => {
  const copy = original.map((arr: SignItem[]) => {
    return arr.slice();
  });
  return copy;
};

export default function App() {
  const [map, setMap] = useState<SignItem[][]>(emptyMap);
  const [currentTurn, setCurrentTurn] = useState<SignItem>("x");
  const [gameMode, setGameMode] = useState<GameType>("BOT_EASY");

  useEffect(() => {
    if (currentTurn === "o" && gameMode !== "LOCAL") {
      botTurn();
    }
  }, [currentTurn, gameMode]);

  useEffect(() => {
    const winner = getWinner(map);
    if (winner) {
      gameWon(winner);
    } else {
      checkTieState();
    }
  }, [map]);

  const updateMap = (rowIndex: number, columnIndex: number) => {
    if (map[rowIndex][columnIndex] !== "") {
      Alert.alert("Position déjà occupée !");
      return;
    }

    setMap((existingMap) => {
      const updatedMap = [...existingMap];
      updatedMap[rowIndex][columnIndex] = currentTurn;
      return updatedMap;
    });

    setCurrentTurn(currentTurn === "x" ? "o" : "x");
  };

  const getWinner = (winnerMap: SignItem[][]) => {
    // Check rows
    for (let i = 0; i < 3; i++) {
      const isRowXWinning = winnerMap[i].every((cell) => cell === "x");
      const isRowOWinning = winnerMap[i].every((cell) => cell === "o");

      if (isRowXWinning) {
        return "x";
      }
      if (isRowOWinning) {
        return "o";
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      let isColumnXWinner = true;
      let isColumnOWinner = true;

      for (let row = 0; row < 3; row++) {
        if (winnerMap[row][col] !== "x") {
          isColumnXWinner = false;
        }
        if (winnerMap[row][col] !== "o") {
          isColumnOWinner = false;
        }
      }

      if (isColumnXWinner) {
        return "x";
      }
      if (isColumnOWinner) {
        return "o";
      }
    }

    // check diagonals
    let isDiagonal1OWinning = true;
    let isDiagonal1XWinning = true;
    let isDiagonal2OWinning = true;
    let isDiagonal2XWinning = true;
    for (let i = 0; i < 3; i++) {
      if (winnerMap[i][i] !== "o") {
        isDiagonal1OWinning = false;
      }
      if (winnerMap[i][i] !== "x") {
        isDiagonal1XWinning = false;
      }

      if (winnerMap[i][2 - i] !== "o") {
        isDiagonal2OWinning = false;
      }
      if (winnerMap[i][2 - i] !== "x") {
        isDiagonal2XWinning = false;
      }
    }

    if (isDiagonal1OWinning || isDiagonal2OWinning) {
      return "o";
    }
    if (isDiagonal1XWinning || isDiagonal2XWinning) {
      return "x";
    }
  };

  const checkTieState = () => {
    if (!map.some((row) => row.some((cell) => cell === ""))) {
      Alert.alert(`Aucun gagnant`, `Terminer`, [
        {
          text: "Rejouer",
          onPress: resetGame,
        },
      ]);
    }
  };

  const gameWon = (player: Omit<SignItem, "">) => {
    Alert.alert(`Partie terminée`, `Le joueur ${player} a gagné`, [
      {
        text: "Rejouer",
        onPress: resetGame,
      },
    ]);
  };

  const resetGame = () => {
    setMap([
      ["", "", ""], // 1st row
      ["", "", ""], // 2nd row
      ["", "", ""], // 3rd row
    ]);
    setCurrentTurn("x");
  };

  const botTurn = () => {
    // collect all possible options
    const possiblePositions: PossiblePosition[] = [];
    map.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell === "") {
          possiblePositions.push({ row: rowIndex, col: columnIndex });
        }
      });
    });

    let chosenOption;

    if (gameMode === "BOT_MEDIUM") {
      // Attack
      possiblePositions.forEach((possiblePosition) => {
        const mapCopy = copyArray(map);

        mapCopy[possiblePosition.row][possiblePosition.col] = "o";

        const winner = getWinner(mapCopy);
        if (winner === "o") {
          // Attack that position
          chosenOption = possiblePosition;
        }
      });

      if (!chosenOption) {
        // Defend
        // Check if the opponent WINS if it takes one of the possible Positions
        possiblePositions.forEach((possiblePosition) => {
          const mapCopy = copyArray(map);

          mapCopy[possiblePosition.row][possiblePosition.col] = "x";

          const winner = getWinner(mapCopy);
          if (winner === "x") {
            // Defend that position
            chosenOption = possiblePosition;
          }
        });
      }
    }

    // choose random
    if (!chosenOption) {
      chosenOption =
        possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
    }

    if (chosenOption) {
      updateMap(chosenOption.row, chosenOption.col);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={background}
        style={styles.bg}
        resizeMode="contain"
      >
        <Text
          style={{
            fontSize: 24,
            color: "white",
            position: "absolute",
            top: 50,
          }}
        >
          Tour actuel: {currentTurn.toUpperCase()}
        </Text>
        <View style={styles.map}>
          {map.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((cell, columnIndex) => (
                <Cell
                  key={`row-${rowIndex}-col-${columnIndex}`}
                  cell={cell}
                  onPress={() => updateMap(rowIndex, columnIndex)}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={styles.buttons}>
          <Text
            onPress={() => setGameMode("LOCAL")}
            style={[
              styles.button,
              { backgroundColor: gameMode === "LOCAL" ? "#4F5686" : "#191F24" },
            ]}
          >
            Locale
          </Text>
          <Text
            onPress={() => setGameMode("BOT_EASY")}
            style={[
              styles.button,
              {
                backgroundColor:
                  gameMode === "BOT_EASY" ? "#4F5686" : "#191F24",
              },
            ]}
          >
            Facile
          </Text>
          <Text
            onPress={() => setGameMode("BOT_MEDIUM")}
            style={[
              styles.button,
              {
                backgroundColor:
                  gameMode === "BOT_MEDIUM" ? "#4F5686" : "#191F24",
              },
            ]}
          >
            Moyen
          </Text>
        </View>
      </ImageBackground>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#242D34",
  },
  bg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 15,
  },
  map: {
    width: "80%",
    aspectRatio: 1,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  buttons: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
  },
  button: {
    color: "white",
    margin: 10,
    fontSize: 16,
    backgroundColor: "#191F24",
    padding: 10,
    paddingHorizontal: 15,
  },
});
