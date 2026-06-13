// ui.js - Integrasi logika game dengan tampilan

// State permainan
let currentPlayer = RED; // Merah jalan duluan
let gameOver = false;
let isAnimating = false;
let gameStarted = false;

// ===== Inisialisasi =====
document.addEventListener("DOMContentLoaded", () => {
    initBoard();

    // Hanya jalankan logika game jika halaman ini punya board
    if (document.getElementById("checkerboard")) {
        renderBoard();
        setupWelcomeOverlay();
        setupTreeModal();
        setupControls();
        updateStatus();
    }

    setupThemeToggle();
});

// ===== Theme Toggle =====
function setupThemeToggle() {
    const html = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    if (!themeToggle) return;

    const savedTheme = localStorage_safe("theme") || "dark";
    html.setAttribute("data-theme", savedTheme);
    themeIcon.innerHTML = savedTheme === "dark" ? "&#9790;" : "&#9728;";

    themeToggle.addEventListener("click", () => {
        const current = html.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", next);
        themeIcon.innerHTML = next === "dark" ? "&#9790;" : "&#9728;";
        localStorage_safe("theme", next);

        if (typeof lastTreeData !== "undefined" && lastTreeData) {
            renderGameTree(lastTreeData);
        }
    });
}

// Wrapper localStorage agar tidak error jika tidak tersedia
function localStorage_safe(key, value) {
    try {
        if (value === undefined) return localStorage.getItem(key);
        localStorage.setItem(key, value);
        return null;
    } catch (e) {
        return null;
    }
}

// Setup modal game tree full-screen
function setupTreeModal() {
    const container = document.getElementById("gameTreeContainer");
    const modal = document.getElementById("treeModal");
    const closeBtn = document.getElementById("closeTreeModal");

    if (!container || !modal || !closeBtn) return;

    container.addEventListener("click", () => {
        if (!lastTreeData) return;
        modal.classList.remove("hidden");
        renderGameTreeLarge(lastTreeData);
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
    });
}

// ===== Welcome Overlay =====
function setupWelcomeOverlay() {
    const overlay = document.getElementById("welcomeOverlay");
    if (!overlay) return;

    const startBtn = document.getElementById("startGameBtn");
    const changeModeBtn = document.getElementById("changeModeBtn");

    startBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="gameModeStart"]:checked');
        const mode = selected ? selected.value : "hvsai";

        setGameMode(mode);
        updateActiveModeDisplay(mode);

        overlay.classList.add("hidden");
        gameStarted = true;

        resetGame();
    });

    changeModeBtn.addEventListener("click", () => {
        overlay.classList.remove("hidden");

        // Set radio sesuai mode aktif saat ini
        const radios = document.querySelectorAll('input[name="gameModeStart"]');
        radios.forEach(r => {
            r.checked = (r.value === currentGameMode);
        });
    });
}

// Update teks mode aktif di sidebar
function updateActiveModeDisplay(mode) {
    const text = document.getElementById("activeModeText");
    if (text) {
        text.textContent = mode === "hvsai" ? "Human vs AI" : "Human vs Human";
    }
}

// ===== Setup Controls =====
function setupControls() {
    const algoToggle = document.getElementById("algorithmToggle");
    if (!algoToggle) return;

    // Toggle algoritma
    algoToggle.addEventListener("change", () => {
        // Dibaca saat AI bergerak, tidak perlu aksi langsung
    });

    // Depth slider
    const depthSlider = document.getElementById("depthSlider");
    const depthValue = document.getElementById("depthValue");
    depthSlider.addEventListener("input", () => {
        depthValue.textContent = depthSlider.value;
    });

    // Reset button
    document.getElementById("resetBtn").addEventListener("click", resetGame);

    // Banner play again button
    document.getElementById("bannerPlayAgainBtn").addEventListener("click", resetGame);
}

// ===== Reset Game =====
function resetGame() {
    initBoard();
    currentPlayer = RED;
    gameOver = false;
    isAnimating = false;
    clearSelection();

    document.getElementById("minimaxCount").textContent = "0";
    document.getElementById("alphabetaCount").textContent = "0";
    document.getElementById("prunePercent").textContent = "0%";
    document.getElementById("statusMessage").textContent = "";

    hideStatusBanner();

    const canvas = document.getElementById("gameTreeCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastTreeData = null;

    updateAISettingsVisibility();
    updateAICardsPlaceholder();
    updateStatus();
    renderBoard();
}

// Tampilkan/sembunyikan pengaturan AI sesuai mode
function updateAISettingsVisibility() {
    const aiSettingsCard = document.getElementById("aiSettingsCard");
    if (currentGameMode === "hvsh") {
        aiSettingsCard.classList.add("disabled");
    } else {
        aiSettingsCard.classList.remove("disabled");
    }
}

// Tampilkan placeholder pada card Statistik Node dan Game Tree jika Human vs Human
function updateAICardsPlaceholder() {
    const statsContent = document.getElementById("statsCardContent");
    const treeContent = document.getElementById("treeCardContent");
    const statsPlaceholder = document.getElementById("statsPlaceholder");
    const treePlaceholder = document.getElementById("treePlaceholder");

    if (currentGameMode === "hvsh") {
        statsContent.classList.add("hidden");
        treeContent.classList.add("hidden");
        statsPlaceholder.classList.remove("hidden");
        treePlaceholder.classList.remove("hidden");
    } else {
        statsContent.classList.remove("hidden");
        treeContent.classList.remove("hidden");
        statsPlaceholder.classList.add("hidden");
        treePlaceholder.classList.add("hidden");
    }
}

// ===== Klik pada sel papan =====
function onCellClick(row, col) {
    if (!gameStarted || gameOver || isAnimating) return;
    if (isAITurn(currentPlayer)) return;

    const piece = board[row][col];

    // Jika klik piece milik pemain saat ini
    if (isPlayerPiece(piece, currentPlayer)) {
        selectedCell = { row, col };
        validMoves = getMovesFromCell(row, col, currentPlayer);
        renderBoard();
        return;
    }

    // Jika klik tujuan yang valid
    if (selectedCell) {
        const move = validMoves.find(m => m.toRow === row && m.toCol === col);
        if (move) {
            executeMove(move);
            return;
        }

        // Klik di tempat lain: batalkan seleksi
        clearSelection();
    }
}

// Ambil moves untuk satu sel spesifik dari semua moves valid pemain
function getMovesFromCell(row, col, player) {
    const allMoves = getAllMoves(board, player);
    return allMoves.filter(m => m.fromRow === row && m.fromCol === col);
}

// ===== Eksekusi Move =====
function executeMove(move) {
    board = applyMove(board, move);
    clearSelection();
    switchTurn();
}

// ===== Ganti Giliran =====
function switchTurn() {
    const winner = checkGameOver(board);
    if (winner !== null) {
        endGame(winner);
        return;
    }

    currentPlayer = currentPlayer === RED ? WHITE : RED;
    updateStatus();
    renderBoard();

    // Jika giliran AI, jalankan dengan delay agar UI sempat update
    if (isAITurn(currentPlayer)) {
        setTimeout(runAIMove, 400);
    }
}

// ===== Giliran AI =====
function runAIMove() {
    if (gameOver) return;

    const depth = parseInt(document.getElementById("depthSlider").value);
    const useAlphaBeta = document.getElementById("algorithmToggle").checked;

    isAnimating = true;
    document.getElementById("statusMessage").textContent = "AI sedang berpikir...";

    setTimeout(() => {
        const result = getBestMove(board, depth, useAlphaBeta);

        if (!result || !result.move) {
            isAnimating = false;
            document.getElementById("statusMessage").textContent = "";
            endGame(RED);
            return;
        }

        animateAIMove(result.move, () => {
            board = applyMove(board, result.move);
            updateNodeCounters();
            renderGameTree(result.tree);

            isAnimating = false;
            document.getElementById("statusMessage").textContent = "";
            currentPlayer = RED;
            updateStatus();
            renderBoard();

            const winner = checkGameOver(board);
            if (winner !== null) endGame(winner);
        });
    }, 300);
}

// Animasi sederhana: highlight sel asal dan tujuan sebelum move diterapkan
function animateAIMove(move, callback) {
    renderBoard();

    const boardEl = document.getElementById("checkerboard");
    const fromIndex = move.fromRow * 8 + move.fromCol;
    const toIndex = move.toRow * 8 + move.toCol;

    const fromCell = boardEl.children[fromIndex];
    const toCell = boardEl.children[toIndex];

    if (fromCell) fromCell.classList.add("selected");
    if (toCell) toCell.classList.add("highlight-capture");

    setTimeout(() => {
        callback();
    }, 350);
}

// ===== Update Counter Node =====
function updateNodeCounters() {
    document.getElementById("minimaxCount").textContent = minimaxNodeCount;
    document.getElementById("alphabetaCount").textContent = alphabetaNodeCount;

    let prunePercent = 0;
    if (minimaxNodeCount > 0) {
        prunePercent = ((minimaxNodeCount - alphabetaNodeCount) / minimaxNodeCount) * 100;
        prunePercent = Math.max(0, prunePercent);
    }

    document.getElementById("prunePercent").textContent = prunePercent.toFixed(1) + "%";
}

// ===== Update Status Tampilan =====
function updateStatus() {
    const turnDot = document.getElementById("turnIndicator").querySelector(".turn-dot");
    const turnText = document.getElementById("turnText");

    if (currentPlayer === RED) {
        turnDot.className = "turn-dot red";
        turnText.textContent = "Giliran: Merah";
    } else {
        turnDot.className = "turn-dot white";
        turnText.textContent = currentGameMode === "hvsh" ? "Giliran: Putih" : "Giliran: AI (Putih)";
    }
}

// ===== Status Banner =====
function showStatusBanner(message, isSuccess) {
    const banner = document.getElementById("statusBanner");
    const text = document.getElementById("bannerText");

    text.textContent = message;
    banner.classList.remove("hidden");

    if (isSuccess) {
        banner.classList.add("success");
    } else {
        banner.classList.remove("success");
    }
}

function hideStatusBanner() {
    document.getElementById("statusBanner").classList.add("hidden");
}

// ===== Akhiri Permainan =====
function endGame(winner) {
    gameOver = true;
    let message = "";

    if (winner === RED) {
        message = currentGameMode === "hvsh"
            ? "Permainan selesai - Merah menang!"
            : "Permainan selesai - Anda (Merah) menang!";
    } else if (winner === WHITE) {
        message = currentGameMode === "hvsh"
            ? "Permainan selesai - Putih menang!"
            : "Permainan selesai - AI menang!";
    } else {
        message = "Permainan seri.";
    }

    document.getElementById("statusMessage").textContent = message;
    showStatusBanner(message, winner === RED);
}