import { GoogleAPI } from "../gateways/GoogleAPI";
import { Result } from "./Attempt";

/**
 * Implements records synchronization with Google Spreadsheet.
 */
export class RecordsSynchronizer {
  // private lastSynced: number | undefined;

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
        timestamp,
        time,
        scramble,
      ];
    });
    await (gapi.client.sheets.spreadsheets.values.append as any)({
      range: 'A1',
      spreadsheetId: this.spreadsheetId,
      valueInputOption: 'RAW'
    }, { values });
  }
}