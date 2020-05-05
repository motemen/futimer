import * as React from "react";

import { connect } from "react-redux";

import {
  createStyles,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Hidden,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";

import { Actions, Dispatch } from "../actions";
import {
  calcStats,
  formatDuration,
  Session,
  PuzzleConfiguration,
} from "../models";

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

const Styles = (theme: Theme) =>
  createStyles({
    scramble: {
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    summary: {
      color: theme.palette.text.secondary,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    summaryContent: {
      "& > :last-child": {
        paddingRight: 0,
      },
    },
    timestamp: {
      [theme.breakpoints.down("xs")]: {
        display: "none",
      },
    },
    number: {},
    title: {
      flexBasis: "20%",
    },
    root: {
      paddingRight: "16px !important",
      [theme.breakpoints.up("sm")]: {
        paddingRight: "24px !important",
      },
    },
  });

class SessionRecords extends React.Component<
  OwnProps & { dispatch: Dispatch } & WithStyles<typeof Styles>,
  State
> {
  public state: Readonly<State> = {};

  public render() {
    const stats = calcStats(this.props.session.records);

    return (
      <ExpansionPanel defaultExpanded={this.props.defaultExpanded}>
        <ExpansionPanelSummary
          classes={{
            content: this.props.classes.summaryContent,
            root: this.props.classes.root,
          }}
        >
          <Hidden xsDown={true}>
            <Typography className={this.props.classes.title}>
              {this.props.resultIndex === -1
                ? "Current Session"
                : this.props.session.name}{" "}
              ({PuzzleConfiguration[this.props.session.puzzleType].longName})
            </Typography>
          </Hidden>
          <Typography className={this.props.classes.summary} component="div">
            {[100, 12, 5].map((n) => {
              const st = stats.averageOf[n];
              if (!st) {
                return null;
              }

              return (
                <div key={n}>
                  <Hidden xsDown={true}>
                    Best ao
                    {n}: {formatDuration(st.best) || "N/A"}
                  </Hidden>{" "}
                  <Hidden xsDown={true}>Curr </Hidden>
                  <span>
                    ao
                    {n}: {formatDuration(st.current) || "N/A"}
                  </span>
                </div>
              );
            })}
          </Typography>
          <div style={{ flex: 1 }} />
          {this.props.actionButton}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={this.props.classes.number}>#</TableCell>
                <TableCell className={this.props.classes.timestamp}>
                  Timestamp
                </TableCell>
                <TableCell className={this.props.classes.scramble}>
                  Scramble
                </TableCell>
                <TableCell>Time</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.session.records
                .slice()
                .reverse()
                .map((record, i) => {
                  const recordIndex =
                    this.props.session.records.length - (i + 1);
                  return (
                    <TableRow key={recordIndex}>
                      <TableCell className={this.props.classes.number}>
                        {recordIndex + 1}
                      </TableCell>
                      <TableCell className={this.props.classes.timestamp}>
                        {this.formatTimestamp(record.timestamp)}
                      </TableCell>
                      <TableCell className={this.props.classes.scramble}>
                        <code>{record.scramble}</code>
                      </TableCell>
                      <TableCell align="right">
                        <code>{formatDuration(record.time)}</code>
                      </TableCell>
                      <TableCell padding="checkbox">
                        <IconButton
                          onClick={this.handleRecordMoreClick(recordIndex)}
                        >
                          <Icon>more_vert</Icon>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <Menu
            anchorEl={this.state.recordMenuAnchor}
            open={Boolean(this.state.recordMenuAnchor)}
            onClose={this.handleRecordMenuClose}
          >
            <MenuItem onClick={this.handleDeleteRecordClick}>Delete</MenuItem>
          </Menu>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  private handleRecordMoreClick = (i: number) => (
    ev: React.MouseEvent<HTMLElement>
  ) => {
    this.setState({ recordMenuAnchor: ev.currentTarget, activeRecordIndex: i });
  };

  private handleRecordMenuClose = () => {
    this.setState({ recordMenuAnchor: undefined });
  };

  private handleDeleteRecordClick = () => {
    this.props.dispatch(
      Actions.deleteRecord({
        sessionIndex: this.props.resultIndex,
        recordIndex: this.state.activeRecordIndex!,
      })
    );
    this.handleRecordMenuClose();
  };

  private formatTimestamp(t: number) {
    return new Date(t).toLocaleString();
  }
}

export default connect()(withStyles(Styles)(SessionRecords));
