import * as React from "react";

import { connect } from "react-redux";

import {
  createStyles,
  Icon,
  IconButton,
  Paper,
  Theme,
  Toolbar,
  Typography,
  withStyles,
  WithStyles,
  Tooltip
} from "@material-ui/core";

import classNames from "classnames";

import { Actions, AsyncAction, Dispatch } from "../actions";
import { calcStats, ResultStats, Session, StoreState } from "../models";
import SessionRecords from "./SessionRecords";

interface OwnProps {
  isAuthed?: boolean;
  isSyncing: boolean;
  results: Array<{
    session: Session;
    stats: ResultStats;
    isSynced: boolean;
  }>;
  spreadsheetId?: string;
  syncDone: boolean;
  session: Session;
}

type Props = OwnProps & { dispatch: Dispatch } & WithStyles<typeof Styles>;

interface State {
  recordMenuAnchor?: HTMLElement;
  activeRecordIndex?: number;
}

const Styles = (theme: Theme) =>
  createStyles({
    "@keyframes spin-l": {
      from: { transform: "rotate(0deg)" },
      to: { transform: "rotate(-360deg)" }
    },
    isSyncing: {
      animation: "spin-l 1.5s linear infinite"
    },
    root: {
      margin: theme.spacing.unit * 2,
      marginTop: 0,
      overflowX: "auto",
      [theme.breakpoints.down("sm")]: {
        marginLeft: 0,
        marginRight: 0,
        borderRadius: 0
      }
    },
    spacer: {
      flex: "1"
    },
    title: {
      flexBasis: "20%"
    }
  });

class Results extends React.Component<Props, State> {
  public state: Readonly<State> = {};

  public render() {
    return (
      <div>
        <Paper className={this.props.classes.root} elevation={1}>
          <SessionRecords
            session={this.props.session}
            resultIndex={-1}
            defaultExpanded={true}
            actionButton={
              <Tooltip title="Save records">
                <div>
                  <IconButton
                    style={{ marginTop: -16, marginBottom: -16 }}
                    onClick={this.handleNewSessionClick}
                    disabled={this.props.session.records.length === 0}
                  >
                    <Icon>save</Icon>
                  </IconButton>
                </div>
              </Tooltip>
            }
          />
        </Paper>
        <Paper className={this.props.classes.root} elevation={1}>
          <Toolbar>
            <Typography variant="headline">History</Typography>
            <div className={this.props.classes.spacer} />
            {this.props.isAuthed && this.props.spreadsheetId ? (
              <Tooltip title="Open spreadsheet">
                <IconButton onClick={this.handleOpenSheetClick}>
                  <Icon>open_in_new</Icon>
                </IconButton>
              </Tooltip>
            ) : null}
            <IconButton onClick={this.handleSyncClick}>
              {this.props.isAuthed ? (
                this.props.syncDone ? (
                  <Tooltip title="Synced all records">
                    <Icon>cloud_done</Icon>
                  </Tooltip>
                ) : (
                  <Tooltip title="Sync records">
                    <Icon
                      className={classNames({
                        [this.props.classes.isSyncing]: this.props.isSyncing
                      })}
                    >
                      sync
                    </Icon>
                  </Tooltip>
                )
              ) : this.props.isAuthed === false ? (
                <Icon>cloud_off</Icon>
              ) : (
                <Icon color="disabled">cloud_off</Icon>
              )}
            </IconButton>
          </Toolbar>
          {this.props.results.map(({ session, stats }, resultIndex) => {
            return (
              <SessionRecords
                session={session}
                resultIndex={resultIndex}
                key={resultIndex}
              />
            );
          })}
        </Paper>
      </div>
    );
  }

  private handleSyncClick = () => {
    if (this.props.isAuthed === undefined) {
      // loading. do not try to sync yet
      return;
    }

    this.props.dispatch(AsyncAction.syncRecords());
  };

  private handleNewSessionClick = () => {
    this.props.dispatch(Actions.createNewSession());
  };

  private handleOpenSheetClick = () => {
    const url = `https://docs.google.com/spreadsheets/d/${
      this.props.spreadsheetId
    }/edit`;
    window.open(url);
  };
}

function mapStateToProps({
  current: { session },
  results,
  auth: { isAuthed },
  sync: { isSyncing, spreadsheetId }
}: StoreState) {
  return {
    isAuthed,
    isSyncing,
    results: results.map(result => ({
      ...result,
      stats: calcStats(result.session.records)
    })),
    spreadsheetId,
    syncDone: results.every(({ isSynced }) => isSynced),
    session
  };
}

export default connect(mapStateToProps)(withStyles(Styles)(Results));
