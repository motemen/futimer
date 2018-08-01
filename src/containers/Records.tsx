import * as React from 'react';

import { connect } from 'react-redux';

import { createStyles, Hidden, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Toolbar, Typography, withStyles, WithStyles } from '@material-ui/core';
import { CloudDone, CloudOff, OpenInNew, Sync } from '@material-ui/icons';

import classNames from 'classnames';

import { Actions, AsyncActions } from '../actions';
import { calcStats, formatDuration, Result, ResultStats } from '../models';
import { StoreState } from '../types';

import { ThunkDispatch } from 'redux-thunk';

interface OwnProps {
  isAuthed?: boolean;
  isSyncing: boolean;
  results: Result[];
  spreadsheetId?: string;
  stats: ResultStats;
  syncDone: boolean;
}

type Props = OwnProps & { dispatch: ThunkDispatch<StoreState, undefined, Actions> } & WithStyles<typeof RecordsStyles>;

const RecordsStyles = (theme: Theme) => createStyles({
  '@keyframes spin-l': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(-360deg)' },
  },
  isSyncing: {
    animation: 'spin-l 1.5s linear infinite',
  },
  root: {
    margin: theme.spacing.unit * 2,
  },
  spacer: {
    flex: '1',
  },
  summary: {
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  title: {
    flexBasis: '20%',
  },
  toolbar: {
    paddingRight: theme.spacing.unit,
  },
});

class Records extends React.Component<Props> {
  public render() {
    return (
      <Paper className={this.props.classes.root}>
        <Toolbar className={this.props.classes.toolbar}>
          <Hidden smDown={true}>
            <Typography variant="headline" className={this.props.classes.title}>Results</Typography>
          </Hidden>
          <Typography variant="subheading" className={this.props.classes.summary}>
            Best ao5: {formatDuration((this.props.stats.averageOf[5] || {}).best) || 'N/A'}
            {' '}
            Last ao5: {formatDuration((this.props.stats.averageOf[5] || {}).last) || 'N/A'}
          </Typography>
          <div className={this.props.classes.spacer} />
          {
            this.props.spreadsheetId
              ? <IconButton onClick={this.handleOpenSheetClick}><OpenInNew /></IconButton>
              : null
          }
          {
            this.props.isAuthed
              ? <IconButton onClick={this.handleSyncClick}>
                  {
                    this.props.syncDone
                      ? <CloudDone />
                      : <Sync className={classNames({ [this.props.classes.isSyncing]: this.props.isSyncing })} />
                  }
                </IconButton>
              : <IconButton>
                  {
                    this.props.isAuthed === false
                      ? <CloudOff />
                      : <CloudOff color="disabled" />
                  }
                </IconButton>
          }
        </Toolbar>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Scramble</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              this.props.results.map((result, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>{this.formatTimestamp(result.timestamp)}</TableCell>
                    <TableCell><code>{result.scramble}</code></TableCell>
                    <TableCell><code>{formatDuration(result.time)}</code></TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </Paper>
    );
  }

  private handleSyncClick = () => {
    this.props.dispatch(AsyncActions.syncRecords());
  }

  private handleOpenSheetClick = () => {
    const url = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId}/edit`;
    window.open(url);
  }

  private formatTimestamp(t: number) {
    return new Date(t).toLocaleString();
  }
}

function mapStateToProps({ results, auth: { isAuthed }, sync: { isSyncing, lastSynced, spreadsheetId } }: StoreState) {
  return {
    isAuthed,
    isSyncing,
    results,
    spreadsheetId,
    stats: calcStats(results),
    syncDone: results.length === 0 || results[results.length-1].timestamp === lastSynced,
  };
}

export default connect(mapStateToProps)(withStyles(RecordsStyles)(Records));