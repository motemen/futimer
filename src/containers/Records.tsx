import * as React from 'react';

import { connect, DispatchProp } from 'react-redux';

import { createStyles, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme, Toolbar, Typography, withStyles, WithStyles } from '@material-ui/core';
import { Sync } from '@material-ui/icons';

import { Actions } from '../actions';
import { Result } from '../models/Attempt';
import { StoreState } from '../types';

interface OwnProps {
  results: Result[];
}

type Props = OwnProps & DispatchProp<Actions> & WithStyles<typeof RecordsStyles>;

const RecordsStyles = (theme: Theme) => createStyles({
  root: {
    margin: theme.spacing.unit * 2,
  },
  spacer: {
    flex: '1 1 100%',
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
          <Typography variant="title">Results</Typography>
          { /* TODO: render summary eg. ao5 */ }
          <div className={this.props.classes.spacer} />
          <IconButton ><Sync /></IconButton>
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
                    <TableCell><code>{this.formatNumber(result.time)}</code></TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </Paper>
    );
  }

  private formatTimestamp(t: number) {
    return new Date(t).toLocaleString();
  }

  private formatNumber(n: number) {
    const [x, y] = n.toString().split(/\./);
    return (x.length === 1 ? ` ${x}` : x) + '.' + ((y || '') + '000').substring(0, 3);
  }
}

function mapStateToProps({ results }: StoreState) {
  return {
    results
  };
}

export default connect(mapStateToProps)(withStyles(RecordsStyles)(Records));