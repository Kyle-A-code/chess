import type { BoardState, Piece, PiecePlacement } from '../types';
import { FILES, RANKS_REVERSE } from './boardPrimitives';

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
const castlingAbilityRegex = /^K?Q?k?q?$/;
const enPassantTargetSquareRegex = /^[a-h][36]$/;
const digitRegex = /^\d+$/;

const pieceMap: Record<string, Piece> = {
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

export const parseFenString = (fen: string): BoardState => {
	const fields = fen.trim().split(/\s+/);
	if (fields.length !== 6) {
		throw new Error(`Invalid FEN: ${fen}`);
	}
	const [
		piecePlacement,
		sideToMove,
		castlingAbility,
		enPassantTargetSquare,
		halfMoveClock,
		fullMoveCounter
	] = fields;
	return {
		piecePlacement: parsePiecePlacement(piecePlacement),
		activeSide: parseSideToMove(sideToMove),
		castlingAvailability: parseCastlingAbility(castlingAbility),
		enPassantTarget: parseEnPassantTargetSquare(enPassantTargetSquare),
		halfMoveClock: parseHalfMoveClock(halfMoveClock),
		fullMoveNumber: parseFullMoveCounter(fullMoveCounter)
	};
};

const serializeFen = (boardState: BoardState) => {
	return;
};

const parsePiecePlacement = (piecePlacement: string): PiecePlacement => {
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
		validatePiecePlacementChar(char);
		if (!isNaN(parseInt(char))) {
			processed += parseInt(char);
		} else {
			piecePlacementState[`${FILES[processed]}${RANKS_REVERSE[rankIndex]}`] = pieceMap[char];
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

const parseSideToMove = (sideToMove: string) => {
	if (sideToMove === 'w' || sideToMove === 'b') {
		return sideToMove;
	}
	throw new Error(`Invalid turn: ${sideToMove}`);
};

const validatePiecePlacementChar = (char: string) => {
	if (validPiecePlacementChars.has(char)) {
		return;
	} else {
		throw new Error(`Invalid board: invalid piece: ${char}`);
	}
};

const parseCastlingAbility = (castlingAbility: string) => {
	if (castlingAbility === '-') {
		return undefined;
	} else {
		if (!castlingAbilityRegex.test(castlingAbility)) {
			throw new Error(`Invalid castling: ${castlingAbility}`);
		}
		return castlingAbility;
	}
};

const parseEnPassantTargetSquare = (enPassantTargetSquare: string) => {
	if (enPassantTargetSquare === '-') {
		return undefined;
	} else {
		if (!enPassantTargetSquareRegex.test(enPassantTargetSquare)) {
			throw new Error(`Invalid en passant target: ${enPassantTargetSquare}`);
		}
		return enPassantTargetSquare;
	}
};

// TODO: implement half clock validation
const parseHalfMoveClock = (halfMoveClock: string) => {
	validateDigitString(halfMoveClock);
	const digit = parseInt(halfMoveClock);
	if (isNaN(digit) || digit < 0) {
		throw new Error(`Invalid half move clock: ${halfMoveClock}`);
	}
	return digit;
};

const parseFullMoveCounter = (fullMoveCounter: string) => {
	validateDigitString(fullMoveCounter);
	const digit = parseInt(fullMoveCounter);
	if (isNaN(digit) || digit < 1) {
		throw new Error(`Invalid full move counter: ${fullMoveCounter}`);
	}
	return digit;
};

const validateDigitString = (digit: string) => {
	if (!digitRegex.test(digit)) {
		throw new Error(`Invalid digit: ${digit}`);
	}
};
