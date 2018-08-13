import * as React from 'react';

import { connect } from 'react-redux';

import { ClickAwayListener, createStyles, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Hidden, Icon, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography, withStyles, WithStyles } from '@material-ui/core';

import { Action, Dispatch } from '../actions';
import { calcStats, formatDuration, Session, PuzzleConfiguration } from '../models';

interface OwnProps {
  resultIndex: number;
  session: Session;
  defaultExpanded?: boolean;
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
    [theme.breakpoints.down('xs')]: {
      display: 'none',
    },
  },
  number: {

  },
  title: {
    flexBasis: '20%',
  },
});

class SessionRecords extends React.Component<OwnProps & { dispatch: Dispatch } & WithStyles<typeof Styles>, State> {
  public state: Readonly<State> = {};

  public render() {
    const stats = calcStats(this.props.session.records);

    return <ExpansionPanel expanded={this.props.defaultExpanded}>
      <ExpansionPanelSummary classes={{ content: this.props.classes.summaryContent}}>
        <Hidden xsDown={true}>
          <Typography className={this.props.classes.title}>
            {this.props.resultIndex === -1 ? "Current Session" : this.props.session.name}
            {' '}
            ({PuzzleConfiguration[this.props.session.puzzleType].longName})
          </Typography>
        </Hidden>
        <Typography className={this.props.classes.summary} component="div">
          {
            [100, 12, 5].map(n => {
              const st = stats.averageOf[n];
              if (!st) {
                return null;
              }

              return <div key={n}>
                <Hidden xsDown={true}>Best ao{n}: {formatDuration(st.best) || 'N/A'}</Hidden>
                {' '}
                <Hidden xsDown={true}>Curr </Hidden>
                <span>ao{n}: {formatDuration(st.current) || 'N/A'}</span>
              </div>;
            })
          }
        </Typography>
        <div style={{ flex: 1 }} />
        { this.props.actionButton }
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={this.props.classes.number}>#</TableCell>
              <TableCell className={this.props.classes.timestamp}>Timestamp</TableCell>
              <TableCell className={this.props.classes.scramble}>Scramble</TableCell>
              <TableCell>Time</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {
              this.props.session.records.slice().reverse().map((record, recordIndex) => {
                return (
                  <TableRow key={recordIndex}>
                    <TableCell className={this.props.classes.number}>{this.props.session.records.length - recordIndex}</TableCell>
                    <TableCell className={this.props.classes.timestamp}>{this.formatTimestamp(record.timestamp)}</TableCell>
                    <TableCell className={this.props.classes.scramble}><code>{record.scramble}</code></TableCell>
                    <TableCell numeric={true}><code>{formatDuration(record.time)}</code></TableCell>
                    <TableCell padding="checkbox">
                      <IconButton onClick={this.handleRecordMoreClick(this.props.session.records.length - (recordIndex + 1))}>
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
      Action.deleteRecord({
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