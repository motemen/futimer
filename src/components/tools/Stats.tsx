import * as React from "react";
import { connect } from 'react-redux';

import { Record, calcStats, formatDuration } from "../../models";
import { StoreState } from "../../types";
import { Table, TableHead, TableBody, TableRow, TableCell } from "@material-ui/core";

interface Props {
  records: Record[];
}

class Stats extends React.Component<Props> {
  public render() {
    const stats = calcStats(this.props.records);

    return <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Current</TableCell>
          <TableCell>Best</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          [1, 5, 12, 100].map(n => {
            const st = n === 1 ? stats.single : stats.averageOf[n];
            if (!st) {
              return null;
            }

            return <TableRow key={n}>
              <TableCell>{n === 1 ? 'single' : `ao${n}`}</TableCell>
              <TableCell>{formatDuration(st.current)}</TableCell>
              <TableCell>{formatDuration(st.best)}</TableCell>
            </TableRow>;
          })
        }
      </TableBody>
    </Table>
  }
}

function mapStateToProps({ current: { session: { records } } }: StoreState) {
  return {
    records,
  };
}

export default connect(mapStateToProps)(Stats);
