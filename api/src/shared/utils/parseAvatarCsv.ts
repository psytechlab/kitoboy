import {parse} from 'csv-parse';
import fs from 'fs';
import {finished} from 'stream/promises';

export type ParsedPost = {
    postedAt: string;
    text: string;
};

/**
 * Парсит CSV-файл с данными о постах Аватара
 *
 * - Формат: CSV
 * - Заголовки колонок отсутствуют - данные парсятся, начиная с первой строки
 * - Первая колонка - дата и время с тайм-зоной в формате UTC (напр. `2025-04-10T12:38:22.922Z`)
 * - Вторая колонка - текст
 *
 * При корректных данных и формате возвращает Promise с массивом постов Аватара
 * @param {string} filePath
 */
export const parseAvatarCsv = async (
    filePath: string
): Promise<ParsedPost[]> => {
    return new Promise(async (resolve, reject) => {
        const records: ParsedPost[] = [];

        const parser = fs.createReadStream(filePath).pipe(
            parse({
                trim: true,
                skipEmptyLines: true,
                skipRecordsWithError: true,
                to: 3000,
            })
        );

        parser
            .on('readable', () => {
                let record;

                while ((record = parser.read()) !== null) {
                    if (record[0] && record[1]) {
                        records.push({
                            postedAt: record[0].trim(),
                            text: record[1].trim(),
                        });
                    }
                }
            })
            .on('end', () => {
                records.forEach(({postedAt, text}) => {
                    const parsedDate = Date.parse(postedAt);

                    if (!parsedDate || isNaN(parsedDate)) {
                        reject(`Incorrect date: ${postedAt}`);
                    }

                    if (!text) {
                        reject(`Empty post message at ${postedAt}`);
                    }
                });
            });

        await finished(parser);

        fs.unlink(filePath, err => {
            if (err) {
                console.error(`Error removing file: ${err}`);

                return;
            }

            console.log(`File ${filePath} has been successfully removed.`);
        });

        resolve(records);
    });
};
