function pad0(s: any): string {
  s = s.toString();
  if (s.length === 1) {
    return "0" + s;
  }
  return s;
}

function postCounts(counts: { [ymd: string]: number }) {
  const props = PropertiesService.getScriptProperties();

  const API_URL = props.getProperty("PIXELA_API_URL");
  const TOKEN = props.getProperty("PIXELA_TOKEN");

  if (!API_URL) {
    throw new Error("PIXELA_API_URL script property not set");
  }

  if (!TOKEN) {
    throw new Error("PIXELA_TOKEN script property not set");
  }

  for (const ymd of Object.keys(counts)) {
    const count = counts[ymd];
    UrlFetchApp.fetch(API_URL, {
      headers: { "X-USER-TOKEN": TOKEN },
      payload: JSON.stringify({ date: ymd, quantity: count.toString() })
    });
  }
}

(global as any).syncPixelaAll = function syncPixelaAll() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1);
  const counts: { [ymd: string]: number } = {};

  range
    .getValues()
    .map((v: any[]) => {
      const dt = new Date(v[0]);
      return dt.getFullYear() + pad0(dt.getMonth() + 1) + pad0(dt.getDate());
    })
    .forEach((ymd: string) => {
      counts[ymd] = (counts[ymd] || 0) + 1;
    });

  postCounts(counts);
};

(global as any).syncPixelaDelta = function syncPixelaDelta() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0);
  yesterday.setMinutes(0);
  yesterday.setSeconds(0);
  yesterday.setMilliseconds(0);

  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1);
  const counts: { [ymd: string]: number } = {};

  range
    .getValues()
    .map((v: any) => new Date(v[0]))
    .filter((dt: Date) => dt > yesterday)
    .map((dt: Date) => dt.getFullYear() + pad0(dt.getMonth() + 1) + pad0(dt.getDate()))
    .forEach((ymd: string) => {
      counts[ymd] = (counts[ymd] || 0) + 1;
    });

  postCounts(counts);
};
