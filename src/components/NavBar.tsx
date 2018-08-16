import * as React from 'react';
import { connect } from 'react-redux';

import { AppBar, Toolbar, Typography, Select } from '@material-ui/core';

import { PuzzleType, PuzzleConfiguration } from '../models';
import { StoreState } from '../types';
import { AsyncAction, Dispatch } from '../actions';

import Logo from '../app.png';

interface OwnProps {
  puzzleType: PuzzleType;
}

type Props = OwnProps & { dispatch: Dispatch };

class NavBar extends React.Component<Props> {
  public render() {
    return <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="title" color="inherit" style={{ textTransform: 'uppercase', marginRight: 20 }}>
          <img src={Logo} width="16" height="16" style={{ marginRight: 4 }} />
          fuTimer
        </Typography>
        <Select value={this.props.puzzleType} native={true} onChange={this.handlePuzzleTypeChange}>
          {
            Object.keys(PuzzleConfiguration).sort().map((key) => {
              return <option value={key} key={key}>{PuzzleConfiguration[key].longName}</option>;
            })
          }
        </Select>
      </Toolbar>
    </AppBar>;
  }

  private handlePuzzleTypeChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.dispatch(AsyncAction.changePuzzleType({ puzzle: ev.target.value as PuzzleType }));
  }
}

function mapStateToProps({ current: { session: { puzzleType } } }: StoreState) {
  return {
    puzzleType,
  };
}

export default connect(mapStateToProps)(NavBar);