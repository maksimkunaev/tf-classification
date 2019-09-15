import React, { PureComponent, Component } from 'react';
import styles from './Canvas.styl';
import container from "components/container";
import Canvas from 'components/canvas.js/';
import tf from 'components/sketch.js/';
import 'antd/dist/antd.css';
import { Button, notification } from 'antd';
import Select from 'react-select';
const PICTIRE_SIZE = 784;

const options = [
  { value: '0', label: 'zero' },
  { value: '1', label: 'one' },
  { value: '2', label: 'two' },
];

const labels = {
    0: [1,0,0],
    1: [0,1,0],
    2: [0,0,1],
}
 
class CanvasView extends Component {
    constructor() {
        super();
        this.state = ({
            value: '',
            selectedOption: options[0],
        })
    }

    componentDidMount() {
        this.initCanvas();
    }

    initCanvas = () => {
        const settings = {
            width: PICTIRE_SIZE,
            height: PICTIRE_SIZE,
            pixel: 28
        }

        this.canvas = new Canvas(this.canv, settings);
    }

    onClear = () => {
        this.canvas.clear()
    }

    pushData = () => {
        const vector = this.canvas.calculate(true);
        const element = {
          xs: vector,
          label: labels[this.state.selectedOption.value],
        };
        this.props.addElement(element)
        this.copyToClipboard(vector);
    }


   copyToClipboard = vector => {
        const inputElement = this.input;

        const copy = () => {
              inputElement.select();
              inputElement.setSelectionRange(0, 99999);
              document.execCommand("copy");

              notification.success({
                message: 'Copied!',
              });
        } 

        this.setState({
            value: JSON.stringify(vector)
        }, copy)
    }

    startTrain = () => {
        this.fetchData()
    }

    fetchData = () => {
        fetch('assets/data/data.json')
            .then(res => res.json())
            .then(res => {
                console.log('startTrain', res);
                this.classNames = res.classNames;
                let labelIndex = 0;
                const NUM_CLASSES = res.classNames.length

                let xPos = 0;
                let yPos = 10;

                for (let i = 0; i < res.xs.length; i = i + PICTIRE_SIZE) {
                    const picture_data = res.xs.slice(i, i + PICTIRE_SIZE);
                    const label = res.labels.slice(labelIndex, labelIndex + NUM_CLASSES);

                    labelIndex = labelIndex + NUM_CLASSES;
                    const foundIndex = label.findIndex(value => value === 1)
                    this.canvas.drawPicture(picture_data.map(value=>value ? 255 : 0), xPos, yPos);
                    this.canvas.filltext(this.classNames[foundIndex], xPos, yPos)

                    xPos = xPos + 50;
                    if (xPos > this.canv.width) {
                        xPos = 0;
                        yPos = yPos + 50;
                    }
                }

                tf.train(res, 10);
            })
    }

    onPredict = () => {
        const vector = this.canvas.calculate(true);
        const { index, probability } = tf.predictOne(vector);
        const result = this.classNames[index];
        print(`${result} ${probability}`)
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };

    render() {
        const { selectedOption } = this.state;

        return (
              <div className={styles.canvas_view}>
                <div className={styles.controls}>
                    <button className={styles.control} onClick={this.onClear}>Clear</button>
                    <button className={styles.control} onClick={this.pushData}>Push</button>
                    <button className={styles.control} onClick={this.startTrain}>Train</button>
                    <button className={styles.control} onClick={this.onPredict}>Predict</button>
                    <Select
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={options}
                    />
                    <div className="errors"></div>
                </div>

                <input id="select-this" ref={node => this.input = node} style={{position: 'absolute', left: -99999 }} value={this.state.value} onChange={()=>{}}/>
                <canvas id="canv" ref={node => this.canv = node} className={styles.canvas}>Ваш браузер устарел, обновитесь.</canvas>
              </div>
        );
    }
}

function print(text) {
  const style = ['padding: 1rem;',
      'background: linear-gradient( #403df7, #12981d);',
      'text-shadow: 0 2px orangered;',
      'font: 1.3rem/3 Georgia;',
      'color: white;'].join('');

  console.table( '%c%s', style, text);
}

export default container(CanvasView);
