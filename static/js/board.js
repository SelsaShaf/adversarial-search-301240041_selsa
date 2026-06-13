// board.js - Representasi dan rendering papan

// Konstanta nilai piece
const EMPTY = 0;
const RED = 1;
const WHITE = 2;
const RED_KING = 3;
const WHITE_KING = 4;

// State papan global
let board = [];
let selectedCell = null;
let validMoves = [];

// Inisialisasi posisi awal piece
function initBoard() {
    board = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));

    // Tempatkan piece putih di baris 0-2
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = WHITE;
            }
        }
    }

    // Tempatkan piece merah di baris 5-7
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                board[row][col] = RED;
            }
        }
    }
}

// Salin board agar tidak mutasi state asli
function cloneBoard(b) {
    return b.map(row => [...row]);
}

// Cek apakah piece adalah milik pemain tertentu
function isPlayerPiece(piece, player) {
    if (player === RED) return piece === RED || piece === RED_KING;
    if (player === WHITE) return piece === WHITE || piece === WHITE_KING;
    return false;
}

// Cek apakah piece adalah king
function isKing(piece) {
    return piece === RED_KING || piece === WHITE_KING;
}

// Promosi piece menjadi king jika mencapai baris ujung
function promoteIfNeeded(b, row, col) {
    if (b[row][col] === RED && row === 0) {
        b[row][col] = RED_KING;
    }
    if (b[row][col] === WHITE && row === 7) {
        b[row][col] = WHITE_KING;
    }
}

// Render papan ke DOM
function renderBoard() {
    const boardEl = document.getElementById("checkerboard");
    boardEl.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add((row + col) % 2 === 0 ? "light" : "dark");
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Highlight sel yang valid untuk bergerak
            if (isHighlighted(row, col)) {
                const move = getHighlightedMove(row, col);
                cell.classList.add(move && move.captured && move.captured.length > 0 ? "highlight-capture" : "highlight");
            }

            // Highlight sel yang dipilih
            if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                cell.classList.add("selected");
            }

            // Render piece jika ada
            const cellPiece = board[row][col];
            if (cellPiece !== EMPTY) {
                const pieceEl = createPieceElement(cellPiece);

                // Highlight jika piece ini wajib capture (forced capture rule)
                if (typeof currentPlayer !== "undefined"
                    && isPlayerPiece(cellPiece, currentPlayer)
                    && hasForcedCapture(row, col, currentPlayer)) {
                    pieceEl.classList.add("must-capture");
                }

                // Tandai piece yang sedang dipilih
                if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
                    pieceEl.classList.add("selected-piece");
                }

                cell.appendChild(pieceEl);
            }

            cell.addEventListener("click", () => onCellClick(row, col));
            boardEl.appendChild(cell);
        }
    }
}

// Buat elemen piece
function createPieceElement(piece) {
    const el = document.createElement("div");
    el.classList.add("piece");

    if (piece === RED || piece === RED_KING) {
        el.classList.add("red");
    } else {
        el.classList.add("white");
    }

    if (isKing(piece)) {
        el.classList.add("king");
    }

    return el;
}

// Cek apakah sel termasuk dalam daftar highlight
function isHighlighted(row, col) {
    return validMoves.some(m => m.toRow === row && m.toCol === col);
}

// Ambil data move dari highlight
function getHighlightedMove(row, col) {
    return validMoves.find(m => m.toRow === row && m.toCol === col);
}

// Reset seleksi
function clearSelection() {
    selectedCell = null;
    validMoves = [];
    renderBoard();
}