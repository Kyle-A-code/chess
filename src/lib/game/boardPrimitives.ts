import type { Side, Tile } from '../types';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
export const RANKS_REVERSE = [...RANKS].reverse();

export type File = (typeof FILES)[number];
export type Rank = (typeof RANKS)[number];
export type Square = `${File}${Rank}`;

const calcSide = (rankIndex: number, fileIndex: number): Side => {
	return (rankIndex + fileIndex) % 2 === 0 ? 'w' : 'b';
};

export const BOARD_TILES: Tile[] = RANKS_REVERSE.flatMap((rank, i) =>
	FILES.map((file, j) => ({ id: `${file}${rank}`, colour: calcSide(i, j) }))
);

export const isFile = (value: string): value is File => FILES.includes(value as File);
export const isRank = (value: string): value is Rank => RANKS.includes(value as Rank);
export const isSquare = (value: string): value is Square => {
	const [file, rank] = value.split('');
	return isFile(file) && isRank(rank);
};
