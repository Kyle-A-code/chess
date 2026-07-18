import type { BoardState, Tile, Side, Piece } from "../types";
import { RANKS, FILES, isRank, isFile, isSquare, type Rank, type File, type Square } from "../game/boardPrimitives";

interface PawnMove {
  to: string;
  isPromotion?: boolean;
  isEnPassantTarget?: boolean;
  enPassantCapture?: Piece;
}

const isFirstMove = (side: Side, rank: Rank) => {
  return side === 'w' ? rank === '2' : rank === '7';
}

const canCapture = (boardState: BoardState, side: Side, targetSquare: Square): boolean => {
  const targetPiece = boardState.piecePlacement[targetSquare];
  if (targetPiece === undefined) return false;

  return targetPiece.side !== side;
}

const canPromote = (rank: Rank) => {
  return rank === '1' || rank === '8';
}

const getCaptureMove = (boardState: BoardState, side: Side, targetFile: File, targetRank: Rank): PawnMove | undefined => {
  const targetSquare = `${targetFile}${targetRank}`;
  if (isSquare(targetSquare) && canCapture(boardState, side, targetSquare)) {
    return { to: targetSquare, isPromotion: canPromote(targetRank) };
  }
  return undefined;
}

const pawnMoves = (boardState: BoardState, side: Side, file: File, rank: Rank): PawnMove[] => {
  const moves: PawnMove[] = [];
  const direction = side === 'w' ? 1 : -1;
  const rankIdx = RANKS.indexOf(rank);
  const fileIdx = FILES.indexOf(file);
  const targetRank = RANKS[rankIdx + 1 * direction];
  const leftFile = FILES[fileIdx - 1];
  const rightFile = FILES[fileIdx + 1];
  const forwardSquare = `${file}${targetRank}`;

  if (isSquare(forwardSquare) && boardState.piecePlacement[forwardSquare] === undefined) {
    moves.push({ to: forwardSquare, isPromotion: canPromote(targetRank) });
  }

  if (isFile(leftFile)) {
    const leftCaptureMove = getCaptureMove(boardState, side, leftFile, targetRank);
    if (leftCaptureMove) {
      moves.push(leftCaptureMove);
    }
    // TODO: Check for en passant capture
  }

  if(isFile(rightFile)) {
    const rightCaptureMove = getCaptureMove(boardState, side, rightFile, targetRank);
    if (rightCaptureMove) {
      moves.push(rightCaptureMove);
    }
    // TODO: Check for en passant capture
  }

  if (isFirstMove(side, rank)) {
    // TODO: check there is no piece in the first square ahead
    const doubleForwardSquare = `${file}${RANKS[rankIdx + 2 * direction]}`;
    if (isSquare(doubleForwardSquare) && boardState.piecePlacement[doubleForwardSquare] === undefined) {
      moves.push({ to: doubleForwardSquare, isEnPassantTarget: true });
    }
  }

  if (boardState.enPassantTarget !== undefined) {

  }

  return moves;
}

export const pseudoLegalPawnMoves = (boardState: BoardState, tile: Tile) => {
  const { piece, id } = tile;
  if (piece?.type !== 'pawn') throw new Error('Tile is not a pawn');
  const side = piece?.side;
  const [file, rank] = id.split('');
  if (!isFile(file) || !isRank(rank)) throw new Error('Invalid tile');
  return pawnMoves(boardState, side, file, rank);
}