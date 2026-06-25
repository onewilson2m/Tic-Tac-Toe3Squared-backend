const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.json());

// CORS — open to all origins for multi-site distribution
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// -------------------------
// SEGMENT ARRAYS
// -------------------------

const NUMBER_SEGMENTS = [
    { id: "1",  label: "1",  color: "#9ecbff" },
    { id: "2",  label: "2",  color: "#7fb3ff" },
    { id: "3",  label: "3",  color: "#9ecbff" },
    { id: "4",  label: "4",  color: "#7fb3ff" },
    { id: "5",  label: "5",  color: "#9ecbff" },
    { id: "6",  label: "6",  color: "#7fb3ff" },
    { id: "7",  label: "7",  color: "#9ecbff" },
    { id: "8",  label: "8",  color: "#7fb3ff" },
    { id: "9",  label: "9",  color: "#9ecbff" },
    { id: "10", label: "10", color: "#7fb3ff" },
    { id: "11", label: "11", color: "#9ecbff" },
    { id: "12", label: "12", color: "#7fb3ff" },
    { id: "13", label: "13", color: "#9ecbff" },
    { id: "14", label: "14", color: "#7fb3ff" },
    { id: "15", label: "15", color: "#9ecbff" },
    { id: "16", label: "16", color: "#7fb3ff" }
];

const SPINNER_SEGMENTS_MAIN = [
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "LOSE_TURN", label: "ACTION_LOSE_TURN",        color: "#f4a3a3" },
    { id: "PLACE_2",   label: "ACTION_PLACE_2",          color: "#a8e6a1" },
    { id: "LOSE_TURN", label: "ACTION_LOSE_TURN",        color: "#f4a3a3" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "REMOVE_1",  label: "ACTION_REMOVE_1",         color: "#9ecbff" },
    { id: "REPLACE_1", label: "ACTION_REPLACE_1",        color: "#7fb3ff" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "MYSTERY",   label: "ACTION_MYSTERY",          color: "#5cb85c" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",          color: "#ffe066" },
    { id: "REMOVE_1",  label: "ACTION_REMOVE_1",         color: "#9ecbff" },
    { id: "REPLACE_1", label: "ACTION_REPLACE_1",        color: "#7fb3ff" }
];

const SPINNER_SEGMENTS_BEGINNING = [
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "LOSE_TURN", label: "ACTION_LOSE_TURN", color: "#f4a3a3" },
    { id: "PLACE_2",   label: "ACTION_PLACE_2",  color: "#a8e6a1" },
    { id: "LOSE_TURN", label: "ACTION_LOSE_TURN", color: "#f4a3a3" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "LOSE_TURN", label: "ACTION_LOSE_TURN", color: "#f4a3a3" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" },
    { id: "PLACE_1",   label: "ACTION_PLACE_1",  color: "#ffe066" }
];

// Mystery options - drawn in shuffled order, reshuffle when exhausted
const MYSTERY_OPTIONS = [
    { id: "MYSTERY_PLACE_2",       label: "ACTION_PLACE_2",             color: "#5cb85c" },
    { id: "MYSTERY_PLACE_SPIN",    label: "ACTION_MYSTERY_PLACE_SPIN",  color: "#5cb85c" },
    { id: "MYSTERY_SWAP",          label: "ACTION_MYSTERY_SWAP",        color: "#5cb85c" },
    { id: "MYSTERY_PLACE_WILD",    label: "ACTION_MYSTERY_PLACE_WILD",  color: "#5cb85c" },
    { id: "MYSTERY_REPLACE_WILD",  label: "ACTION_MYSTERY_REPLACE_WILD",color: "#5cb85c" }
];

// -------------------------
// ROOM MAP
// -------------------------

// rooms: Map<roomId, { game: GameState, players: string[] }>
const rooms = new Map();

// -------------------------
// ROOM ID GENERATION
// -------------------------

function generateRoomId() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O, 0, I, 1 (ambiguous)
    let id;
    do {
        id = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } while (rooms.has(id));
    return id;
}

// -------------------------
// GAME STATE FACTORY
// -------------------------

function createGameState() {
    return {
        players: [],
        numbers: {},
        symbols: {},
        playerNames: {}, // socketId -> username, for reconnect identification
        preGameNumbers: {},
        turnNumber: 1,
        turnSocket: null,

        // Track last moves PER PLAYER
        lastMoves: {
            // Populated like: { socketId: { row: 0, col: 1, count: 2 } }
        },

        spinnerAngle: 45,
        gameOver: false,
        rematchRequests: [],

        // Mystery system
        mysteryQueue: [],
        mysteryIndex: 0,
        isMysteryTurn: false,
        isCurrentlyRespinning: false,

        masterGrid: [
            [ Array(9).fill("EMPTY"), Array(9).fill("EMPTY"), Array(9).fill("EMPTY") ],
            [ Array(9).fill("EMPTY"), Array(9).fill("EMPTY"), Array(9).fill("EMPTY") ],
            [ Array(9).fill("EMPTY"), Array(9).fill("EMPTY"), Array(9).fill("EMPTY") ]
        ],

        masterStatus: [
            ["EMPTY", "EMPTY", "EMPTY"],
            ["EMPTY", "EMPTY", "EMPTY"],
            ["EMPTY", "EMPTY", "EMPTY"]
        ],

        currentSpinResult: null,
        movesRemainingThisTurn: 0,

        // Cooldowns — keyed by socketId, populated when players join
        place2Cooldown:   {},
        loseTurnCooldown: {},
        mysteryCooldown:  {},
        removeCooldown:   {},
        replaceCooldown:  {}
    };
}

// -------------------------
// MYSTERY QUEUE HELPERS
// -------------------------

function initializeMysteryQueue(game) {
    game.mysteryQueue = shuffleArray([...MYSTERY_OPTIONS]);
    game.mysteryIndex = 0;
}

function getNextMystery(game) {
    if (game.mysteryIndex >= game.mysteryQueue.length) {
        initializeMysteryQueue(game);
    }
    const mystery = game.mysteryQueue[game.mysteryIndex];
    game.mysteryIndex++;
    return mystery;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// -------------------------
// ROOM LOOKUP HELPERS
// -------------------------

// Find which room a socket is in (returns roomId or null)
function getRoomIdForSocket(socketId) {
    for (const [roomId, room] of rooms) {
        if (room.game.players.includes(socketId)) {
            return roomId;
        }
    }
    return null;
}

// -------------------------
// HTTP ROUTES — Room management
// -------------------------

// Create a new room (public or private)
app.post("/create-room", (req, res) => {
    const isPublic = req.body?.isPublic === true;
    const platform = req.body?.platform || "open";
    const roomId = generateRoomId();
    rooms.set(roomId, { game: createGameState(), isPublic, pendingClaim: false, createdAt: Date.now(), platform });
    console.log(`Room created: ${roomId} (${isPublic ? "public" : "private"}, platform: ${platform})`);
    res.json({ roomId });
});

// Join or create a public room
app.post("/join-public", (req, res) => {
    const platform = req.body?.platform || "open";

    // Find an existing public room with exactly 1 player waiting that isn't being claimed
    for (const [roomId, room] of rooms) {
        if (
            room.isPublic &&
            room.game.players.length === 1 &&
            !room.pendingClaim &&
            !room.game.gameOver
        ) {
            room.pendingClaim = true; // Reserve this room atomically
            console.log(`Public room found: ${roomId} (platform: ${platform})`);
            // Release the claim flag after a short window — in case the joiner never connects
            setTimeout(() => { if (room) room.pendingClaim = false; }, 10000);
            return res.json({ roomId });
        }
    }
    // None found — create a new public room for this platform
    const roomId = generateRoomId();
    rooms.set(roomId, { game: createGameState(), isPublic: true, pendingClaim: false, createdAt: Date.now(), platform });
    console.log(`No public room found, created new: ${roomId} (platform: ${platform})`);
    res.json({ roomId });
});

// Check if a room exists and has space
app.get("/check-room/:roomId", (req, res) => {
    const roomId = req.params.roomId.toUpperCase();
    const room = rooms.get(roomId);
    if (!room) {
        return res.json({ status: "not_found" });
    }
    if (room.game.players.length >= 2) {
        return res.json({ status: "full" });
    }
    res.json({ status: "ok" });
});

// List open public rooms (1 player waiting, created within last 5 minutes)
app.get("/public-rooms", (req, res) => {
    const STALE_MS = 5 * 60 * 1000;
    const now = Date.now();
    const open = [];

    for (const [roomId, room] of rooms) {
        if (
            room.isPublic &&
            room.game.players.length === 1 &&
            !room.game.gameOver &&
            (now - (room.createdAt || 0)) < STALE_MS
        ) {
            const waitingSocketId = room.game.players[0];
            const displayName = room.game.playerNames[waitingSocketId] || `Guest_${roomId}`;
            open.push({ roomId, displayName, createdAt: room.createdAt });
        }
    }

    open.sort((a, b) => a.createdAt - b.createdAt);
    res.json({ rooms: open });
});

// -------------------------
// CONNECTION HANDLER
// -------------------------

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // -------------------------
    // JOIN ROOM
    // -------------------------

    socket.on("join-room", ({ roomId, username }) => {
        const id = roomId.toUpperCase();
        const room = rooms.get(id);

        if (!room) {
            socket.emit("room-error", { reason: "ROOM_NOT_FOUND" });
            return;
        }

        const { game } = room;

        // Allow re-join if socket is already in the room (same socket ID)
        const alreadyIn = game.players.includes(socket.id);

        if (!alreadyIn && game.players.length >= 2) {
            // Room is full — check if this is a reconnecting player by username
            const oldSocketId = Object.keys(game.playerNames).find(
                sid => game.playerNames[sid] === username
            );

            if (oldSocketId) {
                // Legitimate reconnect — swap old socket ID for new one
                console.log(`[${id}] Reconnect: ${username} replacing socket ${oldSocketId} with ${socket.id}`);

                // Update players array
                const idx = game.players.indexOf(oldSocketId);
                if (idx !== -1) game.players[idx] = socket.id;

                // Update symbols map
                if (game.symbols[oldSocketId]) {
                    game.symbols[socket.id] = game.symbols[oldSocketId];
                    delete game.symbols[oldSocketId];
                }

                // Update turn socket if needed
                if (game.turnSocket === oldSocketId) game.turnSocket = socket.id;

                // Update lastMoves if needed
                if (game.lastMoves[oldSocketId]) {
                    game.lastMoves[socket.id] = game.lastMoves[oldSocketId];
                    delete game.lastMoves[oldSocketId];
                }

                // Update playerNames
                game.playerNames[socket.id] = username;
                delete game.playerNames[oldSocketId];

                socket.join(id);
                console.log(`[${id}] Reconnect successful for ${username}`);

                // Re-send current game state to reconnected player
                const opponentSocketId = game.players.find(p => p !== socket.id);
                const opponentName = opponentSocketId ? (game.playerNames[opponentSocketId] || "Opponent") : "Opponent";
                socket.emit("reconnect-state", {
                    symbol:       game.symbols[socket.id],
                    isMyTurn:     game.turnSocket === socket.id,
                    gameOver:     game.gameOver,
                    yourName:     username,
                    opponentName: opponentName
                });
                return;
            }

            socket.emit("room-error", { reason: "ROOM_FULL" });
            return;
        }

        // Join the Socket.io room and add to game state
        socket.join(id);
        if (!alreadyIn) {
            game.players.push(socket.id);
            if (username) game.playerNames[socket.id] = username;
            game.place2Cooldown[socket.id]   = 0;
            game.loseTurnCooldown[socket.id] = 0;
            game.mysteryCooldown[socket.id]  = 0;
            game.removeCooldown[socket.id]   = 0;
            game.replaceCooldown[socket.id]  = 0;
        }

        // Clear pending claim once second player actually connects
        if (room.game.players.length === 2) room.pendingClaim = false;

        console.log(`Socket ${socket.id} joined room ${id}. Players: ${room.game.players.length}`);

        if (room.game.players.length === 1) {
            socket.emit("waiting-for-opponent");
        }

        if (room.game.players.length === 2) {
            const [playerA, playerB] = room.game.players;

            io.to(playerA).emit("pre-game-init", {
                numberSegments: NUMBER_SEGMENTS,
                beginningSegments: SPINNER_SEGMENTS_BEGINNING,
                mainSegments: SPINNER_SEGMENTS_MAIN
            });

            io.to(playerB).emit("pre-game-init", {
                numberSegments: NUMBER_SEGMENTS,
                beginningSegments: SPINNER_SEGMENTS_BEGINNING,
                mainSegments: SPINNER_SEGMENTS_MAIN
            });

            io.to(id).emit("pre-game-spin", { yourTurn: true });
        }
    });

    // -------------------------
    // PRE-GAME SPIN
    // -------------------------

    socket.on("pre-game-spin-result", ({ number }) => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const { game } = rooms.get(roomId);

        game.preGameNumbers[socket.id] = number;

        if (Object.keys(game.preGameNumbers).length < 2) return;

        const [playerA, playerB] = game.players;
        const numA = game.preGameNumbers[playerA];
        const numB = game.preGameNumbers[playerB];

        io.to(roomId).emit("both-numbers-known", {
            aId: playerA,
            bId: playerB,
            numA,
            numB
        });

        const nA = Number(numA);
        const nB = Number(numB);

        let winner, loser;
        if (nA > nB) {
            winner = playerA;
            loser  = playerB;
        } else if (nB > nA) {
            winner = playerB;
            loser  = playerA;
        } else {
            game.preGameNumbers = {};
            io.to(roomId).emit("pre-game-tie");
            setTimeout(() => {
                io.to(roomId).emit("pre-game-spin", { yourTurn: true });
            }, 2000);
            return;
        }

        setTimeout(() => {
            game.symbols[winner] = "X";
            game.symbols[loser]  = "O";

            const winnerName = game.playerNames[winner] || "Player 1";
            const loserName  = game.playerNames[loser]  || "Player 2";

            io.to(winner).emit("symbol-assigned", {
                youAre: "X", opponentIs: "O",
                yourName: winnerName, opponentName: loserName
            });
            io.to(loser).emit("symbol-assigned", {
                youAre: "O", opponentIs: "X",
                yourName: loserName, opponentName: winnerName
            });
        }, 2000);

        setTimeout(() => {
            game.turnNumber  = 1;
            game.turnSocket  = winner; // X goes first

            io.to(roomId).emit("turn-changed", {
                nextTurn:    game.turnSocket,
                turnNumber:  game.turnNumber
            });

            game.preGameNumbers = {};
        }, 3500);
    });

    // -------------------------
    // MAIN GAME MOVE HANDLER
    // -------------------------

    socket.on("attempt-move", ({ masterRow, masterCol, cellIndex }) => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const { game } = rooms.get(roomId);

        if (game.gameOver) return;

        if (socket.id !== game.turnSocket) {
            socket.emit("move-rejected", { reason: "REJECT_NOT_YOUR_TURN" });
            return;
        }

        const action = game.currentSpinResult?.id;
        if (!action) {
            socket.emit("move-rejected", { reason: "REJECT_SPIN_REQUIRED" });
            return;
        }

        if (!isSubGridPlayable(game, masterRow, masterCol)) {
            socket.emit("move-rejected", { reason: "REJECT_SUBGRID" });
            return;
        }

        const cellValue    = game.masterGrid[masterRow][masterCol][cellIndex];
        const playerSymbol = game.symbols[socket.id];

        console.log(`[${roomId}] Cell[${masterRow},${masterCol},${cellIndex}] = "${cellValue}", Player = "${playerSymbol}", Action = "${action}"`);

        if (["PLACE_1","PLACE_2","MYSTERY_PLACE_2","MYSTERY_PLACE_SPIN","MYSTERY_PLACE_WILD"].includes(action)) {
            if (cellValue !== "EMPTY") {
                socket.emit("move-rejected", { reason: "REJECT_CELL_NOT_EMPTY" });
                return;
            }
        }

        if (["REMOVE_1","REPLACE_1","MYSTERY_REPLACE_WILD"].includes(action)) {
            if (!isOpponentTile(game, cellValue, playerSymbol)) {
                socket.emit("move-rejected", { reason: "REJECT_NOT_OPPONENT" });
                return;
            }
        }

        // Consecutive-move rule (suspended on mystery turns)
        if (!game.isMysteryTurn && !canActInSubGrid(game, masterRow, masterCol, socket.id)) {
            socket.emit("move-rejected", { reason: "REJECT_CONSECUTIVE" });
            return;
        }

        // ✅ MOVE IS LEGAL — APPLY IT
        applyMove(game, action, playerSymbol, masterRow, masterCol, cellIndex);
        updateConsecutiveMoveTracker(game, masterRow, masterCol, socket.id);

        // Check sub-grid win
        const subWinner = checkSubGridWin(game, masterRow, masterCol);
        if (subWinner && game.masterStatus[masterRow][masterCol] === "EMPTY") {
            game.masterStatus[masterRow][masterCol] = subWinner;
            io.to(roomId).emit("subgrid-won", { masterRow, masterCol, winner: subWinner });
        }

        // Check master grid win
        const masterWinResult = checkMasterGridWin(game);
        if (masterWinResult) {
            game.gameOver = true;
            if (masterWinResult.winner === "DRAW") {
                // Simultaneous win (e.g. Wild sub-grid completes lines for both)
                io.to(roomId).emit("game-draw");
            } else {
                io.to(roomId).emit("game-over", {
                    winner:      masterWinResult.winner,
                    winningLine: masterWinResult.line
                });
            }
            return;
        }

        // Check for draw
        if (checkForDraw(game)) {
            game.gameOver = true;
            io.to(roomId).emit("game-draw");
            return;
        }

        game.movesRemainingThisTurn--;

        // PLACE_2 / MYSTERY_PLACE_2: check if second move is possible
        if ((action === "PLACE_2" || action === "MYSTERY_PLACE_2") && game.movesRemainingThisTurn === 1) {
            const hasSecondMove = checkForValidTargets(game, playerSymbol, action === "MYSTERY_PLACE_2" ? "MYSTERY_PLACE_2" : "PLACE_1");
            if (!hasSecondMove) {
                game.movesRemainingThisTurn = 0;

                // Must emit move-applied BEFORE returning so opponent board stays in sync
                io.to(roomId).emit("move-applied", {
                    masterRow,
                    masterCol,
                    cellIndex,
                    newValue: playerSymbol,
                    movesRemaining: 0,
                    masterStatus: game.masterStatus
                });

                io.to(socket.id).emit("highlight-action-box", { duration: 2000 });
                io.to(socket.id).emit("no-second-move", { message: "NO_SECOND_MOVE" });
                setTimeout(() => { endTurn(game, roomId); }, 2500);
                return;
            }

            // Calculate blocked grid for second move
            let blockedGridForSecondMove = null;
            const playerLastMove = game.lastMoves[socket.id];
            if (playerLastMove && playerLastMove.count >= 2 && countOpenSubGrids(game) > 1 && countTotalEmptyCells(game) > 4) {
                let playableCount = 0;
                for (let r = 0; r < 3; r++)
                    for (let c = 0; c < 3; c++)
                        if (game.masterStatus[r][c] === "EMPTY") playableCount++;
                if (playableCount > 1) {
                    blockedGridForSecondMove = { row: playerLastMove.row, col: playerLastMove.col };
                }
            }
            io.to(socket.id).emit("update-blocked-grid", { blockedGrid: blockedGridForSecondMove });
        }

        // Determine value to send to client
        let newValue;
        if (action === "REMOVE_1") {
            newValue = "EMPTY";
        } else if (action === "MYSTERY_PLACE_WILD" || action === "MYSTERY_REPLACE_WILD") {
            newValue = "W";
        } else {
            newValue = playerSymbol;
        }

        io.to(roomId).emit("move-applied", {
            masterRow,
            masterCol,
            cellIndex,
            newValue,
            movesRemaining: game.movesRemainingThisTurn,
            masterStatus:   game.masterStatus
        });

        // MYSTERY_PLACE_SPIN: trigger another spin
        if (action === "MYSTERY_PLACE_SPIN" && game.movesRemainingThisTurn <= 0) {
            if (game.lastMoves[socket.id]) {
                game.lastMoves[socket.id].count = 0;
            }
            setTimeout(() => {
                io.to(socket.id).emit("trigger-mystery-spin-again");
            }, 1000);
            return;
        }

        if (game.movesRemainingThisTurn <= 0) {
            setTimeout(() => { endTurn(game, roomId); }, 500);
        }
    });

    // -------------------------
    // SWAP HANDLER
    // -------------------------

    socket.on("attempt-swap", ({ cell1, cell2 }) => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const { game } = rooms.get(roomId);

        if (game.gameOver) return;

        if (socket.id !== game.turnSocket) {
            socket.emit("move-rejected", { reason: "REJECT_NOT_YOUR_TURN" });
            return;
        }

        const action = game.currentSpinResult?.id;
        if (action !== "MYSTERY_SWAP") {
            socket.emit("move-rejected", { reason: "REJECT_NOT_SWAP" });
            return;
        }

        const { masterRow: r1, masterCol: c1, cellIndex: i1 } = cell1;
        const { masterRow: r2, masterCol: c2, cellIndex: i2 } = cell2;

        const val1 = game.masterGrid[r1][c1][i1];
        const val2 = game.masterGrid[r2][c2][i2];

        if (!((val1 === "X" && val2 === "O") || (val1 === "O" && val2 === "X"))) {
            socket.emit("move-rejected", { reason: "REJECT_SWAP_INVALID" });
            return;
        }

        if (game.masterStatus[r1][c1] !== "EMPTY" || game.masterStatus[r2][c2] !== "EMPTY") {
            socket.emit("move-rejected", { reason: "REJECT_SWAP_WON_GRID" });
            return;
        }

        game.masterGrid[r1][c1][i1] = val2;
        game.masterGrid[r2][c2][i2] = val1;

        updateConsecutiveMoveTracker(game, r1, c1, socket.id);

        // Check sub-grid wins in both grids
        const subWinner1 = checkSubGridWin(game, r1, c1);
        if (subWinner1 && game.masterStatus[r1][c1] === "EMPTY") {
            game.masterStatus[r1][c1] = subWinner1;
            io.to(roomId).emit("subgrid-won", { masterRow: r1, masterCol: c1, winner: subWinner1 });
        }

        const subWinner2 = checkSubGridWin(game, r2, c2);
        if (subWinner2 && game.masterStatus[r2][c2] === "EMPTY") {
            game.masterStatus[r2][c2] = subWinner2;
            io.to(roomId).emit("subgrid-won", { masterRow: r2, masterCol: c2, winner: subWinner2 });
        }

        const masterWinResult = checkMasterGridWin(game);
        if (masterWinResult) {
            game.gameOver = true;
            if (masterWinResult.winner === "DRAW") {
                io.to(roomId).emit("game-draw");
            } else {
                io.to(roomId).emit("game-over", {
                    winner:      masterWinResult.winner,
                    winningLine: masterWinResult.line
                });
            }
            return;
        }

        if (checkForDraw(game)) {
            game.gameOver = true;
            io.to(roomId).emit("game-draw");
            return;
        }

        io.to(roomId).emit("swap-applied", {
            cell1: { masterRow: r1, masterCol: c1, cellIndex: i1, newValue: val2 },
            cell2: { masterRow: r2, masterCol: c2, cellIndex: i2, newValue: val1 },
            masterStatus: game.masterStatus
        });

        game.movesRemainingThisTurn--;

        setTimeout(() => { endTurn(game, roomId); }, 500);
    });

    // -------------------------
    // SPINNER HANDLER
    // -------------------------

    socket.on("request-spin", () => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const { game } = rooms.get(roomId);

        if (socket.id !== game.turnSocket) return;

        const isRespin = game.isCurrentlyRespinning || false;
        handleSpin(socket, game, roomId, isRespin);
    });

    // -------------------------
    // REMATCH HANDLER
    // -------------------------

    socket.on("request-rematch", () => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const room = rooms.get(roomId);
        const { game } = room;

        if (!game.rematchRequests.includes(socket.id)) {
            game.rematchRequests.push(socket.id);
        }

        const opponentId = game.players.find(id => id !== socket.id);
        if (opponentId) {
            io.to(opponentId).emit("opponent-wants-rematch");
        }

        if (game.rematchRequests.length === 2) {
            const players = [...game.players];
            room.game = createGameState();
            room.game.players = players;

            const [playerA, playerB] = players;
            [playerA, playerB].forEach(sid => {
                room.game.place2Cooldown[sid]   = 0;
                room.game.loseTurnCooldown[sid] = 0;
                room.game.mysteryCooldown[sid]  = 0;
                room.game.removeCooldown[sid]   = 0;
                room.game.replaceCooldown[sid]  = 0;
            });

            io.to(playerA).emit("pre-game-init", {
                numberSegments:   NUMBER_SEGMENTS,
                beginningSegments: SPINNER_SEGMENTS_BEGINNING,
                mainSegments:     SPINNER_SEGMENTS_MAIN
            });

            io.to(playerB).emit("pre-game-init", {
                numberSegments:   NUMBER_SEGMENTS,
                beginningSegments: SPINNER_SEGMENTS_BEGINNING,
                mainSegments:     SPINNER_SEGMENTS_MAIN
            });

            io.to(roomId).emit("pre-game-spin", { yourTurn: true });
        }
    });

    // -------------------------
    // FORFEIT HANDLER
    // -------------------------

    socket.on("forfeit-game", () => {
        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;
        const { game } = rooms.get(roomId);

        if (game.gameOver) return;

        const opponent      = game.players.find(id => id !== socket.id);
        const forfeitSymbol = game.symbols[socket.id];
        const winnerSymbol  = forfeitSymbol === "X" ? "O" : "X";

        game.gameOver = true;

        if (opponent) {
            io.to(opponent).emit("opponent-forfeited", { winner: winnerSymbol });
        }
    });

    // -------------------------
    // DISCONNECT
    // -------------------------

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        const roomId = getRoomIdForSocket(socket.id);
        if (!roomId) return;

        const room   = rooms.get(roomId);
        const { game } = room;

        const otherPlayer = game.players.find(id => id !== socket.id);

        if (otherPlayer) {
            // Only send player-left if game was still in progress
            // If game was already over, the remaining player is just on the results screen
            if (!game.gameOver) {
                io.to(otherPlayer).emit("player-left");
            }
            // Reset game state, keep only the remaining player
            room.game = createGameState();
            room.game.players = [otherPlayer];
            console.log(`[${roomId}] Player left. Room kept alive for ${otherPlayer}.`);
        } else {
            // Last player gone — clean up room entirely
            rooms.delete(roomId);
            console.log(`[${roomId}] Room deleted (empty).`);
        }
    });
});

// -------------------------
// TURN MANAGEMENT
// -------------------------

function endTurn(game, roomId) {
    // Reset consecutive move counter on LOSE_TURN or NO_TARGETS
    if (game.currentSpinResult?.id === "LOSE_TURN" || game.currentSpinResult?.id === "NO_TARGETS") {
        if (game.lastMoves[game.turnSocket]) {
            game.lastMoves[game.turnSocket].count = 0;
        }
    }

    // Reset mystery turn flag and consecutive counter
    if (game.isMysteryTurn) {
        if (game.lastMoves[game.turnSocket]) {
            game.lastMoves[game.turnSocket].count = 0;
        }
        game.isMysteryTurn = false;
    }

    // Update all cooldowns for the current player
    const sid    = game.turnSocket;
    const spinId = game.currentSpinResult?.id;

    // PLACE_2
    if (spinId === "PLACE_2" || spinId === "MYSTERY_PLACE_2") {
        game.place2Cooldown[sid] = 3;
    } else if ((game.place2Cooldown[sid] || 0) > 0) { game.place2Cooldown[sid]--; }

    // LOSE_TURN
    if (spinId === "LOSE_TURN" || spinId === "NO_TARGETS") {
        game.loseTurnCooldown[sid] = 3;
    } else if ((game.loseTurnCooldown[sid] || 0) > 0) { game.loseTurnCooldown[sid]--; }

    // MYSTERY
    if (spinId?.startsWith("MYSTERY_")) {
        game.mysteryCooldown[sid] = 2;
    } else if ((game.mysteryCooldown[sid] || 0) > 0) { game.mysteryCooldown[sid]--; }

    // REMOVE
    if (spinId === "REMOVE_1") {
        game.removeCooldown[sid] = 2;
    } else if ((game.removeCooldown[sid] || 0) > 0) { game.removeCooldown[sid]--; }

    // REPLACE
    if (spinId === "REPLACE_1") {
        game.replaceCooldown[sid] = 2;
    } else if ((game.replaceCooldown[sid] || 0) > 0) { game.replaceCooldown[sid]--; }

    game.turnNumber++;

    // Switch player
    const [p1, p2] = game.players;
    game.turnSocket = (game.turnSocket === p1) ? p2 : p1;

    // Reset spin state
    game.currentSpinResult        = null;
    game.movesRemainingThisTurn   = 0;

    // Calculate blocked grid for the new current player
    let blockedGrid = null;
    const currentPlayerLastMove = game.lastMoves[game.turnSocket];

    if (currentPlayerLastMove && currentPlayerLastMove.count >= 2 && countOpenSubGrids(game) > 1 && countTotalEmptyCells(game) > 4) {
        const gridStatus = game.masterStatus[currentPlayerLastMove.row][currentPlayerLastMove.col];
        if (gridStatus === "EMPTY") {
            let playableCount = 0;
            for (let r = 0; r < 3; r++)
                for (let c = 0; c < 3; c++)
                    if (game.masterStatus[r][c] === "EMPTY") playableCount++;
            if (playableCount > 1) {
                blockedGrid = { row: currentPlayerLastMove.row, col: currentPlayerLastMove.col };
            }
        }
    }

    io.to(roomId).emit("turn-changed", {
        nextTurn:   game.turnSocket,
        turnNumber: game.turnNumber,
        blockedGrid
    });
}

// -------------------------
// SPIN HANDLER (extracted from connection closure)
// -------------------------

function handleSpin(socket, game, roomId, isRespin) {
    if (isRespin) {
        game.isCurrentlyRespinning = false;
    }

    // Pick result
    let chosenId;
    const sid   = socket.id;
    const p2cd  = game.place2Cooldown[sid]   || 0;
    const ltcd  = game.loseTurnCooldown[sid] || 0;
    const mycd  = game.mysteryCooldown[sid]  || 0;
    const rmcd  = game.removeCooldown[sid]   || 0;
    const rpcd  = game.replaceCooldown[sid]  || 0;
    if (game.turnNumber <= 6) {
        chosenId = pickWeightedBeginning(p2cd, ltcd);
    } else {
        chosenId = pickWeightedResult(p2cd, ltcd, mycd, rmcd, rpcd);
    }

    const segments = game.turnNumber <= 6 ? SPINNER_SEGMENTS_BEGINNING : SPINNER_SEGMENTS_MAIN;

    const matchingIndices = segments
        .map((seg, idx) => (seg.id === chosenId ? idx : -1))
        .filter(idx => idx !== -1);

    const winningIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
    let action = segments[winningIndex];

    game.currentSpinResult = action;

    // Handle MYSTERY segment
    if (action.id === "MYSTERY") {
        if (game.mysteryQueue.length === 0) {
            initializeMysteryQueue(game);
        }

        game.isMysteryTurn = true;

        if (game.lastMoves[socket.id]) {
            game.lastMoves[socket.id].count = 0;
        }

        io.to(socket.id).emit("clear-blocked-grid");

        action = getNextMystery(game);
        game.currentSpinResult = action;

        console.log(`[${roomId}] Mystery drawn:`, action.id);
    }

    // Set moves based on action
    if (action.id === "PLACE_2" || action.id === "MYSTERY_PLACE_2") {
        game.movesRemainingThisTurn = 2;
    } else if (action.id === "LOSE_TURN") {
        game.movesRemainingThisTurn = 0;
    } else {
        game.movesRemainingThisTurn = 1;
    }

    // Check for valid targets (skip LOSE_TURN)
    if (action.id !== "LOSE_TURN") {
        const playerSymbol = game.symbols[socket.id];
        let hasValidTarget = true;

        if (["MYSTERY_SWAP","MYSTERY_REPLACE_WILD","MYSTERY_PLACE_WILD","MYSTERY_PLACE_2","MYSTERY_PLACE_SPIN"].includes(action.id)) {
            hasValidTarget = checkForValidTargets(game, playerSymbol, action.id);
        } else if (action.id !== "MYSTERY") {
            hasValidTarget = checkForValidTargets(game, playerSymbol, action.id);
        }

        if (!hasValidTarget) {
            const isMysteryAction = action.id.startsWith("MYSTERY_");

            if (isMysteryAction) {
                // Silently cycle through all mystery options until one has valid targets
                // Try up to 5 times (full pool size) before giving up
                let attempts = 0;
                while (!hasValidTarget && attempts < 5) {
                    console.log(`[${roomId}] Mystery action ${action.id} has no valid targets, advancing`);
                    action = getNextMystery(game);
                    game.currentSpinResult = action;
                    if (action.id === "MYSTERY_PLACE_2") {
                        game.movesRemainingThisTurn = 2;
                    } else {
                        game.movesRemainingThisTurn = 1;
                    }
                    hasValidTarget = checkForValidTargets(game, playerSymbol, action.id);
                    attempts++;
                }

                if (!hasValidTarget) {
                    // All mystery options exhausted — silently lose turn, no respin
                    console.log(`[${roomId}] All mystery options exhausted, ending turn`);
                    game.currentSpinResult      = { id: "LOSE_TURN", label: "ACTION_LOSE_TURN", color: "#f4a3a3" };
                    game.movesRemainingThisTurn = 0;
                    setTimeout(() => { endTurn(game, roomId); }, 1000);
                    return;
                }

            } else {
                // Non-mystery action with no valid targets — respin once, then skip
                if (!isRespin) {
                    // First failure — show result and auto re-spin
                    io.to(socket.id).emit("spin-result", {
                        action,
                        movesRemaining: 0,
                        winningIndex,
                        startAngle: game.spinnerAngle,
                        segments
                    });
                    io.to(socket.id).emit("spin-instructions", {
                        top:    action.id,
                        bottom: "NO_TARGETS_RESPIN"
                    });

                    const opponentId1 = game.players.find(id => id !== socket.id);
                    if (opponentId1) {
                        io.to(opponentId1).emit("opponent-spin-result", {
                            actionId:   action.id,
                            messageKey: "OPP_SPIN_NO_TARGETS_RESPIN"
                        });
                    }

                    setTimeout(() => {
                        game.isCurrentlyRespinning = true;
                        io.to(socket.id).emit("trigger-respin");
                    }, 4000);
                    return;

                } else {
                    // Second failure — lose turn
                    io.to(socket.id).emit("spin-result", {
                        action,
                        movesRemaining: 0,
                        winningIndex,
                        startAngle: game.spinnerAngle,
                        segments
                    });
                    io.to(socket.id).emit("spin-instructions", {
                        top:    action.id,
                        bottom: "NO_TARGETS_SKIP"
                    });

                    const opponentId2 = game.players.find(id => id !== socket.id);
                    if (opponentId2) {
                        io.to(opponentId2).emit("opponent-spin-result", {
                            actionId:   action.id,
                            messageKey: "OPP_SPIN_NO_TARGETS_SKIP"
                        });
                    }

                    game.currentSpinResult      = { id: "NO_TARGETS", label: "NO_TARGETS_LABEL", color: "#f4a3a3" };
                    game.movesRemainingThisTurn = 0;

                    setTimeout(() => {
                        io.to(socket.id).emit("highlight-action-box", { duration: 2000 });
                        setTimeout(() => { endTurn(game, roomId); }, 2000);
                    }, 6000);
                    return;
                }
            }
        }
    }

    // Send result to current player
    io.to(socket.id).emit("spin-result", {
        action,
        movesRemaining: game.movesRemainingThisTurn,
        winningIndex,
        startAngle: game.spinnerAngle,
        segments
    });

    io.to(socket.id).emit("spin-instructions", {
        top:    action.id,
        bottom: getSpinnerDescription(action.id)
    });

    const opponentId = game.players.find(id => id !== socket.id);
    if (opponentId) {
        io.to(opponentId).emit("opponent-spin-result", {
            actionId:   action.id,
            messageKey: "OPP_SPIN_RESULT"
        });
    }

    if (action.id === "LOSE_TURN") {
        setTimeout(() => { endTurn(game, roomId); }, 6000);
    }
}

// -------------------------
// SPINNER HELPERS
// -------------------------

function place2Weight(cd) {
    if (cd >= 3) return 1;   // just landed — almost impossible next spin
    if (cd === 2) return 2;  // one turn ago
    if (cd === 1) return 3;  // two turns ago
    return 5;                // normal weight
}

function loseTurnWeight(cd) {
    if (cd >= 3) return 1;   // just landed — almost impossible next spin
    if (cd === 2) return 3;  // one turn ago
    if (cd === 1) return 6;  // two turns ago — still suppressed
    return 10;               // normal weight
}
function mysteryWeight(cd)  { return cd > 0 ? 1 : 5; }
function removeWeight(cd)  {
    if (cd >= 2) return 1;   // just landed — near impossible
    if (cd === 1) return 4;  // one turn ago — still suppressed
    return 10;               // normal
}
function replaceWeight(cd) {
    if (cd >= 2) return 1;   // just landed — near impossible
    if (cd === 1) return 4;  // one turn ago — still suppressed
    return 10;               // normal
}

function pickWeightedResult(p2cd, ltcd, mycd, rmcd, rpcd) {
    const pool = [
        { id: "PLACE_1",   weight: 60 },
        { id: "LOSE_TURN", weight: loseTurnWeight(ltcd) },
        { id: "PLACE_2",   weight: place2Weight(p2cd) },
        { id: "REMOVE_1",  weight: removeWeight(rmcd) },
        { id: "REPLACE_1", weight: replaceWeight(rpcd) },
        { id: "MYSTERY",   weight: mysteryWeight(mycd) }
    ];
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of pool) { if (r < p.weight) return p.id; r -= p.weight; }
    return "PLACE_1";
}

function pickWeightedBeginning(p2cd, ltcd) {
    const pool = [
        { id: "PLACE_1",   weight: 85 },
        { id: "PLACE_2",   weight: place2Weight(p2cd) },
        { id: "LOSE_TURN", weight: loseTurnWeight(ltcd) }
    ];
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of pool) { if (r < p.weight) return p.id; r -= p.weight; }
    return "PLACE_1";
}

function getSpinnerDescription(id) {
    switch (id) {
        case "PLACE_1":              return "DESC_PLACE_1";
        case "PLACE_2":              return "DESC_PLACE_2_FIRST";
        case "REMOVE_1":             return "DESC_REMOVE_1";
        case "REPLACE_1":            return "DESC_REPLACE_1";
        case "LOSE_TURN":            return "DESC_LOSE_TURN";
        case "MYSTERY_PLACE_2":      return "DESC_PLACE_2_FIRST";
        case "MYSTERY_PLACE_SPIN":   return "DESC_MYSTERY_PLACE_SPIN";
        case "MYSTERY_SWAP":         return "DESC_MYSTERY_SWAP";
        case "MYSTERY_PLACE_WILD":   return "DESC_MYSTERY_PLACE_WILD";
        case "MYSTERY_REPLACE_WILD": return "DESC_MYSTERY_REPLACE_WILD";
        default:                     return "";
    }
}

// -------------------------
// VALIDATION HELPERS
// -------------------------

function isSubGridPlayable(game, masterRow, masterCol) {
    if (game.masterStatus[masterRow][masterCol] !== "EMPTY") return false;

    const sub    = game.masterGrid[masterRow][masterCol];
    const action = game.currentSpinResult?.id;
    if (!action) return false;

    if (["PLACE_1","MYSTERY_PLACE_SPIN","MYSTERY_PLACE_WILD"].includes(action)) {
        return sub.includes("EMPTY");
    }
    if (["PLACE_2","MYSTERY_PLACE_2"].includes(action)) {
        return sub.includes("EMPTY");
    }
    if (["REMOVE_1","REPLACE_1","MYSTERY_REPLACE_WILD"].includes(action)) {
        return sub.some(v => v === "X" || v === "O");
    }
    if (action === "MYSTERY_SWAP") {
        return sub.some(v => v === "X" || v === "O");
    }

    return false;
}

function checkForValidTargets(game, playerSymbol, actionId) {
    const playerId        = Object.keys(game.symbols).find(id => game.symbols[id] === playerSymbol);
    const isMysteryAction = actionId.startsWith("MYSTERY_");

    // -------------------------
    // SPECIAL CASE FIX:
    // When only ONE sub-grid is open, the consecutive rule is suspended.
    // Therefore, PLACE_2 is ALWAYS allowed if that grid has an EMPTY cell.
    // -------------------------
    if (actionId === "PLACE_2" || actionId === "MYSTERY_PLACE_2") {
        if (countOpenSubGrids(game) <= 1) {
            for (let r = 0; r < 3; r++)
                for (let c = 0; c < 3; c++)
                    if (game.masterStatus[r][c] === "EMPTY" &&
                        game.masterGrid[r][c].includes("EMPTY"))
                        return true;
            return false;
        }
    }

    // -------------------------
    // PLACE_1
    // -------------------------
    if (actionId === "PLACE_1") {
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++) {
                if (game.masterStatus[r][c] !== "EMPTY") continue;
                if (!canActInSubGrid(game, r, c, playerId)) continue;
                if (game.masterGrid[r][c].includes("EMPTY")) return true;
            }
        return false;
    }

    // -------------------------
    // PLACE_2 (normal case)
    // -------------------------
    if (actionId === "PLACE_2" || actionId === "MYSTERY_PLACE_2") {
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++) {
                if (game.masterStatus[r][c] !== "EMPTY") continue;
                if (!isMysteryAction && !canActInSubGrid(game, r, c, playerId)) continue;
                if (game.masterGrid[r][c].includes("EMPTY")) return true;
            }
        return false;
    }

    // -------------------------
    // MYSTERY_PLACE_SPIN / WILD
    // -------------------------
    if (actionId === "MYSTERY_PLACE_SPIN" || actionId === "MYSTERY_PLACE_WILD") {
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++) {
                if (game.masterStatus[r][c] !== "EMPTY") continue;
                if (game.masterGrid[r][c].includes("EMPTY")) return true;
            }
        return false;
    }

    // -------------------------
    // MYSTERY_SWAP
    // -------------------------
    if (actionId === "MYSTERY_SWAP") {
        let hasX = false, hasO = false;
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++) {
                if (game.masterStatus[r][c] !== "EMPTY") continue;
                const sub = game.masterGrid[r][c];
                if (sub.includes("X")) hasX = true;
                if (sub.includes("O")) hasO = true;
                if (hasX && hasO) return true;
            }
        return false;
    }

    // -------------------------
    // REMOVE / REPLACE
    // -------------------------
    if (["REMOVE_1","REPLACE_1","MYSTERY_REPLACE_WILD"].includes(actionId)) {
        const opponentSymbol = playerSymbol === "X" ? "O" : "X";
        for (let r = 0; r < 3; r++)
            for (let c = 0; c < 3; c++) {
                if (game.masterStatus[r][c] !== "EMPTY") continue;
                if (!isMysteryAction && !canActInSubGrid(game, r, c, playerId)) continue;
                if (game.masterGrid[r][c].some(cell => cell === opponentSymbol)) return true;
            }
        return false;
    }

    return false;
}

function isOpponentTile(game, cellValue, playerSymbol) {
    if (cellValue === "EMPTY") return false;
    return cellValue !== playerSymbol;
}

function applyMove(game, action, player, r, c, i) {
    const grid = game.masterGrid[r][c];

    if (["PLACE_1","PLACE_2","MYSTERY_PLACE_2","MYSTERY_PLACE_SPIN"].includes(action)) {
        grid[i] = player;
    }
    if (action === "REMOVE_1") {
        grid[i] = "EMPTY";
    }
    if (action === "REPLACE_1") {
        grid[i] = player;
    }
    if (action === "MYSTERY_PLACE_WILD") {
        grid[i] = "W";
    }
    if (action === "MYSTERY_REPLACE_WILD") {
        grid[i] = "W";
    }
}

function countTotalEmptyCells(game) {
    let count = 0;
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
            if (game.masterStatus[r][c] === "EMPTY")
                count += game.masterGrid[r][c].filter(cell => cell === "EMPTY").length;
    return count;
}

function countOpenSubGrids(game) {
    let count = 0;
    for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++)
            if (game.masterStatus[r][c] === "EMPTY") count++;
    return count;
}

function canActInSubGrid(game, masterRow, masterCol, playerId) {
    // Suspend consecutive move rule when only one sub-grid remains open
    // or when 4 or fewer empty cells remain across all open sub-grids
    if (countOpenSubGrids(game) <= 1) return true;
    if (countTotalEmptyCells(game) <= 4) return true;

    const playerLastMove = game.lastMoves[playerId];
    if (!playerLastMove) return true;

    if (playerLastMove.row !== masterRow || playerLastMove.col !== masterCol) return true;

    return playerLastMove.count < 2;
}

function updateConsecutiveMoveTracker(game, masterRow, masterCol, playerId) {
    const playerLastMove = game.lastMoves[playerId];

    if (!playerLastMove) {
        game.lastMoves[playerId] = { row: masterRow, col: masterCol, count: 1 };
        return;
    }

    if (playerLastMove.row === masterRow && playerLastMove.col === masterCol) {
        playerLastMove.count++;
    } else {
        game.lastMoves[playerId] = { row: masterRow, col: masterCol, count: 1 };
    }
}

function checkSubGridWin(game, r, c) {
    const grid  = game.masterGrid[r][c];
    const lines = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    let xWins = false, oWins = false;

    for (const [a, b, cc] of lines) {
        const v1 = grid[a], v2 = grid[b], v3 = grid[cc];

        if (v1 === "X" && v2 === "X" && v3 === "X") xWins = true;
        if (v1 === "O" && v2 === "O" && v3 === "O") oWins = true;

        const xCount = [v1,v2,v3].filter(v => v === "X").length;
        const oCount = [v1,v2,v3].filter(v => v === "O").length;
        const wCount = [v1,v2,v3].filter(v => v === "W").length;
        const hasEmpty = [v1,v2,v3].includes("EMPTY");

        if (xCount + wCount === 3 && oCount === 0 && !hasEmpty) xWins = true;
        if (oCount + wCount === 3 && xCount === 0 && !hasEmpty) oWins = true;
    }

    if (xWins && oWins) return "WILD";
    if (xWins) return "X";
    if (oWins) return "O";
    return null;
}

function checkMasterGridWin(game) {
    const g = game.masterStatus;
    const lines = [
        [[0,0],[0,1],[0,2]],
        [[1,0],[1,1],[1,2]],
        [[2,0],[2,1],[2,2]],
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]]
    ];

    let xWin = null, oWin = null;

    for (const line of lines) {
        const [[r1,c1],[r2,c2],[r3,c3]] = line;
        const v1 = g[r1][c1], v2 = g[r2][c2], v3 = g[r3][c3];
        const vals = [v1, v2, v3];

        const xCount    = vals.filter(v => v === "X").length;
        const oCount    = vals.filter(v => v === "O").length;
        const wildCount = vals.filter(v => v === "WILD").length;

        if (xCount + wildCount === 3 && oCount === 0 && xCount >= 1) xWin = { winner: "X", line };
        if (oCount + wildCount === 3 && xCount === 0 && oCount >= 1) oWin = { winner: "O", line };
    }

    // Both players won simultaneously — it's a draw
    if (xWin && oWin) return { winner: "DRAW", line: xWin.line };
    if (xWin) return xWin;
    if (oWin) return oWin;
    return null;
}

function checkForDraw(game) {
    const g = game.masterStatus;
    const lines = [
        [[0,0],[0,1],[0,2]],
        [[1,0],[1,1],[1,2]],
        [[2,0],[2,1],[2,2]],
        [[0,0],[1,0],[2,0]],
        [[0,1],[1,1],[2,1]],
        [[0,2],[1,2],[2,2]],
        [[0,0],[1,1],[2,2]],
        [[0,2],[1,1],[2,0]]
    ];

    for (const line of lines) {
        const [[r1,c1],[r2,c2],[r3,c3]] = line;
        const v1 = g[r1][c1], v2 = g[r2][c2], v3 = g[r3][c3];
        const hasX    = [v1,v2,v3].includes("X");
        const hasO    = [v1,v2,v3].includes("O");

        if (!(hasX && hasO)) return false;

        if (v1 === "WILD" && v2 === "WILD" && v3 === "WILD") continue;
    }

    return true;
}

// -------------------------
// CAWilsonApps 2025-2026

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
