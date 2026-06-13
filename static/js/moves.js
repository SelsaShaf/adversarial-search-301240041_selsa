// moves.js - Generator langkah valid, capture, dan multi-jump

// Arah diagonal: [dRow, dCol]
const DIRECTIONS = {
    redMan: [[-1, -1], [-1, 1]],          // merah maju ke atas
    whiteMan: [[1, -1], [1, 1]],          // putih maju ke bawah
    king: [[-1, -1], [-1, 1], [1, -1], [1, 1]]
};

// Ambil arah gerak berdasarkan jenis piece
function getDirections(piece) {
    if (piece === RED) return DIRECTIONS.redMan;
    if (piece === WHITE) return DIRECTIONS.whiteMan;
    return DIRECTIONS.king; // RED_KING atau WHITE_KING
}

// Cek apakah posisi masih dalam papan
function inBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Ambil semua capture yang mungkin untuk satu piece (termasuk multi-jump)
function getCapturesForPiece(b, row, col, player, path = [], originRow = null, originCol = null) {
    const piece = b[row][col];
    const directions = getDirections(piece);
    const captures = [];

    // Set origin hanya sekali, di level rekursi pertama
    if (originRow === null) {
        originRow = row;
        originCol = col;
    }

    for (const [dr, dc] of directions) {
        const midRow = row + dr;
        const midCol = col + dc;
        const landRow = row + dr * 2;
        const landCol = col + dc * 2;

        if (!inBounds(landRow, landCol)) continue;

        const midPiece = b[midRow][midCol];
        const landPiece = b[landRow][landCol];

        if (midPiece !== EMPTY && !isPlayerPiece(midPiece, player) && landPiece === EMPTY) {
            const newBoard = cloneBoard(b);
            newBoard[landRow][landCol] = newBoard[row][col];
            newBoard[row][col] = EMPTY;
            newBoard[midRow][midCol] = EMPTY;

            const newPath = [...path, { row: landRow, col: landCol, captured: { row: midRow, col: midCol } }];

            const wasMan = (piece === RED || piece === WHITE);
            let promoted = false;
            if (wasMan) {
                if (piece === RED && landRow === 0) {
                    newBoard[landRow][landCol] = RED_KING;
                    promoted = true;
                }
                if (piece === WHITE && landRow === 7) {
                    newBoard[landRow][landCol] = WHITE_KING;
                    promoted = true;
                }
            }

            let furtherCaptures = [];
            if (!promoted) {
                furtherCaptures = getCapturesForPiece(newBoard, landRow, landCol, player, newPath, originRow, originCol);
            }

            if (furtherCaptures.length > 0) {
                captures.push(...furtherCaptures);
            } else {
                captures.push({
                    fromRow: originRow,
                    fromCol: originCol,
                    toRow: landRow,
                    toCol: landCol,
                    captured: newPath.map(p => p.captured),
                    path: newPath,
                    isCapture: true
                });
            }
        }
    }

    return captures;
}

// Ambil gerak biasa (non-capture) untuk satu piece
function getRegularMovesForPiece(b, row, col, player) {
    const piece = b[row][col];
    const directions = getDirections(piece);
    const moves = [];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (!inBounds(newRow, newCol)) continue;

        if (b[newRow][newCol] === EMPTY) {
            moves.push({
                fromRow: row,
                fromCol: col,
                toRow: newRow,
                toCol: newCol,
                captured: [],
                path: [],
                isCapture: false
            });
        }
    }

    return moves;
}

// Ambil semua moves untuk satu pemain (forced capture rule diterapkan)
function getAllMoves(b, player) {
    let allCaptures = [];
    let allRegular = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = b[row][col];
            if (!isPlayerPiece(piece, player)) continue;

            const captures = getCapturesForPiece(b, row, col, player);
            if (captures.length > 0) {
                allCaptures.push(...captures);
            } else {
                allRegular.push(...getRegularMovesForPiece(b, row, col, player));
            }
        }
    }

    // Forced capture: jika ada capture, gerak biasa diabaikan
    return allCaptures.length > 0 ? allCaptures : allRegular;
}

// Terapkan move ke board, kembalikan board baru
function applyMove(b, move) {
    const newBoard = cloneBoard(b);
    const piece = newBoard[move.fromRow][move.fromCol];

    newBoard[move.toRow][move.toCol] = piece;
    newBoard[move.fromRow][move.fromCol] = EMPTY;

    // Hapus semua piece yang dimakan (multi-jump bisa lebih dari satu)
    if (move.captured && move.captured.length > 0) {
        move.captured.forEach(c => {
            newBoard[c.row][c.col] = EMPTY;
        });
    }

    // Cek promosi king
    promoteIfNeeded(newBoard, move.toRow, move.toCol);

    return newBoard;
}

// Cek apakah game sudah selesai, return 'red' / 'white' / null
function checkGameOver(b) {
    const redMoves = getAllMoves(b, RED);
    const whiteMoves = getAllMoves(b, WHITE);

    if (redMoves.length === 0) return WHITE;  // merah tidak bisa gerak, putih menang
    if (whiteMoves.length === 0) return RED;  // putih tidak bisa gerak, merah menang

    return null;
}

// Hitung jumlah piece per pemain (untuk evaluasi cepat)
function countPieces(b, player) {
    let count = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isPlayerPiece(b[row][col], player)) count++;
        }
    }
    return count;
}

// Cek apakah piece di posisi ini termasuk yang wajib capture
function hasForcedCapture(row, col, player) {
    const allMoves = getAllMoves(board, player);
    return allMoves.some(m => m.isCapture && m.fromRow === row && m.fromCol === col);
}