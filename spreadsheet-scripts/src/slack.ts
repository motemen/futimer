import { variousAveragesOf, formatDuration } from "../../src/models/index";

import "es6-shim";

(global as any).postStatsToSlack = (e: any) => {
  const props = PropertiesService.getScriptProperties();

  const WEBHOOK_URL = props.getProperty("SLACK_WEBHOOK_URL");
  if (!WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL script property not set");
  }

  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = parseInt(props.getProperty("SLACK_LAST_ROW") || "", 10) || sheet.getLastRow();

  let range: GoogleAppsScript.Spreadsheet.Range;
  try {
    range = sheet.getRange(lastRow + 1, 1, sheet.getLastRow() - lastRow, 3);
  } catch (e) {
    props.setProperty("SLACK_LAST_ROW", sheet.getLastRow().toString());
    return;
  }

  const values = range.getValues();
  const times = values.map((v: any[]) => v[2]);
  const session = values[0][0];

  const bestTime = Math.min(...times);
  const ao5 = times.length >= 5 ? variousAveragesOf(5, times) : null;
  const ao12 = times.length >= 12 ? variousAveragesOf(12, times) : null;

  const payload = {
    username: "fuTimer",
    icon_emoji: ":rubikscube:",
    attachments: [
      {
        fallback: `Session ${session}: Best single = ${bestTime}`,
        pretext: `Session ${session}`,
        fields: [
          {
            title: "Attempts",
            value: times.length,
            short: true
          },
          ...[
            ["Best single", formatDuration(bestTime)],
            ["Best ao5", ao5 && formatDuration(ao5.best)],
            ["Best ao12", ao12 && formatDuration(ao12.best)]
          ]
            .filter(([name, score]) => score)
            .map(([name, score]) => {
              return {
                title: name,
                value: score,
                short: true
              };
            })
        ]
      }
    ]
  };

  UrlFetchApp.fetch(WEBHOOK_URL, { method: "post", payload: JSON.stringify(payload) });

  props.setProperty("SLACK_LAST_ROW", range.getLastRow().toString());
};
