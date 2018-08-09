import * as React from 'react';

import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { ClickAwayListener, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Hidden, Icon, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';

import { Actions } from '../actions';
import { calcStats, formatDuration, Session } from '../models';
import { StoreState } from '../types';

interface OwnProps {
  resultIndex: number;
  session: Session;
  expanded?: boolean;
  actionButton?: React.ReactNode;
}

interface State {
  recordMenuAnchor?: HTMLElement;
  activeRecordIndex?: number;
}

const Styles = (theme: Theme) => createStyles({
  scramble: {
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  summary: {
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  summaryContent: {
    '& > :last-child': {
      paddingRight: 0,
    },
  },
  timestamp: {
  },
  title: {
    flexBasis: '20%',
  },
});

class SessionRecords extends React.Component<OwnProps & { dispatch: ThunkDispatch<StoreState, undefined, Actions> } & WithStyles<typeof Styles>, State> {
  public state: Readonly<State> = {};

  public render() {
    const {
      resultIndex,
      session,
    } = this.props;

    const stats = calcStats(session.records);

    return <ExpansionPanel expanded={this.props.expanded}>
      <ExpansionPanelSummary classes={{ content: this.props.classes.summaryContent}}>
        <Hidden xsDown={true}>
          <Typography className={this.props.classes.title}>
            {resultIndex === -1 ? "Current Session" : session.name}
          </Typography>
        </Hidden>
        <Typography className={this.props.classes.summary}>
          Best ao5: {formatDuration((stats.averageOf[5] || {}).best) || 'N/A'}
          {' '}
          Curr ao5: {formatDuration((stats.averageOf[5] || {}).current) || 'N/A'}
        </Typography>
        <div style={{ flex: 1 }} />
        { this.props.actionButton }
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
              session.records.slice().reverse().map((record, recordIndex) => {
                return (
                  <TableRow key={recordIndex}>
                    <TableCell className={this.props.classes.timestamp}>{this.formatTimestamp(record.timestamp)}</TableCell>
                    <TableCell className={this.props.classes.scramble}><code>{record.scramble}</code></TableCell>
                    <TableCell numeric={true}><code>{formatDuration(record.time)}</code></TableCell>
                    <TableCell padding="checkbox">
                      <IconButton onClick={this.handleRecordMoreClick(session.records.length - (recordIndex + 1))}>
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
  }

  private handleRecordMoreClick = (i: number) => (ev: React.MouseEvent<HTMLElement>) => {
    this.setState({ recordMenuAnchor: ev.currentTarget, activeRecordIndex: i });
  }

  private handleRecordMenuClose = () => {
    this.setState({ recordMenuAnchor: undefined });
  }

  private handleDeleteRecordClick = () => {
    this.props.dispatch(
      Actions.deleteRecord({
        sessionIndex: this.props.resultIndex,
        recordIndex: this.state.activeRecordIndex!,
      }),
    );
  }

  private formatTimestamp(t: number) {
    return new Date(t).toLocaleString();
  }
}

export default connect()(withStyles(Styles)(SessionRecords));