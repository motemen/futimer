// ref:
// - https://developers.google.com/drive/v3/web/quickstart/js
// - https://developers.google.com/api-client-library/javascript/reference/referencedocs

import { drive_v3, sheets_v4 } from 'googleapis';

declare var gapi: GAPI | undefined;

export interface GoogleUser {
  getBasicProfile(): {
    getImageUrl(): string;
  } | undefined;
}

export interface GAPI {
  auth2: {
    getAuthInstance(): {
      isSignedIn: {
        get(): any;
        listen(cb: any): void;
      };
      currentUser: {
        get(): any;
        listen(cb: any): void;
      };
      signIn(): any;
      signOut(): any;
    };
  };
  client: {
    init: (opts: {}) => void;
    sheets: sheets_v4.Sheets;
    drive: drive_v3.Drive;
  };
  load(l: string, f: () => void): void;
}

export interface GoogleAPIOptions {
  apiKey?: string;
  discoveryDocs: string[];
  clientId: string;
  scope: string;
}

export class GoogleAPI {
  private readonly SCRIPT_SOURCE = 'https://apis.google.com/js/api.js';

  private loadScriptP?: Promise<GAPI>;

  constructor(private readonly opts: GoogleAPIOptions) {
    this.load();
  }

  public load(): Promise<GAPI> {
    return this.loadScript()
      .then((g) => new Promise<GAPI>((resolve, reject) => {
        g.load('client:auth2', () => resolve(g));
      }))
      .then((g) => {
        g.client.init(this.opts)
        return g;
      });
  }

  public signIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.load().then((g) => {
        const auth = g.auth2.getAuthInstance();
        if (auth.isSignedIn.get()) {
          resolve();
          return;
        }

        auth.signIn();

        auth.isSignedIn.listen((signedIn: boolean) => {
          if (signedIn) {
            resolve();
          } else {
            reject();
          }
        });
      });
    });
  }

  private loadScript(): Promise<GAPI> {
    if (typeof gapi !== 'undefined') {
      return Promise.resolve(gapi);
    }

    if (this.loadScriptP) {
      return this.loadScriptP;
    }

    return this.loadScriptP = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('src', this.SCRIPT_SOURCE);
      script.addEventListener('load', () => {
        this.loadScriptP = undefined;
        resolve(gapi);
      });
      script.addEventListener('error', (ev: ErrorEvent) => {
        this.loadScriptP = undefined;
        reject(`Failed to load ${this.SCRIPT_SOURCE}`);
      });
      document.querySelector('head')!.appendChild(script);
    });
  }
}
