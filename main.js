document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const resultDisplay = document.getElementById("result");
  let squares = [];
  const width = 4;
  let score = 0;
  let bestScore = 0;
  let boardChanged = false; // Variable para rastrear si el tablero ha cambiado

  // Crear el tablero de juego
  function createBoard() {
    // Limpiar gridDisplay y resetear el array de squares
    gridDisplay.innerHTML = "";
    squares = [];

    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.innerHTML = 0;
      gridDisplay.appendChild(square);
      squares.push(square);
    }
    generate();
    generate();
  }
  createBoard();

  initializeBestScore();

  function initializeBestScore() {
    const bestScoreElement = document.getElementById("best-score");
    const storedBestScore = localStorage.getItem("bestScore");

    if (storedBestScore !== null) {
      const parsedBestScore = parseInt(storedBestScore);
      bestScoreElement.textContent = parsedBestScore;
      bestScore = parsedBestScore; // Inicializar bestScore con el valor almacenado
    }
  }

  const resetButton = document.getElementById("reset-button");

  // Agregar un evento de clic al botón de reinicio
  resetButton.addEventListener("click", () => {
    createBoard();

    addColours();
    // Reiniciar la puntuación
    score = 0;
    scoreDisplay.innerHTML = score;

    // Reiniciar el mensaje de resultado
    resultDisplay.innerHTML = "Une los números para llegar al <b>2048</b>!";

    // Volver a habilitar el evento keyup
    document.addEventListener("keyup", control);
  });

  // Generar un nuevo número
  function generate() {
    let randomNumber = Math.random(); // Generar un número aleatorio entre 0 y 1
    let newTileValue = randomNumber < 0.9 ? 2 : 4; // 90% de probabilidad de "2", 10% de probabilidad de "4"

    // Encontrar un cuadro vacío para colocar la nueva ficha
    let emptySquares = squares.filter((square) => square.innerHTML == 0);
    if (emptySquares.length > 0) {
      let randomIndex = Math.floor(Math.random() * emptySquares.length);
      emptySquares[randomIndex].innerHTML = newTileValue;
      addColours();
      // Reiniciar la variable boardChanged al generar una nueva ficha
      boardChanged = false;

      checkForGameOver();
    }
  }

  // Mover fichas en una dirección
  function move(direction) {
    let hasMoved = false; // Variable local para rastrear si alguna ficha se ha movido en esta operación
    for (let i = 0; i < 16; i++) {
      if (direction === "right" || direction === "left") {
        if (i % 4 === 0) {
          let row = [
            squares[i],
            squares[i + 1],
            squares[i + 2],
            squares[i + 3],
          ].map((square) => parseInt(square.innerHTML));
          let filteredRow = row.filter((num) => num);
          let missing = 4 - filteredRow.length;
          let newRow =
            direction === "right"
              ? Array(missing).fill(0).concat(filteredRow)
              : filteredRow.concat(Array(missing).fill(0));

          [squares[i], squares[i + 1], squares[i + 2], squares[i + 3]].forEach(
            (square, j) => {
              if (square.innerHTML != newRow[j]) {
                square.innerHTML = newRow[j];
                hasMoved = true;
              }
            }
          );
        }
      } else if (direction === "up" || direction === "down") {
        if (i < 4) {
          let column = [
            squares[i],
            squares[i + width],
            squares[i + 2 * width],
            squares[i + 3 * width],
          ].map((square) => parseInt(square.innerHTML));
          let filteredColumn = column.filter((num) => num);
          let missing = 4 - filteredColumn.length;
          let newColumn =
            direction === "down"
              ? Array(missing).fill(0).concat(filteredColumn)
              : filteredColumn.concat(Array(missing).fill(0));

          [
            squares[i],
            squares[i + width],
            squares[i + 2 * width],
            squares[i + 3 * width],
          ].forEach((square, j) => {
            if (square.innerHTML != newColumn[j]) {
              square.innerHTML = newColumn[j];
              hasMoved = true;
            }
          });
        }
      }
    }
    if (hasMoved) {
      boardChanged = true;
    }
  }

  // Combinar fichas
  function combine(lineDirection) {
    let hasCombined = false; // Variable local para rastrear si se ha producido alguna combinación
    for (let i = 0; i < squares.length - 1; i++) {
      if (lineDirection === "row" && i % 4 !== 3) {
        if (
          squares[i].innerHTML === squares[i + 1].innerHTML &&
          squares[i].innerHTML != 0
        ) {
          combineSquares(i, i + 1);
          hasCombined = true;
        }
      } else if (lineDirection === "column" && i < 12) {
        if (
          squares[i].innerHTML === squares[i + width].innerHTML &&
          squares[i].innerHTML != 0
        ) {
          combineSquares(i, i + width);
          hasCombined = true;
        }
      }
    }
    if (hasCombined) {
      boardChanged = true;
    }
  }

  // Función auxiliar para combinar dos fichas
  function combineSquares(index1, index2) {
    let combinedTotal =
      parseInt(squares[index1].innerHTML) + parseInt(squares[index2].innerHTML);
    squares[index1].innerHTML = combinedTotal;
    squares[index2].innerHTML = 0;
    score += combinedTotal;
    scoreDisplay.innerHTML = score;

    // Actualizar el mejor puntaje si el puntaje actual es mayor
    if (score > bestScore) {
      updateBestScore();
    }
  }

  // Manejadores de movimiento de teclas
  function control(e) {
    boardChanged = false; // Restablecer la bandera boardChanged antes de verificar la tecla presionada
    if (e.keyCode === 37) keyLeft();
    else if (e.keyCode === 38) keyUp();
    else if (e.keyCode === 39) keyRight();
    else if (e.keyCode === 40) keyDown();

    if (boardChanged) {
      // Solo generar una nueva ficha si el tablero ha cambiado
      generate();
    }
  }
  document.addEventListener("keyup", control);

  function keyRight() {
    move("right");
    combine("row");
    move("right");
    checkForWin();
  }

  function keyLeft() {
    move("left");
    combine("row");
    move("left");
    checkForWin();
  }

  function keyUp() {
    move("up");
    combine("column");
    move("up");
    checkForWin();
  }

  function keyDown() {
    move("down");
    combine("column");
    move("down");
    checkForWin();
  }

  // Comprobar el número 2048 para ganar
  function checkForWin() {
    if (squares.some((square) => square.innerHTML == 2048)) {
      resultDisplay.innerHTML = "Ganaste!";
      document.removeEventListener("keyup", control);
      setTimeout(clear, 3000);
    }
  }

  // Comprobar si no hay ceros en el tablero para perder
  function checkForGameOver() {
    // Comprobar movimientos disponibles horizontalmente y verticalmente
    for (let i = 0; i < squares.length; i++) {
      if (
        (i % width !== width - 1 &&
          squares[i].innerHTML === squares[i + 1].innerHTML) || // Comprobar hacia la derecha
        (i % width !== 0 &&
          squares[i].innerHTML === squares[i - 1].innerHTML) || // Comprobar hacia la izquierda
        (i < width * (width - 1) &&
          squares[i].innerHTML === squares[i + width].innerHTML) || // Comprobar hacia abajo
        (i >= width && squares[i].innerHTML === squares[i - width].innerHTML) // Comprobar hacia arriba
      ) {
        // Si hay una ficha coincidente adyacente a esta ficha, hay un movimiento disponible
        return;
      }
    }

    // Comprobar si el tablero está lleno (sin ceros)
    if (squares.every((square) => square.innerHTML != 0)) {
      // Si se cumplen ambas condiciones, es una derrota
      resultDisplay.innerHTML = "Pierdes :c";
      document.removeEventListener("keyup", control);
      setTimeout(clear, 3000);
    }
  }

  // Limpiar temporizador
  function clear() {
    clearInterval(myTimer);
  }

  // Agregar colores
  function addColours() {
    const colourMap = {
      0: { background: "#afa192", text: "#afa192" }, // Color predeterminado para fichas vacías
      2: { background: "#eee4da", text: "#afa192" },
      4: { background: "#ede0c8", text: "#afa192" },
      8: { background: "#f2b179", text: "#ffffff" }, // Cambiar color de texto para 8 y superiores
      16: { background: "#f59563", text: "#ffffff" },
      32: { background: "#f67c5f", text: "#ffffff" },
      64: { background: "#f65e3b", text: "#ffffff" },
      128: { background: "#edcf72", text: "#ffffff" },
      256: { background: "#edcc61", text: "#ffffff" },
      512: { background: "#edc850", text: "#ffffff" },
      1024: { background: "#edc53f", text: "#ffffff" },
      2048: { background: "#edc22e", text: "#ffffff" },
    };
    squares.forEach((square) => {
      const value = parseInt(square.innerHTML);
      const color = colourMap[value] || {
        background: "#afa192",
        text: "#afa192",
      }; // Por defecto al color predeterminado
      square.style.backgroundColor = color.background;
      square.style.color = color.text;
    });
  }
  addColours();

  const myTimer = setInterval(addColours, 50);

  // Función para actualizar el mejor puntaje basado en el puntaje actual
  function updateBestScore() {
    if (score > bestScore) {
      bestScore = score;
      document.getElementById("best-score").innerHTML = bestScore;

      // Almacenar el nuevo mejor puntaje en localStorage
      localStorage.setItem("bestScore", bestScore);
    }
  }
});
