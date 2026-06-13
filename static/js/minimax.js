// minimax.js - Implementasi Minimax dan Alpha-Beta Pruning

// Counter global node
let minimaxNodeCount = 0;
let alphabetaNodeCount = 0;

// Data tree untuk visualisasi (diisi saat AI berpikir)
let lastTreeData = null;

// Minimax murni
function minimax(b, depth, isMaximizing, treeNode = null) {
    minimaxNodeCount++;

    const winner = checkGameOver(b);
    if (depth === 0 || winner !== null) {
        const score = evaluateBoard(b);
        if (treeNode) treeNode.score = score;
        return score;
    }

    const player = isMaximizing ? WHITE : RED;
    const moves = getAllMoves(b, player);

    if (isMaximizing) {
        let best = -Infinity;
        for (const move of moves) {
            const newBoard = applyMove(b, move);
            let childNode = null;
            if (treeNode) {
                childNode = { move, children: [], score: null, pruned: false };
                treeNode.children.push(childNode);
            }
            const score = minimax(newBoard, depth - 1, false, childNode);
            best = Math.max(best, score);
        }
        if (treeNode) treeNode.score = best;
        return best;
    } else {
        let best = Infinity;
        for (const move of moves) {
            const newBoard = applyMove(b, move);
            let childNode = null;
            if (treeNode) {
                childNode = { move, children: [], score: null, pruned: false };
                treeNode.children.push(childNode);
            }
            const score = minimax(newBoard, depth - 1, true, childNode);
            best = Math.min(best, score);
        }
        if (treeNode) treeNode.score = best;
        return best;
    }
}

// Minimax dengan Alpha-Beta Pruning
function alphabeta(b, depth, alpha, beta, isMaximizing, treeNode = null) {
    alphabetaNodeCount++;

    const winner = checkGameOver(b);
    if (depth === 0 || winner !== null) {
        const score = evaluateBoard(b);
        if (treeNode) treeNode.score = score;
        return score;
    }

    const player = isMaximizing ? WHITE : RED;
    const moves = getAllMoves(b, player);

    if (isMaximizing) {
        let best = -Infinity;
        for (const move of moves) {
            const newBoard = applyMove(b, move);
            let childNode = null;
            if (treeNode) {
                childNode = { move, children: [], score: null, pruned: false };
                treeNode.children.push(childNode);
            }

            const score = alphabeta(newBoard, depth - 1, alpha, beta, false, childNode);
            best = Math.max(best, score);
            alpha = Math.max(alpha, best);

            if (beta <= alpha) {
                markRemainingPruned(treeNode, moves, move);
                break;
            }
        }
        if (treeNode) treeNode.score = best;
        return best;
    } else {
        let best = Infinity;
        for (const move of moves) {
            const newBoard = applyMove(b, move);
            let childNode = null;
            if (treeNode) {
                childNode = { move, children: [], score: null, pruned: false };
                treeNode.children.push(childNode);
            }

            const score = alphabeta(newBoard, depth - 1, alpha, beta, true, childNode);
            best = Math.min(best, score);
            beta = Math.min(beta, best);

            if (beta <= alpha) {
                markRemainingPruned(treeNode, moves, move);
                break;
            }
        }
        if (treeNode) treeNode.score = best;
        return best;
    }
}

// Tandai sisa moves yang tidak dieksplorasi sebagai pruned (untuk visualisasi)
function markRemainingPruned(treeNode, allMoves, currentMove) {
    if (!treeNode) return;
    const currentIndex = allMoves.indexOf(currentMove);
    const remaining = allMoves.length - currentIndex - 1;
    for (let i = 0; i < remaining; i++) {
        treeNode.children.push({ move: null, children: [], score: null, pruned: true });
    }
}

// Cari langkah terbaik AI berdasarkan algoritma yang aktif
function getBestMove(b, depth, useAlphaBeta) {
    minimaxNodeCount = 0;
    alphabetaNodeCount = 0;

    const moves = getAllMoves(b, WHITE);
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestScore = -Infinity;

    // Root tree node untuk visualisasi
    const rootTree = { move: null, children: [], score: null, pruned: false };

    if (useAlphaBeta) {
        let alpha = -Infinity;
        const beta = Infinity;

        for (const move of moves) {
            const newBoard = applyMove(b, move);
            const childNode = { move, children: [], score: null, pruned: false };
            rootTree.children.push(childNode);

            const score = alphabeta(newBoard, depth - 1, alpha, beta, false, childNode);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestScore);
        }

        // Jalankan juga minimax murni untuk perbandingan node count
        runMinimaxForCounter(b, depth, moves);
    } else {
        for (const move of moves) {
            const newBoard = applyMove(b, move);
            const childNode = { move, children: [], score: null, pruned: false };
            rootTree.children.push(childNode);

            const score = minimax(newBoard, depth - 1, false, childNode);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        // Jalankan juga alpha-beta untuk perbandingan node count
        runAlphaBetaForCounter(b, depth, moves);
    }

    rootTree.score = bestScore;
    lastTreeData = rootTree;

    return { move: bestMove, score: bestScore, tree: rootTree };
}

// Jalankan minimax murni hanya untuk hitung node (tanpa pengaruh ke keputusan)
function runMinimaxForCounter(b, depth, moves) {
    minimaxNodeCount = 0;
    for (const move of moves) {
        const newBoard = applyMove(b, move);
        minimax(newBoard, depth - 1, false);
    }
    minimaxNodeCount += moves.length; // root nodes
}

// Jalankan alpha-beta hanya untuk hitung node (tanpa pengaruh ke keputusan)
function runAlphaBetaForCounter(b, depth, moves) {
    alphabetaNodeCount = 0;
    let alpha = -Infinity;
    const beta = Infinity;
    for (const move of moves) {
        const newBoard = applyMove(b, move);
        const score = alphabeta(newBoard, depth - 1, alpha, beta, false);
        alpha = Math.max(alpha, score);
    }
    alphabetaNodeCount += moves.length; // root nodes
}