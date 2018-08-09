import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { createStyles, Icon, IconButton, Paper, Theme, Toolbar, Typography, withStyles, WithStyles } from '@material-ui/core';

import classNames from 'classnames';

import { Actions, AsyncActions } from '../actions';
import { calcStats, ResultStats, Session } from '../models';
import { StoreState } from '../types';
import SessionRecords from './SessionRecords';

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

type Props = OwnProps & { dispatch: ThunkDispatch<StoreState, undefined, Actions> } & WithStyles<typeof Styles>;

interface State {
  recordMenuAnchor?: HTMLElement;
  activeRecordIndex?: number;
}

const Styles = (theme: Theme) => createStyles({
  '@keyframes spin-l': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(-360deg)' },
  },
  isSyncing: {
    animation: 'spin-l 1.5s linear infinite',
  },
  root: {
    margin: theme.spacing.unit * 2,
    overflowX: 'auto',
    [theme.breakpoints.down('sm')]: {
      margin: 0,
    },
  },
  spacer: {
    flex: '1',
  },
  title: {
    flexBasis: '20%',
  },
});

class Results extends React.Component<Props, State> {
  public state: Readonly<State> = {};

  public render() {
    return <div>
      <Paper className={this.props.classes.root}>
        <SessionRecords session={this.props.session} resultIndex={-1} expanded={true}
          actionButton={ <IconButton onClick={this.handleNewSessionClick}><Icon>save</Icon></IconButton> } />
      </Paper>,
      <Paper className={this.props.classes.root}>
        <Toolbar>
          <Typography variant="headline">Results</Typography>
          <div className={this.props.classes.spacer} />
          {
            this.props.isAuthed && this.props.spreadsheetId
              ? <IconButton onClick={this.handleOpenSheetClick}><Icon>open_in_new</Icon></IconButton>
              : null
          }
          <IconButton onClick={this.handleSyncClick}>
            {
              this.props.isAuthed
                ? this.props.syncDone
                  ? <Icon>cloud_done</Icon>
                  : <Icon className={classNames({ [this.props.classes.isSyncing]: this.props.isSyncing })}>sync</Icon>
                : this.props.isAuthed === false
                  ? <Icon>cloud_off</Icon>
                  : <Icon color="disabled">cloud_off</Icon>
            }
          </IconButton>
        </Toolbar>
        {
          this.props.results.map(({ session, stats }, resultIndex) => {
            return <SessionRecords session={session} resultIndex={resultIndex} key={resultIndex} />
          })
        }
      </Paper>
    </div>;
  }

  private handleSyncClick = () => {
    if (this.props.isAuthed === undefined) {
      // loading. do not try to sync yet
      return;
    }

    this.props.dispatch(AsyncActions.syncRecords());
  }

  private handleNewSessionClick = () => {
    this.props.dispatch(Actions.createNewSession());
  }

  private handleOpenSheetClick = () => {
    const url = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId}/edit`;
    window.open(url);
  }
}

function mapStateToProps({ current: { session }, results, auth: { isAuthed }, sync: { isSyncing, spreadsheetId } }: StoreState) {
  return {
    isAuthed,
    isSyncing,
    results: results.map(result => ({ ...result, stats: calcStats(result.session.records) })),
    spreadsheetId,
    syncDone: results.every(({ isSynced }) => isSynced),
    session,
  };
}

export default connect(mapStateToProps)(withStyles(Styles)(Results));