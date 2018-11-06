# fuTimer spreadsheet scripts

In your spreadsheet, visit [Tools] → [Script editor] to open script editor. Add files under dist/ directory via [File] → [New] → [Script file].

Configure scripts by setting variables at [File] → [Project properties] → [Script properties].

## Slack

### Configuration

- `SLACK_WEBHOOK_URL`

### Functions

- `postStatsToSlack`
  - Set trigger on Spreadsheet onChange.

## Pixela

### Configuration

- `PIXELA_API_URL`
- `PIXELA_TOKEN`

### Functions

- `syncPixelaDelta`
  - Set trigger on daily timer.
- `syncPixelaAll`
  - Run once manually, at first.
