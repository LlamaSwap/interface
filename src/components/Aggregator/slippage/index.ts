function maxSlippage(dvx: number, f: number, xo: number) {
	return (
		(dvx ** 3 *
			f ** 4 *
			Math.sqrt(xo) *
			Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
			(f - 1) ** 2 +
			2 * dvx ** 3 * f ** 4 * xo * (f - 1) ** 4 -
			3 *
				dvx ** 3 *
				f ** 3 *
				Math.sqrt(xo) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
			dvx ** 3 * f ** 3 * xo * (f - 1) ** 5 -
			5 * dvx ** 3 * f ** 3 * xo * (f - 1) ** 4 +
			3 *
				dvx ** 3 *
				f ** 2 *
				Math.sqrt(xo) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 -
			2 * dvx ** 3 * f ** 2 * xo * (f - 1) ** 5 +
			4 * dvx ** 3 * f ** 2 * xo * (f - 1) ** 4 -
			dvx ** 3 *
				f *
				Math.sqrt(xo) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
			dvx ** 3 * f * xo * (f - 1) ** 5 -
			dvx ** 3 * f * xo * (f - 1) ** 4 +
			dvx ** 2 * f ** 6 * xo ** 2 * (f - 1) ** 2 +
			dvx ** 2 *
				f ** 5 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
			2 * dvx ** 2 * f ** 5 * xo ** 2 * (f - 1) ** 2 -
			5 *
				dvx ** 2 *
				f ** 4 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
			4 * dvx ** 2 * f ** 4 * xo ** 2 * (f - 1) ** 2 -
			dvx ** 2 *
				f ** 3 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
			9 *
				dvx ** 2 *
				f ** 3 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
			dvx ** 2 * f ** 3 * xo ** 2 * (f - 1) ** 5 -
			2 * dvx ** 2 * f ** 3 * xo ** 2 * (f - 1) ** 4 +
			12 * dvx ** 2 * f ** 3 * xo ** 2 * (f - 1) ** 2 +
			5 *
				dvx ** 2 *
				f ** 2 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 -
			7 *
				dvx ** 2 *
				f ** 2 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
			2 * dvx ** 2 * f ** 2 * xo ** 2 * (f - 1) ** 5 +
			5 * dvx ** 2 * f ** 2 * xo ** 2 * (f - 1) ** 4 -
			dvx ** 2 * f ** 2 * xo ** 2 * (f - 1) ** 3 -
			9 * dvx ** 2 * f ** 2 * xo ** 2 * (f - 1) ** 2 -
			6 *
				dvx ** 2 *
				f *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
			2 *
				dvx ** 2 *
				f *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
			dvx ** 2 * f * xo ** 2 * (f - 1) ** 5 -
			4 * dvx ** 2 * f * xo ** 2 * (f - 1) ** 4 +
			2 * dvx ** 2 * f * xo ** 2 * (f - 1) ** 3 +
			2 * dvx ** 2 * f * xo ** 2 * (f - 1) ** 2 +
			2 *
				dvx ** 2 *
				xo ** (3 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
			dvx ** 2 * xo ** 2 * (f - 1) ** 4 -
			dvx ** 2 * xo ** 2 * (f - 1) ** 3 +
			dvx * f ** 7 * xo ** 3 -
			6 * dvx * f ** 6 * xo ** 3 -
			dvx * f ** 5 * xo ** 3 * (f - 1) ** 2 +
			13 * dvx * f ** 5 * xo ** 3 +
			dvx * f ** 4 * xo ** (5 / 2) * Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
			4 * dvx * f ** 4 * xo ** 3 * (f - 1) ** 2 -
			12 * dvx * f ** 4 * xo ** 3 -
			dvx * f ** 4 * xo * (dvx * (f - 1) ** 2 + f * xo - 2 * xo) ** 2 -
			3 *
				dvx *
				f ** 3 *
				xo ** (5 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
			5 * dvx * f ** 3 * xo ** 3 * (f - 1) ** 2 +
			4 * dvx * f ** 3 * xo ** 3 +
			2 * dvx * f ** 3 * xo * (dvx * (f - 1) ** 2 + f * xo - 2 * xo) ** 2 +
			2 *
				dvx *
				f ** 2 *
				xo ** (5 / 2) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
			2 * dvx * f ** 2 * xo ** 3 * (f - 1) ** 2 -
			dvx * f ** 2 * xo * (dvx * (f - 1) ** 2 + f * xo - 2 * xo) ** 2 +
			f ** 3 * xo ** 2 * (dvx * (f - 1) ** 2 + f * xo - 2 * xo) ** 2 -
			f ** 2 * xo ** 2 * (dvx * (f - 1) ** 2 + f * xo - 2 * xo) ** 2) /
		(dvx *
			(dvx ** 2 *
				f ** 4 *
				Math.sqrt(xo) *
				Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
				(f - 1) ** 2 +
				2 * dvx ** 2 * f ** 4 * xo * (f - 1) ** 4 -
				3 *
					dvx ** 2 *
					f ** 3 *
					Math.sqrt(xo) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 +
				dvx ** 2 * f ** 3 * xo * (f - 1) ** 5 -
				5 * dvx ** 2 * f ** 3 * xo * (f - 1) ** 4 +
				3 *
					dvx ** 2 *
					f ** 2 *
					Math.sqrt(xo) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 -
				2 * dvx ** 2 * f ** 2 * xo * (f - 1) ** 5 +
				4 * dvx ** 2 * f ** 2 * xo * (f - 1) ** 4 -
				dvx ** 2 *
					f *
					Math.sqrt(xo) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 +
				dvx ** 2 * f * xo * (f - 1) ** 5 -
				dvx ** 2 * f * xo * (f - 1) ** 4 +
				dvx * f ** 6 * xo ** 2 * (f - 1) ** 2 +
				dvx *
					f ** 5 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
				2 * dvx * f ** 5 * xo ** 2 * (f - 1) ** 2 -
				5 *
					dvx *
					f ** 4 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
				4 * dvx * f ** 4 * xo ** 2 * (f - 1) ** 2 -
				dvx *
					f ** 3 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 +
				9 *
					dvx *
					f ** 3 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
				dvx * f ** 3 * xo ** 2 * (f - 1) ** 5 -
				2 * dvx * f ** 3 * xo ** 2 * (f - 1) ** 4 +
				12 * dvx * f ** 3 * xo ** 2 * (f - 1) ** 2 +
				5 *
					dvx *
					f ** 2 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 -
				7 *
					dvx *
					f ** 2 *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
				2 * dvx * f ** 2 * xo ** 2 * (f - 1) ** 5 +
				5 * dvx * f ** 2 * xo ** 2 * (f - 1) ** 4 -
				dvx * f ** 2 * xo ** 2 * (f - 1) ** 3 -
				9 * dvx * f ** 2 * xo ** 2 * (f - 1) ** 2 -
				6 *
					dvx *
					f *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 +
				2 * dvx * f * xo ** (3 / 2) * Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
				dvx * f * xo ** 2 * (f - 1) ** 5 -
				4 * dvx * f * xo ** 2 * (f - 1) ** 4 +
				2 * dvx * f * xo ** 2 * (f - 1) ** 3 +
				2 * dvx * f * xo ** 2 * (f - 1) ** 2 +
				2 *
					dvx *
					xo ** (3 / 2) *
					Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) *
					(f - 1) ** 2 +
				dvx * xo ** 2 * (f - 1) ** 4 -
				dvx * xo ** 2 * (f - 1) ** 3 +
				f ** 7 * xo ** 3 -
				6 * f ** 6 * xo ** 3 -
				f ** 5 * xo ** 3 * (f - 1) ** 2 +
				13 * f ** 5 * xo ** 3 +
				f ** 4 * xo ** (5 / 2) * Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
				4 * f ** 4 * xo ** 3 * (f - 1) ** 2 -
				12 * f ** 4 * xo ** 3 -
				3 * f ** 3 * xo ** (5 / 2) * Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) -
				5 * f ** 3 * xo ** 3 * (f - 1) ** 2 +
				4 * f ** 3 * xo ** 3 +
				2 * f ** 2 * xo ** (5 / 2) * Math.sqrt((1 - f) ** 3 * (-dvx * f * (1 - f) ** 2 - f * xo * (1 - f) ** 2 + xo)) +
				2 * f ** 2 * xo ** 3 * (f - 1) ** 2))
	);
}

function calculateMevProfit(f: number, xo: number, b: number, dvx: number, s: number) {
	return (
		(-2 * b * dvx * f ** 4 * s -
			2 * b * dvx * f ** 4 +
			10 * b * dvx * f ** 3 * s +
			6 * b * dvx * f ** 3 -
			18 * b * dvx * f ** 2 * s -
			6 * b * dvx * f ** 2 +
			14 * b * dvx * f * s +
			2 * b * dvx * f -
			4 * b * dvx * s +
			2 * b * f ** 3 * s * xo +
			2 * b * f ** 3 * xo -
			2 * b * f ** 2 * s * xo -
			10 * b * f ** 2 * xo +
			2 *
				b *
				f ** 2 *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				) +
			12 * b * f * xo -
			2 *
				b *
				f *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				) -
			4 * b * xo +
			2 * dvx ** 2 * f ** 4 * s -
			8 * dvx ** 2 * f ** 3 * s +
			12 * dvx ** 2 * f ** 2 * s -
			8 * dvx ** 2 * f * s +
			2 * dvx ** 2 * s +
			dvx * f ** 4 * s * xo +
			dvx * f ** 4 * xo -
			6 * dvx * f ** 3 * s * xo -
			4 * dvx * f ** 3 * xo +
			11 * dvx * f ** 2 * s * xo +
			5 * dvx * f ** 2 * xo -
			8 * dvx * f * s * xo -
			2 * dvx * f * xo +
			2 * dvx * s * xo -
			f ** 3 * s * xo ** 2 -
			f ** 3 * xo ** 2 +
			2 * f ** 2 * s * xo ** 2 +
			4 * f ** 2 * xo ** 2 -
			f ** 2 *
				xo *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				) -
			4 * f * xo ** 2 +
			2 *
				f *
				xo *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				)) /
		(dvx * f ** 4 * s +
			dvx * f ** 4 -
			5 * dvx * f ** 3 * s -
			3 * dvx * f ** 3 +
			9 * dvx * f ** 2 * s +
			3 * dvx * f ** 2 -
			7 * dvx * f * s -
			dvx * f +
			2 * dvx * s -
			f ** 3 * s * xo -
			f ** 3 * xo +
			f ** 2 * s * xo +
			5 * f ** 2 * xo -
			f ** 2 *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				) -
			6 * f * xo +
			f *
				Math.sqrt(
					dvx ** 2 * f ** 4 * s ** 2 -
						2 * dvx ** 2 * f ** 4 * s +
						dvx ** 2 * f ** 4 -
						4 * dvx ** 2 * f ** 3 * s ** 2 +
						8 * dvx ** 2 * f ** 3 * s -
						4 * dvx ** 2 * f ** 3 +
						6 * dvx ** 2 * f ** 2 * s ** 2 -
						12 * dvx ** 2 * f ** 2 * s +
						6 * dvx ** 2 * f ** 2 -
						4 * dvx ** 2 * f * s ** 2 +
						8 * dvx ** 2 * f * s -
						4 * dvx ** 2 * f +
						dvx ** 2 * s ** 2 -
						2 * dvx ** 2 * s +
						dvx ** 2 -
						2 * dvx * f ** 3 * s ** 2 * xo +
						4 * dvx * f ** 3 * s * xo -
						2 * dvx * f ** 3 * xo +
						4 * dvx * f ** 2 * s ** 2 * xo -
						12 * dvx * f ** 2 * s * xo +
						8 * dvx * f ** 2 * xo -
						2 * dvx * f * s ** 2 * xo +
						12 * dvx * f * s * xo -
						10 * dvx * f * xo -
						4 * dvx * s * xo +
						4 * dvx * xo +
						f ** 2 * s ** 2 * xo ** 2 -
						2 * f ** 2 * s * xo ** 2 +
						f ** 2 * xo ** 2 +
						4 * f * s * xo ** 2 -
						4 * f * xo ** 2 -
						4 * s * xo ** 2 +
						4 * xo ** 2
				) +
			2 * xo)
	);
}

function findSlippageWithNoLosses(vf: number, vxo: number, vdvx: number, vb: number) {
	let high = maxSlippage(vdvx, vf, vxo);
	if (high <= 0) {
		return 1; // Invulnerable to sandwich attacks
	}
	let low = 0;
	while (high - low > 0.00001) {
		// >0.01%
		const mid = (high + low) / 2;
		const midVal = calculateMevProfit(vf, vxo, vb, vdvx, mid);
		if (midVal > 0) {
			high = mid;
		} else {
			low = mid;
		}
	}
	return low;
}

const stablecoins = [
	'USDT',
	'USDC',
	'BUSD',
	'DAI',
	'FRAX',
	'TUSD',
	'USDD',
	'USDP',
	'GUSD',
	'LUSD',
	'sUSD',
	'MIM',
	'DOLA',
	'USP',
	'USDX',
	'MAI'
];

const defaultSlippage = 0.5 / 100;
export function calculateSlippage(fromToken, toToken, adapter: string, routeInfo: any) {
	if (stablecoins.includes(fromToken) && stablecoins.includes(toToken)) {
		return 0.05 / 100; // Stable-stable trade
	}

	if (adapter === 'PancakeSwap') {
		const slipNoLoss = findSlippageWithNoLosses(0.25 / 100, routeInfo.liquidity, routeInfo.amount, routeInfo.txCost); // TODO: Add token tax into fee
		if (slipNoLoss > 0.1 / 100) {
			return Math.max(slipNoLoss, 5 / 100); // Cap it at 5%
		}
	}
	const slippageFromBaseFee = (2 * routeInfo.txCost) / routeInfo.amount;
	if (slippageFromBaseFee > defaultSlippage) {
		return Math.max(slippageFromBaseFee, 10 / 100);
	}

	return defaultSlippage; // default case
}

function test() {
	const time = Date.now();
	const s = findSlippageWithNoLosses(0.3 / 100, 100e3, 5e3, 5);
	console.log(Date.now() - time, s); // 0-2ms
}
