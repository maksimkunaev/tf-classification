import React from 'react';
import {connect} from 'react-redux';

const mapStateToProps = state => ({
  data: state.data,
  status: state.status,
})

const mapDispatchToProps = dispatch => ({
  addElement: (data) => {
    dispatch({
      type: 'addElement',
      data,
    })
  },
  changeStatus: (data) => {
    dispatch({
      type: data.type,
    })
  },
})

export default component => connect(mapStateToProps, mapDispatchToProps)(component);
