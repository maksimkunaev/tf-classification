import React from 'react';
import {connect} from 'react-redux';

const mapStateToProps = state => ({
    data: state.data,
})

const mapDispatchToProps = dispatch => ({
  addElement: (data) => {
    console.log('dispatch')
    dispatch({
      type: 'addElement',
      data,
    })
  },
})

export default component => connect(mapStateToProps, mapDispatchToProps)(component);
