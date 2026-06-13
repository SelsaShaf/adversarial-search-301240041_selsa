// evaluation.js - Fungsi heuristik evaluasi papan

// Bobot nilai
const WEIGHT_MAN = 100;
const WEIGHT_KING = 175;
const WEIGHT_POSITION = 10;
const WEIGHT_BACKROW = 5;
const WEIGHT_MOBILITY = 3;

// Evaluasi papan dari sudut pandang AI (WHITE = AI)
// Skor positif = baik untuk AI, negatif = baik untuk lawan (RED)
function evaluateBoard(b) {
    let score = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = b[row][col];
            if (piece === EMPTY) continue;

            const isWhite = (piece === WHITE || piece === WHITE_KING);
            const isKingPiece = isKing(piece);
            const sign = isWhite ? 1 : -1;

            // Nilai dasar piece
            score += sign * (isKingPiece ? WEIGHT_KING : WEIGHT_MAN);

            // Bonus posisi tengah (baris 2-5 dianggap area kontrol)
            if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
                score += sign * WEIGHT_POSITION;
            }

            // Bonus back row untuk piece biasa yang belum maju
            if (!isKingPiece) {
                if (isWhite && row === 0) score += sign * WEIGHT_BACKROW;
                if (!isWhite && row === 7) score += sign * WEIGHT_BACKROW;
            }
        }
    }

    // Bonus mobilitas: selisih jumlah legal moves
    const whiteMoves = getAllMoves(b, WHITE).length;
    const redMoves = getAllMoves(b, RED).length;
    score += (whiteMoves - redMoves) * WEIGHT_MOBILITY;

    return score;
}