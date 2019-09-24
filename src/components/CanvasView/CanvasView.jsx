import React, { PureComponent, Component } from 'react';
import styles from './Canvas.styl';
import container from "components/container";
import Canvas from 'components/canvas.js/';
import tf from 'components/sketch.js/';
import 'antd/dist/antd.css';
import { notification } from 'antd';
import Select from 'react-select';
const PICTIRE_SIZE = 784;
import utils from 'utils';
const { fetchData } = utils;

const options = [
  { value: '0', label: 'zero' },
  { value: '1', label: 'one' },
  { value: '2', label: 'two' },
];

const labels = {
    0: [1,0,0,0,0,0],
    1: [0,1,0,0,0,0],
    2: [0,0,1,0,0,0],
}
 
class CanvasView extends Component {
    constructor() {
        super();
        this.state = ({
            value: '',
            selectedOption: options[0],
            detected: {
                object: '',
                probability: '',
            },
            learning: {
                status: 'init',
                percent: 0,
                loss: 0,
            }
        })
    }

    componentDidMount() {
        this.initCanvas();
        this.initTouchEvents();
        document.addEventListener('keydown', this.handleKeyPress)
        let width = Math.min(window.innerWidth, window.innerHeight);
        this.width = window.innerWidth > 500 ? 0.8 * width : width;
    }

    initCanvas = async () => {
        const settings = {
            width: PICTIRE_SIZE,
            height: PICTIRE_SIZE,
            pixel: 28
        };

        this.canvas = new Canvas(this.canv, settings, { callbacks: { onDraw: this.onDraw }} );
        const data = await fetchData('assets/data/data.json', PICTIRE_SIZE);
        this.showPreview(data)
        this.props.changeStatus({ type: 'training'})

        this.train(data, 15)
    }

    onClear = () => {
        this.canvas.clear()
    }

    onDraw = () => {
        this.onPredict()
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
        this.train(this.props.data, 100);
        this.classNames = this.props.data.classNames
    }

    showPreview = async (data) => {
        this.classNames = data.classNames;
        let labelIndex = 0;
        const NUM_CLASSES = data.classNames.length;

        let xPos = 0;
        let yPos = 10;

        for (let i = 0; i < data.xs.length; i = i + PICTIRE_SIZE) {
            const picture_data = data.xs.slice(i, i + PICTIRE_SIZE);
            const label = data.labels.slice(labelIndex, labelIndex + NUM_CLASSES);

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
    };

    train = (data, epochs) => {
        const startTime = Date.now();
        const callbacks = {
            onTrainBegin: () => console.log('start'),
            onEpochEnd: (epoch, loss) => {
                console.log('loss',loss),

                this.setState({
                    learning: {
                        status: 'learning',
                        percent: (epoch * 100 / epochs).toFixed(2),
                        loss: loss.toFixed(4),
                    }
                })
            },
            onTrainEnd: () => {
                const time = (Date.now() - startTime)/1000;
                console.log('Training comp. Time:', time, 's');
                this.setState({
                    learning: {
                        status: 'finished',
                        percent: 100,
                        loss: this.state.learning.loss
                    }
                })
                this.props.changeStatus({ type: 'trained'})
            }
        };

        tf.train(data, { epochs, callbacks });
        this.setState({
            learning: {
                status: 'learning',
                percent: 0,
                loss: 0,
            }
        })
    };

    onPredict = () => {
        const vector = this.canvas.calculate();
        const { index, probability, error } = tf.predictOne(vector);

        if (error) {
            console.log(error);
            return;
        }
        const object = this.classNames[index]; 
        this.setState({
            detected: {
                object,
                probability: probability.toFixed(2),
            }
        })
    }

    handleChange = selectedOption => {
        this.setState({ selectedOption });
    };

    handleKeyPress = e => {
        if (e.code  === 'KeyC') {
            this.onClear();
        }
    };

    initTouchEvents() {
        function touchHandler(event) {
            const touch = event.changedTouches[0];

            const simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent({
                    touchstart: "mousedown",
                    touchmove: "mousemove",
                    touchend: "mouseup"
                }[event.type], true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0, null);

            touch.target.dispatchEvent(simulatedEvent);
        }

        document.addEventListener("touchstart", touchHandler, true);
        document.addEventListener("touchmove", touchHandler, true);
        document.addEventListener("touchend", touchHandler, true);
        document.addEventListener("touchcancel", touchHandler, true);
    }

    render() {
        const { selectedOption, detected, learning } = this.state;
        const { status, percent, loss } = learning;
        const { width } = this;

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
                </div>

                <div className={styles.canvasWrap} style={{width, height: width}}>
                    <canvas id="canv" ref={node => this.canv = node} className={styles.canvas} onKeyPress={this.handleKeyPress}>Ваш браузер устарел, обновитесь.</canvas>
                    <div>
                        {status ==='init' && <p className={styles.detection}>Wait until training starts...</p>}
                        {status ==='learning' && <p className={styles.detection}>
                            Training in progress <span style={{color: '#69696d'}}>{percent}%</span><br />
                            Error <span style={{color: '#69696d'}}>{loss}</span><br />
                        </p>}

                        {status ==='finished' && <p className={styles.detection}>
                            Training finished  <span style={{color: 'green'}}>{percent}%</span><br />
                            Error <span style={{color: 'green'}}>{loss}</span><br />
                        </p>}

                        {detected.object && <p className={styles.detection}><b>{detected.object} <span>{detected.probability}%</span></b></p>}
                    </div>
                </div>
                <input id="select-this" ref={node => this.input = node} style={{position: 'absolute', left: -99999 }} value={this.state.value} onChange={()=>{}}/>
            </div>
        );
    }
}

export default container(CanvasView);
