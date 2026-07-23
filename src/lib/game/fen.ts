import type { BoardState, Piece, PiecePlacement, Side } from '../types';
import { FILES, isSquare, PIECES, RANKS_REVERSE, type Rank, type Square } from './boardPrimitives';

const validPiecePlacementChars = new Set([
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'r',
	'R',
	'n',
	'N',
	'b',
	'B',
	'q',
	'Q',
	'k',
	'K',
	'p',
	'P'
]);
const castlingAvailabilityRegex = /^K?Q?k?q?$/;
const enPassantTargetRegex = /^[a-h][36]$/;
const digitRegex = /^\d+$/;

const fenPieceMap: Record<string, Piece> = {
	P: { type: 'pawn', side: 'w' },
	p: { type: 'pawn', side: 'b' },
	R: { type: 'rook', side: 'w' },
	r: { type: 'rook', side: 'b' },
	N: { type: 'knight', side: 'w' },
	n: { type: 'knight', side: 'b' },
	B: { type: 'bishop', side: 'w' },
	b: { type: 'bishop', side: 'b' },
	Q: { type: 'queen', side: 'w' },
	q: { type: 'queen', side: 'b' },
	K: { type: 'king', side: 'w' },
	k: { type: 'king', side: 'b' }
};

const pieceFenChar: Record<Piece['type'], string> = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k'
};

// ---------
// Deserialises a FEN string to a board state.
// ---------

export const fenToBoardState = (fen: string): BoardState => {
	const fields = fen.trim().split(/\s+/);
	if (fields.length !== 6) {
		throw new Error(`Invalid FEN: ${fen}`);
	}
	const [
		piecePlacement,
		sideToMove,
		castlingAvailability,
		enPassantTarget,
		halfMoveClock,
		fullMoveCounter
	] = fields;
	return {
		piecePlacement: parseFenPiecePlacement(piecePlacement),
		activeSide: parseFenSideToMove(sideToMove),
		castlingAvailability: parseFenCastlingAbility(castlingAvailability),
		enPassantTarget: parseFenEnPassantTargetSquare(enPassantTarget),
		halfMoveClock: parseFenHalfMoveClock(halfMoveClock),
		fullMoveNumber: parseFenFullMoveCounter(fullMoveCounter)
	};
};

const parseFenPiecePlacement = (piecePlacement: string): PiecePlacement => {
	const piecePlacementState: PiecePlacement = {};
	const boardRanks = piecePlacement.split('/');
	if (boardRanks.length !== 8) {
		throw new Error('Invalid board: ranks must be 8');
	}
	for (let i = 0; i < 8; i++) {
		parseFenRank(boardRanks[i], i, piecePlacementState);
	}
	return piecePlacementState;
};

const parseFenRank = (rank: string, rankIndex: number, piecePlacementState: PiecePlacement) => {
	let processed = 0;
	for (const char of rank) {
		validateFenPiecePlacementChar(char);
		if (!isNaN(parseInt(char))) {
			processed += parseInt(char);
		} else {
			piecePlacementState[`${FILES[processed]}${RANKS_REVERSE[rankIndex]}`] = fenPieceMap[char];
			processed++;
		}
		if (processed > 8) {
			throw new Error(`Invalid board: rank too long: ${rank}`);
		}
	}
	if (processed !== 8) {
		throw new Error(`Invalid board: rank too short: ${rank}`);
	}
};

const parseFenSideToMove = (sideToMove: string): Side => {
	validateSide(sideToMove);
	return sideToMove;
};

const validateFenPiecePlacementChar = (char: string) => {
	if (!validPiecePlacementChars.has(char)) {
		throw new Error(`Invalid board: invalid piece: ${char}`);
	}
};

const parseFenCastlingAbility = (castlingAvailability: string) => {
	if (castlingAvailability === '-') {
		return undefined;
	} else {
		validateCastlingAvailability(castlingAvailability);

		return castlingAvailability;
	}
};

const parseFenEnPassantTargetSquare = (enPassantTarget: string) => {
	if (enPassantTarget === '-') {
		return undefined;
	} else {
		validateEnPassantTarget(enPassantTarget);
		if (!isSquare(enPassantTarget)) {
			throw new Error(`Invalid en passant target: ${enPassantTarget}`);
		}
		return enPassantTarget;
	}
};

const parseFenHalfMoveClock = (halfMoveClock: string) => {
	validateDigitString(halfMoveClock);
	const digit = parseInt(halfMoveClock);
	validateHalfMoveClock(digit);
	return digit;
};

const parseFenFullMoveCounter = (fullMoveCounter: string) => {
	validateDigitString(fullMoveCounter);
	const digit = parseInt(fullMoveCounter);
	validateFullMoveNumber(digit);
	return digit;
};

const validateDigitString = (digit: string) => {
	if (!digitRegex.test(digit)) {
		throw new Error(`Invalid digit: ${digit}`);
	}
};

// ---------
// Serializes a board state to a FEN string.
// ---------

export const boardStateToFen = (boardState: BoardState): string => {
	const {
		piecePlacement,
		activeSide,
		castlingAvailability,
		enPassantTarget,
		halfMoveClock,
		fullMoveNumber
	} = boardState;
	const fen: string[] = [];
	fen.push(serialiseFenPiecePlacement(piecePlacement));
	fen.push(serialiseFenSideToMove(activeSide));
	fen.push(serialiseCastlingAvailability(castlingAvailability));
	fen.push(serialiseEnPassantTarget(enPassantTarget));
	fen.push(serialiseHalfMoveClock(halfMoveClock));
	fen.push(serialiseFullMoveNumber(fullMoveNumber));
	return fen.join(' ');
};

const serialiseFenPiecePlacement = (piecePlacement: PiecePlacement): string => {
	const piecePlacementString: string[] = [];
	for (const rank of RANKS_REVERSE) {
		piecePlacementString.push(serialiseFenRank(rank, piecePlacement));
	}
	return piecePlacementString.join('/');
};

const serialiseFenRank = (rank: Rank, piecePlacement: PiecePlacement) => {
	let emptySquares = 0;
	let serialised = '';
	for (const file of FILES) {
		const square = `${file}${rank}`;
		const piece = piecePlacement[square as Square];
		if (piece !== undefined) {
			if (emptySquares > 0) {
				serialised += emptySquares.toString();
				emptySquares = 0;
			}
			serialised += serialisePiece(piece);
		} else {
			emptySquares++;
		}
	}
	if (emptySquares > 0) {
		serialised += emptySquares.toString();
	}
	return serialised;
};

const serialisePiece = (piece: Piece) => {
	validatePiece(piece);
	validateSide(piece.side);
	const pieceChar = pieceFenChar[piece.type];
	return piece.side === 'w' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
};

const validatePiece = (piece: Piece) => {
	if (!PIECES.includes(piece.type)) {
		throw new Error(`Invalid piece type: ${piece.type}`);
	}
};

const serialiseFenSideToMove = (sideToMove: Side): string => {
	validateSide(sideToMove);
	return sideToMove;
};

const serialiseCastlingAvailability = (castlingAvailability: string | undefined) => {
	if (castlingAvailability === undefined) {
		return '-';
	}
	validateCastlingAvailability(castlingAvailability);

	return castlingAvailability;
};

const serialiseEnPassantTarget = (enPassantTarget: string | undefined) => {
	if (enPassantTarget === undefined) {
		return '-';
	}
	validateEnPassantTarget(enPassantTarget);

	return enPassantTarget;
};

const serialiseHalfMoveClock = (halfMoveClock: number) => {
	validateHalfMoveClock(halfMoveClock);
	return halfMoveClock.toString();
};

const serialiseFullMoveNumber = (fullMoveNumber: number) => {
	validateFullMoveNumber(fullMoveNumber);
	return fullMoveNumber.toString();
};

// ---------
// Shared helpers
// ---------

const isSide = (side: string): side is Side => {
	return side === 'w' || side === 'b';
};

function validateSide(side: string): asserts side is Side {
  if (!isSide(side)) {
    throw new Error(`Invalid side: ${side}`);
  }
}


const validateCastlingAvailability = (castlingAvailability: string) => {
	if (!castlingAvailabilityRegex.test(castlingAvailability)) {
		throw new Error(`Invalid castling: ${castlingAvailability}`);
	}
};

const validateEnPassantTarget = (enPassantTarget: string) => {
	if (!enPassantTargetRegex.test(enPassantTarget)) {
		throw new Error(`Invalid en passant target: ${enPassantTarget}`);
	}
};

const validateHalfMoveClock = (halfMoveClock: number) => {
	if (halfMoveClock < 0) {
		throw new Error(`Invalid half move clock: ${halfMoveClock}`);
	}
};

const validateFullMoveNumber = (fullMoveNumber: number) => {
	if (fullMoveNumber < 1) {
		throw new Error(`Invalid full move number: ${fullMoveNumber}`);
	}
};
