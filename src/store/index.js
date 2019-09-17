import { combineReducers } from 'redux';

const initialState = {
    data: {
        xs: [],
        labels: [],
        train_data_size: 0,
        classNames: ['smiley face', 'sad face', 'three', 'four', 'five', 'six'],
    },
};

function changeData(state = initialState.data, action) {
    switch (action.type) {
        case 'addElement':
            let newData = { ...state };
            newData.xs = newData.xs.concat(action.data.xs);
            newData.labels = newData.labels.concat(action.data.label);
            newData.train_data_size = newData.train_data_size + 1;

            return { ...state, ...newData };
    }

    return state;
}

export default combineReducers({
    data: changeData,
})


