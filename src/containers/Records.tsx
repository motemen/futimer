import * as React from 'react';

import { connect } from 'react-redux';

import { ClickAwayListener, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Hidden, Icon, IconButton, Menu, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Toolbar, Typography, withStyles, WithStyles } from '@material-ui/core';

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

interface State {
  recordMenuAnchor?: HTMLElement;
  activeRecordIndex?: number;
}

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
    overflowX: 'auto',
  },
  scramble: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
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
  timestamp: {
  },
  title: {
    flexBasis: '20%',
  },
  toolbar: {
    paddingRight: theme.spacing.unit,
  },
});

class Records extends React.Component<Props, State> {
  public state: Readonly<State> = {};

  public render() {
    return (
      <Paper>
        <Toolbar>
          <Typography variant="headline">Results</Typography>
          <div className={this.props.classes.spacer} />
          {
            this.props.isAuthed && this.props.spreadsheetId
              ? <IconButton onClick={this.handleOpenSheetClick}><Icon>open_in_new</Icon></IconButton>
              : null
          }
          <IconButton><Icon>add</Icon></IconButton>
        </Toolbar>
        <ExpansionPanel>
          <ExpansionPanelSummary>
            <Hidden smDown={true}>
              <Typography className={this.props.classes.title}>Session #1</Typography>
            </Hidden>
            <Typography className={this.props.classes.summary}>
              Best ao5: {formatDuration((this.props.stats.averageOf[5] || {}).best) || 'N/A'}
              {' '}
              Curr ao5: {formatDuration((this.props.stats.averageOf[5] || {}).current) || 'N/A'}
            </Typography>
            <div className={this.props.classes.spacer} />
            <div style={{ marginBottom: -12, marginTop: -12 }}>
              {
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
              }
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className={this.props.classes.timestamp}>Timestamp</TableCell>
                  <TableCell className={this.props.classes.scramble}>Scramble</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  this.props.results.slice().reverse().map((result, i) => {
                    return (
                      <TableRow key={i}>
                        <TableCell className={this.props.classes.timestamp}>{this.formatTimestamp(result.timestamp)}</TableCell>
                        <TableCell className={this.props.classes.scramble}><code>{result.scramble}</code></TableCell>
                        <TableCell numeric={true}><code>{formatDuration(result.time)}</code></TableCell>
                        <TableCell padding="checkbox">
                          <IconButton onClick={this.handleRecordMoreClick(this.props.results.length - (i + 1))}>
                            <Icon>more_vert</Icon>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                }
              </TableBody>
            </Table>
            <ClickAwayListener onClickAway={this.handleRecordMenuClose}>
              <div>{ /* XXX required for ClickAwayListener to work! */}
                <Menu anchorEl={this.state.recordMenuAnchor} open={Boolean(this.state.recordMenuAnchor)}>
                  <MenuItem onClick={this.handleDeleteRecordClick}>Delete</MenuItem>
                </Menu>
              </div>
            </ClickAwayListener>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Paper>
    );
  }

  private handleSyncClick = () => {
    if (this.props.isAuthed === undefined) {
      // loading. do not try to sync yet
      return;
    }

    this.props.dispatch(AsyncActions.syncRecords());
  }

  private handleOpenSheetClick = () => {
    const url = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId}/edit`;
    window.open(url);
  }

  private handleDeleteRecordClick = () => {
    this.props.dispatch(Actions.deleteResult({ index: this.state.activeRecordIndex! }));
  }

  private handleRecordMoreClick = (i: number) => (ev: React.MouseEvent<HTMLElement>) => {
    this.setState({ recordMenuAnchor: ev.currentTarget, activeRecordIndex: i });
  }

  private handleRecordMenuClose = () => {
    this.setState({ recordMenuAnchor: undefined });
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
    syncDone: results.length === 0 || results[results.length - 1].timestamp === lastSynced,
  };
}

export default connect(mapStateToProps)(withStyles(RecordsStyles)(Records));