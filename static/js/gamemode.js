// gamemode.js - Pengaturan mode permainan (Human vs AI / Human vs Human)

let currentGameMode = "hvsai"; // "hvsai" atau "hvsh"

// Set mode permainan dan update tampilan terkait
function setGameMode(mode) {
    currentGameMode = mode;

    const aiSettingsCard = document.getElementById("aiSettingsCard");

    if (mode === "hvsh") {
        aiSettingsCard.style.opacity = "0.4";
        aiSettingsCard.style.pointerEvents = "none";
    } else {
        aiSettingsCard.style.opacity = "1";
        aiSettingsCard.style.pointerEvents = "auto";
    }
}

// Cek apakah giliran saat ini harus dijalankan oleh AI
function isAITurn(currentPlayer) {
    if (currentGameMode === "hvsh") return false;
    return currentPlayer === WHITE; // AI selalu memegang putih
}