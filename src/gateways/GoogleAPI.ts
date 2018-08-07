// ref:
// - https://developers.google.com/drive/v3/web/quickstart/js
// - https://developers.google.com/api-client-library/javascript/reference/referencedocs

import { EventEmitter } from 'events';

// tslint:disable-next-line:no-namespace
export interface GoogleAPIOptions {
  apiKey?: string;
  discoveryDocs: string[];
  clientId: string;
  scope: string;
}

type GAPI = typeof gapi;

export enum GoogleAPIEvents {
  UPDATE_SIGNED_IN = 'updateSignedIn'
}
export class GoogleAPI extends EventEmitter {
  private readonly SCRIPT_SOURCE = 'https://apis.google.com/js/api.js';

  private loadP?: Promise<GAPI>;
  private loadScriptP?: Promise<GAPI>;

  constructor(private readonly opts: GoogleAPIOptions) {
    super();
    this.load();
  }

  public load(): Promise<GAPI> { 
    return this.loadP || (this.loadP = (async () => {
      const g = await this.loadScript();
      await new Promise((resolve) => g.load('client:auth2', resolve));
      await g.client.init(this.opts);
      const auth = g.auth2.getAuthInstance();
      this.emit(GoogleAPIEvents.UPDATE_SIGNED_IN, auth.isSignedIn.get());
      auth.isSignedIn.listen((signedIn) => this.emit(GoogleAPIEvents.UPDATE_SIGNED_IN, signedIn));
      return g;
    })());
  }

  public async signIn(): Promise<void> {
    const g = await this.load();
    return new Promise<void>((resolve, reject) => {
      const auth = g.auth2.getAuthInstance();
      if (auth.isSignedIn.get()) {
        resolve();
        return;
      }

      this.once(
        GoogleAPIEvents.UPDATE_SIGNED_IN, (signedIn: boolean) => {
          if (signedIn) {
            resolve();
          } else {
            reject();
          }
        },
      );

      auth.signIn();
    });
  }

  private loadScript(): Promise<GAPI> {
    if (typeof gapi !== 'undefined') {
      return Promise.resolve(gapi);
    }

    if (this.loadScriptP) {
      return this.loadScriptP;
    }

    return this.loadScriptP = new Promise<GAPI>((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('src', this.SCRIPT_SOURCE);
      script.addEventListener('load', () => {
        this.loadScriptP = undefined;
        const poll = () => {
          if (typeof gapi !== 'undefined') {
            resolve(gapi);
            return;
          }
          setTimeout(poll, 50);
        };
        poll();
      });
      script.addEventListener('error', (ev: ErrorEvent) => {
        this.loadScriptP = undefined;
        reject(`Failed to load ${this.SCRIPT_SOURCE}`);
      });
      document.querySelector('head')!.appendChild(script);
    });
  }
}

export const googleAPI = new GoogleAPI({
  clientId: process.env.REACT_APP_GOOGLE_API_CLIENT_ID!,
  discoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/drive.file',
});
