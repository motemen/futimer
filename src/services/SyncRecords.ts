import { GoogleAPI } from "../gateways/GoogleAPI";
import { PuzzleConfiguration, Session } from "../models";

/**
 * Implements records synchronization with Google Spreadsheet.
 */
export class SyncRecords {
  private getFileP?: Promise<gapi.client.drive.File>;

  constructor(private readonly googleAPI: GoogleAPI) {
  }

  public async uploadSession(spreadsheetId: string, { name, puzzleType, records }: Session) {
    await this.googleAPI.signIn();
    const gapi = await this.googleAPI.load();
    const values = records.map(({ scramble, time, timestamp }) => {
      return [
        name,
        new Date(timestamp).toLocaleString(),
        time,
        scramble,
      ];
    });
    const gameLongName = PuzzleConfiguration[puzzleType].longName;
    await this.ensureSheet(spreadsheetId, gameLongName);
    await (gapi.client.sheets.spreadsheets.values.append as any)({
      range: `'${gameLongName}'!A1`,
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
    }, { values });
  }

  public async getFile(): Promise<gapi.client.drive.File> {
    if (this.getFileP) {
      return this.getFileP;
    }

    return this.getFileP = (async () => {
      const gapi = await this.googleAPI.load();
      const listResp = await gapi.client.drive.files.list({ orderBy: 'createdTime desc' });
      if (listResp.result.files && listResp.result.files.length > 0) {
        return listResp.result.files[0];
      }

      const createResp = await (gapi.client.drive.files.create as any)({}, {
        mimeType: 'application/vnd.google-apps.spreadsheet',
        name: 'Speedcubing records',
      });
      return createResp.result;
    })();
  }

  private async ensureSheet(spreadsheetId: string, name: string) {
    const gapi = await this.googleAPI.load();
    const sheetInfo = await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
    if (sheetInfo.result.sheets!.some(sheet => sheet.properties!.title === name)) {
      return;
    }

    await (gapi.client.sheets.spreadsheets.batchUpdate as any)(
      { spreadsheetId },
      {
        requests: [
          { addSheet: { properties: { title: name } } }
        ]
      },
    );
  }
}