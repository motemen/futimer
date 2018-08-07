import { GoogleAPI } from "../gateways/GoogleAPI";
import { Record } from "../models";

/**
 * Implements records synchronization with Google Spreadsheet.
 */
export class SyncRecords {
  private getFileP?: Promise<gapi.client.drive.File>;

  constructor(private readonly googleAPI: GoogleAPI) {
  }

  public async uploadRecords(spreadsheetId: string, results: Record[]) {
    await this.googleAPI.signIn();
    const gapi = await this.googleAPI.load();
    const values = results.map(({ scramble, time, timestamp }) => {
      return [
        new Date(timestamp).toLocaleString(),
        time, // TODO format to duration: "mmmm:ss.000"
        scramble,
      ];
    });
    await (gapi.client.sheets.spreadsheets.values.append as any)({
      range: 'A1',
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

      const createResp = await gapi.client.drive.files.create({});
      return createResp.result;
    })();
  }
}