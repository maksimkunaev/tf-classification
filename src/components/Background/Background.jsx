import React, { Component } from "react";
import styles from './Background.styl';
import container from "components/container";

class Background extends Component {
    render() {
        const { status } = this.props;
        console.log('this.props', this.props)
        let list = new Array(9).fill(1);
        return (
            <div className={styles.area}>
                <ul className={styles.circles}>
                    {status !== 'training' && list.map((li, i) => <li key={i} className={styles.circlesLi}></li>)}
                    {status === 'trained' && 'training....'}
                </ul>
            </div>
        );
    }
}

export default container(Background);
