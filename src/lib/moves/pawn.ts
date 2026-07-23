import type { BoardState, Tile, Side } from "../types";
import { RANKS, FILES, isRank, isFile, isSquare, type Rank, type File, type Square } from "../game/boardPrimitives";

interface PawnMove {
  to: Square;
  isPromotion?: boolean;
  isEnPassantTarget?: boolean;
  isEnPassantCapture?: boolean;
}

const isFirstMove = (side: Side, rank: Rank) => {
  return side === 'w' ? rank === '2' : rank === '7';
}

const canPromote = (rank: Rank) => {
  return rank === '1' || rank === '8';
}

const getCaptureMove = (boardState: BoardState, side: Side, targetSquare: Square, targetRank: Rank): PawnMove | undefined => {
  const targetPiece = boardState.piecePlacement[targetSquare];
  if (targetPiece === undefined || targetPiece.side === side) return undefined;

  return { to: targetSquare, isPromotion: canPromote(targetRank) };
}

const getEnPassantMove = (boardState: BoardState, side: Side, targetFile: File, currentRank: Rank, targetSquare: Square): PawnMove | undefined => {
  const adjacentSquare = `${targetFile}${currentRank}`;
  if (
    boardState.enPassantTarget === undefined ||
    targetSquare !== boardState.enPassantTarget ||
    boardState.piecePlacement[targetSquare] !== undefined ||
    !isSquare(adjacentSquare)
  ) return undefined;

  const adjacentPiece = boardState.piecePlacement[adjacentSquare];
  if (adjacentPiece?.type !== 'pawn' || adjacentPiece.side === side) return undefined;

  return { to: targetSquare, isEnPassantCapture: true };
}

const getDiagonalMove = (boardState: BoardState, side: Side, targetFile: File, currentRank: Rank, targetRank: Rank): PawnMove | undefined => {
  const targetSquare = `${targetFile}${targetRank}`;
  if (!isSquare(targetSquare)) return undefined;

  const captureMove = getCaptureMove(boardState, side, targetSquare, targetRank);
  if (captureMove !== undefined) return captureMove;

  const enPassantMove = getEnPassantMove(boardState, side, targetFile, currentRank, targetSquare);
  if (enPassantMove !== undefined) return enPassantMove;

  return undefined;
}

const getPseudoLegalMoves = (boardState: BoardState, side: Side, file: File, rank: Rank): PawnMove[] => {
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

    if (isFirstMove(side, rank)) {
      const targetSquare = `${file}${RANKS[rankIdx + 2 * direction]}`;
      if (isSquare(targetSquare) && boardState.piecePlacement[targetSquare] === undefined) {
        moves.push({ to: targetSquare, isEnPassantTarget: true });
      }
    }
  }

  if (isFile(leftFile)) {
    const diagonalMove = getDiagonalMove(boardState, side, leftFile, rank, targetRank);
    if (diagonalMove !== undefined) moves.push(diagonalMove);
  }

  if(isFile(rightFile)) {
    const diagonalMove = getDiagonalMove(boardState, side, rightFile, rank, targetRank);
    if (diagonalMove !== undefined) moves.push(diagonalMove);
  }

  return moves;
}

export const pseudoLegalPawnMoves = (boardState: BoardState, tile: Tile) => {
  const { piece, id } = tile;
  if (piece?.type !== 'pawn') throw new Error('Tile is not a pawn');
  const side = piece.side;
  const [file, rank] = id.split('');
  if (!isFile(file) || !isRank(rank)) throw new Error('Invalid tile');
  return getPseudoLegalMoves(boardState, side, file, rank);
}