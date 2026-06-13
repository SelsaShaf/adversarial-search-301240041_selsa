// gametree.js - Visualisasi game tree pada canvas

const MAX_TREE_DEPTH = 3;

// Render game tree ke canvas berdasarkan data dari minimax.js
function renderGameTree(treeData) {
    const canvas = document.getElementById("gameTreeCanvas");
    const container = document.getElementById("gameTreeContainer");
    if (!treeData) return;

    const ctx = canvas.getContext("2d");

    // Hitung dimensi canvas berdasarkan jumlah node tiap level
    const levels = buildLevels(treeData, MAX_TREE_DEPTH);

    // Jika tree tidak punya children sama sekali, tampilkan pesan kosong
    if (levels.length <= 1) {
        canvas.width = container.clientWidth || 300;
        canvas.height = 100;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedColor("--text-secondary");
        ctx.font = "12px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText("Tidak ada data tree untuk ditampilkan", canvas.width / 2, canvas.height / 2);
        return;
    }

    const maxNodesInLevel = Math.max(...levels.map(l => l.length), 1);

    const nodeRadius = 16;
    const nodeSpacingX = 70;
    const nodeSpacingY = 80;

    // Fallback width jika container belum memiliki ukuran saat render pertama
    const containerWidth = container.clientWidth || 300;

    canvas.width = Math.max(containerWidth, maxNodesInLevel * nodeSpacingX + 40);
    canvas.height = levels.length * nodeSpacingY + 40;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Hitung posisi setiap node
    const positions = computePositions(levels, canvas.width, nodeSpacingY);

    // Gambar garis penghubung dulu
    drawConnections(ctx, levels, positions);

    // Gambar node
    drawNodes(ctx, levels, positions, nodeRadius);
}

// Bangun array per level dari tree (BFS), batasi sampai maxDepth
function buildLevels(root, maxDepth) {
    const levels = [];
    let currentLevel = [{ node: root, parentId: null, id: "root" }];
    let depth = 0;

    while (currentLevel.length > 0 && depth <= maxDepth) {
        levels.push(currentLevel);
        const nextLevel = [];

        currentLevel.forEach(item => {
            (item.node.children || []).forEach((child, idx) => {
                nextLevel.push({
                    node: child,
                    parentId: item.id,
                    id: `${item.id}-${idx}`
                });
            });
        });

        currentLevel = nextLevel;
        depth++;
    }

    return levels;
}

// Render game tree versi besar untuk modal
function renderGameTreeLarge(treeData) {
    const canvas = document.getElementById("gameTreeCanvasLarge");
    const container = document.getElementById("gameTreeContainerLarge");
    if (!treeData) return;

    const ctx = canvas.getContext("2d");
    const levels = buildLevels(treeData, MAX_TREE_DEPTH);

    const maxNodesInLevel = Math.max(...levels.map(l => l.length), 1);

    const nodeRadius = 28;
    const nodeSpacingX = 130;
    const nodeSpacingY = 160;

    const containerWidth = container.clientWidth || 800;

    canvas.width = Math.max(containerWidth, maxNodesInLevel * nodeSpacingX + 80);
    canvas.height = levels.length * nodeSpacingY + 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positions = computePositions(levels, canvas.width, nodeSpacingY);

    drawConnections(ctx, levels, positions);
    drawNodesLarge(ctx, levels, positions, nodeRadius);
}

// Gambar node versi besar dengan font lebih besar
function drawNodesLarge(ctx, levels, positions, radius) {
    const accentColor = getComputedColor("--accent");
    const cardColor = getComputedColor("--bg-card");
    const textColor = getComputedColor("--text-primary");
    const prunedColor = "#555555";

    levels.forEach(level => {
        level.forEach(item => {
            const pos = positions[item.id];
            if (!pos) return;

            const isPruned = item.node.pruned;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isPruned ? prunedColor : cardColor;
            ctx.fill();
            ctx.strokeStyle = isPruned ? prunedColor : accentColor;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            if (!isPruned && item.node.score !== null && item.node.score !== undefined) {
                ctx.fillStyle = textColor;
                ctx.font = "16px Segoe UI";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const displayScore = Math.round(item.node.score);
                ctx.fillText(displayScore, pos.x, pos.y);
            }
        });
    });
}

// Hitung posisi x,y setiap node
function computePositions(levels, canvasWidth, spacingY) {
    const positions = {};

    levels.forEach((level, depth) => {
        const count = level.length;
        const gap = canvasWidth / (count + 1);

        level.forEach((item, idx) => {
            positions[item.id] = {
                x: gap * (idx + 1),
                y: depth * spacingY + 30
            };
        });
    });

    return positions;
}

// Gambar garis penghubung antar node
function drawConnections(ctx, levels, positions) {
    ctx.strokeStyle = getComputedColor("--border");
    ctx.lineWidth = 1.5;

    levels.forEach(level => {
        level.forEach(item => {
            if (item.parentId === null) return;
            const parentPos = positions[item.parentId];
            const childPos = positions[item.id];
            if (!parentPos || !childPos) return;

            ctx.beginPath();
            ctx.moveTo(parentPos.x, parentPos.y);
            ctx.lineTo(childPos.x, childPos.y);
            ctx.stroke();
        });
    });
}

// Gambar node beserta nilai skor
function drawNodes(ctx, levels, positions, radius) {
    const accentColor = getComputedColor("--accent");
    const cardColor = getComputedColor("--bg-card");
    const textColor = getComputedColor("--text-primary");
    const prunedColor = "#555555";

    levels.forEach(level => {
        level.forEach(item => {
            const pos = positions[item.id];
            if (!pos) return;

            const isPruned = item.node.pruned;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = isPruned ? prunedColor : cardColor;
            ctx.fill();
            ctx.strokeStyle = isPruned ? prunedColor : accentColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            if (!isPruned && item.node.score !== null && item.node.score !== undefined) {
                ctx.fillStyle = textColor;
                ctx.font = "10px Segoe UI";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const displayScore = Math.round(item.node.score);
                ctx.fillText(displayScore, pos.x, pos.y);
            }
        });
    });
}

// Ambil nilai CSS variable yang sedang aktif, dengan fallback jika kosong
function getComputedColor(varName) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (value) return value;

    // Fallback warna default jika variable belum terbaca
    const fallbacks = {
        "--border": "#333333",
        "--accent": "#c0392b",
        "--bg-card": "#222222",
        "--text-primary": "#f0f0f0",
        "--text-secondary": "#a0a0a0"
    };
    return fallbacks[varName] || "#888888";
}