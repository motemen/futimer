declare namespace gapi {
  namespace client {
    export var sheets: { spreadsheets: typeof gapi.client.spreadsheets };
  }
}

declare module "tnoodle/tnoodle" {

}

declare var tnoodlejs: any;

declare var puzzle: any;

// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
declare class MediaRecorder {
  constructor(stream: MediaStream);

  public stop(): void;

  ondataavailable?: (e: any) => void;
  onstop?: (e: any) => void;

  start(): void;
  stop(): void;

  state: "inactive" | "recording" | "paused";
}
