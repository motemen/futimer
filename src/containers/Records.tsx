import * as React from 'react';

import { connect } from 'react-redux';

import { createStyles, Hidden, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Toolbar, Typography, withStyles, WithStyles } from '@material-ui/core';
import { CloudDone, OpenInNew, Sync } from '@material-ui/icons';

import classNames from 'classnames';

import './Records.css'; // TODO use css-modules

import { Actions, AsyncActions } from '../actions';
import { calcStats, formatDuration, Result, ResultStats } from '../models';
import { StoreState } from '../types';

import { ThunkDispatch } from 'redux-thunk';

interface OwnProps {
  isSyncing: boolean;
  results: Result[];
  stats: ResultStats;
  syncDone: boolean;
}

type Props = OwnProps & { dispatch: ThunkDispatch<StoreState, undefined, Actions> } & WithStyles<typeof RecordsStyles>;

const RecordsStyles = (theme: Theme) => createStyles({
  root: {
    margin: theme.spacing.unit * 2,
  },
  spacer: {
    flex: '1',
  },
  summary: {
    color: theme.palette.text.secondary,
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
          <IconButton><OpenInNew /></IconButton>
          <IconButton onClick={this.handleSyncClick}>
            {
              /* TODO: state:
                 - authLoading .. grayed-out CloudOff
                 - notAuthed .. CloudOff
                 - authed
                   - syncDone .. CloudDone
                   - notSynced .. Sync
                   - isSyncing .. rorating Sync
              */
              this.props.syncDone
              ? <CloudDone />
              : <Sync className={classNames({ isSyncing: this.props.isSyncing })} />
            }
          </IconButton>
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

  private formatTimestamp(t: number) {
    return new Date(t).toLocaleString();
  }
}

function mapStateToProps({ results, sync: { isSyncing, lastSynced } }: StoreState) {
  return {
    isSyncing,
    results,
    stats: calcStats(results),
    syncDone: results.length === 0 || results[results.length-1].timestamp === lastSynced,
  };
}

export default connect(mapStateToProps)(withStyles(RecordsStyles)(Records));