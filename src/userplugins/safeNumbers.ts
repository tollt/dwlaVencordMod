/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    MessageObject
} from "@api/MessageEvents";
import definePlugin from "@utils/types";

const numberWords = {
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10",
    "eleven": "11",
    "twelve": "12"
};

export default definePlugin({
    name: "Safe Numbers",
    description: "Keep yourself safe from Discord's regex bots by replacing little numbers with mighty ones.",
    authors: [{ name: "iilwy", id: 971202946895339550n }],

    onBeforeMessageSend(_, msg) {
        return this.onSend(msg);
    },

    onBeforeMessageEdit(_cid, _mid, msg) {
        return this.onSend(msg);
    },

    replaceStandaloneNumbers(str: string) {
        const segments: { text: string, isCodeBlock: boolean; }[] = [];
        let inCodeBlock = false;
        let currentSegment = "";

        const lines = str.split("\n");

        for (const line of lines) {
            if (line.trim().startsWith("```")) {
                segments.push({ text: currentSegment, isCodeBlock: inCodeBlock });
                currentSegment = line + "\n";
                inCodeBlock = !inCodeBlock;
            } else {
                currentSegment += line + "\n";
            }
        }

        segments.push({ text: currentSegment, isCodeBlock: inCodeBlock });

        const processedSegments = segments.map(segment => {
            if (segment.isCodeBlock) {
                return segment.text;
            } else if (!segment.text.match(/\Wage\W|\Wold\W/)) {
                return segment.text;
            } else {
                return segment.text.replace(/\b(1[0-2]|[2-9]|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi, match => {
                    const lowerMatch = match.toLowerCase();
                    let numValue = lowerMatch;
                    if (numberWords[lowerMatch]) numValue = numberWords[lowerMatch];
                    if (numValue === "2" || numValue === "3") {
                        return `sqrt(sqrt(${Math.pow(Number.parseInt(numValue), 4)}))`;
                    }
                    return `sqrt(${Math.pow(Number.parseInt(numValue), 2)})`;
                });
            }
        });

        return processedSegments.join("");
    },

    onSend(msg: MessageObject) {
        msg.content = this.replaceStandaloneNumbers(msg.content);
    },
});
