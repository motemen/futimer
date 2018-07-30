import { GoogleAPI } from "../gateways/GoogleAPI";
import { Result } from "../models";

/**
 * Implements records synchronization with Google Spreadsheet.
 */
export class SyncRecords {
  // private lastSynced: number | undefined;

  // TODO
  private spreadsheetId: string = '1OEI5qUMDAT6z17FZkrGznS23uW7tQelLFhO0uGiruXA';

  constructor(private readonly googleAPI: GoogleAPI) {
  }

  public async uploadRecords(results: Result[]) {
    await this.googleAPI.signIn();
    const gapi = await this.googleAPI.load();
    const files = await gapi.client.drive.files.list()
    console.log(files); // tslint:disable-line
    const values = results.map(({ scramble, time, timestamp }) => {
      return [
        new Date(timestamp).toString(),
        time, // TODO format to duration: "mmmm:ss.000"
        scramble,
      ];
    });
    await (gapi.client.sheets.spreadsheets.values.append as any)({
      range: 'A1',
      spreadsheetId: this.spreadsheetId,
      valueInputOption: 'USER_ENTERED',
    }, { values });
  }
}